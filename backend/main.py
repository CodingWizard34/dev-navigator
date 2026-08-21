from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ingestion import ingest_local_directory
from vector_store import embed_documents
from graph_store import build_knowledge_graph
from models import init_db, get_db, Repository, User, Message
from auth import get_current_user
import os

app = FastAPI(title="AI Engineering Platform API")

# Add CORS middleware to allow the Next.js frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RepositoryUrl(BaseModel):
    url: str

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Engineering Platform API"}

@app.get("/api/v1/repos")
def get_repos(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    repos = db.query(Repository).filter(Repository.owner_id == current_user.id).all()
    return {"status": "success", "repos": [{"id": r.id, "name": r.name, "path": r.path, "tech_debt_score": r.tech_debt_score} for r in repos]}

@app.post("/api/v1/ingest")
def ingest_repository(repo: RepositoryUrl, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not os.environ.get("GOOGLE_API_KEY"):
        raise HTTPException(status_code=400, detail="GOOGLE_API_KEY environment variable is not set. Required for embeddings.")
    
    import tempfile
    import subprocess
    import shutil
    from urllib.parse import urlparse

    try:
        is_url = repo.url.startswith("http://") or repo.url.startswith("https://")
        
        target_path = repo.url
        temp_dir = None
        
        if is_url:
            # Parse repo name from URL (e.g., https://github.com/facebook/react -> react)
            parsed_url = urlparse(repo.url)
            repo_name = os.path.basename(parsed_url.path).replace(".git", "")
            
            # Create a temporary directory and clone the repo
            temp_dir = tempfile.mkdtemp()
            try:
                subprocess.run(["git", "clone", "--depth", "1", repo.url, temp_dir], check=True, capture_output=True)
            except subprocess.CalledProcessError as e:
                shutil.rmtree(temp_dir, ignore_errors=True)
                raise HTTPException(status_code=400, detail=f"Failed to clone repository. Is it public? Error: {e.stderr.decode('utf-8')}")
            
            target_path = temp_dir
        else:
            repo_name = os.path.basename(os.path.normpath(repo.url))

        # Step 1: Parse the repository
        parsed_files = ingest_local_directory(target_path)
        
        if not parsed_files:
            if temp_dir:
                shutil.rmtree(temp_dir, ignore_errors=True)
            raise HTTPException(status_code=400, detail="No supported files found in repository.")
        
        # Step 1.5: Register Repo in Database
        new_repo = Repository(
            owner_id=current_user.id,
            name=repo_name,
            path=repo.url,
            tech_debt_score=len(parsed_files) * 2 # Mock heuristic for now
        )
        db.add(new_repo)
        db.commit()
        db.refresh(new_repo)
        
        # Step 2: Embed the chunks into ChromaDB scoped by repo_id
        embed_documents(parsed_files, repo_id=new_repo.id)
        
        # Step 3: Build the knowledge graph (NetworkX) scoped by repo_id
        graph = build_knowledge_graph(parsed_files, repo_id=str(new_repo.id))
        
        # Clean up temporary directory if we cloned from GitHub
        if temp_dir:
            shutil.rmtree(temp_dir, ignore_errors=True)
            
        return {
            "status": "success", 
            "repo_id": new_repo.id,
            "message": f"Successfully parsed {len(parsed_files)} Python/JS files, embedded into ChromaDB collection '{new_repo.id}'.",
        }
    except HTTPException:
        raise
    except Exception as e:
        if 'temp_dir' in locals() and temp_dir:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(e))

class ChatQuery(BaseModel):
    query: str
    repo_id: str

@app.post("/api/v1/chat")
def chat(chat_query: ChatQuery, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from graphrag import execute_graphrag_query
    
    # Verify user owns this repo
    repo = db.query(Repository).filter(Repository.id == chat_query.repo_id, Repository.owner_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found or access denied.")
    
    if not os.environ.get("GOOGLE_API_KEY"):
        raise HTTPException(status_code=400, detail="GOOGLE_API_KEY environment variable is not set. Required for Gemini.")
        
    try:
        # 1. Generate AI Response
        response = execute_graphrag_query(chat_query.query, repo_id=chat_query.repo_id)
        
        # 2. Save User Message
        user_msg = Message(repo_id=chat_query.repo_id, role="user", content=chat_query.query)
        db.add(user_msg)
        
        # 3. Save AI Message
        ai_msg = Message(repo_id=chat_query.repo_id, role="ai", content=response)
        db.add(ai_msg)
        
        db.commit()
        
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/chat/{repo_id}")
def get_chat_history(repo_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify user owns this repo
    repo = db.query(Repository).filter(Repository.id == repo_id, Repository.owner_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found or access denied.")
        
    messages = db.query(Message).filter(Message.repo_id == repo_id).order_by(Message.created_at.asc()).all()
    
    return {
        "status": "success",
        "messages": [{"role": m.role, "content": m.content} for m in messages]
    }

@app.delete("/api/v1/repos/{repo_id}")
def delete_repo(repo_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from vector_store import delete_vector_index
    from graph_store import delete_graph
    
    repo = db.query(Repository).filter(Repository.id == repo_id, Repository.owner_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found or access denied.")
        
    # Delete from DB
    db.delete(repo)
    db.commit()
    
    # Delete ChromaDB collection
    delete_vector_index(repo_id)
    
    # Delete Graph
    delete_graph(repo_id)
        
    return {"status": "success", "message": "Repository deleted successfully."}

@app.get("/api/v1/repos/{repo_id}/graph")
def get_repo_graph(repo_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from graph_store import get_or_create_graph
    
    # Verify user owns this repo
    repo = db.query(Repository).filter(Repository.id == repo_id, Repository.owner_id == current_user.id).first()
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found or access denied.")
        
    G = get_or_create_graph(repo_id)
    
    # Convert to JSON payload compatible with react-force-graph
    from networkx.readwrite import json_graph
    data = json_graph.node_link_data(G)
    
    # ensure 'id' is present for force graph
    nodes = []
    for n in data.get("nodes", []):
        if "id" not in n:
            n["id"] = n.get("id", str(n))
        nodes.append(n)
        
    links = data.get("links", [])
    
    return {"status": "success", "graph": {"nodes": nodes, "links": links}}

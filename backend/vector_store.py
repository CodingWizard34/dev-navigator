import os
import chromadb
from llama_index.core import VectorStoreIndex, Document
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import StorageContext, Settings
from llama_index.embeddings.fastembed import FastEmbedEmbedding

# Completely bypass Google's API for embeddings and run it locally
Settings.embed_model = FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")

def get_vector_index(repo_id: str):
    """Initialize or get the ChromaDB vector index for a specific repo."""
    # initialize client, setting path to save data
    db = chromadb.PersistentClient(path="./chroma_db")
    
    # create collection scoped to this repo_id
    # We prefix it with 'repo_' to ensure it's a valid Chroma collection name
    collection_name = f"repo_{repo_id.replace('-', '_')}"
    chroma_collection = db.get_or_create_collection(collection_name)
    
    # assign chroma as the vector store to the context
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    
    return vector_store, storage_context

def delete_vector_index(repo_id: str):
    """Delete a ChromaDB collection for a specific repo."""
    db = chromadb.PersistentClient(path="./chroma_db")
    collection_name = f"repo_{repo_id.replace('-', '_')}"
    try:
        db.delete_collection(collection_name)
    except Exception as e:
        print(f"Warning: Failed to delete Chroma collection {collection_name}: {e}")

def embed_documents(documents_data: list, repo_id: str):
    """
    Take parsed AST data, convert to LlamaIndex Documents, and embed them.
    documents_data is a list of dicts from parse_python_file.
    """
    vector_store, storage_context = get_vector_index(repo_id)
    
    docs = []
    for data in documents_data:
        # Create a document for the entire file content or summarize its classes/functions
        content = f"File: {data['file']}\n"
        content += f"Imports: {', '.join(data['imports'])}\n"
        content += "Classes:\n"
        for c in data['classes']:
            content += f" - {c['name']} (Methods: {', '.join(c['methods'])})\n"
        content += "Functions:\n"
        for f in data['functions']:
            content += f" - {f['name']}\n"
            
        doc = Document(
            text=content,
            metadata={"file": data['file']}
        )
        docs.append(doc)
        
    index = VectorStoreIndex.from_documents(
        docs, 
        storage_context=storage_context,
        embed_model=FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")
    )
    return index

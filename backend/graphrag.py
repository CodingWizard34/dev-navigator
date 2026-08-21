from vector_store import get_vector_index
from graph_store import get_or_create_graph
from agents import run_multi_agent_workflow
from llama_index.core import VectorStoreIndex
import networkx as nx

def execute_graphrag_query(query: str, repo_id: str):
    """
    Combines Vector Search (LlamaIndex) with Knowledge Graph context
    """
    # 1. Retrieve similar documents via Vector Search (FastEmbed locally)
    vector_store, storage_context = get_vector_index(repo_id)
    
    from llama_index.embeddings.fastembed import FastEmbedEmbedding
    # 1. Vector Search
    index = VectorStoreIndex.from_vector_store(
        vector_store=vector_store, 
        storage_context=storage_context,
        embed_model=FastEmbedEmbedding(model_name="BAAI/bge-small-en-v1.5")
    )
    retriever = index.as_retriever(similarity_top_k=3)
    nodes = retriever.retrieve(query)
    
    vector_context = "\n".join([n.text for n in nodes])
    
    # 2. Graph Traversal (Find neighbors of retrieved files/classes)
    G = get_or_create_graph(repo_id)
    graph_context = "Graph Dependencies:\n"
    for node in nodes:
        file_name = node.metadata.get("file")
        if file_name and G.has_node(file_name):
            neighbors = list(G.neighbors(file_name))
            graph_context += f" - {file_name} is connected to: {', '.join(neighbors)}\n"
            
    # Combine Context
    full_context = f"--- Code Snippets ---\n{vector_context}\n\n--- Architecture ---\n{graph_context}"
    
    # 3. Multi-Agent Orchestration
    final_response = run_multi_agent_workflow(query, full_context)
    
    return final_response

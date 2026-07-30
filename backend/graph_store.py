import networkx as nx
import pickle
import os

GRAPH_FILE = "codebase_graph.gpickle"

def get_or_create_graph():
    """Load the existing graph from disk or create a new one."""
    if os.path.exists(GRAPH_FILE):
        try:
            return pickle.load(open(GRAPH_FILE, 'rb'))
        except Exception:
            pass
    return nx.DiGraph()

def save_graph(G):
    """Save the graph to disk."""
    with open(GRAPH_FILE, 'wb') as f:
        pickle.dump(G, f)

def build_knowledge_graph(documents_data: list):
    """
    Build a NetworkX Directed Graph representing dependencies between files and classes.
    """
    G = get_or_create_graph()

    for data in documents_data:
        file_node = data['file']
        G.add_node(file_node, type="file")

        # Link classes to their file
        for cls in data['classes']:
            cls_name = cls['name']
            G.add_node(cls_name, type="class")
            G.add_edge(file_node, cls_name, relation="DEFINES_CLASS")
            
            # Link methods to the class
            for method in cls['methods']:
                method_name = f"{cls_name}.{method}"
                G.add_node(method_name, type="method")
                G.add_edge(cls_name, method_name, relation="HAS_METHOD")

        # Link functions to the file
        for func in data['functions']:
            func_name = func['name']
            G.add_node(func_name, type="function")
            G.add_edge(file_node, func_name, relation="DEFINES_FUNCTION")

        # Add import edges (dependencies)
        for imp in data['imports']:
            G.add_node(imp, type="module")
            G.add_edge(file_node, imp, relation="IMPORTS")

    save_graph(G)
    return G

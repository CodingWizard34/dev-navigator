import os
import ast
import re
from pathlib import Path

def parse_python_file(file_path: str):
    """Parse a python file and extract functions and classes using AST."""
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            content = f.read()
            tree = ast.parse(content)
        except Exception as e:
            print(f"Failed to parse {file_path}: {e}")
            return None

    classes = []
    functions = []
    imports = []

    for node in ast.walk(tree):
        if isinstance(node, ast.ClassDef):
            classes.append({
                "name": node.name,
                "line": node.lineno,
                "methods": [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
            })
        elif isinstance(node, ast.FunctionDef):
            functions.append({
                "name": node.name,
                "line": node.lineno
            })
        elif isinstance(node, ast.Import):
            for alias in node.names:
                imports.append(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.append(node.module)

    return {
        "file": str(file_path),
        "classes": classes,
        "functions": functions,
        "imports": imports,
    }

def parse_js_file(file_path: str):
    """Parse a JS/TS/React file and extract functions and classes using Regex."""
    with open(file_path, "r", encoding="utf-8") as f:
        try:
            content = f.read()
        except Exception as e:
            print(f"Failed to read {file_path}: {e}")
            return None

    classes = []
    functions = []
    imports = []

    # Regex for imports: import X from 'Y'
    import_pattern = re.compile(r'import\s+.*?from\s+[\'"](.*?)[\'"]')
    for match in import_pattern.finditer(content):
        imports.append(match.group(1))

    # Regex for functions: function name() or const name = () =>
    func_pattern1 = re.compile(r'function\s+([a-zA-Z0-9_]+)\s*\(')
    for match in func_pattern1.finditer(content):
        functions.append({"name": match.group(1), "line": 0})
        
    func_pattern2 = re.compile(r'const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>')
    for match in func_pattern2.finditer(content):
        functions.append({"name": match.group(1), "line": 0})

    # Regex for classes
    class_pattern = re.compile(r'class\s+([a-zA-Z0-9_]+)')
    for match in class_pattern.finditer(content):
        classes.append({
            "name": match.group(1),
            "line": 0,
            "methods": []
        })

    return {
        "file": str(file_path),
        "classes": classes,
        "functions": functions,
        "imports": list(set(imports)),
    }

def ingest_local_directory(directory_path: str):
    """Walk through a directory, parse supported files, and return metadata."""
    parsed_files = []
    path = Path(directory_path)
    
    if not path.exists() or not path.is_dir():
        raise ValueError(f"Directory {directory_path} does not exist or is not a directory.")

    valid_extensions = {".py", ".js", ".ts", ".jsx", ".tsx"}
    
    for file_path in path.rglob("*"):
        if not file_path.is_file() or file_path.suffix not in valid_extensions:
            continue
            
        # skip virtual environments, node_modules, and hidden dirs
        if any(part.startswith('.') or part in ['venv', 'env', '__pycache__', 'node_modules', 'dist', 'build'] for part in file_path.parts):
            continue
            
        if file_path.suffix == ".py":
            parsed_data = parse_python_file(str(file_path))
        else:
            parsed_data = parse_js_file(str(file_path))
            
        if parsed_data:
            parsed_files.append(parsed_data)

    return parsed_files

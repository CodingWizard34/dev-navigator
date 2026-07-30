# DevNavigator

DevNavigator is an AI-powered engineering platform designed to help developers instantly understand complex codebases, map architecture, and debug spaghetti code. It acts as a multi-tenant SaaS where users can ingest entire repositories into a Vector Database and interact with an AI Architect using GraphRAG (Retrieval-Augmented Generation).

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React
- Tailwind CSS
- Clerk (Authentication)

**Backend:**
- FastAPI (Python)
- SQLite & SQLAlchemy (Database & ORM)
- ChromaDB (Local Vector Store)
- LlamaIndex (GraphRAG & Document Embedding)
- Google Gemini API (LLM)

## Features

- **Multi-Tenant Architecture:** Every ingested repository gets its own perfectly isolated vector collection.
- **Advanced Code Parsing:** Supports parsing and embedding Python (`.py`) and React/TypeScript (`.ts`, `.tsx`, `.js`) codebases using AST and Regex.
- **Persistent Chat History:** All conversations are backed by an SQLite database, ensuring chat context is saved across sessions.
- **Tech Debt Scoring:** Generates heuristics-based tech debt scores based on repository complexity.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- A Google Gemini API Key
- A Clerk Account (for Auth keys)

### 1. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

Set your Gemini API key (you can also set this in a `.env` file or export it directly):
```bash
# Windows
$env:GOOGLE_API_KEY="your_api_key_here"

# Mac/Linux
export GOOGLE_API_KEY="your_api_key_here"
```

Start the FastAPI server:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup

Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` folder and add your Clerk API keys:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

Start the Next.js development server:
```bash
npm run dev
```

Visit `http://localhost:3001` in your browser.

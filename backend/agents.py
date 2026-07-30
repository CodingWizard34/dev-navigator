from typing import Dict, TypedDict
from langgraph.graph import StateGraph, END
import os
from google import genai

class GraphState(TypedDict):
    query: str
    context: str
    architect_review: str
    reviewer_comments: str
    security_analysis: str
    final_report: str

def get_gemini_client():
    # It auto-picks up GOOGLE_API_KEY from environment
    return genai.Client()

def architect_agent(state: GraphState):
    """Analyzes architecture from the context."""
    context = state.get("context", "")
    query = state.get("query", "")
    
    prompt = f"You are a Software Architect. Based on this codebase context:\n{context}\n\nAnswer this query from an architectural perspective: {query}"
    
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        review = response.text
    except Exception as e:
        review = f"Error generating architecture analysis: {str(e)}"
        
    return {"architect_review": review}

def reviewer_agent(state: GraphState):
    """Reviews code quality and PRs."""
    arch_review = state.get("architect_review", "")
    context = state.get("context", "")
    query = state.get("query", "")
    
    prompt = f"You are a Senior Code Reviewer. The Architect said:\n{arch_review}\n\nBased on the codebase context:\n{context}\n\nProvide a code quality review answering: {query}"
    
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        review = response.text
    except Exception as e:
        review = f"Error generating review: {str(e)}"
        
    return {"reviewer_comments": review}

def security_agent(state: GraphState):
    """Checks for security issues."""
    context = state.get("context", "")
    query = state.get("query", "")
    
    prompt = f"You are an Application Security Engineer. Based on this codebase context:\n{context}\n\nAnalyze any security implications or vulnerabilities related to this query: {query}"
    
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        sec_analysis = response.text
    except Exception as e:
        sec_analysis = f"Error generating security analysis: {str(e)}"
        
    return {"security_analysis": sec_analysis}

def summary_agent(state: GraphState):
    """Synthesizes the final output."""
    arch = state.get("architect_review", "")
    rev = state.get("reviewer_comments", "")
    sec = state.get("security_analysis", "")
    query = state.get("query", "")
    
    prompt = f"You are the Lead Engineer. Synthesize the following reports into a final cohesive markdown response to the user's query: '{query}'\n\nArchitect: {arch}\nReviewer: {rev}\nSecurity: {sec}"
    
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model='gemini-flash-latest',
            contents=prompt
        )
        final = response.text
    except Exception as e:
        final = f"### Final Report\n\n**Architecture:** {arch}\n\n**Review:** {rev}\n\n**Security:** {sec}"
        
    return {"final_report": final}

# Build LangGraph
workflow = StateGraph(GraphState)

workflow.add_node("architect", architect_agent)
workflow.add_node("reviewer", reviewer_agent)
workflow.add_node("security", security_agent)
workflow.add_node("summary", summary_agent)

workflow.set_entry_point("architect")
workflow.add_edge("architect", "reviewer")
workflow.add_edge("reviewer", "security")
workflow.add_edge("security", "summary")
workflow.add_edge("summary", END)

app_graph = workflow.compile()

def run_multi_agent_workflow(query: str, context: str):
    """Runs the LangGraph multi-agent workflow."""
    inputs = {"query": query, "context": context}
    result = app_graph.invoke(inputs)
    return result["final_report"]

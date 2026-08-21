from google import genai

def get_gemini_client():
    # It auto-picks up GOOGLE_API_KEY from environment
    return genai.Client()

def run_multi_agent_workflow(query: str, context: str):
    """Runs the consolidated 'Mixture of Experts' prompt."""
    
    prompt = f"""You are a panel of elite software engineers: a Software Architect, a Senior Code Reviewer, and an Application Security Engineer.
    
Based on this codebase context (snippets and dependency graph):
{context}

Please analyze the user's query: "{query}"

You must provide a cohesive markdown response with three distinct sections. 
IMPORTANT INSTRUCTION: Use simple, beginner-friendly language. Avoid overly complex vocabulary and dense jargon. Explain concepts clearly so that a new developer can easily understand them. Do NOT repeat the same general answer in every section. Each expert must provide unique value based on their specific role. If a section is not highly relevant to the specific query, briefly state that it is not applicable rather than inventing redundant information.

### 🏗️ Architecture Analysis
(The Architect's perspective on the overall structure, design patterns, and system components related to the query)

### 🧐 Code Review
(The Code Reviewer's perspective. Focus ONLY on code quality, bugs, maintainability, and best practices for the provided snippets. If no specific code is relevant, state "No specific code to review for this query.")

### 🔒 Security Check
(The Security Engineer's perspective. Focus ONLY on vulnerabilities, data risks, and security best practices. If no security risks are present, state "No security risks detected for this context.")

Do not use conversational filler, just output the structured report directly.
"""
    
    import time
    
    client = get_gemini_client()
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content_stream(
                model='gemini-flash-latest',
                contents=prompt
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
            return # We successfully finished streaming
        except Exception as e:
            error_msg = str(e)
            if "503" in error_msg or "429" in error_msg:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt) # Sleep 1s, 2s, 4s...
                    continue
            yield f"Error generating analysis after {attempt + 1} attempts: {error_msg}"
            return

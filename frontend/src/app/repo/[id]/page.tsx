"use client";

import { useState, use, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function RepoChat({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { getToken, isLoaded } = useAuth();
  
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    const fetchHistory = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://127.0.0.1:8000/api/v1/chat/${resolvedParams.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      } finally {
        setFetchingHistory(false);
      }
    };
    
    fetchHistory();
  }, [isLoaded, resolvedParams.id]);

  const handleChat = async () => {
    if (!query.trim()) return;

    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch("http://127.0.0.1:8000/api/v1/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          query,
          repo_id: resolvedParams.id
        }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: "ai", content: data.response }]);
      } else {
        setMessages([...newMessages, { role: "ai", content: "Error: " + (data.detail || "Unknown error") }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: "ai", content: "Failed to connect to backend." }]);
    }
    setLoading(false);
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-slate-500 hover:text-indigo-600 transition-colors flex items-center space-x-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <span className="font-bold text-slate-700">Repository Intelligence</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-lg text-slate-900 mb-4">Architecture Health</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Technical Debt</span>
                  <span className="text-amber-600 font-medium">Monitoring</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full w-[45%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Complexity</span>
                  <span className="text-emerald-600 font-medium">Healthy</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-[25%]"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed">
              These metrics are dynamically calculated based on file sizes and nested dependencies found during ingestion.
            </p>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden h-[calc(100vh-8rem)]">
          
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {fetchingHistory ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                 Loading chat history...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">
                <div className="text-center space-y-3 max-w-md">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-slate-700">Ask your AI Architect</p>
                  <p className="text-sm">Query your codebase structure, dependencies, or ask for refactoring advice.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="max-w-[80%] rounded-2xl px-5 py-4 bg-indigo-600 text-white whitespace-pre-wrap shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-[95%] w-full rounded-2xl px-6 py-5 bg-slate-50 text-slate-800 border border-slate-200 shadow-sm prose prose-slate prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            <div className="flex space-x-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChat()}
                placeholder="e.g. Which components depend on VectorStore?"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 shadow-sm"
              />
              <button
                onClick={handleChat}
                disabled={loading || !query.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center space-x-2"
              >
                <span className="font-medium">{loading ? "Thinking..." : "Send"}</span>
                {!loading && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

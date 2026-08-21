"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Repo = {
  id: string;
  name: string;
  path: string;
  tech_debt_score: number;
};

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingestUrl, setIngestUrl] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState("");

  const fetchRepos = async () => {
    try {
      const token = await getToken();
      const res = await fetch("http://127.0.0.1:8000/api/v1/repos", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRepos(data.repos);
      }
    } catch (e) {
      console.error("Failed to fetch repos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchRepos();
    }
  }, [isLoaded]);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingestUrl.trim()) return;
    
    setIngesting(true);
    setError("");
    
    try {
      const token = await getToken();
      const res = await fetch("http://127.0.0.1:8000/api/v1/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: ingestUrl })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIngestUrl("");
        fetchRepos(); // refresh list
      } else {
        setError(data.detail || "Failed to ingest repository.");
      }
    } catch (e) {
      setError("Network error connecting to backend.");
    } finally {
      setIngesting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, repoId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this repository? This cannot be undone.")) return;
    
    try {
      const token = await getToken();
      const res = await fetch(`http://127.0.0.1:8000/api/v1/repos/${repoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchRepos(); // Refresh the list
      } else {
        const data = await res.json();
        alert(data.detail || "Failed to delete repository");
      }
    } catch (e) {
      alert("Network error while deleting.");
    }
  };

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <nav className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">DevNavigator</span>
          </div>
          <div className="flex items-center space-x-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.firstName || 'Developer'}</h1>
          <p className="text-slate-600">Manage your ingested repositories and analyze architecture health.</p>
        </header>

        {/* Ingest Form */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Ingest New Repository</h2>
          <form onSubmit={handleIngest} className="flex space-x-4">
            <div className="flex-1">
              <input 
                type="text" 
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                placeholder="Paste a public GitHub URL (e.g., https://github.com/facebook/react)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                disabled={ingesting}
              />
            </div>
            <button 
              type="submit" 
              disabled={ingesting || !ingestUrl.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 rounded-xl transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {ingesting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>Import Repository</span>
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
              <p className="text-amber-800 text-sm font-medium">{error}</p>
              {error.includes("Upgrade to Pro") && (
                <button
                  onClick={async () => {
                    const token = await getToken();
                    const res = await fetch("http://127.0.0.1:8000/api/v1/create-checkout-session", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-lg shadow hover:shadow-md transition-all"
                >
                  Unlock Pro for $15/mo
                </button>
              )}
            </div>
          )}
        </section>

        {/* Repositories Grid */}
        <section>
          <h2 className="text-lg font-bold mb-6">Your Repositories</h2>
          {repos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
              <p className="text-slate-500">You haven't ingested any repositories yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {repos.map(repo => (
                <div 
                  key={repo.id} 
                  onClick={() => router.push(`/repo/${repo.id}`)}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 cursor-pointer h-full flex flex-col relative"
                >
                  <button 
                    onClick={(e) => handleDelete(e, repo.id)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete Repository"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <h3 className="font-bold text-lg mb-2 text-indigo-900 group-hover:text-indigo-600 transition-colors pr-8">{repo.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 truncate font-mono bg-slate-50 p-2 rounded-lg">{repo.path}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Tech Debt Score</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      repo.tech_debt_score > 50 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {repo.tech_debt_score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

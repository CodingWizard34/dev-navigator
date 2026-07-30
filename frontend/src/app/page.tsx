import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto p-6 lg:p-12 space-y-24">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight">DevNavigator</span>
          </div>
          <div className="flex items-center space-x-4">
            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2 transition-colors">Log In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow">
                    Sign Up Free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow">
                Go to Dashboard
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center space-y-8 max-w-4xl mx-auto pt-12">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium border border-indigo-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Platform v2.0 is now live</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Chat with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">entire codebase.</span>
          </h1>
          
          <p className="text-slate-600 text-xl max-w-2xl mx-auto leading-relaxed">
            Upload your repository and let DevNavigator guide you through complex codebases. Find tech debt, debug instantly, and understand spaghetti code in seconds.
          </p>

          <div className="pt-8 flex justify-center space-x-4">
            {!userId ? (
              <SignUpButton mode="modal">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Start for free
                </button>
              </SignUpButton>
            ) : (
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-medium px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Mockup / Dashboard Preview Graphic */}
        <div className="mt-16 rounded-3xl border border-slate-200 bg-white/50 backdrop-blur-xl p-4 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-50"></div>
          <div className="aspect-[16/9] w-full rounded-2xl bg-slate-900 flex items-center justify-center relative overflow-hidden shadow-inner border border-slate-800">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
             <div className="text-slate-400 text-center space-y-4">
                <svg className="w-16 h-16 mx-auto text-indigo-500 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <p className="text-xl font-medium">Knowledge Graph Visualization (Coming Soon)</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

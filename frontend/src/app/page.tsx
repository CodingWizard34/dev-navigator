import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Navigation */}
        <nav className="flex justify-between items-center py-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white">DevNavigator</span>
          </div>
          <div className="flex items-center space-x-4">
            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-slate-300 hover:text-white font-medium px-4 py-2 transition-colors">Log In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                    Start Free
                  </button>
                </SignUpButton>
              </>
            ) : (
              <Link href="/dashboard" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                Go to Dashboard
              </Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center space-y-8 py-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/50 text-indigo-400 text-sm font-medium border border-slate-700/50 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Now with 1-Click GitHub Integration & Real-Time Streaming</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Talk to your codebase. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Ship 10x faster.</span>
          </h1>
          
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Paste any GitHub URL. Our GraphRAG engine instantly builds a neural map of your architecture, letting you chat, debug, and refactor in real-time.
          </p>

          <div className="pt-8 flex justify-center space-x-4">
            {!userId ? (
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-lg font-semibold px-10 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:shadow-[0_0_40px_rgba(79,70,229,0.6)] hover:-translate-y-1">
                  Start mapping for free
                </button>
              </SignUpButton>
            ) : (
              <Link href="/dashboard" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-lg font-semibold px-10 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:-translate-y-1">
                Enter Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24 border-t border-slate-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Superpowers for Software Engineers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1-Click GitHub Sync</h3>
              <p className="text-slate-400 leading-relaxed">No local downloads required. Just paste a public repository URL and our backend clones, parses, and embeds it instantly.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-Time Streaming</h3>
              <p className="text-slate-400 leading-relaxed">Powered by Gemini AI and Server-Sent Events, get answers typed out word-by-word instantly with zero lag.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-sm hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 text-pink-400 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Radial Map Visualizer</h3>
              <p className="text-slate-400 leading-relaxed">View a beautiful 2D exploding starburst diagram of your architecture. See how files, classes, and methods connect.</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-24 border-t border-slate-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Simple, transparent pricing</h2>
            <p className="text-slate-400 mt-4">Start for free, upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl">
              <h3 className="text-2xl font-bold text-white mb-2">Hobby</h3>
              <div className="flex items-baseline text-4xl font-extrabold text-white mb-6">
                $0
                <span className="text-lg text-slate-400 font-medium ml-1">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-slate-300"><svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 1 Repository Ingestion</li>
                <li className="flex items-center text-slate-300"><svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> 5 AI Chat Questions</li>
                <li className="flex items-center text-slate-300"><svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Basic Graph Visualization</li>
              </ul>
              {!userId ? (
                <SignUpButton mode="modal">
                  <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors">Sign Up Free</button>
                </SignUpButton>
              ) : (
                <button className="w-full bg-slate-700 text-slate-400 font-semibold py-3 rounded-xl cursor-not-allowed">Current Plan</button>
              )}
            </div>

            {/* Pro Tier */}
            <div className="bg-gradient-to-b from-indigo-900/50 to-slate-900 border border-indigo-500 p-8 rounded-3xl relative shadow-[0_0_50px_rgba(79,70,229,0.15)]">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="flex items-baseline text-4xl font-extrabold text-white mb-6">
                $15
                <span className="text-lg text-slate-400 font-medium ml-1">/mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-white"><svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unlimited Repositories</li>
                <li className="flex items-center text-white"><svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Unlimited AI Chat Questions</li>
                <li className="flex items-center text-white"><svg className="w-5 h-5 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Fast-Lane Gemini Processing</li>
              </ul>
              {!userId ? (
                <SignUpButton mode="modal">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5">Start Pro Trial</button>
                </SignUpButton>
              ) : (
                <Link href="/dashboard" className="block text-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5">Upgrade to Pro in Dashboard</Link>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} DevNavigator. All rights reserved. Built with ❤️ for AI Engineers.
        </footer>
      </div>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function JobPage() {
    const params = useParams();
    const jobId = params.id as string;

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-xl font-semibold tracking-tight">
                        <span className="text-blue-500">Repo</span>Learn
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        Analyzing...
                    </div>
                </div>
            </header>

            {/* 3-Panel Layout */}
            <div className="flex-1 grid grid-cols-12 gap-0">
                {/* Left Panel: Planner */}
                <aside className="col-span-3 border-r border-zinc-800 p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                        Planner
                    </h3>
                    <div className="space-y-2">
                        {/* Placeholder TODO items */}
                        <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 text-sm">
                            <span className="w-4 h-4 border border-zinc-600 rounded"></span>
                            <span className="text-zinc-500">Waiting for tasks...</span>
                        </div>
                    </div>
                </aside>

                {/* Center Panel: The Brain */}
                <main className="col-span-6 border-r border-zinc-800 flex flex-col">
                    <div className="p-4 border-b border-zinc-800">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                            The Brain
                        </h3>
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-zinc-900/50">
                        {/* Terminal-like log output */}
                        <div className="space-y-1 text-zinc-400">
                            <p>
                                <span className="text-blue-400">[system]</span> Connected to LangGraph server
                            </p>
                            <p>
                                <span className="text-blue-400">[system]</span> Job ID: {jobId.slice(0, 8)}...
                            </p>
                            <p>
                                <span className="text-yellow-400">[agent]</span> Initializing analysis...
                            </p>
                            <p className="animate-pulse">▊</p>
                        </div>
                    </div>
                </main>

                {/* Right Panel: The Grid (Sub-agents) */}
                <aside className="col-span-3 p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                        Sub-agents
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {/* Placeholder - no active sub-agents */}
                        <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center">
                            <p className="text-sm text-zinc-500">No active sub-agents</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Footer / Status bar */}
            <footer className="border-t border-zinc-800 px-6 py-2 text-xs text-zinc-500">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span>Thread: {jobId.slice(0, 8)}...</span>
                    <span>Tokens: 0 | Cost: $0.00</span>
                </div>
            </footer>
        </main>
    );
}

"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useAgentStream } from "@/hooks/useAgentStream";
import { PlannerPanel } from "@/components/PlannerPanel";
import { BrainPanel } from "@/components/BrainPanel";
import { GridPanel } from "@/components/GridPanel";

function JobPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const jobId = params.id as string;

    // Get the GitHub URL and audience from query params (set by /new page)
    const githubUrl = searchParams.get("url");
    const audience = (searchParams.get("audience") as "user" | "dev") || "dev";

    const [hasStarted, setHasStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const {
        messages,
        todos,
        subagents,
        isLoading,
        error,
        threadId,
        submitAnalysis,
    } = useAgentStream({
        // Don't pass initial thread since we create it optimistically
        onComplete: () => setIsComplete(true),
    });

    // Auto-start analysis when page loads with a URL
    useEffect(() => {
        if (githubUrl && !hasStarted && !isLoading) {
            setHasStarted(true);
            submitAnalysis(githubUrl, audience);
        }
    }, [githubUrl, hasStarted, isLoading, audience, submitAnalysis]);

    // Calculate status
    const status = isComplete
        ? "complete"
        : isLoading
            ? "analyzing"
            : error
                ? "error"
                : hasStarted
                    ? "processing"
                    : "idle";

    return (
        <main className="h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-800 px-6 py-4 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-xl font-semibold tracking-tight">
                        <span className="text-blue-500">Repo</span>Learn
                    </Link>
                    <div className="flex items-center gap-4">
                        {/* Status badge */}
                        <div className="flex items-center gap-2 text-sm">
                            {(status === "analyzing" || status === "processing") && (
                                <>
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                    <span className="text-yellow-400">Analyzing...</span>
                                </>
                            )}
                            {status === "complete" && (
                                <>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    <span className="text-emerald-400">Complete</span>
                                </>
                            )}
                            {status === "error" && (
                                <>
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    <span className="text-red-400">Error</span>
                                </>
                            )}
                            {status === "idle" && (
                                <>
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full"></span>
                                    <span className="text-zinc-400">Ready</span>
                                </>
                            )}
                        </div>

                        {/* View Tutorial button (when complete) */}
                        {isComplete && githubUrl && (
                            <Link
                                href={`/tutorial/${encodeURIComponent(githubUrl)}`}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                View Tutorial →
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Error display */}
            {error && (
                <div className="bg-red-900/20 border-b border-red-800 px-6 py-3 text-sm text-red-400">
                    Error: {(error as Error)?.message || String(error)}
                </div>
            )}

            {/* 3-Panel Layout */}
            <div className="flex-1 grid grid-cols-12 min-h-0">
                {/* Left Panel: Planner (3 cols) */}
                <div className="col-span-3 min-h-0">
                    <PlannerPanel todos={todos} isLoading={isLoading || (hasStarted && messages.length === 0)} />
                </div>

                {/* Center Panel: The Brain (6 cols) */}
                <div className="col-span-6 min-h-0">
                    <BrainPanel messages={messages} isLoading={isLoading || (hasStarted && messages.length === 0)} />
                </div>

                {/* Right Panel: Sub-agents Grid (3 cols) */}
                <div className="col-span-3 min-h-0">
                    <GridPanel subagents={subagents} isLoading={isLoading || (hasStarted && messages.length === 0)} />
                </div>
            </div>

            {/* Footer / Status bar */}
            <footer className="border-t border-zinc-800 px-6 py-2 text-xs text-zinc-500 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span>Thread: {(threadId || jobId).slice(0, 8)}...</span>
                    <span>
                        {githubUrl && (
                            <span className="text-zinc-400">{githubUrl}</span>
                        )}
                    </span>
                </div>
            </footer>
        </main>
    );
}

export default function JobPage() {
    return (
        <Suspense fallback={
            <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
                Loading...
            </div>
        }>
            <JobPageContent />
        </Suspense>
    );
}

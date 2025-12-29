"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useAgentStream } from "@/hooks/useAgentStream";
import { useThreadHistory } from "@/hooks/useThreadHistory";
import { PlannerPanel } from "@/components/PlannerPanel";
import { BrainPanel } from "@/components/BrainPanel";
import { GridPanel } from "@/components/GridPanel";

function JobPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const jobId = params.id as string;

    // Get mode and params from query
    const githubUrl = searchParams.get("url");
    const audience = (searchParams.get("audience") as "user" | "dev") || "dev";
    const isReadonly = searchParams.get("readonly") === "true";
    let tutorialId = searchParams.get("tutorial"); // For linking back to tutorial

    // Defensive: If tutorialId looks like a URL, convert it to repoId format
    if (tutorialId && tutorialId.includes("github.com")) {
        const match = tutorialId.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            tutorialId = `${match[1]}_${match[2]}`.replace(/\.git$/, "");
        }
    }

    const [hasStarted, setHasStarted] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    // Use different hooks based on mode
    const liveStream = useAgentStream({
        onComplete: () => setIsComplete(true),
    });

    const historyStream = useThreadHistory(isReadonly ? jobId : null);

    // Pick the right data source
    const messages = isReadonly ? historyStream.messages : liveStream.messages;
    const todos = isReadonly ? historyStream.todos : liveStream.todos;
    const subagents = isReadonly ? historyStream.subagents : liveStream.subagents;
    const isLoading = isReadonly ? historyStream.isLoading : liveStream.isLoading;
    const error: Error | null = isReadonly
        ? historyStream.error
        : (liveStream.error instanceof Error ? liveStream.error : liveStream.error ? new Error(String(liveStream.error)) : null);
    const threadId = isReadonly ? jobId : liveStream.threadId;

    // Save thread ID and audience when job completes (for future dashboard access)
    const saveThreadMetadata = useCallback(async (repoId: string, tid: string, aud: "user" | "dev") => {
        try {
            await fetch(`/api/tutorials/${encodeURIComponent(repoId)}/metadata`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ threadId: tid, audience: aud }),
            });
        } catch (err) {
            console.error("Failed to save thread metadata:", err);
        }
    }, []);

    // Auto-start analysis when page loads with a URL (live mode only)
    const { submitAnalysis, isLoading: streamLoading } = liveStream;

    // Auto-start analysis when page loads with a URL (live mode only)
    useEffect(() => {
        if (isReadonly || !githubUrl || isComplete) return;

        // Use a ref or simple check to ensure we only run once
        if (!hasStarted && !streamLoading) {
            setHasStarted(true);
            submitAnalysis(githubUrl, audience);
        }
    }, [isReadonly, githubUrl, hasStarted, streamLoading, submitAnalysis, audience, isComplete]);

    // Save thread ID and Redirect when complete (only if no error)
    useEffect(() => {
        // Don't redirect if there's an error
        if (error) return;

        if (isComplete && githubUrl && liveStream.threadId) {
            const checkAndRedirect = async () => {
                // Convert github URL to repo ID format
                const url = githubUrl as string;
                const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
                if (match) {
                    const repoId = `${match[1]}_${match[2]}`.replace(/\.git$/, "");
                    saveThreadMetadata(repoId, liveStream.threadId, audience);

                    // Check if tutorial actually exists before redirecting
                    try {
                        const res = await fetch(`/api/tutorials/${encodeURIComponent(repoId)}?audience=${audience}`);
                        if (res.ok && !isReadonly) {
                            router.push(`/tutorial/${encodeURIComponent(repoId)}?audience=${audience}`);
                        } else {
                            console.error("Tutorial generation failed or file not found.");
                        }
                    } catch (e) {
                        console.error("Error checking tutorial existence:", e);
                    }
                }
            };
            checkAndRedirect();
        }
    }, [isComplete, githubUrl, liveStream.threadId, audience, saveThreadMetadata, isReadonly, router, error]);

    // Calculate status
    const status = isReadonly
        ? "history"
        : isComplete
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
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        {/* Back button for readonly mode */}
                        {isReadonly && tutorialId && (
                            <Link
                                href={`/tutorial/${encodeURIComponent(tutorialId || "")}?audience=${audience}`}
                                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                <span className="text-sm">Back to Tutorial</span>
                            </Link>
                        )}
                        {isReadonly && tutorialId && <div className="h-5 w-px bg-zinc-700" />}

                        <Link href="/" className="text-xl font-semibold tracking-tight">
                            <span className="text-blue-600">Repo</span>Learn
                        </Link>
                    </div>

                    <div className="h-5 w-px bg-zinc-800" />

                    <div className="flex items-center gap-4">
                        {/* Status badge */}
                        <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                            {status === "history" && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                                    <span className="text-purple-400">History View</span>
                                </div>
                            )}
                            {(status === "analyzing" || status === "processing") && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
                                    <span className="text-yellow-400 font-mono">Analyzing...</span>
                                </div>
                            )}
                            {status === "complete" && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                    <span className="text-emerald-400">Complete</span>
                                </div>
                            )}
                            {status === "error" && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    <span className="text-red-400">Error</span>
                                </div>
                            )}
                            {status === "idle" && (
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></span>
                                    <span>Ready</span>
                                </div>
                            )}
                        </div>

                        {/* View Tutorial button (when complete, live mode only) */}
                        {!isReadonly && isComplete && githubUrl && (
                            <Link
                                href={`/tutorial/${encodeURIComponent(githubUrl)}`}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
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
                    <PlannerPanel todos={todos} isLoading={isLoading && !isReadonly} />
                </div>

                {/* Center Panel: The Brain (6 cols) */}
                <div className="col-span-6 min-h-0">
                    <BrainPanel messages={messages} isLoading={isLoading && !isReadonly} />
                </div>

                {/* Right Panel: Sub-agents Grid (3 cols) */}
                <div className="col-span-3 min-h-0">
                    <GridPanel subagents={subagents} isLoading={isLoading && !isReadonly} />
                </div>
            </div>

            {/* Footer / Status bar */}
            <footer className="border-t border-zinc-800 px-6 py-2 text-xs text-zinc-500 flex-shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span>Thread: {(threadId || jobId).slice(0, 8)}...</span>
                    <span>
                        {isReadonly && <span className="text-purple-400 mr-2">[Read-Only]</span>}
                        {(githubUrl || tutorialId) && (
                            <span className="text-zinc-400">{githubUrl || tutorialId}</span>
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
            <div className="h-screen flex items-center justify-center bg-black text-zinc-400">
                Loading...
            </div>
        }>
            <JobPageContent />
        </Suspense>
    );
}

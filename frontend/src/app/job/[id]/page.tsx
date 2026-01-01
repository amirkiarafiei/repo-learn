"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import Link from "next/link";
import { usePersistentAgent } from "@/hooks/usePersistentAgent";
import { useThreadHistory } from "@/hooks/useThreadHistory";
import { PlannerPanel } from "@/components/PlannerPanel";
import { BrainPanel } from "@/components/BrainPanel";
import { GridPanel } from "@/components/GridPanel";
import { useJob } from "@/context/JobContext";
import { useToast } from "@/components/Toast";

function JobPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const jobId = params.id as string;
    const { activeJob, completeJob, clearJob } = useJob();
    const { addToast } = useToast();

    // Dialog states
    const [showStopConfirm, setShowStopConfirm] = useState(false);
    const [showRetryConfirm, setShowRetryConfirm] = useState(false);

    // Get mode and params from query (with fallbacks to activeJob for resumption)
    const githubUrl = searchParams.get("url");
    const audience = (searchParams.get("audience") as "user" | "dev") || activeJob?.audience || "dev";
    const depth = (searchParams.get("depth") as "basic" | "detailed") || activeJob?.depth || "basic";
    const isReadonly = searchParams.get("readonly") === "true";
    let tutorialId = searchParams.get("tutorial"); // For linking back to tutorial

    // Defensive: If tutorialId looks like a URL, convert it to repoId format
    if (tutorialId && tutorialId.includes("github.com")) {
        const match = tutorialId.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            tutorialId = `${match[1]}_${match[2]}`.replace(/\.git$/, "").toLowerCase();
        }
    }

    // ========================================
    // FIX: Use refs for synchronous guards
    // ========================================
    const hasStartedRef = useRef(false);
    const redirectAttemptedRef = useRef(false);

    const [isComplete, setIsComplete] = useState(false);

    // Use different hooks based on mode
    const isResuming = !isReadonly && activeJob?.id === jobId;

    const liveAgent = usePersistentAgent();
    // Monitor completion from live agent
    useEffect(() => {
        if (!isReadonly && liveAgent.status === "completed" && !isComplete) {
            setIsComplete(true);
            completeJob();
            addToast("Tutorial generation complete!", "success");
        }
    }, [isReadonly, liveAgent.status, isComplete, completeJob, addToast]);


    const historyStream = useThreadHistory(isReadonly ? jobId : null);

    // Pick the right data source
    const messages = isReadonly ? historyStream.messages : liveAgent.messages;
    const todos = isReadonly ? historyStream.todos : liveAgent.todos;
    const subagents = isReadonly ? historyStream.subagents : liveAgent.subagents;
    const isLoading = isReadonly ? historyStream.isLoading : liveAgent.isLoading;
    // Error handling: checking both Error object and string possibilities securely
    const error: Error | null = isReadonly
        ? historyStream.error
        : (liveAgent.error instanceof Error ? liveAgent.error : liveAgent.error ? new Error(String(liveAgent.error)) : null);

    // Thread ID source
    const threadId = isReadonly ? jobId : activeJob?.threadId;

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

    // Pre-create tutorial directory before analysis starts
    const ensureTutorialDir = useCallback(async (repoId: string, aud: "user" | "dev") => {
        try {
            await fetch(`/api/tutorials/${repoId}/metadata`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audience: aud, status: "generating", startedAt: new Date().toISOString() }),
            });
            console.log("[JobPage] Pre-created tutorial directory for:", repoId, aud);
        } catch (err) {
            console.error("Failed to create tutorial directory:", err);
            // Non-fatal - agent might still work
        }
    }, []);

    // Auto-start analysis when page loads with a URL (live mode only)
    const { start, stop, status: agentStatus } = liveAgent;

    // ========================================
    // FIX: Use ref-based guard to prevent double execution
    // ========================================
    useEffect(() => {
        if (isReadonly || !githubUrl || isComplete) return;

        // If we represent the active job, do not restart
        if (activeJob?.id === jobId) {
            console.log("[JobPage] Connected to active job:", jobId);
            return;
        }

        // Synchronous guard using ref - prevents race condition
        // Also check if we are already running (agentStatus)
        if (!hasStartedRef.current && agentStatus === "idle") {
            hasStartedRef.current = true;

            // Pre-create tutorial directory before starting analysis
            const startAnalysis = async () => {
                const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                let repoId = "unknown_repo";
                if (match) {
                    repoId = `${match[1]}_${match[2]}`.toLowerCase().replace(/\.git$/, "");
                    await ensureTutorialDir(repoId, audience);
                }

                console.log("[JobPage] Starting analysis for:", githubUrl, "depth:", depth);

                start(jobId, repoId, audience, depth);
            };
            startAnalysis();
        }
    }, [isReadonly, githubUrl, agentStatus, start, audience, depth, isComplete, ensureTutorialDir, activeJob, jobId]);



    // Handle Stop
    const handleStop = async () => {
        setShowStopConfirm(false);
        stop(); // Calls stream.stop() and clearJob() internally in our modified hook
        // But let's be explicit with context
        clearJob();
        router.push("/");
    };

    // Handle Retry
    const handleRetry = async () => {
        setShowRetryConfirm(false);
        stop();
        clearJob();

        // Cleanup existing tutorial content
        if (githubUrl) {
            const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (match) {
                const repoId = `${match[1]}_${match[2]}`.replace(/\.git$/, "").toLowerCase();
                try {
                    console.log("[JobPage] Cleaning up tutorial for retry:", repoId);
                    await fetch(`/api/tutorials/${encodeURIComponent(repoId)}?audience=${audience}`, {
                        method: "DELETE"
                    });
                } catch (e) {
                    console.error("Failed to cleanup tutorial:", e);
                }
            }
        }

        // Reload page to same URL to restart fresh
        window.location.reload();
    };


    // ========================================
    // FIX: Improved redirect logic with retry verification
    // ========================================
    useEffect(() => {
        // Don't redirect if there's an error or already attempted or readonly
        if (error || redirectAttemptedRef.current || isReadonly) return;

        // Determine repoId from URL or activeJob
        const resolvedRepoId = activeJob?.repoId || (() => {
            if (!githubUrl) return null;
            const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
            return match ? `${match[1]}_${match[2]}`.replace(/\.git$/, "").toLowerCase() : null;
        })();

        if (isComplete && resolvedRepoId && threadId) {
            // Mark as attempted to prevent duplicate redirects
            redirectAttemptedRef.current = true;

            const checkAndRedirect = async () => {
                const repoId = resolvedRepoId;
                console.log("[JobPage] Verifying tutorial exists for:", repoId);

                // Save metadata WITH threadId immediately to ensure it's available
                console.log("[JobPage] Saving thread metadata:", { repoId, threadId, audience });
                await saveThreadMetadata(repoId, threadId!, audience);

                // Retry logic: filesystem may have delay
                // Increased to 10 attempts * 1s = 10s max wait
                let verified = false;
                for (let attempt = 0; attempt < 10; attempt++) {
                    await new Promise(r => setTimeout(r, 1000));

                    try {
                        const res = await fetch(`/api/tutorials/${encodeURIComponent(repoId)}?audience=${audience}`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.files && data.files.length > 0) {
                                verified = true;
                                console.log(`[JobPage] Tutorial verified on attempt ${attempt + 1}`);
                                break;
                            }
                        }
                    } catch (e) {
                        console.warn(`[JobPage] Verification attempt ${attempt + 1} failed:`, e);
                    }
                }

                if (!verified) {
                    console.error("[JobPage] Tutorial verification failed after 10 attempts");
                    // Reset attempt ref so user can try to trigger it again if they want (though it's automatic)
                    redirectAttemptedRef.current = false;
                    return;
                }

                // Redirect to tutorial
                console.log("[JobPage] Redirecting to tutorial...");
                router.push(`/tutorial/${encodeURIComponent(repoId)}?audience=${audience}`);
            };
            checkAndRedirect();
        }
    }, [isComplete, githubUrl, activeJob?.repoId, threadId, audience, saveThreadMetadata, isReadonly, router, error]);

    // Calculate status
    const status = isReadonly
        ? "history"
        : isComplete
            ? "complete"
            : isLoading
                ? "analyzing"
                : error
                    ? "error"
                    : hasStartedRef.current || isResuming
                        ? "processing"
                        : "idle";

    return (
        <main className="h-screen flex flex-col relative">
            {/* Stop Confirmation Dialog */}
            {showStopConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Stop Generation?</h3>
                        <p className="text-zinc-400 mb-6">
                            Current progress will be lost. You will be returned to the home page.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowStopConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStop}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
                            >
                                Stop Generation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Retry Confirmation Dialog */}
            {showRetryConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">Restart Generation?</h3>
                        <p className="text-zinc-400 mb-6">
                            Current progress will be lost and the analysis will start over from the beginning.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRetryConfirm(false)}
                                className="px-4 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRetry}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-zinc-800 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
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

                        {!isReadonly && <div className="h-5 w-px bg-zinc-800" />}

                        {!isReadonly && (
                            <div className="flex items-center gap-4">
                                {/* Status badge */}
                                <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
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
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side Controls */}
                    <div className="flex items-center gap-3">
                        {/* View Tutorial button (when complete, live mode only) */}
                        {!isReadonly && isComplete && githubUrl && (() => {
                            const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                            const repoId = match ? `${match[1]}_${match[2]}`.replace(/\.git$/, "").toLowerCase() : githubUrl;
                            return (
                                <Link
                                    href={`/tutorial/${encodeURIComponent(repoId)}?audience=${audience}`}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                    View Tutorial →
                                </Link>
                            );
                        })()}

                        {/* Control Buttons (Stop/Retry) - Only in active mode */}
                        {!isReadonly && (
                            <>
                                {/* Retry Button - Always visible */}
                                <button
                                    onClick={() => setShowRetryConfirm(true)}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                                    title="Restart Analysis"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>

                                {/* Stop Button - Visible when running */}
                                {!isComplete && !error && (
                                    <button
                                        onClick={() => setShowStopConfirm(true)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 border border-red-900/50 hover:bg-red-900/20 rounded-lg transition-all"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Stop
                                    </button>
                                )}
                            </>
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

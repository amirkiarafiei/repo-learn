"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useJob } from "@/context/JobContext";

export default function NewRepository() {
    const router = useRouter();
    const { activeJob, clearJob } = useJob();
    const [url, setUrl] = useState("");
    const [audience, setAudience] = useState<"user" | "dev">("user");
    const [depth, setDepth] = useState<"basic" | "detailed">("basic");
    const [isLoading, setIsLoading] = useState(false);

    // Overwrite confirmation state
    const [showConfirm, setShowConfirm] = useState(false);
    const [showActiveJobDialog, setShowActiveJobDialog] = useState(false);
    const [existingTutorial, setExistingTutorial] = useState<string | null>(null);
    const [checkError, setCheckError] = useState<string | null>(null);

    // Check for active job on mount and whenever it changes
    useEffect(() => {
        if (activeJob && activeJob.status === "generating") {
            setShowActiveJobDialog(true);
        } else {
            setShowActiveJobDialog(false);
        }
    }, [activeJob]);

    const proceedToJob = async (isOverwrite = false) => {
        setIsLoading(true);

        // Cleanup if overwriting
        if (isOverwrite && url) {
            const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (match) {
                const repoId = `${match[1]}_${match[2]}`.replace(/\.git$/, "").toLowerCase();
                try {
                    console.log("[NewPage] Cleaning up existing tutorial for overwrite:", repoId);
                    await fetch(`/api/tutorials/${encodeURIComponent(repoId)}?audience=${audience}`, {
                        method: "DELETE"
                    });
                } catch (e) {
                    console.error("Failed to cleanup tutorial:", e);
                }
            }
        }

        // BUG FIX: If overwriting, or just starting new, we must CLEAR the old active job first
        // to prevent the JobPage from trying to "resume" the old completed one.
        if (isOverwrite || (activeJob && activeJob.status !== "generating")) {
            clearJob();
        }

        const jobId = crypto.randomUUID();
        const params = new URLSearchParams({
            url: url,
            audience: audience,
            depth: depth,
        });
        router.push(`/job/${jobId}?${params.toString()}`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCheckError(null);

        // Double check active job just in case
        if (activeJob && activeJob.status === "generating") {
            setShowActiveJobDialog(true);
            return;
        }

        // Validate URL format
        const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) {
            setCheckError("Please enter a valid GitHub URL");
            return;
        }

        const repoId = `${match[1]}_${match[2]}`.toLowerCase().replace(/\.git$/, "");

        // Pre-flight check: does this EXACT tutorial (repo + SAME audience) exist?
        try {
            setIsLoading(true);
            const res = await fetch(`/api/tutorials/${repoId}?audience=${audience}`);
            setIsLoading(false);

            if (res.ok) {
                const data = await res.json();
                // CRITICAL: Only show overwrite dialog if the SAME audience exists
                // The API may return a different audience as fallback - ignore those
                if (data.files && data.files.length > 0 && data.audience === audience) {
                    setExistingTutorial(repoId.replace(/_/g, "/"));
                    setShowConfirm(true);
                    return;
                }
            }
        } catch (err) {
            setIsLoading(false);
            // Network error - warn but allow proceeding
            console.warn("Could not check for existing tutorial:", err);
        }

        // No existing tutorial, proceed directly
        proceedToJob();
    };

    return (
        <main className="min-h-screen flex flex-col">
            {/* Active Job Blocking Dialog */}
            {showActiveJobDialog && activeJob && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-zinc-900 border border-blue-500/50 rounded-xl p-8 max-w-md shadow-2xl relative overflow-hidden">
                        {/* Background orbital animation */}
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <div className="w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                        </div>

                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span className="text-2xl animate-pulse">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold text-white">Agent is Busy</h3>
                        </div>

                        <p className="text-zinc-300 mb-6 relative z-10 leading-relaxed">
                            RepoLearn is currently generating a tutorial for <span className="font-mono text-blue-300">{activeJob.repoId.replace("_", "/")}</span>.
                            <br /><br />
                            Please wait for it to finish, or stop it to start a new one.
                        </p>

                        <div className="flex flex-col gap-3 relative z-10">
                            <Link
                                href={`/job/${activeJob.id}`}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-center transition-all hover-lift shadow-lg shadow-blue-900/20"
                            >
                                View Progress
                            </Link>
                            <Link
                                href="/"
                                className="w-full py-3 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-center transition-all"
                            >
                                Go Home
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Overwrite Confirmation Dialog */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-md shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">⚠️</span>
                            <h3 className="text-lg font-semibold text-white">Tutorial Already Exists</h3>
                        </div>
                        <p className="text-zinc-400 mb-6">
                            A <span className="text-blue-400 font-medium">{audience === "user" ? "user-friendly" : "developer"}</span> tutorial
                            for <span className="font-mono text-white bg-zinc-800 px-1.5 py-0.5 rounded">{existingTutorial}</span> already exists.
                            <br /><br />
                            Continuing will <span className="text-red-400 font-medium">overwrite</span> the existing tutorial.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => { setShowConfirm(false); setIsLoading(false); }}
                                className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { setShowConfirm(false); proceedToJob(true); }}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors"
                            >
                                Overwrite
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-zinc-800/50 px-4 py-2 bg-black sticky top-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors group"
                        >
                            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm">Home</span>
                        </button>
                        <div className="h-5 w-px bg-zinc-700" />
                        <Link href="/" className="text-xl font-semibold tracking-tight">
                            <span className="text-blue-600">Repo</span>
                            <span className="text-white">Learn</span>
                        </Link>
                    </div>
                    <a
                        href="https://github.com/amirkiarafiei/repo-learn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-sm transition-all"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                        </svg>
                        GitHub
                    </a>
                </div>
            </header>

            {/* Form */}
            <section className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold mb-2">Add Repository</h2>
                        <p className="text-xs text-zinc-500">Enter a GitHub URL to generate a tutorial</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message */}
                        {checkError && (
                            <div className="p-4 bg-red-900/20 border border-red-800 rounded-xl text-red-400 text-sm">
                                {checkError}
                            </div>
                        )}

                        {/* GitHub URL */}
                        <div className="space-y-2">
                            <label htmlFor="url" className="block text-sm font-medium text-zinc-300">
                                GitHub URL
                            </label>
                            <div className="relative">
                                <input
                                    id="url"
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://github.com/owner/repo"
                                    required
                                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500 transition-all focus-glow text-sm"
                                />
                                {url && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Target Audience */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-300">
                                Target Audience
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: "user", label: "User", desc: "End-user tutorials", icon: "👤" },
                                    { value: "dev", label: "Developer", desc: "Technical deep-dives", icon: "💻" },
                                ].map((option) => (
                                    <label key={option.value} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="audience"
                                            value={option.value}
                                            checked={audience === option.value}
                                            onChange={() => setAudience(option.value as "user" | "dev")}
                                            className="sr-only peer"
                                        />
                                        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all hover:border-zinc-600 hover-lift">
                                            <div className="text-xl mb-1">{option.icon}</div>
                                            <div className="font-semibold text-zinc-100 text-sm">{option.label}</div>
                                            <div className="text-xs text-zinc-500">{option.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Depth */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-zinc-300">
                                Tutorial Depth
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: "basic", label: "Basic", desc: "Quick overview", icon: "⚡" },
                                    { value: "detailed", label: "Detailed", desc: "Comprehensive guide", icon: "📖" },
                                ].map((option) => (
                                    <label key={option.value} className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="depth"
                                            value={option.value}
                                            checked={depth === option.value}
                                            onChange={() => setDepth(option.value as "basic" | "detailed")}
                                            className="sr-only peer"
                                        />
                                        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all hover:border-zinc-600 hover-lift">
                                            <div className="text-xl mb-1">{option.icon}</div>
                                            <div className="font-semibold text-zinc-100 text-sm">{option.label}</div>
                                            <div className="text-xs text-zinc-500">{option.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover-lift flex items-center justify-center gap-3 text-sm"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Checking...
                                </>
                            ) : (
                                <>
                                    Generate Tutorial
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}


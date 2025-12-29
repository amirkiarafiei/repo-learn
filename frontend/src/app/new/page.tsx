"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewRepository() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [audience, setAudience] = useState<"user" | "dev">("user");
    const [depth, setDepth] = useState<"basic" | "detailed">("basic");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const jobId = crypto.randomUUID();
        const params = new URLSearchParams({
            url: url,
            audience: audience,
        });
        router.push(`/job/${jobId}?${params.toString()}`);
    };

    return (
        <main className="min-h-screen flex flex-col">
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
                        <Link href="/" className="text-lg font-bold tracking-tight">
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
                <div className="w-full max-w-lg animate-fade-in">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-3">Add Repository</h2>
                        <p className="text-zinc-500">Enter a GitHub URL to generate a tutorial</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
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
                                    className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500 transition-all focus-glow"
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
                                        <div className="p-5 bg-zinc-900/50 border border-zinc-700 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all hover:border-zinc-600 hover-lift">
                                            <div className="text-2xl mb-2">{option.icon}</div>
                                            <div className="font-semibold text-zinc-100">{option.label}</div>
                                            <div className="text-sm text-zinc-500">{option.desc}</div>
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
                                        <div className="p-5 bg-zinc-900/50 border border-zinc-700 rounded-xl peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all hover:border-zinc-600 hover-lift">
                                            <div className="text-2xl mb-2">{option.icon}</div>
                                            <div className="font-semibold text-zinc-100">{option.label}</div>
                                            <div className="text-sm text-zinc-500">{option.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all hover-lift flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Starting...
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

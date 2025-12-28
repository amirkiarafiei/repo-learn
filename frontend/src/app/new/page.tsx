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
            <header className="border-b border-zinc-800/50 px-6 py-4 glass sticky top-0 z-40">
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
                            <span className="text-sm">Back</span>
                        </button>
                        <div className="h-5 w-px bg-zinc-700" />
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            <span className="gradient-text">Repo</span>
                            <span className="text-zinc-100">Learn</span>
                        </Link>
                    </div>
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

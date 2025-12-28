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

        // Generate a unique job ID (this will be the LangGraph thread ID)
        const jobId = crypto.randomUUID();

        // Redirect to job page with URL and audience as query params
        const params = new URLSearchParams({
            url: url,
            audience: audience,
        });

        router.push(`/job/${jobId}?${params.toString()}`);
    };

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-xl font-semibold tracking-tight">
                        <span className="text-blue-500">Repo</span>Learn
                    </Link>
                </div>
            </header>

            {/* Form */}
            <section className="flex-1 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-8 text-center">Add Repository</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* GitHub URL */}
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium mb-2">
                                GitHub URL
                            </label>
                            <input
                                id="url"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://github.com/owner/repo"
                                required
                                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-zinc-500"
                            />
                        </div>

                        {/* Target Audience */}
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Target Audience
                            </label>
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="audience"
                                        value="user"
                                        checked={audience === "user"}
                                        onChange={() => setAudience("user")}
                                        className="sr-only peer"
                                    />
                                    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-colors">
                                        <div className="font-medium">User</div>
                                        <div className="text-sm text-zinc-400">End-user tutorials</div>
                                    </div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="audience"
                                        value="dev"
                                        checked={audience === "dev"}
                                        onChange={() => setAudience("dev")}
                                        className="sr-only peer"
                                    />
                                    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-colors">
                                        <div className="font-medium">Developer</div>
                                        <div className="text-sm text-zinc-400">Technical deep-dives</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Depth */}
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Depth
                            </label>
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="depth"
                                        value="basic"
                                        checked={depth === "basic"}
                                        onChange={() => setDepth("basic")}
                                        className="sr-only peer"
                                    />
                                    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-colors">
                                        <div className="font-medium">Basic</div>
                                        <div className="text-sm text-zinc-400">Quick overview</div>
                                    </div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="depth"
                                        value="detailed"
                                        checked={depth === "detailed"}
                                        onChange={() => setDepth("detailed")}
                                        className="sr-only peer"
                                    />
                                    <div className="p-4 bg-zinc-900 border border-zinc-700 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-colors">
                                        <div className="font-medium">Detailed</div>
                                        <div className="text-sm text-zinc-400">Comprehensive guide</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                            {isLoading ? "Starting..." : "Generate Tutorial"}
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TutorialData {
    id: string;
    name: string;
    files: string[];
    contents: Record<string, string>;
}

interface TutorialMetadata {
    threadId?: string;
}

export default function TutorialPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [tutorial, setTutorial] = useState<TutorialData | null>(null);
    const [metadata, setMetadata] = useState<TutorialMetadata | null>(null);
    const [activeFile, setActiveFile] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        async function fetchTutorial() {
            try {
                const res = await fetch(`/api/tutorials/${encodeURIComponent(id)}`);
                if (!res.ok) throw new Error("Tutorial not found");
                const data = await res.json();
                setTutorial(data);
                if (data.files?.length > 0) {
                    setActiveFile(data.files[0]);
                }
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setLoading(false);
            }
        }

        async function fetchMetadata() {
            try {
                const res = await fetch(`/api/tutorials/${encodeURIComponent(id)}/metadata`);
                if (res.ok) {
                    const data = await res.json();
                    setMetadata(data);
                }
            } catch {
                // Metadata is optional
            }
        }

        fetchTutorial();
        fetchMetadata();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-3 text-zinc-400">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    Loading tutorial...
                </div>
            </div>
        );
    }

    if (error || !tutorial) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="text-red-400">Tutorial not found</div>
                <Link href="/" className="text-blue-400 hover:underline">
                    ← Back to home
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Back button */}
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            <span className="text-sm">Back</span>
                        </button>

                        <div className="h-5 w-px bg-zinc-700" />

                        <Link href="/" className="text-xl font-semibold tracking-tight">
                            <span className="text-blue-600">Repo</span>Learn
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* View Dashboard button (only if threadId exists) */}
                        {metadata?.threadId && (
                            <Link
                                href={`/job/${metadata.threadId}?readonly=true&tutorial=${encodeURIComponent(id)}`}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-purple-700/50 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40 text-sm transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                                Deep Agent Panel
                            </Link>
                        )}

                        <span className="text-zinc-400 text-sm">Repository:</span>
                        <span className="text-zinc-200 font-mono text-sm bg-zinc-800 px-2 py-1 rounded">
                            {tutorial.name}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex">
                {/* Collapsible Sidebar */}
                <aside
                    className={`border-r border-zinc-800 transition-all duration-300 flex-shrink-0 ${sidebarOpen ? "w-64" : "w-12"
                        }`}
                >
                    {/* Toggle button */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full py-2 flex items-center justify-center gap-2 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800"
                    >
                        {sidebarOpen && <span className="text-xs text-zinc-500 uppercase font-semibold">Hide</span>}
                        <svg
                            className={`w-4 h-4 text-zinc-400 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Sidebar content */}
                    {sidebarOpen && (
                        <div className="p-3">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
                                Sections
                            </h3>
                            <nav className="space-y-1">
                                {tutorial.files.map((file) => (
                                    <button
                                        key={file}
                                        type="button"
                                        onClick={() => setActiveFile(file)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeFile === file
                                            ? "bg-blue-900/30 text-blue-300 border border-blue-800/50"
                                            : "text-zinc-400 hover:bg-zinc-800/50"
                                            }`}
                                    >
                                        {file.replace(/\.md$/, "").replace(/_/g, " ")}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    )}
                </aside>

                {/* Main content - Markdown */}
                <article className="flex-1 p-8 overflow-auto">
                    <div className="max-w-4xl mx-auto prose prose-invert prose-zinc prose-headings:font-semibold prose-a:text-blue-400 prose-code:text-emerald-400 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {tutorial.contents[activeFile] || "No content"}
                        </ReactMarkdown>
                    </div>
                </article>
            </div>
        </main>
    );
}

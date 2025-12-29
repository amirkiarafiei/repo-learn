"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface TutorialData {
    id: string;
    name: string;
    audience: "user" | "dev";
    files: string[];
    contents: Record<string, string>;
}

interface TutorialMetadata {
    threadId?: string;
}

function TutorialPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = params.id as string;
    const audience = (searchParams.get("audience") as "user" | "dev") || "user";

    const [tutorial, setTutorial] = useState<TutorialData | null>(null);
    const [metadata, setMetadata] = useState<TutorialMetadata | null>(null);
    const [activeFile, setActiveFile] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [exporting, setExporting] = useState<string | null>(null);

    const handleExport = async (type: "markdown" | "pdf") => {
        setExporting(type);
        try {
            const res = await fetch(`/api/tutorials/${encodeURIComponent(id)}/export?type=${type}&audience=${audience}`);
            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${id}_${audience}_${type}_export.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e) {
            alert("Export failed. Please try again.");
        } finally {
            setExporting(null);
        }
    };

    useEffect(() => {
        async function fetchTutorial() {
            try {
                const res = await fetch(`/api/tutorials/${encodeURIComponent(id)}?audience=${audience}`);
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
                const res = await fetch(`/api/tutorials/${encodeURIComponent(id)}/metadata?audience=${audience}`);
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
    }, [id, audience]);

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
                            <span className="text-sm">Home</span>
                        </button>

                        <div className="h-5 w-px bg-zinc-700" />

                        <Link href="/" className="text-xl font-semibold tracking-tight">
                            <span className="text-blue-600">Repo</span>Learn
                        </Link>
                    </div>

                    {/* Centered Visualization Panel button */}
                    <div className="flex-1 flex justify-center items-center gap-3">
                        {metadata?.threadId && (
                            <Link
                                href={`/job/${metadata.threadId}?readonly=true&tutorial=${encodeURIComponent(id)}`}
                                className="flex items-center gap-2 px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 text-xs transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Visualization Panel
                            </Link>
                        )}

                        <div className="h-4 w-px bg-zinc-800" />

                        {/* Export Dropdown */}
                        <div className="relative group">
                            <button
                                className="flex items-center gap-2 px-3 py-1 rounded-lg border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 text-xs transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a1 1 0 001 1h14a1 1 0 001-1v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                {exporting ? "Exporting..." : "Export Docs"}
                                <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu - Opens on Hover/Group-Hover */}
                            <div className="absolute right-0 top-full mt-1 w-40 py-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                <button
                                    onClick={() => handleExport("markdown")}
                                    disabled={!!exporting}
                                    className="w-full text-left px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    Markdown (.zip)
                                </button>
                                <button
                                    onClick={() => handleExport("pdf")}
                                    disabled={!!exporting}
                                    className="w-full text-left px-4 py-2 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                >
                                    PDF (.zip)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-xs">Repository:</span>
                        <span className="text-zinc-300 font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded border border-zinc-800">
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

export default function TutorialPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black text-zinc-400">
                Loading tutorial...
            </div>
        }>
            <TutorialPageContent />
        </Suspense>
    );
}

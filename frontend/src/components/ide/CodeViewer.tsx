"use client";

import { useEffect, useState } from "react";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Import languages you expect to support
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";

// Register languages
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("markdown", markdown);

interface CodeViewerProps {
    repoId: string;
    filePath: string;
}

export default function CodeViewer({ repoId, filePath }: CodeViewerProps) {
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError(null);

        async function fetchContent() {
            try {
                const res = await fetch(
                    `/api/repositories/${repoId}/file?path=${encodeURIComponent(filePath)}`
                );

                if (!res.ok) throw new Error("Failed to load file");

                const data = await res.json();
                if (mounted) {
                    setContent(data.content);
                }
            } catch (err) {
                if (mounted) {
                    setError("Could not load file content");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchContent();
        return () => { mounted = false; };
    }, [repoId, filePath]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-zinc-500">
                <span className="animate-pulse">Loading {filePath}...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-400">
                {error}
            </div>
        );
    }

    // Determine language from extension
    const ext = filePath.split(".").pop()?.toLowerCase() || "text";
    const language = {
        ts: "typescript",
        js: "javascript",
        py: "python",
        sh: "bash",
        json: "json",
        tsx: "tsx",
        jsx: "javascript",
        md: "markdown"
    }[ext] || "text";

    return (
        <div className="h-full overflow-auto bg-[#1d1f21] text-sm">
            <SyntaxHighlighter
                language={language}
                style={atomDark}
                customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                    lineHeight: "1.5"
                }}
                showLineNumbers={true}
                lineNumberStyle={{
                    minWidth: "3em",
                    paddingRight: "1em",
                    color: "#5c6370",
                    textAlign: "right"
                }}
            >
                {content}
            </SyntaxHighlighter>
        </div>
    );
}

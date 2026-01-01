"use client";

import { useEffect, useState } from "react";
import {
    Folder,
    File,
    ChevronDown,
    ChevronRight,
    HardDrive,
    Database,
    FileText,
    AppWindow
} from "lucide-react";

// Types matching the API response
export interface FileNode {
    name: string;
    type: "file" | "dir";
    path: string;
    children?: FileNode[];
}

interface FileSystemResponse {
    repo: FileNode;
    tutorial: FileNode;
}

interface FileSystemPanelProps {
    repoId: string | null;
    audience: string | null;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    // Trigger to re-fetch data (increment to reload)
    revalidateKey: number;
}

// Recursive Tree Item Component
function FileTreeItem({ node, depth = 0, isRoot = false, defaultOpen = false }: { node: FileNode; depth?: number; isRoot?: boolean; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const hasChildren = node.type === "dir" && node.children && node.children.length > 0;

    // Auto-open if it's a root node
    useEffect(() => {
        if (isRoot) setIsOpen(true);
    }, [isRoot]);

    return (
        <div className="select-none">
            <div
                className={`
                    flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors cursor-pointer
                    ${depth === 0 ? "hover:bg-zinc-800/50" : "hover:bg-zinc-800/30"}
                `}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => hasChildren && setIsOpen(!isOpen)}
            >
                {/* Arrow */}
                <div className="w-4 h-4 flex items-center justify-center text-zinc-500">
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                    ) : (
                        <div className="w-4" />
                    )}
                </div>

                {/* Icon */}
                <div className={`${isRoot ? "text-blue-400" : node.type === "dir" ? "text-blue-300/80" : "text-zinc-500"}`}>
                    {isRoot ? (
                        <Database size={14} />
                    ) : node.type === "dir" ? (
                        <Folder size={14} />
                    ) : (
                        <FileText size={14} />
                    )}
                </div>

                {/* Name */}
                <span className={`text-xs truncate ${node.type === "dir" ? "text-zinc-300 font-medium" : "text-zinc-400"}`}>
                    {node.name}
                </span>
            </div>

            {/* Children */}
            {isOpen && node.children && (
                <div className="flex flex-col">
                    {node.children.map((child, i) => (
                        <FileTreeItem key={`${child.path}-${i}`} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FileSystemPanel({ repoId, audience, isCollapsed, onToggleCollapse, revalidateKey }: FileSystemPanelProps) {
    const [data, setData] = useState<FileSystemResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!repoId || !audience) return;

        let mounted = true;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/files?repoId=${encodeURIComponent(repoId)}&audience=${encodeURIComponent(audience)}`);
                if (!res.ok) throw new Error("Failed to load filesystem");
                const json = await res.json();
                if (mounted) {
                    setData(json);
                    setError(null);
                }
            } catch (err) {
                if (mounted) setError("Could not load filesystem");
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        fetchData();

        return () => { mounted = false; };
    }, [repoId, audience, revalidateKey]);

    return (
        <div className="flex flex-col border-r border-zinc-900 bg-black h-full border-t border-t-zinc-900">
            {/* Header / Toggle Bar */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-zinc-900/50 transition-colors bg-[#0A0A0A]"
                onClick={onToggleCollapse}
            >
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span>The Filesystem <span className="text-zinc-500 font-normal">(Virtual)</span> </span>
                </div>
                {isCollapsed ? <ChevronRight size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
            </div>

            {/* Content Area */}
            {!isCollapsed && (
                <div className="flex-1 overflow-y-auto scrollbar-hide p-2 pb-4">
                    {!repoId || !audience ? (
                        <div className="text-xs text-zinc-500 p-4 text-center">
                            Waiting for repository context...
                        </div>
                    ) : isLoading && !data ? (
                        <div className="flex items-center justify-center p-8">
                            <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                        </div>
                    ) : error ? (
                        <div className="text-xs text-red-500 p-4 text-center">{error}</div>
                    ) : data ? (
                        <div className="flex flex-col gap-0.5">
                            {/* Unified Root nodes */}
                            <FileTreeItem node={data.repo} isRoot={true} defaultOpen={false} />

                            <FileTreeItem
                                node={{ ...data.tutorial, name: `tutorials/${data.repo.name}/${data.tutorial.name}` }}
                                isRoot={true}
                                defaultOpen={true}
                            />
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

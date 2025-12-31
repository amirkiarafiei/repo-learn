"use client";

import { useEffect, useState, useRef } from "react";
import { Search, X, FileCode, BookOpen } from "lucide-react";
import Fuse from "fuse.js";

interface TabBarProps {
    tabs: string[];
    activeTab: string;
    onTabClick: (tab: string) => void;
    onTabClose: (tab: string) => void;
    repoId: string; // Needed for search
    onFileSelect: (path: string) => void;
}

export default function TabBar({
    tabs,
    activeTab,
    onTabClick,
    onTabClose,
    repoId,
    onFileSelect
}: TabBarProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [files, setFiles] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize Fuse lazily
    const fuseRef = useRef<Fuse<string> | null>(null);

    // Fetch file list on mount
    useEffect(() => {
        async function fetchFiles() {
            try {
                const res = await fetch(`/api/repositories/${repoId}/files`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.files) {
                        setFiles(data.files);
                        fuseRef.current = new Fuse(data.files, {
                            threshold: 0.4,
                            distance: 100
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to load file list for search", e);
            }
        }
        if (repoId) fetchFiles();
    }, [repoId]);

    // Handle search
    useEffect(() => {
        if (!searchQuery.trim() || !fuseRef.current) {
            setSearchResults([]);
            return;
        }
        const results = fuseRef.current.search(searchQuery, { limit: 10 });
        setSearchResults(results.map(r => r.item));
    }, [searchQuery]);

    // Click outside to close search
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Focus input when search opens
    useEffect(() => {
        if (searchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [searchOpen]);

    const handleFileSelect = (file: string) => {
        onFileSelect(file);
        setSearchOpen(false);
        setSearchQuery("");
    };

    return (
        <div className="flex items-center bg-black border-b border-[#30363d] h-10 px-2 select-none relative z-20">
            {/* Tabs Container */}
            <div className="flex-1 flex overflow-x-auto no-scrollbar items-end h-full gap-1 pr-2">
                {tabs.map((tab) => {
                    const isMd = tab.endsWith(".md");
                    const isActive = tab === activeTab;
                    const name = isMd
                        ? tab.replace(/\.md$/, "").replace(/_/g, " ")
                        : tab.split("/").pop();

                    return (
                        <div
                            key={tab}
                            className={`group flex items-center gap-2 px-3 py-2 text-xs border-t border-x rounded-t-lg cursor-pointer transition-colors min-w-[120px] max-w-[200px] ${isActive
                                ? "bg-[#0d1117] border-[#30363d] text-blue-400 font-medium"
                                : "bg-transparent border-transparent text-zinc-400 hover:bg-[#161b22] hover:text-zinc-200"
                                }`}
                            onClick={() => onTabClick(tab)}
                        >
                            {isMd ? <BookOpen size={12} className={isActive ? "text-blue-400" : "text-zinc-500"} /> : <FileCode size={12} className={isActive ? "text-emerald-400" : "text-zinc-500"} />}
                            <span className="truncate flex-1">{name}</span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTabClose(tab);
                                }}
                                className={`p-0.5 rounded-full hover:bg-zinc-700 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            >
                                <X size={10} />
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Search Trigger */}
            <div className="flex-shrink-0 relative ml-2" ref={searchRef}>
                <button
                    onClick={() => setSearchOpen(!searchOpen)}
                    className={`p-1.5 rounded-md transition-colors ${searchOpen ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
                    title="Search files (Ctrl+P)"
                >
                    <Search size={16} />
                </button>

                {/* Search Bar Overlay */}
                <div
                    className={`absolute right-0 top-full mt-2 w-72 bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 flex flex-col overflow-hidden origin-top-right transition-all duration-200 ease-out z-50 ${searchOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
                >
                    <div className="flex items-center px-3 py-2 border-b border-zinc-700 bg-zinc-800/50">
                        <Search size={14} className="text-zinc-500 mr-2" />
                        <input
                            ref={inputRef}
                            type="text"
                            className="bg-transparent border-none outline-none text-xs text-zinc-200 placeholder-zinc-500 w-full"
                            placeholder="Find file..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') setSearchOpen(false);
                            }}
                        />
                    </div>

                    {/* Results Dropdown */}
                    {(searchResults.length > 0 || (searchQuery && searchResults.length === 0)) && (
                        <div className="max-h-64 overflow-y-auto bg-zinc-900/95 backdrop-blur-sm">
                            {searchResults.length > 0 ? (
                                searchResults.map((file) => (
                                    <button
                                        key={file}
                                        onClick={() => handleFileSelect(file)}
                                        className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors flex items-center gap-2 truncate border-b border-zinc-800/50 last:border-0"
                                    >
                                        <FileCode size={12} className="flex-shrink-0 opacity-70" />
                                        <span className="truncate">{file}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-3 text-xs text-zinc-500 text-center italic">No results found</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

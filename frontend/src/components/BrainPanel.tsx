"use client";

import { useEffect, useRef, useState } from "react";
import { AgentMessage } from "@/hooks/useAgentStream";

interface BrainPanelProps {
    messages: AgentMessage[];
    isLoading: boolean;
}

export function BrainPanel({ messages, isLoading }: BrainPanelProps) {
    const endRef = useRef<HTMLDivElement>(null);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };


    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <main className="h-full flex flex-col border-r border-zinc-900 bg-black">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-black">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    The Brain <span className="text-zinc-500 font-normal">(Deep Agent)</span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-black scrollbar-hide">
                <div className="space-y-2">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                            {isLoading ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 border-2 border-blue-500/20 rounded-full"></div>
                                        <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                                    </div>
                                    <div className="text-zinc-500">
                                        Initializing agent<span className="typing-cursor"></span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="text-zinc-500">Waiting for agent...</div>
                                </>
                            )}
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={`space-y-2 animate-fade-in`}
                                style={{ animationDelay: `${index * 0.02}s` }}
                            >
                                {msg.type === "human" && (
                                    <div className="flex flex-col gap-1 p-3 rounded bg-[#0a1810] border border-emerald-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-500 font-bold">User</span>
                                        </div>
                                        <span className="text-zinc-200">{msg.content}</span>
                                    </div>
                                )}

                                {msg.type === "ai" && (
                                    <>
                                        {msg.content && (
                                            <div className="flex flex-col gap-1 p-3 rounded bg-[#0e0e1b] border border-indigo-800">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-indigo-400 font-bold">Deep Agent</span>
                                                </div>
                                                <span className="text-zinc-200 leading-relaxed font-sans">{msg.content}</span>
                                            </div>
                                        )}
                                        {msg.toolCalls?.map((tc, i) => {
                                            const itemId = `tc-${msg.id}-${i}`;
                                            const isExpanded = expandedItems.has(itemId);
                                            return (
                                                <div
                                                    key={i}
                                                    onClick={() => toggleExpand(itemId)}
                                                    className="ml-12 cursor-pointer flex flex-col gap-1 p-2 rounded bg-[#1a1200] border border-amber-800 hover:border-amber-600 transition-colors"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-amber-500 font-mono">→ {tc.name}</span>
                                                    </div>
                                                    <div className="text-zinc-400 text-xs font-mono overflow-hidden">
                                                        {isExpanded ? (
                                                            <pre className="whitespace-pre-wrap">{JSON.stringify(tc.args, null, 2)}</pre>
                                                        ) : (
                                                            <span className="opacity-70">
                                                                {JSON.stringify(tc.args).slice(0, 60)}...
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}

                                {msg.type === "tool" && (() => {
                                    const isExpanded = expandedItems.has(msg.id);
                                    return (
                                        <div
                                            onClick={() => toggleExpand(msg.id)}
                                            className="ml-12 cursor-pointer flex flex-col gap-1 p-2 rounded bg-[#00141a] border border-cyan-800 hover:border-cyan-600 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-cyan-500 font-mono">← {msg.name} Output</span>
                                            </div>
                                            <div className="text-zinc-400 text-xs font-mono">
                                                {isExpanded ? (
                                                    <pre className="whitespace-pre-wrap max-h-96 overflow-auto">{msg.content}</pre>
                                                ) : (
                                                    <span className="opacity-70">
                                                        {msg.content.slice(0, 80)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        ))
                    )}

                    {isLoading && messages.length > 0 && (
                        <div className="flex items-center gap-2 p-3 text-zinc-500">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="typing-cursor"></span>
                        </div>
                    )}

                    <div ref={endRef} />
                </div>
            </div>
        </main>
    );
}

"use client";

import { useEffect, useRef } from "react";
import { AgentMessage } from "@/hooks/useAgentStream";

interface BrainPanelProps {
    messages: AgentMessage[];
    isLoading: boolean;
}

export function BrainPanel({ messages, isLoading }: BrainPanelProps) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <main className="h-full flex flex-col border-r border-zinc-800/50">
            <div className="p-4 border-b border-zinc-800/50 glass flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="text-lg">🧠</span>
                    The Brain
                </h3>
                {isLoading && (
                    <span className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-blue-300">Thinking</span>
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-zinc-950/50 scrollbar-hide">
                <div className="space-y-3">
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
                                    <div className="text-4xl mb-3">💭</div>
                                    <div className="text-zinc-500">Waiting for agent...</div>
                                </>
                            )}
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id}
                                className={`space-y-1 animate-fade-in`}
                                style={{ animationDelay: `${index * 0.02}s` }}
                            >
                                {msg.type === "human" && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="text-emerald-400 font-bold">›</span>
                                        <span className="text-zinc-200">{msg.content}</span>
                                    </div>
                                )}

                                {msg.type === "ai" && (
                                    <>
                                        {msg.content && (
                                            <div className="flex items-start gap-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                                <span className="text-indigo-400 font-bold">⚡</span>
                                                <span className="text-zinc-200 leading-relaxed">{msg.content}</span>
                                            </div>
                                        )}
                                        {msg.toolCalls?.map((tc, i) => (
                                            <div key={i} className="ml-4 flex items-start gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20">
                                                <span className="text-amber-400">→</span>
                                                <div className="flex-1">
                                                    <span className="text-amber-300 font-semibold">{tc.name}</span>
                                                    <span className="text-zinc-600 ml-2 text-xs">
                                                        {Object.entries(tc.args)
                                                            .slice(0, 2)
                                                            .map(([k, v]) => `${k}=${JSON.stringify(v).slice(0, 30)}`)
                                                            .join(", ")}
                                                        {Object.keys(tc.args).length > 2 && "..."}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {msg.type === "tool" && (
                                    <div className="ml-4 flex items-start gap-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                        <span className="text-cyan-400">←</span>
                                        <div>
                                            <span className="text-cyan-300 font-semibold">{msg.name}</span>
                                            <span className="text-zinc-600 ml-2 text-xs">
                                                {msg.content.length > 80
                                                    ? msg.content.slice(0, 80) + "..."
                                                    : msg.content}
                                            </span>
                                        </div>
                                    </div>
                                )}
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

"use client";

import { useEffect, useRef } from "react";
import { AgentMessage } from "@/hooks/useAgentStream";

interface BrainPanelProps {
    messages: AgentMessage[];
    isLoading: boolean;
}

export function BrainPanel({ messages, isLoading }: BrainPanelProps) {
    const endRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <main className="h-full flex flex-col border-r border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    The Brain (Deep Agent)
                </h3>
                {isLoading && (
                    <span className="flex items-center gap-2 text-xs text-yellow-400">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        Thinking...
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-zinc-900/30">
                <div className="space-y-3">
                    {messages.length === 0 ? (
                        <p className="text-zinc-500">
                            <span className="text-blue-400">[system]</span> Waiting for agent...
                        </p>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className="space-y-1">
                                {msg.type === "human" && (
                                    <p className="text-zinc-300">
                                        <span className="text-green-400">[user]</span>{" "}
                                        {msg.content}
                                    </p>
                                )}

                                {msg.type === "ai" && (
                                    <>
                                        {msg.content && (
                                            <p className="text-zinc-300">
                                                <span className="text-purple-400">[agent]</span>{" "}
                                                {msg.content}
                                            </p>
                                        )}
                                        {msg.toolCalls?.map((tc, i) => (
                                            <p key={i} className="text-zinc-400 pl-4">
                                                <span className="text-yellow-400">→ {tc.name}</span>
                                                <span className="text-zinc-500">
                                                    ({Object.entries(tc.args)
                                                        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                                                        .join(", ")})
                                                </span>
                                            </p>
                                        ))}
                                    </>
                                )}

                                {msg.type === "tool" && (
                                    <p className="text-zinc-400 pl-4">
                                        <span className="text-cyan-400">← {msg.name}</span>{" "}
                                        <span className="text-zinc-500">
                                            {msg.content.length > 100
                                                ? msg.content.slice(0, 100) + "..."
                                                : msg.content}
                                        </span>
                                    </p>
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <p className="text-zinc-500 animate-pulse">▊</p>
                    )}

                    <div ref={endRef} />
                </div>
            </div>
        </main>
    );
}

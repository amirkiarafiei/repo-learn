"use client";

import { useState } from "react";
import { SubagentStatus } from "@/hooks/useAgentStream";

interface GridPanelProps {
    subagents: SubagentStatus[];
    isLoading: boolean;
}

export function GridPanel({ subagents, isLoading }: GridPanelProps) {
    const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

    const toggleAccordion = (agentName: string) => {
        setExpandedAgents((prev) => {
            const next = new Set(prev);
            if (next.has(agentName)) {
                next.delete(agentName);
            } else {
                next.add(agentName);
            }
            return next;
        });
    };

    const formatName = (name: string) => {
        return name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getAgentIcon = (name: string) => {
        if (name.includes("code") || name.includes("analyzer")) return "🔍";
        if (name.includes("doc") || name.includes("writer")) return "✍️";
        return "🤖";
    };

    const completed = subagents.filter((a) => a.status === "done").length;

    return (
        <aside className="h-full flex flex-col glass">
            <div className="p-4 border-b border-zinc-800/50">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                        <span className="text-lg">👥</span>
                        Workers
                    </h3>
                    {subagents.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-xs font-mono text-zinc-400">
                            {completed}/{subagents.length}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {subagents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                                    <div className="w-3 h-3 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                    <div className="w-3 h-3 bg-blue-500/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                </div>
                                <div className="text-sm text-zinc-500">
                                    Waiting for delegation<span className="typing-cursor"></span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-4xl mb-3">🛋️</div>
                                <div className="text-sm text-zinc-500">No workers active</div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 stagger-children">
                        {subagents.map((agent) => {
                            const isExpanded = expandedAgents.has(agent.name);
                            const isDone = agent.status === "done";
                            const isError = agent.status === "error";

                            return (
                                <div
                                    key={agent.name}
                                    className={`rounded-xl overflow-hidden transition-all animate-fade-in ${isDone
                                            ? "bg-zinc-900/50 border border-zinc-800"
                                            : isError
                                                ? "bg-red-500/10 border border-red-500/30"
                                                : "bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                                        }`}
                                >
                                    {/* Accordion Header */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleAccordion(agent.name);
                                        }}
                                        className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
                                    >
                                        {/* Icon */}
                                        <span className="text-xl">{getAgentIcon(agent.name)}</span>

                                        {/* Status indicator */}
                                        <span
                                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isDone
                                                    ? "bg-emerald-500"
                                                    : isError
                                                        ? "bg-red-500"
                                                        : "bg-blue-500 animate-pulse shadow-lg shadow-blue-500/50"
                                                }`}
                                        ></span>

                                        {/* Agent name */}
                                        <span
                                            className={`font-semibold text-sm flex-1 ${isDone
                                                    ? "text-zinc-500 line-through"
                                                    : isError
                                                        ? "text-red-300"
                                                        : "text-blue-200"
                                                }`}
                                        >
                                            {formatName(agent.name)}
                                        </span>

                                        {/* Expand/collapse icon */}
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${isDone ? "text-zinc-600" : "text-zinc-400"
                                                } ${isExpanded ? "rotate-180" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Current task summary (when collapsed) */}
                                    {!isExpanded && agent.currentTask && (
                                        <div className={`px-4 pb-3 -mt-2 ${isDone ? "text-zinc-600" : "text-zinc-400"}`}>
                                            <p className="text-xs truncate leading-relaxed">{agent.currentTask}</p>
                                        </div>
                                    )}

                                    {/* Accordion Content */}
                                    {isExpanded && (
                                        <div className={`px-4 pb-4 border-t ${isDone ? "border-zinc-800" : "border-blue-500/20"}`}>
                                            <div className="mt-3 space-y-2">
                                                {agent.activityLogs.length > 0 ? (
                                                    agent.activityLogs.slice(-3).map((log, idx) => (
                                                        <p
                                                            key={idx}
                                                            className={`text-xs font-mono leading-relaxed ${isDone ? "text-zinc-600" : "text-zinc-400"
                                                                }`}
                                                        >
                                                            <span className={isDone ? "text-zinc-700" : "text-blue-400"}>›</span> {log}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-zinc-600 italic">No activity logged yet</p>
                                                )}

                                                {agent.currentTask && (
                                                    <div className={`mt-3 pt-3 border-t ${isDone ? "border-zinc-800" : "border-blue-500/20"}`}>
                                                        <p className={`text-xs ${isDone ? "text-zinc-600" : "text-zinc-400"}`}>
                                                            <span className="font-semibold">Task:</span> {agent.currentTask}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className={`mt-3 pt-3 border-t ${isDone ? "border-zinc-800" : "border-blue-500/20"} flex items-center justify-between`}>
                                                    <span className={`flex items-center gap-2 text-xs ${isDone ? "text-emerald-600" : isError ? "text-red-400" : "text-blue-400"}`}>
                                                        {isDone ? "✓ Completed" : isError ? "✗ Failed" : "⟳ Working..."}
                                                    </span>
                                                    {agent.startedAt && (
                                                        <span className="text-xs text-zinc-600 font-mono">
                                                            {agent.startedAt.toLocaleTimeString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </aside>
    );
}

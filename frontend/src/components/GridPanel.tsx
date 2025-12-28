"use client";

import { useState } from "react";
import { SubagentStatus } from "@/hooks/useAgentStream";

interface GridPanelProps {
    subagents: SubagentStatus[];
    isLoading: boolean;
}

export function GridPanel({ subagents, isLoading }: GridPanelProps) {
    // Track which accordions are expanded
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

    // Format name for display (code-analyzer -> Code Analyzer)
    const formatName = (name: string) => {
        return name
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <aside className="h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    The Workers (Sub-agents)
                </h3>
                {subagents.length > 0 && (
                    <div className="text-xs text-zinc-500 mt-1">
                        {subagents.filter((a) => a.status === "done").length}/{subagents.length} completed
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {subagents.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/50 text-sm text-zinc-500">
                        {isLoading ? (
                            <>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Waiting for delegation...
                            </>
                        ) : (
                            <>
                                <span className="w-4 h-4 text-zinc-600">📭</span>
                                No workers active
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {subagents.map((agent) => {
                            const isExpanded = expandedAgents.has(agent.name);
                            const isDone = agent.status === "done";
                            const isError = agent.status === "error";

                            return (
                                <div
                                    key={agent.name}
                                    className={`rounded-lg border transition-all overflow-hidden ${isDone
                                        ? "border-zinc-700 bg-zinc-900/30"
                                        : isError
                                            ? "border-red-500/50 bg-red-900/20"
                                            : "border-blue-500/50 bg-blue-900/20"
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
                                        className="w-full p-3 flex items-center gap-2 text-left hover:bg-white/5 transition-colors"
                                    >
                                        {/* Status indicator */}
                                        <span
                                            className={`w-2 h-2 rounded-full flex-shrink-0 ${isDone
                                                ? "bg-zinc-500"
                                                : isError
                                                    ? "bg-red-500"
                                                    : "bg-blue-500 animate-pulse"
                                                }`}
                                        ></span>

                                        {/* Agent name */}
                                        <span
                                            className={`font-medium text-sm flex-1 ${isDone
                                                ? "text-zinc-500 line-through"
                                                : isError
                                                    ? "text-red-400"
                                                    : "text-blue-300"
                                                }`}
                                        >
                                            {formatName(agent.name)}
                                        </span>

                                        {/* Expand/collapse icon */}
                                        <svg
                                            className={`w-4 h-4 transition-transform ${isDone ? "text-zinc-600" : "text-zinc-400"
                                                } ${isExpanded ? "rotate-180" : ""}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Current task summary (always visible) */}
                                    {!isExpanded && agent.currentTask && (
                                        <div className={`px-3 pb-3 -mt-1 ${isDone ? "text-zinc-600" : "text-zinc-400"}`}>
                                            <p className="text-xs truncate">
                                                {agent.currentTask}
                                            </p>
                                        </div>
                                    )}

                                    {/* Accordion Content - Activity Logs */}
                                    {isExpanded && (
                                        <div className={`px-3 pb-3 border-t ${isDone ? "border-zinc-800" : "border-blue-800/30"}`}>
                                            <div className="mt-2 space-y-1">
                                                {agent.activityLogs.length > 0 ? (
                                                    agent.activityLogs.slice(-3).map((log, idx) => (
                                                        <p
                                                            key={idx}
                                                            className={`text-xs font-mono ${isDone ? "text-zinc-600" : "text-zinc-400"
                                                                }`}
                                                        >
                                                            <span className={isDone ? "text-zinc-700" : "text-zinc-500"}>›</span> {log}
                                                        </p>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-zinc-600 italic">No activity logged yet</p>
                                                )}

                                                {/* Task description */}
                                                {agent.currentTask && (
                                                    <div className={`mt-2 pt-2 border-t ${isDone ? "border-zinc-800" : "border-blue-800/30"}`}>
                                                        <p className={`text-xs ${isDone ? "text-zinc-600" : "text-zinc-400"}`}>
                                                            <span className="font-semibold">Task:</span> {agent.currentTask}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Status footer */}
                                                <div className={`mt-2 pt-2 border-t ${isDone ? "border-zinc-800" : "border-blue-800/30"} flex items-center justify-between`}>
                                                    <span className={`text-xs ${isDone ? "text-zinc-600" : "text-zinc-500"}`}>
                                                        {isDone ? "✓ Completed" : isError ? "✗ Failed" : "⟳ Working..."}
                                                    </span>
                                                    {agent.startedAt && (
                                                        <span className="text-xs text-zinc-600">
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

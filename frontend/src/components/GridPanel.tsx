"use client";

import { SubagentStatus } from "@/hooks/useAgentStream";

interface GridPanelProps {
    subagents: SubagentStatus[];
    isLoading: boolean;
}

export function GridPanel({ subagents, isLoading }: GridPanelProps) {
    return (
        <aside className="h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    The Workers (Sub-agents)
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {subagents.length === 0 ? (
                    <div className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 text-center">
                        <div className="text-zinc-500 text-sm">
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    Main agent working...
                                </span>
                            ) : (
                                "No active sub-agents"
                            )}
                        </div>
                        <p className="text-xs text-zinc-600 mt-2">
                            Sub-agents will appear here when the main agent delegates tasks
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {subagents.map((agent) => (
                            <div
                                key={agent.name}
                                className={`p-4 rounded-lg border transition-all ${agent.status === "running"
                                    ? "border-blue-500/50 bg-blue-900/20"
                                    : agent.status === "done"
                                        ? "border-emerald-500/50 bg-emerald-900/20"
                                        : "border-red-500/50 bg-red-900/20"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {/* Status indicator */}
                                    <span
                                        className={`w-2 h-2 rounded-full ${agent.status === "running"
                                            ? "bg-blue-500 animate-pulse"
                                            : agent.status === "done"
                                                ? "bg-emerald-500"
                                                : "bg-red-500"
                                            }`}
                                    ></span>

                                    {/* Agent name */}
                                    <span className="font-medium text-sm capitalize">
                                        {agent.name}
                                    </span>
                                </div>

                                {/* Current task */}
                                {agent.currentTask && (
                                    <p className="text-xs text-zinc-400 truncate">
                                        {agent.currentTask}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

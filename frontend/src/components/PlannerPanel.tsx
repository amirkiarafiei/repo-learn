"use client";

import { Todo } from "@/hooks/useAgentStream";

interface PlannerPanelProps {
    todos: Todo[];
    isLoading: boolean;
}

export function PlannerPanel({ todos, isLoading }: PlannerPanelProps) {
    return (
        <aside className="h-full flex flex-col border-r border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                    The Plan (TODOs)
                </h3>
                {todos.length > 0 && (
                    <div className="text-xs text-zinc-500 mt-1">
                        {todos.filter(t => t.status === "completed").length}/{todos.length} completed
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {todos.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-900/50 text-sm text-zinc-500">
                        {isLoading ? (
                            <>
                                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                                Waiting for plan...
                            </>
                        ) : (
                            <>
                                <span className="w-4 h-4 border border-zinc-600 rounded"></span>
                                No tasks yet
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todos.map((todo, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${todo.status === "completed"
                                    ? "bg-emerald-900/20 border border-emerald-800/50"
                                    : todo.status === "in_progress"
                                        ? "bg-yellow-900/20 border border-yellow-800/50"
                                        : "bg-zinc-900/50 border border-zinc-800"
                                    }`}
                            >
                                {/* Status icon */}
                                <div className="mt-0.5 flex-shrink-0">
                                    {todo.status === "completed" ? (
                                        <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : todo.status === "in_progress" ? (
                                        <div className="w-4 h-4 border-2 border-yellow-500 rounded animate-pulse"></div>
                                    ) : (
                                        <div className="w-4 h-4 border border-zinc-600 rounded"></div>
                                    )}
                                </div>

                                {/* Task content */}
                                <span
                                    className={`text-sm flex-1 ${todo.status === "completed"
                                        ? "text-zinc-400 line-through"
                                        : todo.status === "in_progress"
                                            ? "text-yellow-200"
                                            : "text-zinc-300"
                                        }`}
                                >
                                    {todo.content}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

"use client";

import { Todo } from "@/hooks/useAgentStream";

interface PlannerPanelProps {
    todos: Todo[];
    isLoading: boolean;
}

export function PlannerPanel({ todos, isLoading }: PlannerPanelProps) {
    const completed = todos.filter(t => t.status === "completed").length;
    const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0;

    return (
        <aside className="h-full flex flex-col border-r border-zinc-900 bg-black">
            <div className="p-4 border-b border-zinc-900">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        The Plan (TODOs)
                    </h3>
                    {todos.length > 0 && (
                        <span className="text-zinc-500 text-xs font-mono">
                            {completed}/{todos.length}
                        </span>
                    )}
                </div>
                {/* Progress bar */}
                {todos.length > 0 && (
                    <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide bg-black">
                {todos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="w-12 h-12 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                                <div className="text-sm text-zinc-500">
                                    Creating plan<span className="typing-cursor"></span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-zinc-500">No tasks yet</div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2 stagger-children flex flex-col justify-start h-full">
                        {todos.map((todo, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-all border ${todo.status === "completed"
                                    ? "bg-[#0A0A0A] border-zinc-900"
                                    : todo.status === "in_progress"
                                        ? "bg-[#0A0A0A] border-amber-900/50 animate-border-glow"
                                        : "bg-[#0A0A0A] border-zinc-900"
                                    }`}
                            >
                                {/* Status icon */}
                                <div className="mt-0.5 flex-shrink-0">
                                    {todo.status === "completed" ? (
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : todo.status === "in_progress" ? (
                                        <div className="w-5 h-5 border-2 border-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/30"></div>
                                    ) : (
                                        <div className="w-5 h-5 border-2 border-zinc-600 rounded-full"></div>
                                    )}
                                </div>

                                {/* Task content */}
                                <span
                                    className={`text-sm flex-1 leading-relaxed ${todo.status === "completed"
                                        ? "text-zinc-500 line-through"
                                        : todo.status === "in_progress"
                                            ? "text-amber-200 font-medium"
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

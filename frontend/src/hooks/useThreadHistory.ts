"use client";

import { useState, useEffect, useCallback } from "react";
import { Client } from "@langchain/langgraph-sdk";
import type { Todo, AgentMessage, SubagentStatus } from "./useAgentStream";

interface ThreadHistoryState {
    messages: AgentMessage[];
    todos: Todo[];
    subagents: SubagentStatus[];
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to fetch historical thread state from LangGraph.
 * Uses the default persistence (pickle files) that langgraph dev provides.
 */
export function useThreadHistory(threadId: string | null) {
    const [state, setState] = useState<ThreadHistoryState>({
        messages: [],
        todos: [],
        subagents: [],
        isLoading: true,
        error: null,
    });

    const fetchHistory = useCallback(async () => {
        if (!threadId) {
            setState(prev => ({ ...prev, isLoading: false }));
            return;
        }

        const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024";

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const client = new Client({ apiUrl });

            // Get the current/final state of the thread
            const threadState = await client.threads.getState(threadId);

            // Extract data from the state
            const stateValues = threadState.values as Record<string, unknown> || {};

            // Parse messages
            const rawMessages = (stateValues.messages || []) as Array<Record<string, unknown>>;
            const messages: AgentMessage[] = rawMessages.map((msg) => ({
                id: (msg.id as string) || crypto.randomUUID(),
                type: (msg.type as "human" | "ai" | "tool") || "ai",
                content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content || ""),
                name: msg.name as string | undefined,
                toolCalls: (msg.tool_calls as Array<{ name: string; args: Record<string, unknown> }> | undefined)?.map((tc) => ({
                    name: tc.name,
                    args: tc.args,
                })),
                timestamp: new Date(),
            }));

            // Parse todos
            const rawTodos = (stateValues.todos || []) as Array<{ status: string; content: string }>;
            const todos: Todo[] = rawTodos.map((t) => ({
                status: t.status as "pending" | "in_progress" | "completed",
                content: t.content,
            }));

            // Extract subagents from task tool calls in messages
            const subagentsMap = new Map<string, SubagentStatus>();
            for (const msg of rawMessages) {
                const toolCalls = msg.tool_calls as Array<{ name: string; args: Record<string, unknown> }> | undefined;
                if (toolCalls) {
                    for (const tc of toolCalls) {
                        if (tc.name === "task") {
                            const subagentType = tc.args.subagent_type as string;
                            const description = tc.args.description as string;
                            if (subagentType && !subagentsMap.has(subagentType)) {
                                subagentsMap.set(subagentType, {
                                    name: subagentType,
                                    status: "done", // Historical, so all are done
                                    currentTask: description?.slice(0, 100) || "Completed",
                                    activityLogs: [`Completed: ${description?.slice(0, 60) || "Task"}...`],
                                });
                            }
                        }
                    }
                }
            }

            setState({
                messages,
                todos,
                subagents: Array.from(subagentsMap.values()),
                isLoading: false,
                error: null,
            });
        } catch (err) {
            console.error("Failed to fetch thread history:", err);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: err instanceof Error ? err : new Error(String(err)),
            }));
        }
    }, [threadId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        ...state,
        refetch: fetchHistory,
    };
}

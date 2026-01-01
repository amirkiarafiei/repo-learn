"use client";

import { useState, useEffect, useCallback } from "react";
import { Client } from "@langchain/langgraph-sdk";
import type { Todo, AgentMessage, SubagentStatus } from "./useAgentStream";

interface ThreadHistoryState {
    messages: AgentMessage[];
    todos: Todo[];
    subagents: SubagentStatus[];
    isLoading: boolean;
    isSnapshot: boolean; // True if using local metadata instead of LangGraph server
    error: Error | null;
}

/**
 * Hook to fetch historical thread state from LangGraph.
 * Uses the default persistence (pickle files) that langgraph dev provides.
 */
export function useThreadHistory(threadId: string | null, repoId?: string | null, audience?: string | null) {
    const [state, setState] = useState<ThreadHistoryState>({
        messages: [],
        todos: [],
        subagents: [],
        isLoading: true,
        isSnapshot: false,
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

            // 1. First, try to fetch metadata to see if we have a snapshot
            let snapshot: any = null;
            if (repoId && audience) {
                try {
                    console.log(`[useThreadHistory] Fetching snapshot: repoId=${repoId}, audience=${audience}`);
                    const metaRes = await fetch(`/api/tutorials/${encodeURIComponent(repoId)}/metadata?audience=${audience}`);
                    if (metaRes.ok) {
                        const meta = await metaRes.json();
                        snapshot = meta.snapshot;
                        console.log(`[useThreadHistory] Snapshot found:`, snapshot ? `${snapshot.messages?.length || 0} messages` : "none");
                    } else {
                        console.warn(`[useThreadHistory] Metadata fetch returned status: ${metaRes.status}`);
                    }
                } catch (e) {
                    console.warn("[useThreadHistory] Failed to fetch metadata for snapshot check:", e);
                }
            } else {
                console.warn(`[useThreadHistory] Missing repoId or audience for snapshot fetch: repoId=${repoId}, audience=${audience}`);
            }

            const client = new Client({ apiUrl });

            // 2. Try to get the current/final state of the thread from server
            let threadState;
            try {
                threadState = await client.threads.getState(threadId);
            } catch (err: any) {
                if (err.message?.includes("404") || err.status === 404) {
                    // FALLBACK: Use snapshot if server returns 404
                    if (snapshot) {
                        console.log("[useThreadHistory] Server 404 - Falling back to local snapshot.");
                        setState({
                            messages: snapshot.messages || [],
                            todos: snapshot.todos || [],
                            subagents: snapshot.subagents || [],
                            isLoading: false,
                            isSnapshot: true,
                            error: null,
                        });
                        return;
                    }
                    throw new Error("Session history lost (404). Local development server resets state if restarted.");
                }
                throw err;
            }

            // 3. Extract data from the server state if successful
            const stateValues = threadState.values as Record<string, unknown> || {};
            const rawMessages = (stateValues.messages || []) as Array<Record<string, unknown>>;

            // ... (rest of parsing logic remains same) ...
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

            const rawTodos = (stateValues.todos || []) as Array<{ status: string; content: string }>;
            const todos: Todo[] = rawTodos.map((t) => ({
                status: t.status as "pending" | "in_progress" | "completed",
                content: t.content,
            }));

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
                                    status: "done",
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
                isSnapshot: false,
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
    }, [threadId, repoId, audience]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    return {
        ...state,
        refetch: fetchHistory,
    };
}

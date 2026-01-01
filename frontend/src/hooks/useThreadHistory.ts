"use client";

import { useState, useEffect, useCallback } from "react";
import { Client } from "@langchain/langgraph-sdk";
import type { Todo, AgentMessage, SubagentStatus, SubagentToolCall } from "./useAgentStream";

interface ThreadHistoryState {
    messages: AgentMessage[];
    todos: Todo[];
    subagents: SubagentStatus[];
    isLoading: boolean;
    isSnapshot: boolean; // True if using local metadata instead of LangGraph server
    error: Error | null;
}

// Helper: Extract brief args from tool call arguments
function extractBriefArgs(toolName: string, args: Record<string, unknown>): string {
    switch (toolName) {
        case "read_file":
        case "write_file":
        case "view_file": {
            const path = String(args.path || args.file_path || args.file || "");
            const parts = path.split("/");
            return parts[parts.length - 1] || path;
        }
        case "ls":
        case "list_dir":
        case "list_directory": {
            const dir = String(args.path || args.directory || args.dir || "/");
            const parts = dir.split("/").filter(Boolean);
            return parts[parts.length - 1] || "/";
        }
        case "grep":
        case "search": {
            const pattern = String(args.pattern || args.query || args.search || "");
            return pattern.length > 20 ? `"${pattern.slice(0, 17)}..."` : `"${pattern}"`;
        }
        case "glob":
        case "find": {
            return String(args.pattern || args.glob || "*");
        }
        case "edit":
        case "edit_file": {
            const path = String(args.path || args.file_path || "");
            const parts = path.split("/");
            return parts[parts.length - 1] || path;
        }
        default: {
            for (const val of Object.values(args)) {
                if (typeof val === "string" && val.length > 0 && val.length < 40) {
                    return val.length > 25 ? val.slice(0, 22) + "..." : val;
                }
            }
            return "";
        }
    }
}

// Helper: Ensure subagent has toolCalls array and hydrated dates (backwards compat for old snapshots)
function ensureSubagentToolCalls(subagent: Partial<SubagentStatus>): SubagentStatus {
    return {
        name: subagent.name || "unknown",
        status: subagent.status || "done",
        currentTask: subagent.currentTask,
        startedAt: subagent.startedAt ? new Date(subagent.startedAt) : undefined,
        completedAt: subagent.completedAt ? new Date(subagent.completedAt) : undefined,
        activityLogs: subagent.activityLogs || [],
        toolCalls: (subagent.toolCalls || []).map(tc => ({
            ...tc,
            timestamp: tc.timestamp ? new Date(tc.timestamp) : new Date()
        })),
    };
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
            let meta: any = null; // Defined here for later access

            if (repoId && audience) {
                try {
                    console.log(`[useThreadHistory] Fetching snapshot: repoId=${repoId}, audience=${audience}`);
                    const metaRes = await fetch(`/api/tutorials/${encodeURIComponent(repoId)}/metadata?audience=${audience}`);
                    if (metaRes.ok) {
                        meta = await metaRes.json();
                        snapshot = meta.snapshot;
                        console.log(`[useThreadHistory] Snapshot found:`, snapshot ? `${snapshot.messages?.length || 0} messages, ${snapshot.subagents?.length || 0} subagents` : "none");
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
                        // Ensure subagents have toolCalls array for backwards compat
                        const subagents = (snapshot.subagents || []).map(ensureSubagentToolCalls);
                        setState({
                            messages: snapshot.messages || [],
                            todos: snapshot.todos || [],
                            subagents,
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

            // Parse messages
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

            // Parse subagents with toolCalls support
            const subagentsMap = new Map<string, SubagentStatus>();

            // First, try to use snapshot subagents if available
            if (snapshot?.subagents && Array.isArray(snapshot.subagents)) {
                for (const sa of snapshot.subagents) {
                    if (sa.name) {
                        subagentsMap.set(sa.name, ensureSubagentToolCalls(sa));
                    }
                }
            }

            // Then, parse from messages to ensure we catch all subagents
            for (const msg of rawMessages) {
                const toolCalls = msg.tool_calls as Array<{ id: string; name: string; args: Record<string, unknown> }> | undefined;
                if (toolCalls) {
                    for (const tc of toolCalls) {
                        if (tc.name === "task") {
                            const subagentType = tc.args.subagent_type as string;
                            const description = tc.args.description as string;
                            if (subagentType) {
                                if (!subagentsMap.has(subagentType)) {
                                    subagentsMap.set(subagentType, {
                                        name: subagentType,
                                        status: "done", // Historical view = completed
                                        currentTask: description?.slice(0, 100) || "Completed",
                                        activityLogs: [`Completed: ${description?.slice(0, 60) || "Task"}...`],
                                        toolCalls: [],
                                    });
                                }
                            }
                        }
                    }
                }
            }

            // NEW: Merge tool logs from metadata (Option B Persistence)
            // Access tool log from the metadata response scope
            if (meta?.subagent_tool_log && Array.isArray(meta.subagent_tool_log)) {
                const toolLog = meta.subagent_tool_log as Array<{
                    id: string; subagent: string; tool: string; args_brief: string; timestamp: string; status: string;
                }>;

                for (const entry of toolLog) {
                    if (entry.status === 'start' && subagentsMap.has(entry.subagent)) {
                        const agent = subagentsMap.get(entry.subagent)!;
                        // Avoid duplicates if snapshot already had them (unlikely for now but safe)
                        if (!agent.toolCalls.some(tc => tc.id === entry.id)) {
                            agent.toolCalls.push({
                                id: entry.id,
                                name: entry.tool,
                                briefArgs: entry.args_brief,
                                timestamp: new Date(entry.timestamp)
                            });
                        }
                    }
                }

                // Sort all tool calls by timestamp
                for (const agent of subagentsMap.values()) {
                    if (agent.toolCalls.length > 0) {
                        agent.toolCalls.sort((a, b) => {
                            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
                            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
                            return timeA - timeB;
                        });
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

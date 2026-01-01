"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Client } from "@langchain/langgraph-sdk";
import { useJob } from "@/context/JobContext";

// Reuse types from useAgentStream for consistency
import { Todo, AgentMessage, SubagentStatus } from "./useAgentStream";

interface PersistentAgentState {
    messages: AgentMessage[];
    todos: Todo[];
    subagents: SubagentStatus[];
    isLoading: boolean;
    error: Error | null;
    status: "idle" | "running" | "completed" | "error";
}

interface UsePersistentAgentOptions {
    disabled?: boolean;
}

export function usePersistentAgent(options: UsePersistentAgentOptions = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024";
    const { activeJob, startJob, completeJob, clearJob } = useJob();

    // Internal state mainly for UI display
    const [state, setState] = useState<PersistentAgentState>({
        messages: [],
        todos: [],
        subagents: [],
        isLoading: false,
        error: null,
        status: "idle",
    });

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // --- Helpers to parse state (duplicated from useThreadHistory/useAgentStream logic) ---
    const parseState = (values: Record<string, unknown>, rawMessages: Array<Record<string, unknown>>) => {
        // Parse Messages
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

        // Parse Todos
        const rawTodos = (values.todos || []) as Array<{ status: string; content: string }>;
        const todos: Todo[] = rawTodos.map((t) => ({
            status: t.status as "pending" | "in_progress" | "completed",
            content: t.content,
        }));

        // Parse Subagents (from messages)
        const subagentsMap = new Map<string, SubagentStatus>();
        for (const msg of rawMessages) {
            const toolCalls = msg.tool_calls as Array<{ id: string; name: string; args: Record<string, unknown> }> | undefined;
            if (toolCalls) {
                for (const tc of toolCalls) {
                    if (tc.name === "task") {
                        const subagentType = tc.args.subagent_type as string;
                        const description = tc.args.description as string;
                        if (subagentType) {
                            subagentsMap.set(subagentType, {
                                name: subagentType,
                                status: "running",
                                currentTask: description?.slice(0, 100) || "Working...",
                                activityLogs: [`Started: ${description?.slice(0, 60)}...`],
                                startedAt: new Date(),
                            });
                        }
                    }
                }
            }
        }

        return { messages, todos, subagents: Array.from(subagentsMap.values()) };
    };


    // --- Actions ---

    const start = useCallback(async (jobId: string, repoId: string, audience: "user" | "dev", depth: "basic" | "detailed", githubUrl: string) => {
        try {
            setState(prev => ({
                ...prev,
                isLoading: true,
                status: "running",
                error: null,
                messages: [],
                todos: [],
                subagents: []
            }));

            const client = new Client({ apiUrl });

            // 1. Create Thread
            const thread = await client.threads.create();
            const threadId = thread.thread_id;
            console.log("[usePersistentAgent] Created thread:", threadId);

            const depthInstruction = depth === "detailed"
                ? "Provide a comprehensive, in-depth tutorial."
                : "Provide a quick overview tutorial.";

            const run = await client.runs.create(threadId, "agent", {
                input: {
                    messages: [{
                        type: "human",
                        content: `Please analyze this repository: https://github.com/${repoId.replace("_", "/")}\nTarget audience: ${audience}\nTutorial depth: ${depth}\n\n${depthInstruction}`,
                    }]
                },
                streamMode: "values",
            });
            console.log("[usePersistentAgent] Started run:", run.run_id);

            // 2. Update Global Context
            startJob({
                id: jobId,
                repoId,
                threadId,
                runId: run.run_id,
                audience,
                depth,
                githubUrl,
            });

        } catch (err) {
            console.error("Failed to start agent:", err);
            setState(prev => ({ ...prev, error: err instanceof Error ? err : new Error(String(err)), status: "error", isLoading: false }));
        }
    }, [apiUrl, startJob]);

    const stop = useCallback(async () => {
        if (!activeJob?.threadId || !activeJob?.runId) {
            clearJob();
            return;
        }

        try {
            const client = new Client({ apiUrl });
            console.log("[usePersistentAgent] Stopping run:", activeJob.runId);
            await client.runs.cancel(activeJob.threadId, activeJob.runId);
        } catch (e) {
            console.warn("Failed to cancel run (might be already done):", e);
        } finally {
            clearJob();
            setState(prev => ({ ...prev, status: "idle", messages: [], todos: [] }));
        }
    }, [activeJob, apiUrl, clearJob]);

    // --- Polling (The "Persistent" part) ---
    useEffect(() => {
        if (options.disabled || !activeJob?.threadId) {
            setState(prev => ({ ...prev, status: "idle" }));
            return;
        }

        console.log("[usePersistentAgent] Monitoring thread:", activeJob.threadId);
        setState(prev => ({ ...prev, status: "running", isLoading: true }));

        const poll = async () => {
            try {
                const client = new Client({ apiUrl });
                let threadState;
                try {
                    threadState = await client.threads.getState(activeJob.threadId);
                } catch (err: any) {
                    if (err.message?.includes("404") || err.status === 404) {
                        console.warn("[usePersistentAgent] Thread not found (404). This usually happens if the dev server was restarted.");
                        setState(prev => ({
                            ...prev,
                            status: "error",
                            error: new Error("Session history lost (404). Local development server resets state if restarted.")
                        }));
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        return;
                    }
                    throw err;
                }

                if (!threadState) return;

                const values = (threadState.values as Record<string, unknown>) || {};
                const rawMessages = (values.messages || []) as Array<Record<string, unknown>>;

                const { messages, todos, subagents } = parseState(values, rawMessages);
                const isFinished = threadState.next?.length === 0 && messages.length > 0;

                setState(prev => ({
                    ...prev,
                    messages,
                    todos,
                    subagents: subagents.length > 0 ? subagents : prev.subagents,
                    isLoading: false,
                    status: isFinished ? "completed" : "running"
                }));

                if (isFinished && activeJob.status !== "completed") {
                    completeJob();
                }

            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        poll();
        pollingIntervalRef.current = setInterval(poll, 2500);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [activeJob?.threadId, apiUrl, activeJob?.status, completeJob, options.disabled]);


    return {
        ...state,
        start,
        stop,
        activeJob,
        snapshot: {
            messages: state.messages,
            todos: state.todos,
            subagents: state.subagents
        }
    };
}

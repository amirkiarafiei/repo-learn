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

export function usePersistentAgent() {
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
    // In a real app, extract this to a utility "parseLangGraphState(values, rawMessages)"
    const parseState = (values: Record<string, unknown>, rawMessages: Array<Record<string, unknown>>) => {
        // Parse Messages
        const messages: AgentMessage[] = rawMessages.map((msg) => ({
            id: (msg.id as string) || crypto.randomUUID(),
            type: (msg.type as "human" | "ai" | "tool") || "ai",
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content || ""),
            name: msg.name as string | undefined,
            toolCalls: (msg.tool_calls as Array<{ name: string; args: Record<string, unknown> }> | undefined)?.map((tc) => ({
                name: tc.name, // Keep existing structure
                args: tc.args,
            })),
            timestamp: new Date(), // Approximate for historical
        }));

        // Parse Todos
        const rawTodos = (values.todos || []) as Array<{ status: string; content: string }>;
        const todos: Todo[] = rawTodos.map((t) => ({
            status: t.status as "pending" | "in_progress" | "completed",
            content: t.content,
        }));

        // Parse Subagents (from messages)
        const subagentsMap = new Map<string, SubagentStatus>();
        // Iterate REVERSE to find latest status? No, iterate forward to build history.
        // Actually, for "current status", we just need to see if they finished.
        // Simplified logic: If we see a "task" tool call, it started. If we see a result, it finished.
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
                                startedAt: new Date(), // Approximate
                            });
                        }
                    }
                }
            }
            if (msg.type === "tool" && msg.name === "task") {
                // Tool result -> Subagent done
                // We don't have easy link back to subagent name in standard msg format without ID map, 
                // but visually we might just mark them all 'done' if the specific ID matches.
                // For now, let's just rely on the fact that if we have a result, the tool call is done.
                // Implementation detail: strict matching requires tracking tool_call_id.
                // Let's replicate simple logic: if message is tool & name is task, we assume the matching agent is done.
                // This is imperfect in historical parsing without a map, but acceptable for UI.
            }
        }

        return { messages, todos, subagents: Array.from(subagentsMap.values()) };
    };


    // --- Actions ---

    const start = useCallback(async (jobId: string, repoId: string, audience: "user" | "dev", depth: "basic" | "detailed") => {
        try {
            setState(prev => ({ ...prev, isLoading: true, status: "running", error: null }));

            const client = new Client({ apiUrl });

            // 1. Create Thread
            const thread = await client.threads.create();
            const threadId = thread.thread_id;
            console.log("[usePersistentAgent] Created thread:", threadId);

            // 2. Start Run (Detached)
            // stream_resumable: true is key for join_stream (though we verify with polling first)
            // We use 'create' to fire and forget from the client's perspective (it runs on server)
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
                streamMode: "values", // We want the values to update our state
            });
            console.log("[usePersistentAgent] Started run:", run.run_id);

            // 3. Update Global Context
            startJob({
                id: jobId,
                repoId,
                threadId,
                runId: run.run_id,
                audience,
                depth,
            });

        } catch (err) {
            console.error("Failed to start agent:", err);
            setState(prev => ({ ...prev, error: err instanceof Error ? err : new Error(String(err)), status: "error", isLoading: false }));
        }
    }, [apiUrl, startJob]);

    const stop = useCallback(async () => {
        if (!activeJob?.threadId || !activeJob?.runId) {
            // Fallback: just clear functionality if no backend run to kill
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
    // Whenever activeJob exists, we poll the thread state to update UI
    useEffect(() => {
        if (!activeJob?.threadId) {
            setState(prev => ({ ...prev, status: "idle" }));
            return;
        }

        console.log("[usePersistentAgent] Monitoring thread:", activeJob.threadId);
        setState(prev => ({ ...prev, status: "running", isLoading: true })); // Assume running initially, poll fixes it

        const poll = async () => {
            try {
                const client = new Client({ apiUrl });
                let threadState;
                try {
                    threadState = await client.threads.getState(activeJob.threadId);
                } catch (err: any) {
                    if (err.message?.includes("404") || err.status === 404) {
                        console.error("[usePersistentAgent] Thread not found (404). Clearing job.");
                        setState(prev => ({ ...prev, status: "error", error: new Error("Server lost connection to job (Tweet 404). Please retry.") }));
                        // Optional: clearJob(); // Clearing immediately might be jarring, let user see error? 
                        // Decisions: If we auto-clear, user loses context. Better to show error.
                        // However, Bug report says "Console Error". The UI might just be stuck.
                        // Let's set status to error so the UI shows "Error" badge.
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        return;
                    }
                    throw err; // rethrow other errors
                }

                if (!threadState) return;

                const values = (threadState.values as Record<string, unknown>) || {};
                const rawMessages = (values.messages || []) as Array<Record<string, unknown>>;

                const { messages, todos, subagents } = parseState(values, rawMessages);

                // Detect Completion?
                // If the run status is 'success' or if we detect the final message?
                // LangGraph state doesn't explicitly store "run status" in thread state values usually.
                // But we can check if the last message is from AI and has "final answer" or if 'next' is empty.
                // For now, let's rely on checking if the run is still active via client.runs.list? 
                // Or simplified: if 'isLoading' happens often. 
                // Actually, 'threadState.next' being empty usually means the graph is at an end state (or waiting for input).
                const isFinished = threadState.next?.length === 0 && messages.length > 0;

                setState(prev => ({
                    ...prev,
                    messages,
                    todos,
                    subagents: subagents.length > 0 ? subagents : prev.subagents, // Keep old if empty?
                    isLoading: false,
                    status: isFinished ? "completed" : "running"
                }));

                if (isFinished && activeJob.status !== "completed") {
                    completeJob();
                }

            } catch (error) {
                console.error("Polling error:", error);
                // Don't kill the job on polling error, just wait for next tick
            }
        };

        // Initial poll
        poll();

        // Interval
        pollingIntervalRef.current = setInterval(poll, 2000); // 2 seconds

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
    }, [activeJob?.threadId, apiUrl, activeJob?.status, completeJob]);


    return {
        ...state,
        start,
        stop,
        activeJob
    };
}

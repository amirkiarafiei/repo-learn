"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Client } from "@langchain/langgraph-sdk";
import { useJob } from "@/context/JobContext";

// Reuse types from useAgentStream for consistency
import { Todo, AgentMessage, SubagentStatus, SubagentToolCall } from "./useAgentStream";

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

// Tools that subagents typically use (excluding brain-level tools)
const SUBAGENT_TOOLS = new Set([
    "read_file", "write_file", "view_file", "edit_file",
    "ls", "list_dir", "list_directory",
    "grep", "search", "glob", "find",
    "shell", "bash", "exec",
]);

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

    // Track tool call IDs to subagent mapping for detecting completion
    const toolCallToAgentRef = useRef<Map<string, string>>(new Map());

    // Track which tool calls we've already processed (to avoid duplicates)
    const processedToolCallsRef = useRef<Set<string>>(new Set());

    interface ToolCallEntry {
        id: string;
        subagent: string;
        tool: string;
        args_brief: string;
        timestamp: string;
        status: string;
    }

    // --- Helpers to parse state ---
    const parseState = useCallback((
        values: Record<string, unknown>,
        rawMessages: Array<Record<string, unknown>>,
        existingSubagents: SubagentStatus[],
        subgraphStates?: Array<{ namespace: string[]; state: Record<string, unknown> }>,
        customToolCalls?: Record<string, ToolCallEntry[]>
    ) => {
        // Parse Messages
        const messages: AgentMessage[] = rawMessages.map((msg) => ({
            id: (msg.id as string) || crypto.randomUUID(),
            type: (msg.type as "human" | "ai" | "tool") || "ai",
            content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content || ""),
            name: msg.name as string | undefined,
            toolCalls: (msg.tool_calls as Array<{ id?: string; name: string; args: Record<string, unknown> }> | undefined)?.map((tc) => ({
                id: tc.id,
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

        // Parse Subagents - now with tool calls from subgraph states
        const subagentsMap = new Map<string, SubagentStatus>();

        // First, initialize from existing subagents to preserve tool calls
        for (const existing of existingSubagents) {
            subagentsMap.set(existing.name, { ...existing });
        }

        // Track which task calls we've seen
        const completedTaskIds = new Set<string>();

        // First pass: find completed task results
        for (const msg of rawMessages) {
            if (msg.type === "tool" && msg.name === "task" && msg.tool_call_id) {
                completedTaskIds.add(msg.tool_call_id as string);
            }
        }

        // Second pass: create/update subagent entries from task calls
        for (const msg of rawMessages) {
            const toolCalls = msg.tool_calls as Array<{ id: string; name: string; args: Record<string, unknown> }> | undefined;
            if (toolCalls) {
                for (const tc of toolCalls) {
                    if (tc.name === "task") {
                        const subagentType = tc.args.subagent_type as string;
                        const description = tc.args.description as string;
                        if (subagentType) {
                            const isCompleted = tc.id ? completedTaskIds.has(tc.id) : false;

                            // Store mapping for later use
                            if (tc.id) {
                                toolCallToAgentRef.current.set(tc.id, subagentType);
                            }

                            if (!subagentsMap.has(subagentType)) {
                                subagentsMap.set(subagentType, {
                                    name: subagentType,
                                    status: isCompleted ? "done" : "running",
                                    currentTask: description?.slice(0, 100) || "Working...",
                                    activityLogs: [`Started: ${description?.slice(0, 60)}...`],
                                    startedAt: new Date(),
                                    completedAt: isCompleted ? new Date() : undefined,
                                    toolCalls: [],
                                });
                            } else if (isCompleted) {
                                const existing = subagentsMap.get(subagentType)!;
                                subagentsMap.set(subagentType, {
                                    ...existing,
                                    status: "done",
                                    completedAt: new Date(),
                                });
                            }
                        }
                    }
                }
            }
        }

        // NEW: Merge custom tool calls from backend store (Option B)
        if (customToolCalls) {
            for (const [subagentName, entries] of Object.entries(customToolCalls)) {
                if (subagentsMap.has(subagentName)) {
                    const agent = subagentsMap.get(subagentName)!;

                    // Create a set of existing IDs to avoid duplicates efficiently
                    const existingIds = new Set(agent.toolCalls.map(tc => tc.id));
                    let hasNew = false;

                    for (const entry of entries) {
                        // Only add 'start' events
                        if (entry.status === 'start' && !existingIds.has(entry.id)) {
                            agent.toolCalls.push({
                                id: entry.id,
                                name: entry.tool,
                                briefArgs: entry.args_brief,
                                timestamp: new Date(entry.timestamp)
                            });
                            hasNew = true;
                        }
                    }

                    if (hasNew) {
                        // Sort just in case async arrival was out of order
                        agent.toolCalls.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                        // Maintain max limit
                        if (agent.toolCalls.length > 50) {
                            agent.toolCalls = agent.toolCalls.slice(-50);
                        }
                    }
                }
            }
        }

        return { messages, todos, subagents: Array.from(subagentsMap.values()) };
    }, []);


    // --- Actions ---

    const start = useCallback(async (jobId: string, repoId: string, audience: "user" | "dev", depth: "basic" | "detailed", githubUrl: string, isContinuation: boolean = false) => {
        try {
            setState(prev => ({
                ...prev,
                isLoading: true,
                status: "running",
                error: null,
                messages: isContinuation ? prev.messages : [],
                todos: isContinuation ? prev.todos : [],
                subagents: isContinuation ? prev.subagents : []
            }));

            if (!isContinuation) {
                toolCallToAgentRef.current.clear();
                processedToolCallsRef.current.clear();
            }

            const client = new Client({ apiUrl });

            let threadId: string;
            if (isContinuation && activeJob?.threadId) {
                threadId = activeJob.threadId;
                console.log("[usePersistentAgent] Resuming existing thread:", threadId);
            } else {
                // 1. Create Thread
                const thread = await client.threads.create();
                threadId = thread.thread_id;
                console.log("[usePersistentAgent] Created new thread:", threadId);
            }

            const depthInstruction = depth === "detailed"
                ? "Provide a comprehensive, in-depth tutorial."
                : "Provide a quick overview tutorial.";

            const inputMessage = isContinuation
                ? {
                    type: "human",
                    content: "Continue with the planning and doing the tasks. Review your todos and complete any remaining steps.",
                }
                : {
                    type: "human",
                    content: `Please analyze this repository: https://github.com/${repoId.replace("_", "/")}\nTarget audience: ${audience}\nTutorial depth: ${depth}\n\n${depthInstruction}`,
                };

            const run = await client.runs.create(threadId, "agent", {
                input: {
                    messages: [inputMessage]
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
                continuationCount: isContinuation ? activeJob?.continuationCount : 0
            });

        } catch (err) {
            console.error("Failed to start agent:", err);
            setState(prev => ({ ...prev, error: err instanceof Error ? err : new Error(String(err)), status: "error", isLoading: false }));
        }
    }, [apiUrl, startJob, activeJob?.threadId, activeJob?.continuationCount]);

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
            toolCallToAgentRef.current.clear();
            processedToolCallsRef.current.clear();
            setState(prev => ({ ...prev, status: "idle", messages: [], todos: [], subagents: [] }));
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
                    // NEW: Request subgraphs to get subagent tool calls
                    threadState = await client.threads.getState(activeJob.threadId, undefined, {
                        subgraphs: true
                    });
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

                // NEW: Extract subgraph states if available
                // The threadState with subgraphs: true includes a 'tasks' or 'subgraphs' field
                const subgraphStates = extractSubgraphStates(threadState);

                // NEW: Fetch Custom Tool Calls (Backend Option B)
                let customToolCalls: Record<string, ToolCallEntry[]> = {};
                try {
                    // Use direct fetch to backend endpoint
                    const res = await fetch(`${apiUrl}/tool-calls/${activeJob.threadId}`);
                    if (res.ok) {
                        customToolCalls = await res.json();
                    }
                } catch (e) {
                    // Silently ignore fetch errors (e.g. backend restarting)
                }

                setState(prev => {
                    const { messages, todos, subagents } = parseState(values, rawMessages, prev.subagents, subgraphStates, customToolCalls);
                    const isFinished = threadState.next?.length === 0 && messages.length > 0;

                    return {
                        ...prev,
                        messages,
                        todos,
                        subagents: subagents.length > 0 ? subagents : prev.subagents,
                        isLoading: false,
                        status: isFinished ? "completed" : "running"
                    };
                });

                const isFinished = threadState.next?.length === 0 && rawMessages.length > 0;
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
    }, [activeJob?.threadId, apiUrl, activeJob?.status, completeJob, options.disabled, parseState]);


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

// Helper to extract subgraph states from the threadState response (future-proofing)
// Note: With current Deep Agents design, subagent tool calls are hidden from state.
// This infrastructure is in place for when streaming or backend changes enable it.
function extractSubgraphStates(threadState: any): Array<{ namespace: string[]; state: Record<string, unknown> }> {
    const results: Array<{ namespace: string[]; state: Record<string, unknown> }> = [];

    // Check tasks field (ThreadTask objects with nested state)
    if (threadState.tasks && Array.isArray(threadState.tasks)) {
        for (const task of threadState.tasks) {
            if (task.state && typeof task.state === 'object') {
                const subgraphState = task.state;
                const subgraphValues = subgraphState.values || subgraphState;

                let subagentName = task.name;
                const colonIdx = subagentName?.indexOf(":") ?? -1;
                if (colonIdx > 0) {
                    subagentName = subagentName.slice(0, colonIdx);
                }

                results.push({
                    namespace: [subagentName],
                    state: typeof subgraphValues === 'object' ? subgraphValues : {},
                });

                // Recursively check for nested subgraph states
                if (subgraphState.tasks && Array.isArray(subgraphState.tasks)) {
                    for (const nestedTask of subgraphState.tasks) {
                        if (nestedTask.state && nestedTask.name) {
                            const nestedValues = nestedTask.state.values || nestedTask.state;
                            results.push({
                                namespace: [subagentName, nestedTask.name],
                                state: typeof nestedValues === 'object' ? nestedValues : {},
                            });
                        }
                    }
                }
            }
        }
    }

    // Secondary: subgraphs field
    if (threadState.subgraphs && typeof threadState.subgraphs === 'object') {
        for (const [namespace, state] of Object.entries(threadState.subgraphs)) {
            if (state && typeof state === 'object') {
                results.push({
                    namespace: [namespace],
                    state: state as Record<string, unknown>,
                });
            }
        }
    }

    // Tertiary: values.subgraph_states
    const values = threadState.values as Record<string, unknown>;
    if (values && values.subgraph_states && Array.isArray(values.subgraph_states)) {
        for (const sg of values.subgraph_states) {
            if (sg.namespace && sg.state) {
                results.push({
                    namespace: Array.isArray(sg.namespace) ? sg.namespace : [sg.namespace],
                    state: sg.state,
                });
            }
        }
    }

    return results;
}


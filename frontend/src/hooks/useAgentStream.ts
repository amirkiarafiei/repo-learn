"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useMemo, useCallback, useState, useRef } from "react";
// Import JobContext
import { useJob } from "@/context/JobContext";

// Types for our agent state
// DeepAgents TodoListMiddleware uses: { status: "pending" | "in_progress" | "completed", content: string }
export interface Todo {
    status: "pending" | "in_progress" | "completed";
    content: string;
}

export interface AgentMessage {
    id: string;
    type: "human" | "ai" | "tool";
    content: string;
    name?: string;
    toolCalls?: Array<{
        id?: string;
        name: string;
        args: Record<string, unknown>;
    }>;
    timestamp: Date;
}

// Individual tool call entry for subagents
export interface SubagentToolCall {
    id: string;           // Unique identifier
    name: string;         // Tool name (e.g., "read_file")
    briefArgs: string;    // Formatted brief args (e.g., "src/main.py")
    timestamp: Date;
}

// SubagentStatus with toolCalls array
export interface SubagentStatus {
    name: string;
    status: "running" | "done" | "error";
    currentTask?: string;
    startedAt?: Date;
    completedAt?: Date;
    activityLogs: string[]; // Keep for backwards compat
    toolCalls: SubagentToolCall[]; // Tool calls made by this subagent
}

interface UseAgentStreamOptions {
    initialThreadId?: string;
    onComplete?: () => void;
}

// The full state type including todos from TodoListMiddleware
type AgentState = Record<string, unknown> & {
    messages?: Message[];
    todos?: Todo[];
};

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
            // Generic: return first short string value
            for (const val of Object.values(args)) {
                if (typeof val === "string" && val.length > 0 && val.length < 40) {
                    return val.length > 25 ? val.slice(0, 22) + "..." : val;
                }
            }
            return "";
        }
    }
}

// Maximum tool calls to keep per subagent (for performance)
const MAX_TOOL_CALLS_PER_AGENT = 50;

// Tools that subagents typically use (excluding brain-level tools)
const SUBAGENT_TOOLS = new Set([
    "read_file", "write_file", "view_file", "edit_file",
    "ls", "list_dir", "list_directory",
    "grep", "search", "glob", "find",
    "shell", "bash", "exec",
]);

export function useAgentStream(options: UseAgentStreamOptions = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024";
    const { activeJob, clearJob } = useJob();

    // Thread management
    const [threadId, setThreadId] = useState<string | null>(
        options.initialThreadId ?? activeJob?.threadId ?? null
    );

    // Track todos from updates
    const [todos, setTodos] = useState<Todo[]>([]);

    // Track subagent status by detecting task tool calls
    const [subagents, setSubagents] = useState<Map<string, SubagentStatus>>(new Map());

    // Track if we've signaled completion (to avoid duplicate calls)
    const hasCompletedRef = useRef(false);

    // Guard against multiple submissions
    const isSubmittingRef = useRef(false);

    // Track tool_call_id to subagent mapping
    const toolCallToAgentRef = useRef<Map<string, string>>(new Map());

    // Track which tool calls we've already processed (by ID) to avoid duplicates
    const processedToolCallsRef = useRef<Set<string>>(new Set());

    // Track the currently active subagent (for associating tool calls)
    const activeSubagentRef = useRef<string | null>(null);

    // Helper to add a tool call to a subagent
    const addToolCallToSubagent = useCallback((agentName: string, toolName: string, args: Record<string, unknown>, toolCallId?: string) => {
        // Avoid duplicates
        const uniqueKey = toolCallId || `${agentName}-${toolName}-${JSON.stringify(args)}`;
        if (processedToolCallsRef.current.has(uniqueKey)) {
            return;
        }
        processedToolCallsRef.current.add(uniqueKey);

        setSubagents(prev => {
            const updated = new Map(prev);
            const existing = updated.get(agentName);
            if (existing) {
                const newToolCall: SubagentToolCall = {
                    id: toolCallId || crypto.randomUUID(),
                    name: toolName,
                    briefArgs: extractBriefArgs(toolName, args),
                    timestamp: new Date(),
                };
                // Keep only last N tool calls for performance
                const updatedToolCalls = [...existing.toolCalls, newToolCall].slice(-MAX_TOOL_CALLS_PER_AGENT);
                updated.set(agentName, {
                    ...existing,
                    toolCalls: updatedToolCalls,
                });
            }
            return updated;
        });
    }, []);

    // Helper to signal completion (idempotent)
    const signalCompletion = useCallback(() => {
        if (hasCompletedRef.current) return;
        hasCompletedRef.current = true;
        console.log("[useAgentStream] Signaling completion");

        // Mark all subagents as done
        setSubagents(prev => {
            const updated = new Map(prev);
            updated.forEach((agent, name) => {
                if (agent.status === "running") {
                    updated.set(name, { ...agent, status: "done", completedAt: new Date() });
                }
            });
            return updated;
        });

        // Unlock submission
        isSubmittingRef.current = false;
        activeSubagentRef.current = null;

        // Call user's callback
        options.onComplete?.();
    }, [options]);

    const stream = useStream<AgentState>({
        apiUrl,
        assistantId: "agent",
        threadId: threadId,
        onThreadId: (newId) => {
            console.log("[useAgentStream] Thread ID set:", newId);
            setThreadId(newId);
        },
        messagesKey: "messages",

        // Capture updates with namespace for subgraph awareness
        onUpdateEvent: (update, { namespace }) => {
            // Debug: Log ALL update events to understand structure
            if (namespace && namespace.length > 0) {
                console.log("[useAgentStream] onUpdateEvent with namespace:", namespace, update);
            }

            if (update && typeof update === 'object') {
                const updateObj = update as Record<string, unknown>;

                // Handle todos (main agent only)
                if ('todos' in updateObj && Array.isArray(updateObj.todos)) {
                    if (!namespace || namespace.length === 0) {
                        setTodos(updateObj.todos as Todo[]);
                    }
                }

                // If this update has tool calls and comes from a subagent namespace
                if (namespace && namespace.length > 0) {
                    // Extract subagent name from namespace
                    const nsFirst = namespace[0];
                    const colonIdx = nsFirst?.indexOf(":") ?? -1;
                    const subagentName = colonIdx > 0 ? nsFirst.slice(0, colonIdx) : nsFirst;

                    if (subagentName) {
                        // Check if update contains messages with tool calls
                        const messages = updateObj.messages as Array<Record<string, unknown>> | undefined;
                        if (messages && Array.isArray(messages)) {
                            for (const msg of messages) {
                                const msgToolCalls = msg.tool_calls as Array<{ id?: string; name: string; args: Record<string, unknown> }> | undefined;
                                if (msgToolCalls) {
                                    for (const tc of msgToolCalls) {
                                        if (tc.name !== "task" && SUBAGENT_TOOLS.has(tc.name)) {
                                            addToolCallToSubagent(subagentName, tc.name, tc.args, tc.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // Capture debug events (experimental but may contain subagent info)
        onDebugEvent: (data, { namespace }) => {
            if (namespace && namespace.length > 0) {
                console.log("[useAgentStream] onDebugEvent from subgraph:", namespace, data);
            }
        },

        // Handle errors explicitly
        onError: (error) => {
            console.error("[useAgentStream] Stream error:", error);
            isSubmittingRef.current = false;
            activeSubagentRef.current = null;
        },

        // Called when stream finishes (success OR after error handling)
        onFinish: (state) => {
            console.log("[useAgentStream] onFinish called with state:", state ? "present" : "null");

            const stateObj = state as unknown as AgentState | undefined;

            // Extract final todos if present
            if (stateObj?.todos && stateObj.todos.length > 0) {
                setTodos(stateObj.todos);
            }

            // Signal completion
            signalCompletion();
        },
    });

    // Explicit stop function
    const stop = useCallback(() => {
        console.log("[useAgentStream] Stopping stream and clearing job");
        stream.stop();
        clearJob();
        isSubmittingRef.current = false;
        activeSubagentRef.current = null;
    }, [stream, clearJob]);

    // Transform raw messages to our AgentMessage format and detect subagent activity
    const messages = useMemo((): AgentMessage[] => {
        if (!stream.messages) return [];

        const result: AgentMessage[] = [];
        const activeSubagents = new Map<string, SubagentStatus>();

        // Track which subagent is "active" based on task tool calls we see
        let currentActiveSubagent: string | null = null;

        for (const msg of stream.messages) {
            const rawMsg = msg as unknown as Record<string, unknown>;
            const toolCalls = rawMsg.tool_calls as Array<{ id: string; name: string; args: Record<string, unknown> }> | undefined;

            // Detect task tool calls (subagent delegation)
            if (toolCalls) {
                for (const tc of toolCalls) {
                    if (tc.name === "task") {
                        const subagentType = tc.args.subagent_type as string;
                        const description = tc.args.description as string;
                        if (subagentType) {
                            currentActiveSubagent = subagentType;
                            activeSubagentRef.current = subagentType;

                            activeSubagents.set(subagentType, {
                                name: subagentType,
                                status: "running",
                                currentTask: description?.slice(0, 100) || "Working...",
                                startedAt: new Date(),
                                activityLogs: [`Started: ${description?.slice(0, 60) || "Analyzing..."}...`],
                                toolCalls: [], // Initialize empty
                            });
                            // Store the mapping so we know when this specific task finishes
                            if (tc.id) {
                                toolCallToAgentRef.current.set(tc.id, subagentType);
                            }
                        }
                    } else if (currentActiveSubagent && SUBAGENT_TOOLS.has(tc.name)) {
                        // This tool call might belong to the currently active subagent
                        // (This is a heuristic - tool calls appearing after task() but before task result)
                        addToolCallToSubagent(currentActiveSubagent, tc.name, tc.args, tc.id);
                    }
                }
            }

            // Detect tool results from task (subagent completion)
            if (rawMsg.type === "tool" && rawMsg.name === "task") {
                const toolCallId = rawMsg.tool_call_id as string;
                const completedAgent = toolCallToAgentRef.current.get(toolCallId);
                if (completedAgent) {
                    // Mark as done
                    setSubagents(prev => {
                        const updated = new Map(prev);
                        const existing = updated.get(completedAgent);
                        if (existing && existing.status === "running") {
                            updated.set(completedAgent, {
                                ...existing,
                                status: "done",
                                completedAt: new Date()
                            });
                        }
                        return updated;
                    });

                    // Clear active subagent if it was this one
                    if (currentActiveSubagent === completedAgent) {
                        currentActiveSubagent = null;
                        activeSubagentRef.current = null;
                    }
                }
            }

            result.push({
                id: (rawMsg.id as string) || crypto.randomUUID(),
                type: (rawMsg.type as "human" | "ai" | "tool") || "ai",
                content: typeof rawMsg.content === "string" ? rawMsg.content : JSON.stringify(rawMsg.content || ""),
                name: rawMsg.name as string | undefined,
                toolCalls: toolCalls?.map((tc) => ({
                    id: tc.id,
                    name: tc.name,
                    args: tc.args,
                })),
                timestamp: new Date(),
            });
        }

        // Update subagent state if we detected new ones
        if (activeSubagents.size > 0) {
            setSubagents(prev => {
                const updated = new Map(prev);
                activeSubagents.forEach((agent, name) => {
                    // Only update if new or was done (re-running)
                    if (!updated.has(name) || updated.get(name)?.status === "done") {
                        updated.set(name, agent);
                    }
                });
                return updated;
            });
        }

        return result;
    }, [stream.messages, addToolCallToSubagent]);

    // Get todos from state or fallback
    const currentTodos = useMemo((): Todo[] => {
        if (todos.length > 0) return todos;
        const values = stream.values as AgentState | undefined;
        return values?.todos || [];
    }, [todos, stream.values]);

    // Convert subagents map to array
    const subagentsList = useMemo((): SubagentStatus[] => {
        return Array.from(subagents.values());
    }, [subagents]);

    // Submit a new analysis request
    const submitAnalysis = useCallback((githubUrl: string, audience: "user" | "dev" = "dev", depth: "basic" | "detailed" = "basic") => {
        // Prevent duplicate submissions
        if (isSubmittingRef.current) {
            console.warn("[useAgentStream] submitAnalysis called while already submitting, ignoring");
            return;
        }
        isSubmittingRef.current = true;
        hasCompletedRef.current = false;

        // Reset state for new analysis
        setTodos([]);
        setSubagents(new Map());
        toolCallToAgentRef.current.clear();
        processedToolCallsRef.current.clear();
        activeSubagentRef.current = null;

        const newThreadId = threadId ?? crypto.randomUUID();
        console.log("[useAgentStream] Submitting analysis with threadId:", newThreadId);

        const depthInstruction = depth === "detailed"
            ? "Provide a comprehensive, in-depth tutorial covering all aspects of the codebase in detail."
            : "Provide a quick overview tutorial focusing on the main concepts and getting started.";

        stream.submit(
            {
                messages: [
                    {
                        type: "human",
                        content: `Please analyze this repository: ${githubUrl}\nTarget audience: ${audience}\nTutorial depth: ${depth}\n\n${depthInstruction}`,
                    },
                ],
            },
            {
                threadId: newThreadId,
                streamSubgraphs: true, // Enable subgraph streaming
            }
        );
    }, [stream, threadId]);

    return {
        // State
        messages,
        todos: currentTodos,
        subagents: subagentsList,
        isLoading: stream.isLoading,
        error: stream.error,
        threadId: threadId,

        // Actions
        submitAnalysis,
        stop,

        // Raw stream for advanced use
        rawStream: stream,
    };
}

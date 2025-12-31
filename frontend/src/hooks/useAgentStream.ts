"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useMemo, useCallback, useState, useRef } from "react";

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
        name: string;
        args: Record<string, unknown>;
    }>;
    timestamp: Date;
}

export interface SubagentStatus {
    name: string;
    status: "running" | "done" | "error";
    currentTask?: string;
    startedAt?: Date;
    completedAt?: Date;
    activityLogs: string[]; // Last few log lines from this subagent
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

export function useAgentStream(options: UseAgentStreamOptions = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024";

    // Thread management - start with null if no initial thread
    const [threadId, setThreadId] = useState<string | null>(options.initialThreadId ?? null);

    // Track todos from updates
    const [todos, setTodos] = useState<Todo[]>([]);

    // Track subagent status by detecting task tool calls
    const [subagents, setSubagents] = useState<Map<string, SubagentStatus>>(new Map());

    // Track if we've signaled completion (to avoid duplicate calls)
    const hasCompletedRef = useRef(false);

    // Guard against multiple submissions
    const isSubmittingRef = useRef(false);

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

        // Capture todos from graph updates
        onUpdateEvent: (update) => {
            if (update && typeof update === 'object') {
                const updateObj = update as Record<string, unknown>;
                if ('todos' in updateObj && Array.isArray(updateObj.todos)) {
                    console.log("[useAgentStream] Todos updated:", updateObj.todos.length, "items");
                    setTodos(updateObj.todos as Todo[]);
                }
            }
        },

        // Handle errors explicitly
        onError: (error) => {
            console.error("[useAgentStream] Stream error:", error);
            isSubmittingRef.current = false;
            // Don't signal completion on error - let the error state propagate
        },

        // Called when stream finishes (success OR after error handling)
        onFinish: (state) => {
            console.log("[useAgentStream] onFinish called with state:", state ? "present" : "null");

            const stateObj = state as unknown as AgentState | undefined;

            // Extract final todos if present
            if (stateObj?.todos && stateObj.todos.length > 0) {
                setTodos(stateObj.todos);
            }

            // Signal completion - the stream has finished
            // We trust onFinish means the agent is done (errors would go to onError)
            signalCompletion();
        },
    });

    // Transform raw messages to our AgentMessage format and detect subagent activity
    const messages = useMemo((): AgentMessage[] => {
        if (!stream.messages) return [];

        const result: AgentMessage[] = [];
        const activeSubagents = new Map<string, SubagentStatus>();
        // Map to track which tool_call_id belongs to which subagent name
        const toolCallToAgent = new Map<string, string>();

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
                            activeSubagents.set(subagentType, {
                                name: subagentType,
                                status: "running",
                                currentTask: description?.slice(0, 100) || "Working...",
                                startedAt: new Date(),
                                activityLogs: [`Started: ${description?.slice(0, 60) || "Analyzing..."}...`],
                            });
                            // Store the mapping so we know when this specific task finishes
                            if (tc.id) {
                                toolCallToAgent.set(tc.id, subagentType);
                            }
                        }
                    }
                }
            }

            // Detect tool results from task (subagent completion)
            if (rawMsg.type === "tool" && rawMsg.name === "task") {
                const toolCallId = rawMsg.tool_call_id as string;
                const agentName = toolCallToAgent.get(toolCallId);
                if (agentName) {
                    setSubagents(prev => {
                        const updated = new Map(prev);
                        const existing = updated.get(agentName);
                        if (existing && existing.status === "running") {
                            updated.set(agentName, {
                                ...existing,
                                status: "done",
                                completedAt: new Date()
                            });
                        }
                        return updated;
                    });
                }
            }

            result.push({
                id: (rawMsg.id as string) || crypto.randomUUID(),
                type: (rawMsg.type as "human" | "ai" | "tool") || "ai",
                content: typeof rawMsg.content === "string" ? rawMsg.content : JSON.stringify(rawMsg.content || ""),
                name: rawMsg.name as string | undefined,
                toolCalls: toolCalls?.map((tc) => ({
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
    }, [stream.messages]);

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

    // Submit a new analysis request with optimistic thread creation
    const submitAnalysis = useCallback((githubUrl: string, audience: "user" | "dev" = "dev", depth: "basic" | "detailed" = "basic") => {
        // Prevent duplicate submissions
        if (isSubmittingRef.current) {
            console.warn("[useAgentStream] submitAnalysis called while already submitting, ignoring");
            return;
        }
        isSubmittingRef.current = true;
        hasCompletedRef.current = false; // Reset completion flag for new analysis

        // Reset state for new analysis
        setTodos([]);
        setSubagents(new Map());

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
            { threadId: newThreadId }
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
        stop: stream.stop,

        // Raw stream for advanced use
        rawStream: stream,
    };
}

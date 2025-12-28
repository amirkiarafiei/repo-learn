"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useMemo, useCallback, useState } from "react";

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
}

interface UseAgentStreamOptions {
    initialThreadId?: string;
    onComplete?: () => void;
}

// The full state type including todos from TodoListMiddleware
interface AgentState {
    messages: Message[];
    todos?: Todo[];
}

export function useAgentStream(options: UseAgentStreamOptions = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024";

    // Thread management - start with null if no initial thread
    const [threadId, setThreadId] = useState<string | null>(options.initialThreadId ?? null);

    // Track todos separately since they come from updates
    const [todos, setTodos] = useState<Todo[]>([]);

    const stream = useStream<AgentState>({
        apiUrl,
        assistantId: "agent",
        threadId: threadId,
        onThreadId: setThreadId,
        messagesKey: "messages",
        // Capture todos from graph updates
        onUpdateEvent: (update) => {
            // Update contains the state values from each node
            if (update && typeof update === 'object') {
                const updateObj = update as Record<string, unknown>;
                // Check if this update contains todos
                if ('todos' in updateObj && Array.isArray(updateObj.todos)) {
                    setTodos(updateObj.todos as Todo[]);
                }
            }
        },
        onFinish: (state) => {
            // Also extract todos from final state
            if (state?.todos) {
                setTodos(state.todos);
            }
            options.onComplete?.();
        },
    });

    // Transform raw messages to our AgentMessage format
    const messages = useMemo((): AgentMessage[] => {
        if (!stream.messages) return [];

        return stream.messages.map((msg) => {
            // Cast to access all properties
            const rawMsg = msg as unknown as Record<string, unknown>;
            const toolCalls = rawMsg.tool_calls as Array<{ name: string; args: Record<string, unknown> }> | undefined;

            return {
                id: (rawMsg.id as string) || crypto.randomUUID(),
                type: (rawMsg.type as "human" | "ai" | "tool") || "ai",
                content: typeof rawMsg.content === "string" ? rawMsg.content : JSON.stringify(rawMsg.content || ""),
                name: rawMsg.name as string | undefined,
                toolCalls: toolCalls?.map((tc) => ({
                    name: tc.name,
                    args: tc.args,
                })),
                timestamp: new Date(),
            };
        });
    }, [stream.messages]);

    // Also try to get todos from stream.values as fallback
    const currentTodos = useMemo((): Todo[] => {
        // First check our state
        if (todos.length > 0) return todos;
        // Fallback to values
        const values = stream.values as AgentState | undefined;
        return values?.todos || [];
    }, [todos, stream.values]);

    // Submit a new analysis request with optimistic thread creation
    const submitAnalysis = useCallback((githubUrl: string, audience: "user" | "dev" = "dev") => {
        // Generate a thread ID if we don't have one yet
        const newThreadId = threadId ?? crypto.randomUUID();

        stream.submit(
            {
                messages: [
                    {
                        type: "human",
                        content: `Please analyze this repository: ${githubUrl}\nTarget audience: ${audience}`,
                    },
                ],
            },
            // Pass the threadId to create the thread optimistically
            { threadId: newThreadId }
        );
    }, [stream, threadId]);

    return {
        // State
        messages,
        todos: currentTodos,
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

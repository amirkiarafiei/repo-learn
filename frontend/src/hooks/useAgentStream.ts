"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";
import { useMemo, useCallback, useState } from "react";

// Types for our agent state
export interface Todo {
    id: string;
    task: string;
    status: "pending" | "in_progress" | "done";
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

export function useAgentStream(options: UseAgentStreamOptions = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024";

    // Thread management - start with null if no initial thread
    const [threadId, setThreadId] = useState<string | null>(options.initialThreadId ?? null);

    const stream = useStream<{ messages: Message[] }>({
        apiUrl,
        assistantId: "agent",
        threadId: threadId,
        onThreadId: setThreadId,
        messagesKey: "messages",
        onFinish: () => {
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

    // Extract todos from state updates
    const todos = useMemo((): Todo[] => {
        const values = stream.values as { todos?: Todo[] } | undefined;
        return values?.todos || [];
    }, [stream.values]);

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
        todos,
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

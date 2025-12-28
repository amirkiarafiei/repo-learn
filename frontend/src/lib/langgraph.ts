import { Client } from "@langchain/langgraph-sdk";

// LangGraph client configuration
// Uses the NEXT_PUBLIC_LANGGRAPH_URL env variable or defaults to localhost:2024
export const langgraphClient = new Client({
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_URL || "http://localhost:2024",
});

// Helper to get the default assistant ID
export const ASSISTANT_ID = "agent";

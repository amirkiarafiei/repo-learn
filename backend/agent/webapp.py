"""
Custom HTTP endpoints for the LangGraph server.

This module provides additional API routes that extend the LangGraph server,
including the endpoint for fetching subagent tool calls.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

from agent.tool_call_store import get_tool_call_store, ToolCallEntry

app = FastAPI(title="RepoLearn Custom API")

# Add CORS middleware (LangGraph server handles main CORS, but this is for safety)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # The main LangGraph server handles CORS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/tool-calls/{thread_id}")
async def get_tool_calls(thread_id: str) -> Dict[str, List[ToolCallEntry]]:
    """
    Get all tool calls for a given thread, grouped by subagent.
    
    Args:
        thread_id: The LangGraph thread ID
        
    Returns:
        Dictionary mapping subagent names to their tool call entries
    """
    store = get_tool_call_store()
    return store.get_entries_by_subagent(thread_id)


@app.get("/tool-calls/{thread_id}/flat")
async def get_tool_calls_flat(thread_id: str) -> List[ToolCallEntry]:
    """
    Get all tool calls for a given thread as a flat list.
    
    Args:
        thread_id: The LangGraph thread ID
        
    Returns:
        List of all tool call entries in chronological order
    """
    store = get_tool_call_store()
    return store.get_entries(thread_id)


@app.delete("/tool-calls/{thread_id}")
async def clear_tool_calls(thread_id: str) -> Dict[str, str]:
    """
    Clear all tool calls for a given thread.
    
    Args:
        thread_id: The LangGraph thread ID
        
    Returns:
        Confirmation message
    """
    store = get_tool_call_store()
    store.clear_thread(thread_id)
    return {"status": "cleared", "thread_id": thread_id}


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok", "service": "repolearn-custom-api"}

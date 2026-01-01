"""
Custom middleware to capture subagent tool calls.

This middleware intercepts tool calls during subagent execution and stores them
in an in-memory store, keyed by thread_id. The frontend can then fetch these
tool calls via a dedicated API endpoint.

IMPORTANT: This approach stores tool calls in memory, NOT in the agent's state.
This means:
1. Tool calls are visible in real-time during polling
2. They DO NOT pollute the main agent's context (respecting Deep Agents philosophy)
3. They need to be persisted separately for historical view (via snapshots)
"""

from typing import Callable, Any
from langchain_core.messages import ToolMessage
from langgraph.types import Command
from langchain.agents.middleware.types import AgentMiddleware

from agent.tool_call_store import get_tool_call_store, create_tool_call_entry


class SubagentToolEventMiddleware(AgentMiddleware):
    """
    Middleware that captures tool calls and stores them for frontend display.
    
    Each instance is bound to a specific subagent name.
    """
    
    def __init__(self, subagent_name: str = "unknown"):
        """
        Initialize the middleware.
        
        Args:
            subagent_name: The name of the subagent this middleware is attached to
        """
        self.subagent_name = subagent_name
    
    def wrap_tool_call(
        self,
        request: Any,
        handler: Callable[[Any], ToolMessage | Command]
    ) -> ToolMessage | Command:
        """Intercept tool calls (sync version)."""
        self._log_tool_call(request)
        return handler(request)
    
    async def awrap_tool_call(
        self,
        request: Any,
        handler: Callable[[Any], ToolMessage | Command]
    ) -> ToolMessage | Command:
        """Intercept tool calls (async version)."""
        self._log_tool_call(request)
        return await handler(request)
    
    def _log_tool_call(self, request: Any) -> None:
        """
        Log a tool call to the store.
        
        Args:
            request: The tool call request
        """
        # Extract tool information from request
        # request is a ToolCallRequest which wraps the data in a .tool_call dictionary
        tool_call = getattr(request, 'tool_call', {})
        if isinstance(tool_call, dict):
            tool_name = tool_call.get('name', 'unknown')
            tool_args = tool_call.get('args', {})
        else:
            # Fallback for other request types
            tool_name = getattr(request, 'tool_name', getattr(request, 'name', 'unknown'))
            tool_args = getattr(request, 'tool_args', getattr(request, 'args', {}))
        
        # Get thread_id from the running context
        thread_id = self._get_thread_id()
        if not thread_id:
            # Can't store without thread_id
            return
        
        # Create and store the entry
        entry = create_tool_call_entry(
            subagent=self.subagent_name,
            tool=tool_name,
            args_brief=_extract_brief_args(tool_name, tool_args),
            status="start"
        )
        
        store = get_tool_call_store()
        store.add_entry(thread_id, entry)
    
    def _get_thread_id(self) -> str | None:
        """
        Get the current thread_id from LangGraph config.
        
        Returns:
            The thread_id if available, None otherwise.
        """
        try:
            from langgraph.config import get_config
            config = get_config()
            configurable = config.get("configurable", {})
            return configurable.get("thread_id")
        except Exception:
            # If we can't get config, we're not in a LangGraph context
            return None


def _extract_brief_args(tool_name: str, args: dict) -> str:
    """
    Extract a brief, human-readable representation of tool arguments.
    """
    if not args:
        return ""
    
    # Map of tool names to their primary argument keys
    primary_arg_keys = {
        "read_file": ["path", "file_path", "file"],
        "write_file": ["path", "file_path", "file"],
        "view_file": ["path", "file_path", "file"],
        "edit_file": ["path", "file_path"],
        "ls": ["path", "directory", "dir"],
        "list_dir": ["path", "directory"],
        "list_directory": ["path", "directory"],
        "grep": ["pattern", "query", "search"],
        "search": ["pattern", "query"],
        "glob": ["pattern", "glob"],
        "find": ["pattern"],
    }
    
    # Get the primary keys for this tool
    primary_keys = primary_arg_keys.get(tool_name, [])
    
    # Try to find a primary argument
    for key in primary_keys:
        if key in args:
            value = str(args[key])
            # For file paths, just show the filename
            if "/" in value:
                value = value.split("/")[-1]
            # Truncate if too long
            if len(value) > 30:
                value = value[:27] + "..."
            return value
    
    # Fallback: return first short string value
    for value in args.values():
        if isinstance(value, str) and 0 < len(value) < 40:
            if len(value) > 25:
                return value[:22] + "..."
            return value
    
    return ""


def create_subagent_tool_middleware(subagent_name: str) -> SubagentToolEventMiddleware:
    """
    Factory function to create a SubagentToolEventMiddleware instance.
    
    Args:
        subagent_name: The name of the subagent (e.g., "code-analyzer", "doc-writer")
        
    Returns:
        A configured SubagentToolEventMiddleware instance
    """
    return SubagentToolEventMiddleware(subagent_name=subagent_name)

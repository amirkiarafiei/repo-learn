"""
In-memory store for subagent tool calls.

This module provides a thread-safe store for accumulating tool calls made by subagents.
The store is keyed by thread_id, allowing multiple concurrent runs to be tracked separately.

Note: This is an in-memory store that resets on server restart.
For persistence, tool calls are also saved to metadata snapshots.
"""

from typing import Dict, List, TypedDict
from threading import Lock
from datetime import datetime
import uuid

class ToolCallEntry(TypedDict):
    """A single tool call log entry."""
    id: str                 # Unique ID for this entry
    subagent: str           # Which subagent (e.g., "code-analyzer")
    tool: str               # Tool name (e.g., "read_file")
    args_brief: str         # Brief representation of args (e.g., "package.json")
    timestamp: str          # ISO timestamp
    status: str             # "start" or "end"


class ToolCallStore:
    """
    Thread-safe in-memory store for subagent tool calls.
    
    Usage:
        store = get_tool_call_store()
        store.add_entry(thread_id, entry)
        entries = store.get_entries(thread_id)
    """
    
    def __init__(self):
        self._data: Dict[str, List[ToolCallEntry]] = {}
        self._lock = Lock()
    
    def add_entry(self, thread_id: str, entry: ToolCallEntry) -> None:
        """Add a tool call entry for a thread."""
        with self._lock:
            if thread_id not in self._data:
                self._data[thread_id] = []
            self._data[thread_id].append(entry)
    
    def get_entries(self, thread_id: str) -> List[ToolCallEntry]:
        """Get all tool call entries for a thread."""
        with self._lock:
            return list(self._data.get(thread_id, []))
    
    def clear_thread(self, thread_id: str) -> None:
        """Clear all entries for a thread."""
        with self._lock:
            if thread_id in self._data:
                del self._data[thread_id]
    
    def get_entries_by_subagent(self, thread_id: str) -> Dict[str, List[ToolCallEntry]]:
        """Get tool call entries grouped by subagent."""
        entries = self.get_entries(thread_id)
        result: Dict[str, List[ToolCallEntry]] = {}
        for entry in entries:
            subagent = entry.get("subagent", "unknown")
            if subagent not in result:
                result[subagent] = []
            result[subagent].append(entry)
        return result


# Global singleton instance
_store_instance: ToolCallStore | None = None
_store_lock = Lock()


def get_tool_call_store() -> ToolCallStore:
    """Get the global tool call store singleton."""
    global _store_instance
    if _store_instance is None:
        with _store_lock:
            if _store_instance is None:
                _store_instance = ToolCallStore()
    return _store_instance


def create_tool_call_entry(
    subagent: str,
    tool: str,
    args_brief: str,
    status: str = "start"
) -> ToolCallEntry:
    """Helper to create a tool call entry with auto-generated ID and timestamp."""
    return {
        "id": str(uuid.uuid4()),
        "subagent": subagent,
        "tool": tool,
        "args_brief": args_brief,
        "timestamp": datetime.now().isoformat(),
        "status": status
    }

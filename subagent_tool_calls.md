# Subagent Tool Calls Feature: Technical Deep Dive

**Document Created**: January 2, 2026  
**Purpose**: Document the research, learnings, and implementation plan for displaying subagent tool calls in the RepoLearn dashboard.

---

## Table of Contents

1. [Feature Goal](#1-feature-goal)
2. [Architecture Overview](#2-architecture-overview)
3. [Understanding Deep Agents Library](#3-understanding-deep-agents-library)
4. [The Challenge: Why Subagent Tool Calls Are Hidden](#4-the-challenge-why-subagent-tool-calls-are-hidden)
5. [Frontend Architecture: Polling vs Streaming](#5-frontend-architecture-polling-vs-streaming)
6. [What We Tried and Why It Didn't Work](#6-what-we-tried-and-why-it-didnt-work)
7. [Available Solutions](#7-available-solutions)
8. [Detailed Implementation Plan: Option B](#8-detailed-implementation-plan-option-b)

---

## 1. Feature Goal

### User Requirement
When viewing the 3-panel dashboard during a live analysis, users want to see **real-time tool call activity** from subagents within the "Workers" panel. Specifically:

- Each subagent card should display a scrollable log of tool calls
- Show tool name and most critical parameter (e.g., `read_file package.json`)
- Logs prefixed with ">" character
- Auto-scroll to show latest entries
- Should work for both live streaming AND historical view (after job completion)

### Current Behavior
- Subagent cards show only "Started: {task description}..."
- No visibility into what tools the subagent is actually executing
- Users have no insight into subagent progress

### Desired Behavior
```
┌─────────────────────────────────────────┐
│ ● Code Analyzer         [5 calls]   ∧   │
├─────────────────────────────────────────┤
│ Task: Analyze main files...             │
├─────────────────────────────────────────┤
│ › ls /                                  │
│ › read_file package.json                │
│ › read_file src/main.py                 │
│ › grep "import"                         │
│ › read_file README.md                   │
│                 ↕ scroll                │
└─────────────────────────────────────────┘
```

---

## 2. Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Python)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Deep Agents Library                       │   │
│  │  ┌──────────────┐    ┌──────────────────┐                   │   │
│  │  │ Brain Agent  │───▶│ SubAgentMiddleware│                   │   │
│  │  │ (Main Agent) │    │   └── task()     │                   │   │
│  │  └──────────────┘    │       ├── code-analyzer  ────────────┼───┼──▶ Tool Calls
│  │                      │       └── doc-writer     ────────────┼───┼──▶ Tool Calls
│  │                      └──────────────────┘                   │   │
│  │                                │                             │   │
│  │                    ┌───────────▼───────────┐                │   │
│  │                    │  _EXCLUDED_STATE_KEYS  │                │   │
│  │                    │  {"messages", "todos"} │ ◀── PROBLEM!   │   │
│  │                    └───────────┬───────────┘                │   │
│  │                                │                             │   │
│  │                    ┌───────────▼───────────┐                │   │
│  │                    │     Thread State       │                │   │
│  │                    │   (subagent messages   │                │   │
│  │                    │     are FILTERED OUT)  │                │   │
│  │                    └───────────────────────┘                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                   │                                 │
│                      LangGraph API Server                           │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │
                         HTTP/SSE Connection
                                   │
┌──────────────────────────────────▼──────────────────────────────────┐
│                         FRONTEND (React/Next.js)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    usePersistentAgent Hook                   │   │
│  │                                                              │   │
│  │  1. client.runs.create() ──▶ Start detached run             │   │
│  │                                                              │   │
│  │  2. setInterval(2500ms) ──▶ Poll every 2.5 seconds          │   │
│  │           │                                                  │   │
│  │           ▼                                                  │   │
│  │  3. client.threads.getState() ──▶ Get current state         │   │
│  │           │                                                  │   │
│  │           ▼                                                  │   │
│  │  4. Parse messages, todos, detect subagents                 │   │
│  │           │                                                  │   │
│  │           ▼                                                  │   │
│  │  5. Update UI state                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Files

| Component            | File                                        | Purpose                                           |
| -------------------- | ------------------------------------------- | ------------------------------------------------- |
| Deep Agent Graph     | `/backend/agent/graph.py`                   | Creates the main agent with `create_deep_agent()` |
| Subagent Definitions | `/backend/agent/subagents.py`               | Defines code-analyzer and doc-writer subagents    |
| Custom Middleware    | `/backend/agent/middleware.py`              | Attempts to emit tool call events (NEW)           |
| Frontend Hook        | `/frontend/src/hooks/usePersistentAgent.ts` | Manages live agent state via polling              |
| Historical Hook      | `/frontend/src/hooks/useThreadHistory.ts`   | Loads completed analysis from snapshots           |
| UI Component         | `/frontend/src/components/GridPanel.tsx`    | Renders subagent cards in Workers panel           |

---

## 3. Understanding Deep Agents Library

### What is Deep Agents?

Deep Agents is a LangChain/LangGraph library that provides a framework for building multi-agent systems. Key concepts:

1. **Brain Agent**: The main orchestrating agent that receives user requests
2. **Subagents**: Specialized worker agents that the brain delegates tasks to
3. **Middleware Stack**: Modular components that handle different concerns (filesystem, todos, subagent delegation)

### The `task()` Tool

When the brain agent wants to delegate work, it uses the `task()` tool:

```python
task(
    subagent_type="code-analyzer",
    description="Analyze the main files and architecture"
)
```

This is implemented by `SubAgentMiddleware`:

```python
# From deepagents/middleware/subagents.py (conceptual)
class SubAgentMiddleware:
    def _create_task_tool(self, ...):
        # Creates the task() tool that delegates to subagents
        async def task(subagent_type: str, description: str):
            subagent = self.subagents[subagent_type]
            result = await subagent.ainvoke({"messages": [HumanMessage(description)]})
            # Returns ONLY the final message, not intermediate tool calls
            return result.messages[-1].content
```

### Subagent Execution Flow

```
Brain Agent                      SubAgentMiddleware                    Subagent
    │                                  │                                   │
    │  tool_call: task(...)            │                                   │
    │─────────────────────────────────▶│                                   │
    │                                  │  invoke subagent                  │
    │                                  │──────────────────────────────────▶│
    │                                  │                                   │
    │                                  │                    [Subagent runs]│
    │                                  │                    - ls /         │
    │                                  │                    - read_file    │
    │                                  │                    - grep         │
    │                                  │                    [These are NOT │
    │                                  │                     returned!]    │
    │                                  │                                   │
    │                                  │◀──────────────────────────────────│
    │                                  │  Only final AIMessage content     │
    │◀─────────────────────────────────│                                   │
    │  ToolMessage with final result   │                                   │
```

### The Philosophy: Context Isolation

Deep Agents intentionally hides subagent details from the brain agent for good reasons:

1. **Context Window Efficiency**: If every subagent tool call was visible to the brain, the context would quickly bloat
2. **Abstraction**: The brain only cares about the final result, not HOW the subagent achieved it
3. **Clean Delegation**: Each subagent has its own isolated message history

This is a **design choice**, not a bug.

---

## 4. The Challenge: Why Subagent Tool Calls Are Hidden

### The `_EXCLUDED_STATE_KEYS` Constant

In `deepagents/middleware/subagents.py`:

```python
_EXCLUDED_STATE_KEYS = {"messages", "todos", "structured_response"}
```

This constant is used in two critical places:

#### 1. When Creating Subagent State (Input Isolation)

```python
def _create_task_tool(self, ...):
    async def task(...):
        # Create a fresh state for the subagent
        subagent_state = {
            k: v for k, v in runtime.state.items() 
            if k not in _EXCLUDED_STATE_KEYS  # <-- Filters OUT messages
        }
        # Subagent starts with only the task description
        subagent_state["messages"] = [HumanMessage(content=description)]
```

#### 2. When Returning State to Parent (Output Isolation)

```python
def _return_command_with_state_update(result, ...):
    state_update = {
        k: v for k, v in result.state.items()
        if k not in _EXCLUDED_STATE_KEYS  # <-- Filters OUT messages
    }
    # Only the final message content is returned as a ToolMessage
    return Command(
        update={
            "messages": [ToolMessage(content=final_message_content)]
        }
    )
```

### Implications for Our Feature

When we call `client.threads.getState()`:

```python
thread_state = await client.threads.getState(thread_id)
# thread_state.values contains:
# - Brain agent's messages (including task() calls and ToolMessage results)
# - Todos
# - Other state
# 
# BUT NOT:
# - Subagent's intermediate messages
# - Subagent's tool calls
```

Even with `subgraphs=True`:

```python
thread_state = await client.threads.getState(thread_id, subgraphs=True)
# The tasks field MIGHT contain subgraph state, BUT
# the _EXCLUDED_STATE_KEYS filtering happens BEFORE state is saved
# So even the subgraph state doesn't have the messages
```

---

## 5. Frontend Architecture: Polling vs Streaming

### Current Architecture: Polling

The frontend uses `usePersistentAgent` which implements a **polling** pattern:

```typescript
// Start a detached run (runs on server independently)
const run = await client.runs.create(threadId, "agent", {
    input: { messages: [...] },
    streamMode: "values"
});

// Poll for state updates every 2.5 seconds
setInterval(async () => {
    const state = await client.threads.getState(threadId);
    // Update UI with state.values
}, 2500);
```

**Advantages of Polling:**
- User can leave the page and come back (detached run continues)
- Simple reconnection logic
- Works with page refreshes

**Disadvantages:**
- Can only see what's in the final state
- No real-time event streaming
- Subagent tool calls are already filtered out before we poll

### Alternative: Streaming

LangGraph supports real-time streaming:

```typescript
// Stream run (tied to client connection)
const stream = await client.runs.stream(threadId, "agent", {
    input: { messages: [...] },
    streamMode: ["values", "updates", "events", "custom"]
});

for await (const chunk of stream) {
    // Real-time updates as they happen
    // Custom events from middleware would appear here
}
```

**Advantages of Streaming:**
- Real-time updates
- Can receive custom events from backend middleware
- Lower latency

**Disadvantages:**
- If connection drops, need to handle reconnection
- Run may not continue if client disconnects (depends on configuration)
- More complex state management

### Why This Matters for Tool Calls

The custom middleware I created emits events like this:

```python
from langgraph.config import get_stream_writer

class SubagentToolEventMiddleware:
    def wrap_tool_call(self, request, handler):
        writer = get_stream_writer()
        writer({
            "type": "subagent_tool_call",
            "subagent": self.subagent_name,
            "tool_name": request.tool_name,
            ...
        })
        return handler(request)
```

**The Problem**: `get_stream_writer()` only works during streaming. Since we use polling, there's no active stream to write to. The events are emitted but nobody is listening.

---

## 6. What We Tried and Why It Didn't Work

### Attempt 1: Enable `subgraphs=True` in Polling

**Hypothesis**: If we pass `subgraphs: true` to `getState()`, we'll get subagent state.

**Implementation**:
```typescript
const state = await client.threads.getState(threadId, undefined, {
    subgraphs: true
});
```

**Result**: ❌ Failed

**Reason**: The `_EXCLUDED_STATE_KEYS` filtering happens inside Deep Agents when the subagent returns. By the time state is saved to the checkpoint, the messages are already stripped out. `subgraphs: true` shows us the subgraph's state, but that state has already been filtered.

### Attempt 2: Custom Middleware Emitting Stream Events

**Hypothesis**: Create middleware that emits custom events for tool calls.

**Implementation**:
```python
class SubagentToolEventMiddleware(AgentMiddleware):
    def wrap_tool_call(self, request, handler):
        writer = get_stream_writer()
        writer({"type": "subagent_tool_call", ...})
        return handler(request)
```

**Result**: ❌ Failed (for polling mode)

**Reason**: Events go to the stream, but polling doesn't consume the stream. If we were using `runs.stream()` with `onCustomEvent` callback, this would work. But we use `runs.create()` + polling.

### Attempt 3: Using `onLangChainEvent` Callback in useStream

**Hypothesis**: The `useStream` hook has an `onLangChainEvent` callback that might receive subagent events.

**Implementation**:
```typescript
useStream({
    streamSubgraphs: true,
    onLangChainEvent: (data) => {
        if (data.event === "on_tool_start") {
            // Capture tool calls
        }
    }
});
```

**Result**: ❌ Not applicable

**Reason**: The job page uses `usePersistentAgent` (polling), not `useStream` (streaming). Even if we used `useStream`, Deep Agents' subagent execution is wrapped in such a way that internal tool calls may not be exposed.

---

## 7. Available Solutions

### Option A: Switch to Full Streaming

**Approach**: Replace `runs.create()` + polling with `runs.stream()`.

**Changes Required**:
1. Modify `usePersistentAgent` to use streaming instead of polling
2. Handle stream disconnect/reconnect scenarios
3. Ensure run continues if user leaves (may need server-side config)

**Pros**:
- Real-time updates
- Can use the existing middleware

**Cons**:
- Significant architectural change
- May break the "leave and come back" feature
- More complex error handling

### Option B: Store Tool Calls in Custom State Key

**Approach**: Have middleware store tool calls in a state key that isn't filtered by `_EXCLUDED_STATE_KEYS`.

**Changes Required**:
1. Define new state key (e.g., `subagent_tool_log`)
2. Update middleware to write to this key instead of streaming
3. Frontend reads from this key during polling

**Pros**:
- Works with existing polling architecture
- Preserves detached run functionality
- No breaking changes to user experience

**Cons**:
- Tool calls accumulate in state (memory consideration)
- Need to ensure Clean state handling between runs

### Option C: Fork Deep Agents Library

**Approach**: Create a custom version of Deep Agents without `_EXCLUDED_STATE_KEYS` filtering.

**Pros**:
- Full control over behavior

**Cons**:
- Maintenance burden of custom fork
- May break Deep Agents' context efficiency assumptions
- Overkill for this feature

---

## 8. Detailed Implementation Plan: Option B

### Overview

Store subagent tool calls in a custom state key `subagent_tool_log` that persists across polling. The middleware writes to this key, and the frontend reads from it.

### Step 1: Define the State Extension

**File**: Create or update `/backend/agent/state.py`

```python
from typing import TypedDict, List, Optional
from datetime import datetime

class SubagentToolLogEntry(TypedDict):
    id: str                      # Unique ID for this tool call
    subagent: str                # Which subagent (e.g., "code-analyzer")
    tool: str                    # Tool name (e.g., "read_file")
    args_brief: str              # Brief representation of args
    timestamp: str               # ISO timestamp
    status: str                  # "start" or "end"

class ExtendedAgentState(TypedDict, total=False):
    # Existing state keys
    messages: List
    todos: List
    # NEW: Tool call log that survives filtering
    subagent_tool_log: List[SubagentToolLogEntry]
```

### Step 2: Update the Agent Graph to Include New State Key

**File**: `/backend/agent/graph.py`

```python
from agent.state import ExtendedAgentState

graph = create_deep_agent(
    model=model,
    tools=[...],
    system_prompt=BRAIN_PROMPT,
    subagents=SUBAGENTS,
    backend=CompositeBackend(...),
    # Ensure the state schema includes our new key
    state_schema=ExtendedAgentState,  # May need to check Deep Agents API
)
```

### Step 3: Modify Middleware to Write to State Instead of Stream

**File**: `/backend/agent/middleware.py`

```python
from langchain.agents.middleware.types import AgentMiddleware
from langgraph.types import Command
from datetime import datetime
import uuid

class SubagentToolEventMiddleware(AgentMiddleware):
    def __init__(self, subagent_name: str):
        self.subagent_name = subagent_name
    
    def wrap_tool_call(self, request, handler):
        # Get current state from runtime
        from langgraph.config import get_runtime
        runtime = get_runtime()
        
        # Create log entry
        entry = {
            "id": str(uuid.uuid4()),
            "subagent": self.subagent_name,
            "tool": getattr(request, 'tool_name', 'unknown'),
            "args_brief": self._extract_brief_args(request),
            "timestamp": datetime.now().isoformat(),
            "status": "start"
        }
        
        # Append to log (need to return Command to update state)
        result = handler(request)
        
        # Return with state update
        current_log = runtime.state.get("subagent_tool_log", [])
        return Command(
            update={"subagent_tool_log": current_log + [entry]},
            goto=result  # Continue with original result
        )
```

**Note**: The exact API for updating state from middleware may vary. We need to verify how to properly append to state from within `wrap_tool_call`.

### Step 4: Update Frontend to Read Tool Log

**File**: `/frontend/src/hooks/usePersistentAgent.ts`

```typescript
const parseState = useCallback((values: Record<string, unknown>, ...) => {
    // ... existing parsing ...
    
    // NEW: Parse subagent tool log
    const toolLog = (values.subagent_tool_log || []) as SubagentToolLogEntry[];
    
    // Group by subagent
    for (const entry of toolLog) {
        const agent = subagentsMap.get(entry.subagent);
        if (agent) {
            // Add to agent's toolCalls array
            agent.toolCalls.push({
                id: entry.id,
                name: entry.tool,
                briefArgs: entry.args_brief,
                timestamp: new Date(entry.timestamp)
            });
        }
    }
    
    // ... rest of parsing ...
});
```

### Step 5: Handle State Cleanup

When a new run starts, clear the previous tool log:

**Option A**: Clear on run start (frontend)
```typescript
// In start() function
if (!isContinuation) {
    // State will be fresh anyway
}
```

**Option B**: Clear on run start (backend)
- Ensure initial state has empty `subagent_tool_log: []`

### Step 6: Ensure Historical View Works

**File**: `/frontend/src/hooks/useThreadHistory.ts`

Make sure snapshots include `subagent_tool_log`:

```typescript
// When saving snapshot (in page.tsx)
saveThreadMetadata(repoId, threadId, audience, {
    messages: liveAgent.messages,
    todos: liveAgent.todos,
    subagents: liveAgent.subagents,
    subagent_tool_log: liveAgent.toolLog  // Include this
});

// When loading snapshot
const toolLog = snapshot.subagent_tool_log || [];
```

### Step 7: Testing Checklist

- [ ] Backend loads without errors
- [ ] Tool calls appear in state during live run
- [ ] Frontend displays tool calls in real-time (on poll)
- [ ] Tool calls persist after run completion
- [ ] Historical view shows tool calls correctly
- [ ] Leave and return works (detached run continues)
- [ ] Multiple subagents show their own tool calls separately

### Potential Issues to Address

1. **Middleware State Access**: Need to verify how middleware can update state. May need to use `ToolRuntime` or similar.

2. **State Size**: Tool logs will grow. Consider limiting to last N entries per subagent.

3. **Deduplication**: Ensure we don't duplicate entries when polling rapidly.

4. **Deep Agents Compatibility**: Verify the state key isn't somehow filtered elsewhere.

---

## Appendix: Key DeepWiki Sources

1. **Sub-Agent Delegation**: Explains how `task()` tool works and the isolation model
2. **Middleware Classes**: Documents `AgentMiddleware.wrap_tool_call()` API
3. **Testing Guide**: Shows expected behavior of subagent isolation

---

## Next Steps

Awaiting approval to proceed with Option B implementation.

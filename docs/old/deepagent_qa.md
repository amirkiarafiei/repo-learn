# DeepAgents Library - Q&A Reference

This document captures key questions and answers about the `langchain-ai/deepagents` library, gathered before implementation for reference.

---

## 1. Agent Creation & Configuration

### Q: How do I create a deep agent with `create_deep_agent`? What are all the parameters it accepts?

**A:** The `create_deep_agent` function is the primary factory for building agents. It assembles a default middleware stack and returns a compiled LangGraph `CompiledStateGraph`.

**Complete Function Signature:**
```python
def create_deep_agent(
    model: str | BaseChatModel | None = None,
    tools: Sequence[BaseTool | Callable | dict[str, Any]] | None = None,
    *,
    system_prompt: str | None = None,
    middleware: Sequence[AgentMiddleware] = (),
    subagents: list[SubAgent | CompiledSubAgent] | None = None,
    response_format: ResponseFormat | None = None,
    context_schema: type[Any] | None = None,
    checkpointer: Checkpointer | None = None,
    store: BaseStore | None = None,
    backend: BackendProtocol | BackendFactory | None = None,
    interrupt_on: dict[str, bool | InterruptOnConfig] | None = None,
    debug: bool = False,
    name: str | None = None,
    cache: BaseCache | None = None,
) -> CompiledStateGraph:
```

**Key Parameters Explained:**

| Parameter       | Description                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `model`         | LLM to use. Defaults to `ChatAnthropic(model_name="claude-sonnet-4-5-20250929")`. Can be any `BaseChatModel`. |
| `tools`         | Sequence of custom tools (BaseTool, callables, or dicts). Added on top of default tools.                      |
| `system_prompt` | Custom instructions appended to the `BASE_AGENT_PROMPT`.                                                      |
| `middleware`    | Custom middleware appended after the default middleware stack.                                                |
| `subagents`     | List of `SubAgent` dicts or `CompiledSubAgent` objects for the `task` tool.                                   |
| `backend`       | `BackendProtocol` instance or factory (e.g., `FilesystemBackend`).                                            |
| `interrupt_on`  | Map of tool names to interrupt configs for human-in-the-loop approval.                                        |
| `checkpointer`  | Optional checkpointer for persisting agent state between runs.                                                |
| `store`         | Optional store for persistent storage (used with `StoreBackend`).                                             |
| `debug`         | Enable debug mode.                                                                                            |
| `name`          | Name of the agent.                                                                                            |
| `cache`         | Cache to use for the agent.                                                                                   |

---

## 2. Sub-Agent Spawning

### Q: How does sub-agent spawning work with the `task` tool? How do I define custom subagents?

**A:** Sub-agent spawning is facilitated by the `task` tool, provided by `SubAgentMiddleware`.

**How It Works:**
- The main agent calls `task` with `subagent_type` and `description`
- A specialized subagent is spawned with isolated context
- Subagent executes, then returns a single structured result
- Full conversation history is NOT returned (context isolation)

**Defining Custom Subagents:**

```python
subagents = [
    {
        "name": "researcher",
        "description": "Deep-dives into specific code modules to extract detailed information.",
        "system_prompt": "You are a code analyst. Read files carefully and summarize key patterns.",
        "tools": [custom_search_tool],  # Optional: subagent-specific tools
        "model": "gpt-4o",  # Optional: override model
        "middleware": [],  # Optional: additional middleware
    },
    {
        "name": "writer",
        "description": "Writes tutorial sections based on provided summaries.",
        "system_prompt": "You are a technical writer. Create clear, beginner-friendly documentation.",
        "tools": [],
    },
]

agent = create_deep_agent(
    model=model,
    subagents=subagents,
)
```

**Communication Pattern:**
- Main Agent → (task tool call) → Subagent
- Subagent → (single structured result) → Main Agent
- For large data, use filesystem for communication to prevent token bloat

**Tracking Running Subagents:**
- There's no direct real-time tracking mechanism from the main agent's perspective
- Subagents are ephemeral and autonomous once launched
- However, during streaming with `subgraphs=True`, the `namespace` field identifies which agent produced each event

---

## 3. Streaming

### Q: How does streaming work with deep agents? How can I differentiate main agent vs subagent events?

**A:** DeepAgents supports streaming via the `astream` method with multiple modes.

**Stream Mode Options:**

| Mode         | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| `"messages"` | Streams `(message, metadata)` tuples - content and tool calls |
| `"updates"`  | Streams dictionary updates - interrupts and todo list changes |
| `"values"`   | Streams full state values                                     |

**Streaming with Subagent Differentiation:**

```python
async for chunk in agent.astream(
    stream_input,
    stream_mode=["messages", "updates"],  # Dual-mode
    subgraphs=True,  # CRITICAL: enables subagent event routing
    config=config,
):
    # With subgraphs=True, chunk is (namespace, stream_mode, data)
    if not isinstance(chunk, tuple) or len(chunk) != 3:
        continue
    
    namespace, current_stream_mode, data = chunk
    
    # Differentiate by namespace:
    # - namespace = ()                          → Main Agent
    # - namespace = ('task_tool', 'researcher') → Subagent named 'researcher'
    
    if current_stream_mode == "updates":
        if "todos" in data:
            # Todo list was updated
            current_todos = data["todos"]
    elif current_stream_mode == "messages":
        # Agent message or tool call
        pass
```

---

## 4. Filesystem Backend

### Q: How does FilesystemBackend work? How do I make the agent work with a cloned git repository?

**A:** `FilesystemMiddleware` provides file operations; `FilesystemBackend` handles actual storage.

**Configuration:**

```python
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend

# Point to your cloned repository
agent = create_deep_agent(
    backend=FilesystemBackend(root_dir="/path/to/cloned/repo"),
)
```

**Available Tools (from FilesystemMiddleware):**

| Tool         | Description                                                                |
| ------------ | -------------------------------------------------------------------------- |
| `ls`         | List files/directories                                                     |
| `read_file`  | Read a file's content                                                      |
| `write_file` | Create/overwrite a file                                                    |
| `edit_file`  | Edit an existing file (line-based)                                         |
| `glob`       | Find files matching patterns                                               |
| `grep`       | Search text patterns within files                                          |
| `execute`    | Execute shell commands (only if backend supports `SandboxBackendProtocol`) |

**Key Notes:**
- All paths are relative to `root_dir`
- `virtual_mode` treats paths as virtual absolute paths under root
- Security checks ensure operations stay within root directory
- By default, `StateBackend` (ephemeral) is used; use `FilesystemBackend` for persistence

---

## 5. TodoList Middleware

### Q: How does the TodoListMiddleware work? How can I access the todo list during streaming?

**A:** `TodoListMiddleware` provides task planning and progress tracking.

**Tools Provided:**
- `write_todos` - Create/update task list
- `read_todos` - Read current task list

**State Storage:**
- Todo list is stored in agent state under the `"todos"` key
- Updates are streamed via `stream_mode="updates"`

**Accessing Todos During Streaming:**

```python
current_todos = None

async for chunk in agent.astream(
    input_message,
    stream_mode=["messages", "updates"],
    subgraphs=True,
    config=config,
):
    namespace, stream_mode, data = chunk
    
    if stream_mode == "updates":
        chunk_data = next(iter(data.values())) if data else None
        if chunk_data and isinstance(chunk_data, dict):
            if "todos" in chunk_data:
                new_todos = chunk_data["todos"]
                if new_todos != current_todos:
                    current_todos = new_todos
                    # Update UI with new todo list
```

**Agent Instructions (auto-injected):**
- Keep todo list minimal (3-6 items)
- Break work into clear, actionable items
- Update task statuses promptly
- Mark tasks complete when done

---

## 6. Custom LLM / OpenRouter

### Q: How do I use a custom LLM model with deepagents? Can I use OpenRouter?

**A:** Yes! Pass any LangChain `BaseChatModel` to the `model` parameter.

**Using OpenRouter (OpenAI-compatible API):**

```python
from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent

model = ChatOpenAI(
    model="openai/gpt-4o",  # Or any OpenRouter model slug
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key="sk-or-v1-...",  # Your OpenRouter API key
)

agent = create_deep_agent(model=model)
```

**Model Selection Options:**
- String: Model name (uses env vars for provider detection)
- `BaseChatModel`: Direct LangChain model instance
- `None`: Defaults to Claude Sonnet

---

## 7. Default Middleware Stack

### Q: What are all the default tools and middleware that `create_deep_agent` includes automatically?

**A:** The default middleware stack (in order):

| Order | Middleware                         | Purpose                       | Tools/State                                                                  |
| ----- | ---------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| 1     | `TodoListMiddleware`               | Task planning & decomposition | `write_todos`, `read_todos` → `todos` state                                  |
| 2     | `FilesystemMiddleware`             | File operations & memory      | `ls`, `read_file`, `write_file`, `edit_file`, `glob`, `grep` → `files` state |
| 3     | `SubAgentMiddleware`               | Hierarchical task delegation  | `task` tool                                                                  |
| 4     | `SummarizationMiddleware`          | Context window management     | (internal - summarizes old messages)                                         |
| 5     | `AnthropicPromptCachingMiddleware` | Anthropic API optimization    | (internal)                                                                   |
| 6     | `PatchToolCallsMiddleware`         | Message history consistency   | (internal)                                                                   |

**Customization:**
- Cannot "disable" default middleware with `create_deep_agent`
- Add custom middleware via `middleware` parameter (appended to stack)
- For full control, use `create_agent` directly and specify only needed middleware

**Additional Middleware (Conditional):**
- `HumanInTheLoopMiddleware`: Added automatically if `interrupt_on` is provided

---

## 8. Package Installation

### Q: What is the pip package name for installing deepagents?

**A:**

| Package             | Purpose                       | Install Command                 |
| ------------------- | ----------------------------- | ------------------------------- |
| `deepagents`        | Core library                  | `pip install deepagents`        |
| `deepagents-cli`    | Interactive terminal          | `pip install deepagents-cli`    |
| `deepagents-harbor` | Harbor evaluation integration | `pip install deepagents-harbor` |

**Core Dependencies:**
- `langchain-anthropic`
- `langchain-google-genai`
- `langchain`
- `langchain-core`
- `wcmatch`

**CLI Additional Dependencies:**
- `requests`, `rich`, `prompt-toolkit`, `langchain-openai`, `tavily-python`, `python-dotenv`, `daytona`, `modal`, `markdownify`, `runloop-api-client`, `pillow`

---

## 9. LangGraph Server / CLI

### Q: How do I run the LangGraph dev server?

**A:**

```bash
# JavaScript/TypeScript
npx @langchain/langgraph-cli dev --config langgraph.json

# Python
langgraph dev --config langgraph.json
```

**Key Options:**

| Option         | Default   | Description                  |
| -------------- | --------- | ---------------------------- |
| `--host`       | 127.0.0.1 | Host to bind to              |
| `--port`       | 2024      | Port to bind to              |
| `--no-reload`  | -         | Disable auto-reload          |
| `--no-browser` | -         | Skip opening browser         |
| `--tunnel`     | -         | Expose via Cloudflare tunnel |

**What It Provides:**
- REST API for runs, threads, assistants
- Managed database for checkpointing (in-memory/file-based for dev)
- Hot reloading during development
- No Docker required for `dev` mode

---

## 10. Frontend Integration (React)

### Q: How do I integrate LangGraph into a React frontend?

**A:** Use the `useStream` hook from `@langchain/langgraph-sdk/react`:

```typescript
"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";

export function AgentChat({ threadId }: { threadId: string }) {
  const { messages, isLoading, error, submit } = useStream({
    apiUrl: "http://localhost:2024",
    threadId: threadId,
    // Additional options...
  });

  // Render messages, handle submit, etc.
}
```

**Key Features:**
- Automatic streaming message handling
- State management for messages, interrupts, loading, errors
- Conversation branching support
- Reconnection on page refresh (via threadId)
- UI-agnostic (bring your own components)

---

## Quick Reference: Complete Agent Setup

```python
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from langchain_openai import ChatOpenAI

# 1. Configure OpenRouter model
model = ChatOpenAI(
    model="openai/gpt-4o",
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key="sk-or-v1-..."
)

# 2. Configure filesystem backend (cloned repo)
backend = FilesystemBackend(root_dir="/data/repositories/my-repo")

# 3. Define custom subagents
subagents = [
    {
        "name": "analyzer",
        "description": "Analyzes specific directories or files in depth.",
        "system_prompt": "You are a code analyst...",
        "tools": [],
    },
]

# 4. Create the agent
agent = create_deep_agent(
    model=model,
    backend=backend,
    system_prompt="You are the Lead Architect...",
    subagents=subagents,
)

# 5. Stream execution
async for chunk in agent.astream(
    {"messages": [("human", "Analyze this repository")]},
    stream_mode=["messages", "updates"],
    subgraphs=True,
    config={"configurable": {"thread_id": "my-thread"}},
):
    namespace, mode, data = chunk
    # Process events...
```

---

## 11. Implementation Notes (RepoLearn Learnings)

This section captures key learnings from building RepoLearn with the DeepAgents library.

### 11.1 Frontend Stream Processing

The `useStream` hook from `@langchain/langgraph-sdk/react` handles most complexity, but extracting specific data requires custom logic:

```typescript
// Custom hook wrapper for RepoLearn
export function useAgentStream(threadId: string) {
  const stream = useStream<AgentState>({
    apiUrl: LANGGRAPH_URL,
    threadId,
    streamMode: ["messages", "updates"],
    assistantId: "agent",
  });

  // Extract todos from stream values (state updates)
  const todos = useMemo(() => {
    const values = stream.values;
    if (values && "todos" in values) {
      return values.todos as Todo[];
    }
    return [];
  }, [stream.values]);

  // Detect subagent spawning from task tool calls
  const [subagents, setSubagents] = useState<Map<string, SubagentStatus>>(new Map());
  
  // Watch for task tool calls in messages
  useEffect(() => {
    for (const msg of stream.messages) {
      if (msg.role === "assistant" && msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          if (tc.name === "task") {
            const subagentType = tc.args.subagent_type;
            // Add to subagents map...
          }
        }
      }
    }
  }, [stream.messages]);

  return { ...stream, todos, subagents };
}
```

### 11.2 Subagent Tracking Without `subgraphs=True`

When `subgraphs=true` is not available or causes issues, you can track subagents by:
1. Detecting `task` tool calls in the message stream
2. Marking them as "started" when the tool is called
3. Marking them as "done" when `stream.isLoading` becomes false

```typescript
// Detect new subagent
if (toolCall.name === "task") {
  const name = toolCall.args.subagent_type;
  setActiveSubagents((prev) => {
    const next = new Map(prev);
    next.set(name, {
      name,
      status: "working",
      currentTask: toolCall.args.description,
      startedAt: new Date(),
      activityLogs: [`Started: ${name}`],
    });
    return next;
  });
}
```

### 11.3 AgentState Type Compatibility

The LangGraph SDK expects states to satisfy `Record<string, unknown>`. Add an index signature:

```typescript
interface AgentState {
  messages: Message[];
  todos?: Todo[];
  [key: string]: unknown; // Required for SDK compatibility
}
```

### 11.4 OpenRouter Model Configuration

For OpenRouter, use `ChatOpenAI` with custom base URL:

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    model="google/gemini-2.0-flash-001",  # Or any OpenRouter model
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
)
```

**Important**: Some models on OpenRouter may have different tool-calling capabilities. Test with your chosen model.

### 11.5 FilesystemBackend Path Configuration

When using `FilesystemBackend`, all paths in tools are relative to `root_dir`:

```python
# In graph.py
backend = FilesystemBackend(root_dir=str(DATA_DIR))

# Agent sees paths like:
# - repositories/langchain-ai_deepagents/
# - tutorials/langchain-ai_deepagents/user/0_overview.md
```

### 11.6 Custom Tools with Path Helpers

Define helper tools that return full paths for the agent to use:

```python
@tool
def get_repo_path(repo_name: str) -> str:
    """Get the local filesystem path for a cloned repository."""
    return f"repositories/{repo_name}"

@tool
def get_tutorial_path(repo_name: str, audience: str = "user") -> str:
    """Get the path where tutorials should be written."""
    return f"tutorials/{repo_name}/{audience}"
```

### 11.7 Prompt Engineering for Subagent Delegation

To ensure the main agent delegates work, be explicit in the system prompt:

```python
BRAIN_PROMPT = """
You are the Lead Architect for RepoLearn.

## MANDATORY WORKFLOW:
1. Clone the repository using git_clone
2. Create a plan using write_todos
3. **DELEGATE** analysis to code-analyzer subagent
4. **DELEGATE** documentation to doc-writer subagent
5. Review and synthesize final tutorials

## CRITICAL RULES:
- You MUST use the `task` tool to delegate work
- You NEVER read source code files directly
- You only read summaries from subagents
"""
```

### 11.8 Error Handling in Frontend

Handle stream errors gracefully:

```typescript
if (stream.error) {
  const errorMessage = (stream.error as Error).message || "Unknown error";
  return <ErrorDisplay message={errorMessage} />;
}
```

### 11.9 Thread ID Management

Generate thread IDs on the frontend and pass them to the job page:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const jobId = crypto.randomUUID(); // Thread ID
  router.push(`/job/${jobId}?url=${encodeURIComponent(url)}`);
};
```

This allows reconnection if the user refreshes the page.

---

## 12. Troubleshooting Common Issues

### Issue: Subagents not being spawned
**Cause**: Main agent reading files directly instead of delegating.
**Fix**: Strengthen system prompt to MANDATE delegation.

### Issue: Todos not updating in UI
**Cause**: Not using `stream.values` or wrong stream mode.
**Fix**: Ensure `streamMode: ["messages", "updates"]` and check `stream.values.todos`.

### Issue: TypeScript errors with AgentState
**Cause**: State type doesn't satisfy `Record<string, unknown>`.
**Fix**: Add index signature `[key: string]: unknown` to interface.

### Issue: CORS errors connecting to LangGraph server
**Cause**: Frontend and backend on different ports.
**Fix**: LangGraph dev server allows localhost by default. Ensure `NEXT_PUBLIC_LANGGRAPH_URL` is correct.

### Issue: Files not appearing in agent's filesystem
**Cause**: Path mismatch between backend and agent.
**Fix**: Use absolute paths or ensure `root_dir` is correctly set in `FilesystemBackend`.


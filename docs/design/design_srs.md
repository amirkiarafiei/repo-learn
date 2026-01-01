# Software Requirements Specification (SRS) for RepoLearn

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the software requirements for **RepoLearn**, an AI-powered tool designed to generate interactive tutorials and documentation from codebases.
This tool serves two primary goals:
1.  **Research**: To demonstrate the effectiveness of "Deep Agents" (agents with planning, sub-agents, and file systems) in understanding large codebases.
2.  **Engineering**: To provide a high-fidelity, user-friendly interface that visualizes the agent's reasoning process in real-time.

### 1.2 Scope
RepoLearn is a web-based application where users can input a GitHub repository URL. The system then employs a hierarchical AI agent to analyze the code and generate a structured set of Markdown tutorials. The system features a "Live Progress" dashboard that visualizes the agent's planning and execution state.

## 2. System Architecture

The system follows a flat, service-oriented architecture:

```text
repo-learn/
├── frontend/               # Next.js 15 + Tailwind v4 Application
├── backend/                # LangGraph Agent Engine + FastAPI Sidecar
│   ├── agent/              # DeepAgent logic (graph.py, tools.py, prompts.py)
│   └── api/                # FastAPI Sidecar (for file operations)
└── data/                   # Local filesystem storage
    ├── repositories/       # Cloned repos from GitHub
    └── tutorials/          # Generated tutorials per repo
        └── {repo_name}/    # e.g., "langchain-ai_deepagents"
            ├── user/       # Tutorials for end-users
            └── dev/        # Tutorials for developers/maintainers
```

### 2.1 Components
*   **The Frontend (Client)**: A Next.js application responsible for the UI, state management, and connecting to the backend streams.
*   **The Engine (Agent Runner)**: A `LangGraph Server` instance that executes the Deep Agent logic and streams events (tokens, tool calls, state updates).
*   **The Sidecar (Utility API)**: A `FastAPI` service that handles non-agentic tasks like file system exploration (for the editor), project listing, and saving user edits.
*   **The Data Layer**: A shared volume (local directory) where the agent writes markdown files and the frontend reads them.

## 2.2 Data Flow & Streaming
To ensure robust, real-time updates and sub-agent differentiation, we utilize LangGraph's native streaming capabilities:
*   **Event Routing**: Events are streamed as tuples `(namespace, data)`.
    *   **Main Agent**: `namespace=()` (empty).
    *   **Sub-Agent**: `namespace=('task_tool', 'subagent_name')`.
*   **Persistence**: For MVP, LangGraph uses in-memory/file-based checkpointing.
    *   **Detached Execution**: Starting in v0.3.1, the system uses `client.runs.create()` to initiate server-side runs that persist independently of the client connection.
    *   **Reconnection (Polling)**: The frontend uses a custom `usePersistentAgent` hook that polls `client.threads.getState()` using a `thread_id`. If a user refreshes or navigates back, the UI hydrates the full state from the server.
    *   **Production**: For production deployments, LangGraph can use Postgres for persistent state storage.

## 2.3 Error Handling & Resilience
*   **Retry Logic**: Critical nodes (e.g., `GitClone`, API calls) must implement `retry_policy` (exponential backoff) to handle transient failures.
*   **Exception Propagation**: Failures in Sub-agents must be caught by the Main Agent to allow for recovery or task skipping, rather than crashing the entire pipeline.
*   **Testing**: We will use "In-Memory" mode for unit/integration tests to validate graph logic without heavy docker dependencies.

## 3.4 File Management Strategy
*   **Decoupled Naming**: The agent does not need to decide the final filename immediately.
    *   *Draft Phase*: Files are created with temporary IDs or logical names.
    *   *Synthesis Phase*: The Main Agent renames and organizes files into the final `{order}_{title}.md` structure based on the complete context.
*   **Storage**: Files are written to the shared `data/` volume, accessible by both the Agent (for writing) and the Sidecar (for reading/serving to UI).

## 3. Functional Requirements

### 3.1 User Workflow
1.  **Home Page**:
    *   User sees a list of existing tutorials (cards).
    *   User clicks "Add New Repository".
    *   User inputs a GitHub URL and selects "Target Audience" (User vs. Developer) and "Depth" (Basic vs. Detailed).
2.  **Generation Phase (Live Progress)**:
    *   User is redirected to a generic "Job" page.
    *   The page displays a 3-Panel Layout (see Section 4).
    *   User watches the agent plan, spawn sub-agents, and complete tasks in real-time.
3.  **Consumption Phase (Tutorial Viewer)**:
    *   Upon completion, user sees the generated documentation.
    *   Sidebar lists modules/files.
    *   Main area shows rendered Markdown with Mermaid diagrams.
    *   User can toggle "Edit Mode" to fix errors manually.

### 3.2 The Deep Agent (Backend)
*   **Core Logic**: Implemented using `langchain-ai/deepagents`.
*   **Planning**: The agent must maintain a structured `todo` list in its state.
*   **Sub-agents**: The agent must spawn sub-agents via a `task` tool.
*   **Events**: The agent must stream:
    *   `updates`: Changes to the `todo` list.
    *   `messages`: Main agent log / thought process.
    *   `custom_events`: Sub-agent specific actions (start, working_on_file, finish).

### 3.3 The Sidecar API (Backend)
*   `GET /projects`: List all analyzed repositories.
*   `GET /files/{path}`: Read raw content of a generated file.
*   `POST /files/{path}`: Save changes to a file (User edit).

## 4. UI Design Specifications

### 4.1 The 3-Panel Layout (Live Progress)
This is the core differentiator for the "Demo" track.

| Panel                 | Content                                                                                            | Source Stream                                      |
| :-------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| **Left: Planner**     | A dynamic tree/list of tasks. Items change color based on status (Pending -> In Progress -> Done). | `stream_mode="updates"` (State: `todos`)           |
| **Center: The Brain** | A terminal-like feed showing the Main Agent's high-level thoughts and tool calls.                  | `stream_mode="messages"`                           |
| **Right: The Grid**   | A grid of active Sub-agents. Each card shows: Name, Status, Current File.                          | `custom_events` (via WebSocket/SubAgentMiddleware) |

### 4.2 Tutorial Viewer
*   Clean, "Docs-like" interface (inspired by GitBook or Vercel formatting).
*   Syntax highlighting for code blocks.
*   Rendering for Mermaid.js diagrams.

## 5. Non-Functional Requirements
*   **Latency**: UI updates must feel "live" (Server-Sent Events or WebSockets).
*   **Persistence**: If the browser is refreshed, the "Job" state must be recoverable (connect to existing thread).
*   **Aesthetics**: Modern, dark-mode first design using Tailwind CSS. "Premium" feel.

## 6. Development Phases (Engineering Focused)

### Phase 1: Skeleton
*   Set up repo structure.
*   Initialize Next.js app.
*   Initialize LangGraph Server configuration.
*   Establish "Hello World" streaming connection (Frontend -> Agent).

### Phase 2: The Deep Agent
*   Implement `DeepAgent` in Python.
*   Implement `TodoListMiddleware` and verify it streams updates.
*   Implement `SubAgentMiddleware` mock (just standard tool calls first).

### Phase 3: The 3-Panel UI
*   Build the React components for Plan, Log, and Grid.
*   Connect React state to the LangGraph stream.

### Phase 4: File Generation & Viewing
*   Implement `FilesystemMiddleware` for the agent.
*   Implement the Sidecar API for reading files.
*   Build the Markdown Viewer/Editor in Next.js.

## 7. Future Scope & Optional Enhancements

### 7.1 Advanced UI Visualizations
*   **Semantic Status Updates**: For the Sub-agent Grid, replace raw tool call expressions with human-readable signatures (e.g., "Scanning `src/auth`..." instead of `read_file('src/auth/...')`).
*   **Conversational Center Panel**: Evolve the center log into a "Chat Interface" that visualizes the internal dialogue between the Main Agent and its Sub-agents as a conversation thread, making the delegation process feel like a team discussion.

### 7.2 Architecture Extensions
*   **The "Manager" Layer**: A Supervisor Agent (standard ReAct) that sits above the Deep Agent.
    *   *Role*: Quality Assurance. It monitors the Deep Agent's output against the original requirements.
    *   *Action*: If the Deep Agent stops too early or produces shallow content, the Manager intervenes and issues corrective prompts.
    *   *UI Impact*: The visualization would expand to show a "Conversation Pool" between Manager, Deep Agent, and Sub-agents.

### 7.3 Operational Features
*   **Cost Estimation & Transparency**:
    *   **Pre-Flight Check**: Before starting, calculate an estimated cost based on repository token count (using `tiktoken`) and selected model pricing.
    *   **Live Metrics**: Display real-time token usage and accrued cost in the "Live Progress" dashboard.
    *   **Configuration**: Allow users to configure model selection (UI/env) and manually input their API cost-per-million tokens for accurate estimation.
*   **Resumability & Fault Tolerance**:
    *   **Checkpointing**: If the process is halted (user cancellation or error), the system should detect existing progress (generated markdown files, completed TODOs) upon restart.
    *   **Recovery**: The agent should skip already-completed phases or files rather than restarting from scratch.

---

## 8. Implementation Notes (MVP Status)

This section documents how the SRS requirements were realized in the MVP.

### 8.1 Requirements Traceability Matrix

| Requirement                | Status     | Implementation                                    |
| -------------------------- | ---------- | ------------------------------------------------- |
| **3.1 User Workflow**      | ✅ Complete | Home → New → Job → Tutorial pages                 |
| **3.2 Deep Agent**         | ✅ Complete | `graph.py` with BRAIN_PROMPT                      |
| **3.2 TodoListMiddleware** | ✅ Complete | Built into DeepAgents                             |
| **3.2 SubAgentMiddleware** | ✅ Complete | `subagents.py` definitions                        |
| **3.2 Event Streaming**    | ✅ Complete | `useAgentStream.ts` hook                          |
| **3.3 Sidecar API**        | ✅ Complete | API routes in Next.js (tutorials, storage, repos) |
| **4.1 3-Panel Layout**     | ✅ Complete | PlannerPanel, BrainPanel, GridPanel               |
| **4.2 Tutorial Viewer**    | ✅ Complete | Interactive Learning IDE with tabs                |
| **5 Non-Functional**       | ✅ Complete | SSE streaming, thread persistence, dark theme     |
| **7.1 Advanced UI**        | ⚠️ Partial  | IDE implemented, semantic updates deferred        |
| **7.2 Manager Layer**      | ⏳ Deferred | Supervisor agent                                  |
| **7.3 Cost Estimation**    | ⏳ Deferred | Token counting, live metrics                      |
| **7.3 Resumability**       | ✅ Complete | Detached server runs (v0.3.1)                     |

### 8.2 Architecture Deviation: Sidecar vs API Routes

The original SRS specified a separate FastAPI sidecar. In the MVP, we use **Next.js API Routes** instead:

**Rationale:**
- Simpler deployment (single frontend process)
- No CORS configuration needed
- Faster development iteration

**Implemented Routes:**
```
/api/tutorials              GET    List all tutorials
/api/tutorials/[id]         GET    Get tutorial content
/api/tutorials/[id]/export  GET    Export as zip (markdown/pdf)
/api/tutorials/[id]/metadata GET/POST  Thread metadata
/api/storage                GET    Storage stats
/api/storage                DELETE Delete tutorial/cache
/api/repositories/[id]/files GET    List repo files
/api/repositories/[id]/file  GET    Get file content
```

### 8.3 Streaming Implementation Details

The `useAgentStream` hook wraps `@langchain/langgraph-sdk/react`:

```typescript
interface UseAgentStreamReturn {
  // From LangGraph SDK
  messages: AgentMessage[];
  isLoading: boolean;
  error: Error | null;
  submit: (input: string) => void;
  stop: () => void;
  
  // Custom additions
  todos: Todo[];
  subagents: SubagentStatus[];
  threadId: string;
}
```

### 8.4 State Interfaces

```typescript
// Todo item from TodoListMiddleware
interface Todo {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

// Subagent tracking (derived from task tool calls)
interface SubagentStatus {
  name: string;
  status: "working" | "done" | "error";
  currentTask: string;
  startedAt: Date;
  completedAt?: Date;
  activityLogs: string[];
}
```

### 8.5 Premium UI Implementation

The CSS system provides:

| Class               | Effect                              |
| ------------------- | ----------------------------------- |
| `.glass`            | Glassmorphism (blur + transparency) |
| `.skeleton`         | Shimmer loading animation           |
| `.hover-lift`       | Lift on hover with shadow           |
| `.gradient-text`    | Blue-purple gradient text           |
| `.stagger-children` | Cascading fade-in animation         |
| `.animate-fade-in`  | Simple fade-in                      |
| `.typing-cursor`    | Blinking cursor effect              |

### 8.6 Data Storage Structure

```
data/
├── repositories/                # Git clones (cache)
│   ├── unjs_destr/
│   ├── sindresorhus_is/
│   └── ...
└── tutorials/                   # Generated content
    ├── unjs_destr/
    │   └── user/
    │       └── 0_overview.md
    ├── sindresorhus_is/
    │   └── user/
    │       └── 0_overview.md
    └── ...
```

### 8.7 Environment Configuration

**Backend (`backend/.env`):**
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_LANGGRAPH_URL=http://localhost:2024
```

### 8.8 Known Limitations

1. **No User Authentication**: All tutorials are public/local
2. **No Rate Limiting**: API routes are unprotected
3. **In-Memory Checkpoints**: LangGraph dev mode only
4. **Single Model**: No model selection UI
5. **No Edit Mode**: Tutorial viewer is read-only

### 8.9 v0.2.0 New Features

| Feature                      | Description                       | Component                      |
| ---------------------------- | --------------------------------- | ------------------------------ |
| Interactive Learning IDE     | Tab-based file viewer with search | `TabBar.tsx`, `CodeViewer.tsx` |
| Smart Contextual References  | Clickable code links in docs      | Custom Markdown renderer       |
| Agent Visualization Playback | Readonly thread history view      | `useThreadHistory.ts`          |
| Tutorial Export              | Download as Markdown/PDF zip      | `/api/tutorials/[id]/export`   |
| Inline Sidebar Toggle        | Compact sidebar header            | `page.tsx` (tutorial)          |

### 8.10 v0.2.1 Robustness Improvements (Hotfix)

| Improvement              | Problem Addressed              | Implementation                  |
| ------------------------ | ------------------------------ | ------------------------------- |
| **Smart Redirect Guard** | Redirect loops/404s on failure | Async check in `JobPage.tsx`    |
| **Case-Insensitive API** | Linux filesystem mismatches    | Logic in `route.ts`, `tools.py` |
| **State Persistence**    | Losing `audience` context      | Query param propagation         |

### 8.11 v0.3.0 Pre-Release Stabilization

| Improvement                | Problem Addressed            | Implementation                    |
| -------------------------- | ---------------------------- | --------------------------------- |
| **Smart Depth Selection**  | One-size-fits-all generation | Basic/Detailed toggle in UI + LLM |
| **Granular Storage**       | Wasting disk space           | "Delete Code" vs "Delete All"     |
| **Universal Lowercase**    | Case-sensitivity 404 errors  | Unified lowercasing for all IDs   |
| **Speed Mode Prompts**     | Slow development testing     | Brief response mode for agents    |
| **README & Env Templates** | Difficult onboarding         | Root README & .env.example files  |

### 8.12 v0.3.1 Detached Persistence & Robust Cleanup

| Improvement              | Problem Addressed            | Implementation                     |
| ------------------------ | ---------------------------- | ---------------------------------- |
| **Detached Persistence** | UI connection loss kills job | `usePersistentAgent` (runs create) |
| **Atomic Deep Cleanup**  | Zombie data on restart       | DELETE removes tutorial AND repo   |
| **Metadata Resilience**  | Missing Visualization link   | Saved immediately on job finish    |
| **One Job = One Thread** | State pollution/leakage      | UUID isolation for every attempt   |


---

## 9. Acceptance Criteria Validation

### 9.1 Functional Acceptance

| Criteria                          | Validation                           |
| --------------------------------- | ------------------------------------ |
| User can input GitHub URL         | ✅ `/new` page with form              |
| User can select audience          | ✅ User/Developer toggle              |
| User can see live progress        | ✅ 3-panel layout with streaming      |
| User can view generated tutorials | ✅ Tutorial viewer with sidebar       |
| Tutorials are persisted           | ✅ Markdown files in `data/tutorials` |

### 9.2 Non-Functional Acceptance

| Criteria                | Validation                 |
| ----------------------- | -------------------------- |
| Real-time updates       | ✅ SSE via LangGraph SDK    |
| Reconnection on refresh | ✅ Thread ID in URL         |
| Premium dark theme      | ✅ Tailwind + glassmorphism |
| Responsive layout       | ✅ Grid-based panels        |

---

*Document updated: January 1, 2026 (v0.3.1)*


# Software Requirements & Technical Reference: RepoLearn

## 1. Introduction & Core Thesis

RepoLearn is an AI-native documentation platform that leverages hierarchical multi-agent systems to analyze source code and generate high-fidelity tutorials.

### 1.1 The Deep Agent Pattern
The project serves as a research demonstration of the **Deep Agent (Agents 2.0)** methodology. Unlike standard RAG or static multi-agent systems, RepoLearn utilizes:
- **Dynamic Instantiation**: The system creates specialized sub-agents with bespoke tasks and prompts on the fly, rather than relying on a fixed pool of workers.
- **Hierarchical Planning**: A centralized "Brain" agent maintains a dynamic TODO list and steers the entire analysis.
- **Recursive Delegation**: Specialist sub-agents report findings back to the Brain, which can then refine the plan or spawn further agents for deeper investigation.
- **Sandboxed Execution**: Agents operate within a virtualized filesystem to ensure host safety.

### 1.2 System Purpose
RepoLearn provides an automated "Explainable AI" experience for codebase onboarding. It emphasizes **transparency**—users don't just see the final tutorial; they see the agent's step-by-step reasoning, tool usage, and collaborative effort between specialists.

---

## 2. System Architecture

The project is architected as a decoupled mono-repo designed for local development and high observability.

### 2.1 Component Overview
1.  **Backend (LangGraph Engine)**: The core intelligence. It runs a LangGraph server that orchestrates the Python-based Deep Agent graph.
2.  **Frontend (Next.js 15)**: The user interface and "Sidecar" API. It handles the 3-panel visualization, tutorial rendering, and serves as a proxy for the filesystem.
3.  **Data Layer (Shared Volume)**: A centralized `data/` directory used for caching repository clones and storing generated Markdown content.

### 2.2 Directory Reference
```text
repo-learn/
├── frontend/               # Next.js Application
│   ├── src/app/            # App Router (Home, New, Job, Tutorial)
│   ├── src/api/            # Next.js API Routes (Serverless functions)
│   ├── src/hooks/          # Core logic (Persistence, Streaming, History)
│   └── src/context/        # Global state (JobContext)
├── backend/                # Agent Graph
│   ├── agent/              # Node definitions, tools, and worker logic
│   └── langgraph.json      # Server configuration
└── data/                   # Persistent storage volume
    ├── repositories/       # Cloned source code (Cache)
    └── tutorials/          # Generated docs & metadata
```

---

## 3. Backend Implementation (The Deep Agent)

The agent logic is implemented in `backend/agent/graph.py` using the `deepagents` framework.

### 3.1 The Agent Graph
The graph is a recursive state machine implementing the Deep Agent pattern:
- **Brain Node**: The Architect orchestrator. It parses the GitHub URL, creates a plan, and manages the lifecycle of worker agents.
- **Deep Delegation Tool**: A specialized tool that performs **Dynamic Instantiation** of sub-agents. It takes a description of the task and a target agent type, generating a tailored prompt for the worker.
- **Worker Sub-agents**:
    - `code-analyzer`: Ephemeral specialist for technical parsing.
    - `doc-writer`: Ephemeral specialist for content synthesis.

### 3.2 Path Safety & Sandboxing
RepoLearn uses `CompositeBackend` to enforce strict security boundaries for the agent:
- **Default (Read-Only)**: Points to `data/repositories/`. Agents can read code but cannot modify it.
- **Tutorials Route (Read-Write)**: Points to `data/tutorials/`. Agents can only write files within this specific context.
- **Virtual Mode**: All paths are virtualized to prevent `../` path traversal attacks.

### 3.3 Safety Backends
- **`ReadOnlyRepoBackend`**: Overrides `write()` and `edit()` to physically block any modifications to the repository cache.
- **`RestrictedTutorialsBackend`**: Validates all write paths. Denies access unless the path follows the strict `/tutorials/{repo}/{audience}/` structure, preventing file pollution.

---

## 4. Streaming & Persistence Logic

### 4.1 Detached Run Execution
To ensure jobs survive browser refreshes or accidental closings:
1.  Frontend uses `client.runs.create()` to start a "Detached Run" on the server.
2.  The job is assigned a unique `thread_id` and `run_id`.
3.  The server continues executing the agent graph even if the client disconnects.

### 4.2 Snapshot Persistence
On job completion, the system performs an **Automated History Archive**:
- The final state (messages, plan, and subagent cards) is serialized.
- This "Snapshot" is saved into the tutorial's `metadata.json`.
- **Benefit**: Reasoning history is preserved even after the LangGraph thread is purged or the server is restarted.

### 4.3 Hybrid State Hydration
The `usePersistentAgent` and `useThreadHistory` hooks implement a fail-safe loading strategy:
- **Primary**: Attempt to fetch live state from the LangGraph server.
- **Secondary (Fallback)**: If the server returns a 404, the UI automatically detects the local snapshot in `metadata.json` and hydrates the visualization from disk.
    
### 4.4 Subagent Tool Call Visibility (Option B)
Subagent messages are intentionally excluded from the main LangGraph state by the Deep Agents library to prevent context window bloat for the Brain agent. To visualize these tool calls in real-time while maintaining this isolation:
- **Sidecar Store**: An in-memory, thread-safe `ToolCallStore` accumulates subagent activity on the backend.
- **Middleware Interception**: Custom `SubagentToolEventMiddleware` intercepts tool calls and writes to the store instead of modifying the graph state.
- **Dedicated API**: A custom FastAPI app mounted at `/tool-calls/{thread_id}` allows the frontend to poll for this activity.
- **Persistence**: Upon job completion, these logs are serialized into `metadata.json` to support historical viewing.

---

## 5. API Design & Sidecar Reference

The frontend API routes (`frontend/src/app/api/...`) act as the system's "operating system", managing files and background tasks.

### 5.1 Storage Management (`/api/storage`)
- **GET**: Aggregates disk usage stats and lists all generated tutorials.
- **DELETE**: Implements **Smart Reference Cleanup**.
    - It checks if other audience versions (User vs. Dev) exist for a repository.
    - It preserves the `repositories/` cache as long as at least one version remains.
    - It nukes the shared cache ONLY when the last associated tutorial is deleted.

### 5.2 Metadata API (`/api/tutorials/[id]/metadata`)
- **POST**: Synchronizes job state (thread IDs, completion status, snapshots) between the UI and the filesystem.
- This is the source of truth for the dashboard's "View Analysis" links.

---

## 6. Frontend Components & UX

### 6.1 The 3-Panel Job Dashboard
Located at `/job/[id]`, this dashboard is the heart of the visualization engine.
- **Panel Container (Left)**: Houses the Planner and FileSystem panels in a vertical stack.
    - **Resizable Height**: The FileSystem panel is manually resizable via a draggable handle, with constraints (min 100px, max 70% height).
    - **Dual-Accordion System**: Both panels are collapsible to maximize vertical space. 
        - **Planner**: Collapses upwards to the top of the container.
        - **FileSystem**: Collapses downwards to the bottom.
        - **Space Management**: Collapsing one panel automatically allows the other to expand and fill the remaining vertical space.
- **Planner (Left Top)**: Renders the `todos` array from the graph state. Uses smooth progress bars, status icons, and an accordion header that shows a progress summary (e.g., "3/5") even when closed.
- **FileSystem (Left Bottom)**: Displays a unified directory tree combining the source repository and the generated `tutorials/` output.
- **Brain (Center)**: A terminal-styled feed. It filters raw LangGraph messages to show only the Main Agent's high-level reasoning.
- **Grid (Right)**: Visualizes the `task()` tool calls. Each card represents a sub-agent's "workspace" and completion status.

### 6.2 Interactive IDE & Contextual Linking
The tutorial viewer (`/tutorial/[id]`) features an "Interactive Learning" mode:
- **TabBar**: Manages multiple open code files.
- **Contextual Interceptor**: A custom Markdown renderer that listens for links to local files (e.g., `[Auth Logic](src/auth/index.ts)`).
- **Execution**: Clicking a link in the doc triggers a `window.dispatchEvent` that the IDE captures to fuzzy-search and open the referenced file.

### 6.3 Agent Recovery ("Continue")
To handle early stops or network interruptions:
- **Detection**: The UI identifies runs that ended without calling the specific `complete_tutorial` callback.
- **Action**: Users can click "Continue with tasks".
- **Limit**: Continuation is capped at 2 attempts to prevent infinite loops.
- **Logic**: A new run is started on the existing thread with a prompt to review remaining todos.

---

## 7. Development & Environment

### 7.1 Key Environment Variables
- `OPENROUTER_API_KEY`: Required for LLM access.
- `NEXT_PUBLIC_LANGGRAPH_URL`: Defaults to `http://localhost:2024`.
- `OPENROUTER_MODEL`: Defaults to `google/gemini-2.0-flash-001`.

### 7.2 Safety Check: Case Sensitivity
The system enforces **Universal Lowercase Mapping**. All repository IDs and folders are transformed to lowercase (`owner_repo`). This prevents 404 errors on case-sensitive filesystems like Linux when GitHub URLs vary in casing.

---

## 8. Summary of Deletion & Cleanup Triggers

| Action               | Logic                       | Side-Effect                                                       |
| :------------------- | :-------------------------- | :---------------------------------------------------------------- |
| **Dashboard Delete** | Smart Cleanup (Ref-counted) | Deletes version; deletes repo ONLY if it's the last one.          |
| **Stop Generation**  | Smart Cleanup (Ref-counted) | Removes partial data for that audience; preserves other versions. |
| **Retry Analysis**   | Smart Cleanup (Ref-counted) | Wipes the current audience folder to ensure a 100% fresh start.   |

---

*This document is the authoritative technical reference for RepoLearn. It is maintained to reflect the current implementation state without specific version or date dependencies.*

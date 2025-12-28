# DeepAgent & LangGraph Server Integration Report

## 1. Executive Summary

This report analyzes the feasibility of using **LangGraph Server** (also known as "Agent Server") as the backend runtime for the *RepoLearn* project. The key finding is that while LangGraph Server provides robust infrastructure (persistence, queues, API), it introduces vendor lock-in risks (LangSmith) and complexity for self-hosting. However, for a *RepoLearn* demo, the local development version (`langgraph dev`) offers a "sweet spot" of functionality without cost, while a custom FastAPI backend provides maximum control.

## 2. LangGraph Server Architecture

LangGraph Server is an opinionated runtime for LangGraph agents. It is not just a web server; it is a full orchestration layer.

### 2.1 Core Components
*   **The API**: Exposes standard endpoints (`POST /threads`, `POST /runs/stream`, `GET /threads/{id}/state`) automatically. You do *not* write these routes manually.
*   **The Runner**: A background worker that executes the graph steps.
*   **The Persistence Layer**:
    *   **Local (`langgraph dev`)**: Uses in-memory storage (state is lost on restart).
    *   **Docker (`langgraph up`)**: Uses a local PostgreSQL container for state and Redis for task queues.
    *   **Cloud**: Uses LangChain's managed infrastructure.

### 2.2 Integration with DeepAgents
The `deepagents` library returns a standard LangGraph `CompiledGraph` object. This means **DeepAgents is 100% compatible with LangGraph Server**. You essentially point the LangGraph CLI to your `agent.py` file, and it automatically wraps your DeepAgent in the server runtime.

## 3. Deployment Options & Trade-offs

### Option A: LangGraph Server (Local/Docker)
*   **How it works**: You run `langgraph up`. This spins up a standard API server on `localhost:8123`.
*   **Pros**:
    *   **Zero Boilerplate**: You don't write FastAPI code. Streaming, threading, and persistence are built-in.
    *   **LangGraph Studio**: You get a free GUI (the "Studio") to debug your agent visually during development.
*   **Cons**:
    *   **Black Box API**: You cannot easily add custom endpoints (e.g., specific file system operations for the UI editor) without writing a separate "proxy" server or technically "hacking" the graph to include them.
    *   **LangSmith Nudging**: The tool heavily pushes you to use LangSmith for auth and tracing. You *can* disable it (`LANGSMITH_TRACING=false`), but the local UI is less useful without it.

### Option B: Custom FastAPI Backend (The "Manual" Way)
*   **How it works**: You create a standard FastAPI app and import your `agent` object. You manually write a websocket endpoint that calls `agent.astream_events()`.
*   **Pros**:
    *   **Total Control**: You define exactly what JSON structure is sent to the frontend.
    *   **Custom Routes**: Easy to add `/api/files/save` or `/api/projects/list`.
    *   **No Lock-in**: You rely only on the open-source python libraries, not the proprietary server binary.
*   **Cons**:
    *   **More Code**: You must implement your own connection handling, run queue, and background task management if you want concurrent users.

### Option C: Hybrid Approach (Recommended for RepoLearn)
Use **LangGraph SDK** in a thin FastAPI wrapper.
*   Run `langgraph dev` (or `up`) as the "Engine".
*   Run a small FastAPI "Gateway" that talks to the LangGraph Engine via the SDK.
*   **Why?** This lets you use the robust, battle-tested streaming/threading of the Server, while still having a place to put your custom UI-specific logic (like file editing API) that doesn't fit in the agent graph.

## 4. Repository Structure Recommendation

Based on the simplified requirements for a research tool, we will use a flat structure that separates the User Interface (`frontend`), the Reasoning Engine (`backend`), and the Scientific Experiments (`experiments`).

```text
repo-learn/
├── frontend/                   # Next.js 14 Application (The "Face")
│   ├── src/app/                # App Router Pages
│   ├── src/components/         # 3-Panel Grid & UI Components
│   └── src/lib/                # LangGraph SDK Client
│
├── backend/                    # The "Brain" (DeepAgent Engine + Sidecar)
│   ├── agent/                  # The DeepAgent Logic (LangGraph)
│   │   ├── __init__.py
│   │   ├── graph.py            # Exports the 'graph' object
│   │   ├── tools.py            # Custom tools (File I/O, Sub-agent spawning)
│   │   └── subagents/          # Sub-agent definitions
│   ├── api/                    # FastAPI Sidecar (The "nervous system")
│   │   ├── main.py             # Utility routes (File Editor API, Project List)
│   │   └── models.py
│   ├── langgraph.json          # Config file for LangGraph CLI
│   └── requirements.txt
│
├── experiments/                # The "Lab" (Science & Evaluation)
│   ├── run_benchmark.py        # Independent script for metrics (No UI)
│   ├── ablation_study.py       # Script for turning off components
│   └── datasets/               # Contamination-free repos
│
├── data/                       # Shared Local Storage (The "Memory")
│   ├── repositories/           # Cloned repos from GitHub
│   └── tutorials/              # Generated tutorials per repo
│       └── {repo_name}/        # e.g., "langchain-ai_deepagents"
│           ├── user/           # Tutorials for end-users
│           └── dev/            # Tutorials for developers/maintainers
│
└── docs/                       # Paper drafts, SRS, Reports
```

**Why this structure?**
1.  **Direct Mapping**: `frontend` maps to the UI, `backend` maps to the logic. No confusion with monorepo `apps/` folders.
2.  **Science Isolation**: The `experiments/` folder allows you one click to run your "MANDATORY" and "OPTIONAL" experiments (from `experiments_ara.md`) without needing to launch the entire web server.
3.  **Shared Data**: The `data/` folder is mounted/accessible by both the Backend and the Experiments scripts, ensuring consistency.

## 5. Decision Log

1.  **Engine**: We will use **LangGraph CLI (`langgraph dev`)** for development. It removes the need to write complex async streaming code manually.
2.  **Frontend**: The Next.js app will use the **LangGraph JS SDK** (`@langchain/langgraph-sdk`) to connect directly to the local server. This supports streaming out of the box.
3.  **Custom Operations**: For non-agentic operations (like "User saving a file manually"), we will either:
    *   Create a simple "System Tool" the agent exposes.
    *   Or add a minimal FastAPI sidecar if absolutely necessary (start without it).

This approach creates a "Professional" tool architecture that looks impressive in a demo paper (microservices-ready, standardized API) while keeping the actual code burden low.

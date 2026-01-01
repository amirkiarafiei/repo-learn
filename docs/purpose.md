# Project Purpose & Strategic Vision: RepoLearn

## 1. The Core Objective
RepoLearn is a dual-purpose project aiming to solve the problem of **Automated Codebase Comprehension** while serving as a vehicle for academic and career advancement.

### 1.1 Academic Goals
*   **e-Science Paper**: Demonstrate the scientific validity of **Deep Agents (Agents 2.0)** in extracting knowledge from large-scale, unstructured scientific repositories via dynamic, recursive delegation.
*   **Tool Track Paper (AAMAS/ICSME/ASE)**: Showcase a novel, transparent interface for interacting with autonomous agents. The focus is on *steerability* and *observability*—proving we can open the "black box" of agent reasoning.

### 1.2 Career Goals
*   **PhD Portfolio**: Establish a strong engineering and research baseline to support PhD applications, demonstrating capability in complex system architecture, ML integration, and academic writing.

---

## 2. The Problem: "The Context Wall"
Developers and researchers often face "The Context Wall" when entering a new codebase:
*   **Size**: Projects with 100k+ lines are too large for a single LLM prompt context window.
*   **Complexity**: Understanding a specific function often requires knowing the global architecture (which is missing in localized RAG searches).
*   **Trust**: Automatic documentation tools (like CodeWiki) often produce generic summaries without explaining *how* they arrived at those conclusions.

## 3. The Solution: Deep Agents & Radical Transparency
We propose **RepoLearn**, a system that mimics a human engineering team:

### 3.1 The "Analyst-Architect" Architecture (Deep Agents)
Instead of a fixed pool of workers (Traditional Multi-Agent), we implement **Dynamic Instantiation**:
*   **The Architect (Main Agent)**: Plans the documentation strategy. It identifies modules, creates a TODO list, and synthesizes final reports. It *never* reads raw code to avoid context pollution.
*   **The Analysts (Deep Sub-Agents)**: Unlike traditional agents, these are not fixed entities. They are **ephemeral specialists** created on the fly with bespoke prompts and specific tools tailored to the task (e.g., "Analyze the Auth Schema"). They return *distilled knowledge* to the Architect, who can then recursively spawn further agents if new complexity is uncovered.

### 3.2 The "Visualizer" UI
Unlike CLI tools or hidden backend processes, RepoLearn puts the agent's brain on display. The **3-Panel Dashboard** (Plan, Brain, Grid) is not just eye candy; it is the scientific proof of the agent's structured reasoning. It allows the user to see:
1.  **Planning**: "The agent knows it needs to check the database before the API."
2.  **Delegation**: "The agent spawned 3 parallel sub-agents to speed up analysis."
3.  **Synthesis**: "The agent is combining conflicting reports into a coherent doc."

---

## 4. Key Design Decisions & Justifications

### 4.1 Hybrid Backend (LangGraph Engine + Sidecar)
*   **Decision**: Run the agent on a specialized LangGraph Server ("Engine") but handle file/project operations on a separate FastAPI ("Sidecar").
*   **Why**: An Agent is designed for *reasoning*, not *CRUD*. Separating these concerns allows us to have best-in-class streaming for the AI (via LangGraph) while maintaining a standard, fast API for the UI editor.

### 4.2 Local-First Execution
*   **Decision**: Clone repositories locally (`data/repositories`) rather than purely in-memory.
*   **Why**: AI Agents need to "explore" files similar to a human (ls, cat, grep). A real filesystem provides the most robust environment for this `FilesystemMiddleware`. It also ensures user data privacy and allows for caching.

### 4.3 Streaming-First/Event-Driven UI
*   **Decision**: The UI dictates the architecture. The need for a "Live Logic Feed" mandates a WebSocket/SSE connection where the backend pushes `token` and `tool_start` events.
*   **Why**: Polling (asking "are you done yet?" every 2s) would destroy the user experience and fail to capture the granular sub-agent lifecycle events needed for the "Grid" view.

### 4.4 Deep Agent Methodology (Agents 2.0)
*   **Decision**: Move away from static worker pools to **Dynamic Task Instantiation**.
*   **Why**: Software architecture is unpredictable. A fixed "database agent" might fail on an idiosyncratic GraphQL-only codebase. Deep Agents allow the Architect to "birth" a specialist that understands the specific library or pattern identified during the initial scan, ensuring the analysis is always context-appropriate.

---

## 5. Limitations & Realistic Expectations
*   **Latency**: Deep Agents are slow. Analyzing a repo might take 5-20 minutes. The UI is designed to keep the user engaged during this wait.
*   **Cost**: Recursive and dynamically instantiated agents consume significantly more tokens than simple RAG. We address this with explicit "Cost Estimation" before the job starts.
*   **Hallucination**: Sub-agents might misinterpret code. We mitigate this by having the Main Agent cross-reference sub-agent reports against the `0_overview.md` global context.

## 6. MVP Scope (Phase 1)
To manage complexity, we focus strictly on:
1.  **Input**: A GitHub URL.
2.  **Process**: Main Agent creating `0_overview.md` (No sub-agents initially).
3.  **Visualization**: Creating the pipe to show this thought process on the frontend.
*Once this pipeline is solid, we unlock the sub-agents.*

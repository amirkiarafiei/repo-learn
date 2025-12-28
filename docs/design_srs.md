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
├── frontend/           # Next.js 14 Application
├── backend/            # LangGraph Agent Engine + FastAPI Sidecar
└── data/               # Local filesystem storage
```

### 2.1 Components
*   **The Frontend (Client)**: A Next.js application responsible for the UI, state management, and connecting to the backend streams.
*   **The Engine (Agent Runner)**: A `LangGraph Server` instance that executes the Deep Agent logic and streams events (tokens, tool calls, state updates).
*   **The Sidecar (Utility API)**: A `FastAPI` service that handles non-agentic tasks like file system exploration (for the editor), project listing, and saving user edits.
*   **The Data Layer**: A shared volume (local directory) where the agent writes markdown files and the frontend reads them.

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

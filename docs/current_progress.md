# RepoLearn - Chronological Feature Log

This log tracks the evolution of RepoLearn, focusing on the order of feature implementation and architectural milestones.

### Foundation & Core Engine
- Initialized mono-repo structure with Next.js frontend and LangGraph backend.
- Configured **DeepAgent** using `create_deep_agent`, featuring a planning "Brain" and **Dynamic Instantiation** of worker sub-agents.
- Implemented **CompositeBackend** for path-safe filesystem operations, providing read-only repo access and strictly partitioned tutorial writes.
- Built core toolset for **Deep Delegation**: 
  - `git_clone`: Handles repository retrieval.
  - `get_tutorial_path`: Ensures standardized audience-specific folder structures.
  - `write_todos`: Enables agents to self-report progress.
  - `ls` / `read_file`: Sandboxed filesystem exploration.

### Visualization & Streaming
- Developed the **3-Panel Dashboard**:
  - **PlannerPanel**: Real-time TODO tree with status indicators.
  - **BrainPanel**: Main agent's "inner monologue" stream with color-coded message types.
  - **GridPanel**: Sub-agent worker cards showing which specialist is currently active.
- Integrated real-time streaming using `@langchain/langgraph-sdk`.
- Implemented **SubAgentMiddleware** to intercept tool-call namespaces and visualize hierarchical delegation.
- Added custom message transformation to distinguish between "thoughts", "tool calls", and "final outputs".

### Tutorial Consumption & Interaction
- Created the **Markdown Viewer** with `react-markdown`, `remark-gfm`, and custom code block styling.
- Added **Interactive IDE**: 
  - Tabbed interface for multiple open files.
  - Fuzzy file search powered by `Fuse.js`.
  - Syntax highlighting for a wide range of languages using `react-syntax-highlighter`.
- Implemented **Contextual Code Linking**: Custom Markdown link interceptors that allow tutorials to "open" specific code files in the IDE, enabling a side-by-side reading experience.
- Added support for dual audiences (Users vs. Developers) with partitioned storage subfolders.

### Reliability & Error Handling
- Improved repository naming with **Universal Lowercase Mapping** to prevent filesystem mismatches on Linux.
- Implemented **Smart Redirect Guards**: Pre-flight async checks that prevent 404 loops by verifying tutorial existence before navigation.
- Added **Audience Persistence**: Ensures `?audience=dev` context is preserved across page refreshes and navigation.
- Optimized agent performance with **"Speed Mode"** prompt instructions, significantly reducing LLM response latency during development.
- Implemented a **Hidden Bugs Audit** system to track and resolve race conditions in completion detection.

### Persistence & Detached Execution
- Migrated to **Detached Run Architecture**: Jobs are now initiated via `client.runs.create()`, ensuring they continue on the server regardless of client connection state.
- Developed the `usePersistentAgent` hook:
  - Manages polling of detached runs.
  - Detects job completion/failure status.
  - Handles re-hydration of state when returning to an active job.
- Implemented **Snapshot Persistence**: 
  - Automated archiving of final thread state (messages, todos, subagent activity) into `metadata.json`.
  - Enables viewing of reasoning history even after the LangGraph server or thread has been purged.
- Added **Hybrid Loading Logic**: The UI now transparently attempts server fetch first, falling back to local metadata snapshots on 404 errors.

### Data Integrity & Smart Cleanup
- Developed **Smart Reference Cleanup**: A reference-counting system that protects shared dependencies.
  - Deleting a "Developer" tutorial only removes that subfolder.
  - The shared source code in `repositories/` is preserved as long as the "User" version exists.
- Integrated unified cleanup triggers across the entire application:
  - **Dashboard**: Manual delete actions.
  - **Job Page**: "Stop Generation" and "Retry Analysis" buttons.
- Simplified storage controls by removing manual cache/code deletion in favor of automated, dependency-aware cleanup.
- Refined session isolation using **Unique UUID Threads** for every generation attempt to prevent state pollution.

### UI/UX & Premium Polish
- Applied modern aesthetics: Glassmorphism (`.glass`), animated gradients, and high-contrast dark mode.
- Developed a comprehensive **Design System**:
  - Staggered entry animations for lists.
  - Shimmer loading states (`.skeleton`) for async data.
  - Smooth progress bar transitions in the Planner.
- Implemented a unified **Toast Notification System** with slide/fade animations for status updates.
- Enhanced the UI with meaningful metadata: Star counts, storage size statistics, and history source badges (`[Live History]` vs `Cached Snapshot`).

### Sandbox Hardening & Agent Stability
- **Filesystem Lockdown**:
  - Implemented `ReadOnlyRepoBackend` to guarantee source repositories are never modified.
  - Implemented `RestrictedTutorialsBackend` to strictly enforce directory structure (`{repo}/{audience}/`) and prevent "zombie file" pollution.
- **Robust Orchestration**:
  - Added `complete_tutorial` tool as a mandatory explicit callback for defining "Success" state.
  - Mitigated hallucinated tool calls with stricter prompt engineering.
- **Recovery Mechanisms**:
  - Implemented **"Continue Analysis"** feature.
  - Allows users to resume an agent that stopped early (e.g., due to token limits or premature stop) on the exact same thread.
  - Includes a 2-attempt safety limit and specific resumption prompts for the Brain agent.

### Layout Modernization & Sidebar Interactivity
- **Smart Sidebar Architecture**:
  - Developed a **resizable vertical layout** for the left sidebar, allowing users to balance space between The Plan and The Filesystem.
  - Implemented a **Dual-Accordion System**:
    - **Planner**: Features a "shrink-to-top" accordion behavior.
    - **FileSystem**: Features a "shrink-to-bottom" accordion behavior.
    - Both headers are synchronized with left-aligned chevrons and status summaries.
- **UI Density Optimization**:
  - Refactored the **Global Navbar** to be 50% thinner, maximizing content area.
  - Slimmed down Planner progress bars and unified heading typography for a more professional, "Pro IDE" feel.
  - Redesigned the **"Add Repository"** flow into a more compact, screen-efficient layout.
- **Unified Filesystem Experience**:
  - Merged the disparate "Source" and "Output" sections of the FileSystem panel into a single unified directory tree.
  - Eliminated visual noise by removing redundant headers and sub-containers.
- **Brand Consistency**:
  - Standardized the "RepoLearn" visual identity and logo sizing across all application routes.

### Subagent Tool Visibility (The "Hidden Logs" Breakthrough)
- **Problem**: Deep Agents library filters subagent activity from the main graph state to protect context windows, making them invisible to the standard frontend polling mechanism.
- **Solution (Sidecar Pipeline)**:
  - **Intercepting Middleware**: Built a custom `SubagentToolEventMiddleware` to catch tool calls at the source.
  - **In-Memory Store**: Developed a thread-safe, in-memory store on the backend to cache these events without polluting the agent's memory.
  - **Real-Time Tunneling**: Created a specialized FastAPI endpoint (`/tool-calls`) to serve these logs directly to the frontend.
  - **Polished UX**: 
    - Real-time "terminal-style" log feed with auto-scroll.
    - Status badges (e.g., "12 calls").
    - Ultra-minimal scrollbars for a focused research feel.
- **Historical Fidelity**: Integrated tool call serialization into `metadata.json`, ensuring the full "thinking" process is preserved in snapshots.
- **Stability**: Fixed a critical "dehydration" bug where historical timestamps were loaded as strings instead of Date objects, causing UI crashes during snapshot sorting.

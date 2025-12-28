# Deep Agent Strategy: The "Analyst-Architect" Workflow

## 0. Strategic Vision & Purpose
**RepoLearn** is not just a documentation generator; it is a research instrument designed to prove that **Hierarchical AI Agents ("Deep Agents")** are superior to flat/monolithic models for comprehending large-scale software systems.

### The Problem
Traditional LLMs and simple ReAct agents fail at large codebases because:
1.  **Context Overflow**: They cannot "read" a repository with 100k+ lines of code in one go.
2.  **Attention Drift**: When an agent gets deep into debugging a specific function, it "forgets" the high-level architecture.
3.  **Black Box Reasoning**: Users receive a final output but have no confidence in *why* or *how* the AI reached its conclusions.

### The RepoLearn Solution
Our goal is to mimic the workflow of a **Senior Staff Engineer (The Architect)** leading a team of **Junior Contractors (The Analysts)**.
*   **Top-Down Cognition**: We do not parse code line-by-line from the start. We first "survey the land" (Phase 1) to build a mental map.
*   **Recursion with Purpose**: We solve the context problem by breaking the repository into modular "black boxes" that specialized sub-agents solve independently. The Main Agent only deals with the *outputs* of these boxes, not their *contents*.
*   **Radical Transparency**: Unlike closed tools (DeepWiki, Copilot), RepoLearn visualizes this mental process. We *want* the user to see the agent pausing to plan, delegating a task to a sub-agent, and reviewing the work. This visibility builds trust and proves the scientific validity of the Deep Agent methodology.

---

## 1. Core Philosophy
The RepoLearn Deep Agent operates on the **"Analyst-Architect"** principle.
*   **The Architect (Main Agent)**: Responsible for high-level understanding, strategic planning, and synthesizing the final output. It avoids "dirty work" (reading thousands of lines of code) to keep its context window clean and focused.
*   **The Analysts (Sub-agents)**: Disposable, specialized workers spawned to dive deep into specific directories or files. They summarize their findings and "die," leaving behind only distilled knowledge for the Architect.

## 2. Execution Phases

### Phase 0: Setup & Repository Acquisition
*   **Input**: User provided GitHub URL.
*   **Action**: The system (not the agent's LLM, but the tool layer) clones the repository to the local filesystem in `data/repositories/{repo_name}`.
*   **Outcome**: The filesystem is ready for the agent to mount.

### Phase 1: Initial Discovery (The "First Glance")
*   **Goal**: Create a cognitive map of the project without getting lost in details.
*   **Main Agent Actions**:
    1.  List root files (`ls -F`).
    2.  Read high-level documentation: `README.md`, `CONTRIBUTING.md`.
    3.  Inspect configuration files to identify stack/framework: `package.json`, `requirements.txt`, `docker-compose.yml`, `go.mod`.
    4.  Identify entry points (e.g., `src/index.ts`, `main.py`).
*   **Deliverable**: `0_overview.md`.
    *   This file is written immediately to disk.
    *   It contains: Project purpose, core technology stack, high-level architecture diagram (Mermaid), and directory structure summary.
    *   *Strategic Note*: This file serves as the "Global Context" anchor for all future sub-agents.

### Phase 2: Strategic Planning (The "Architect's Blueprint")
*   **Goal**: Decompose the massive task of "Explain this codebase" into manageable chunks.
*   **Inputs**:
    *   `0_overview.md` (Current understanding).
    *   User Config: `Target Audience` (User/Dev) and `Depth` (Basic/Detailed).
*   **Main Agent Actions**:
    1.  Analyze the directory tree to identify logical modules (e.g., "Auth Module", "Database Layer", "UI Components").
    2.  Populate the **Global TODO List** (via `TodoListMiddleware`).
*   **Example Plan**:
    *   [ ] Analyze `src/models` to understand data schema.
    *   [ ] Analyze `src/api` to document endpoints.
    *   [ ] Analyze `src/utils` for helper functions.
    *   [ ] Synthesize "Module 1: Architecture Deep Dive".

### Phase 3: Execution Loop (The "Delegation Cycle")
*   **Goal**: Clear the TODO list by delegating work.
*   **Constraint**: **The Main Agent NEVER reads source code files in this phase.** It only delegates.
*   **Workflow**:
    1.  **Pick a Task**: Main Agent selects the highest priority item from the TODO list (e.g., "Analyze `src/models`").
    2.  **Formulate Strategy**: Decides if this needs one or multiple sub-agents.
    3.  **Spawn Sub-agent(s)**: Uses the `task` tool.
        *   *Instruction*: "You are a Data Analyst. Read `src/models`. Identify the key entities and relationships. Output a summary focusing on {User/Dev perspective}."
        *   *Context*: Passes `0_overview.md` content so the sub-agent knows the big picture.
    4.  **Sub-agent Execution**:
        *   Sub-agent spins up, mounts `src/models`.
        *   Reads files, traces imports (dirty work).
        *   Produces a **Task Result**: A concise summary or a draft markdown snippet.
        *   Sub-agent terminates.
    5.  **Review**: Main Agent reads the *result*, not the raw logs.
    6.  **Update State**: Marks TODO as complete.

### Phase 4: Synthesis & Final Generation
*   **Goal**: Produce the high-quality, polished tutorials.
*   **Input**: The collection of summaries and drafts produced by sub-agents.
*   **Main Agent Actions**:
    1.  Review all accumulated knowledge.
    2.  Structure the final tutorial modules based on the requested order (e.g., `1_DataLayer.md`, `2_API_Guide.md`).
    3.  **Write Files**: The Main Agent essentially acts as a Technical Editor, stitching together the sub-agent findings into a coherent narrative, adding transitions, and ensuring tone consistency.
*   **Outcome**: A set of `{order}_{title}.md` files in `data/tutorials/{repo_name}/{audience}/` where `{audience}` is either `user` or `dev`.

## 3. Sub-Agent Handling Policies
*   **Parallelism**: If the Main Agent realizes two tasks are independent (e.g., "Analyze Backend" and "Analyze Frontend"), it *can* spawn two sub-agents simultaneously (feature dependent on LangGraph capability, otherwise sequential is safer for MVP).
*   **Context Isolation**: Sub-agents do not share memory. They only know what the Main Agent tells them in the prompt (`0_overview.md` + specific instructions).
*   **Kill Switch**: If a sub-agent takes too long or hallucinates, the Main Agent (or the system) can terminate it and retry with a simpler task.

## 4. Prompt Engineering Requirements
To enforce this behavior, the System Prompt must be rigid:
> "You are the Lead Architect. **DO NOT** read code files yourself. Your job is to PLAN and DELEGATE. If you see a file you need to understand, spawn a sub-agent. You only read the summaries they provide. Your only direct output is the initial '0_overview.md' and the final tutorial files."

## 5. Future Scope & Optional Strategy Enhancements

### 5.1 Context-Aware Sub-agents
*   **Automatic Injection**: Instead of manually passing context, the system can automatically inject the content of `0_overview.md` into the System Prompt of *every* spawned sub-agent.
*   **Benefit**: This ensures no sub-agent ever works "blind." They always inherit the global architectural understanding (entry points, stack, patterns) before analyzing their specific localized file.

### 5.2 The "Manager" Agent (Supervisor)
*   **Role**: A high-level ReAct agent that does *not* do work but *monitors* the Deep Agent.
*   **Function**: It observes the Deep Agent's output. If the Deep Agent attempts to quit early or produces conflicting plans, the Supervisor intervenes with corrective instructions.
*   **Loop**: `Supervisor -> Observes Deep Agent -> Evaluating Progress -> Corrects/Approves`.

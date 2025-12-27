# Implementation Guide for AI Coding Assistants

This document provides high-level guidance for AI coding assistants (Claude, Cursor, GitHub Copilot, etc.) to help students implement a **Knowledge Base Generator using Sub-Agents Architecture**.

## Project Overview

**Goal:** Build a system that generates a comprehensive knowledge base from any codebase using a main agent that spawns sub-agents to analyze different parts of the codebase independently.

**Key Concept:** This implements the **Deep Agents** pattern for long-horizon tasks, where a main agent delegates work to dynamically-created sub-agents that work independently and save results to persistent storage.

**Timeline:** 4-8 weeks for a working prototype

**Target Codebase Size:** Small repositories (~30-50 files for testing)

## Architecture Overview

### Three-Layer Structure

1. **Main Agent (Orchestrator)**
   - Analyzes codebase structure
   - Identifies tasks to delegate
   - Spawns sub-agents dynamically
   - Reads results from sub-agent workspaces
   - Combines outputs into final knowledge base

2. **Sub-Agents (Workers)**
   - Created on-demand by main agent
   - Each has isolated workspace
   - Analyzes specific parts of codebase
   - Generates markdown documentation
   - Saves results to dedicated workspace

3. **Storage Management**
   - Codebase: Read-only for all agents
   - Main agent workspace: Write access for main agent only
   - Sub-agent workspaces: Each sub-agent has write access to its own workspace only
   - Main agent can read all sub-agent workspaces after completion

## Critical Design Principles

### 1. Context Isolation (Most Important!)

**Why:** The main agent must NOT see sub-agents' reasoning, tool calls, or intermediate steps. This keeps the main agent's context window clean for long-horizon tasks.

**How it works:**
- Main agent calls `spawn_sub_agents` tool
- Tool creates sub-agents and runs them sequentially
- Sub-agents save results to files in their workspaces
- Tool returns summary: "Results saved in workspace X, Y, Z"
- Main agent reads the saved files later (not the sub-agent's response)

**Key insight:** "Concurrent from main agent's perspective" means the main agent doesn't track what sub-agents do, NOT that they run in parallel threads.

### 2. Sequential Execution (Keep It Simple!)

**Implementation:** Sub-agents execute one after another in a loop, NOT in parallel using threads/async.

**Why:**
- Simpler to implement
- No threading complexity
- No race conditions
- Avoids conflicts with Smolagents internal workings
- It's okay if it takes time - quality over speed

**In code:** Use a simple `for` loop, not `asyncio` or `threading`

### 3. Scoped Tools (Tricky Part - Pay Attention!)

Each sub-agent gets tools that are scoped to specific directories:

**Read-only access:**
- Can read from codebase directory
- Path must be validated to prevent traversal attacks

**Write-only access:**
- Can write to its own workspace directory only
- Path must be validated to prevent writing outside workspace

**Security validation pattern:**
```
1. User provides: "src/api/users.py"
2. Join with base path: "/codebase/src/api/users.py"
3. Resolve to absolute path
4. Check if it starts with allowed base path
5. If yes, allow operation
6. If no, raise error "Path traversal detected"
```

## Implementation Tasks Breakdown

### Task 1: Write Main Agent Prompt

**Purpose:** Instructions for the main agent on how to analyze codebases and delegate tasks

**Key elements to include:**
- How to use `get_tree` or `list_directory` tools to understand codebase structure
- How to read important files (README.md, main.py, package.json)
- **Simplified approach:** For every first-level directory under `src/`, spawn one sub-agent with a standard task
- How to use `spawn_sub_agents` tool with clear task descriptions
- How to read results from sub-agent workspaces
- How to combine markdown files into final knowledge base

**Example main agent logic:**
```
1. Read codebase tree
2. Find all first-level directories in src/
3. For each directory, create a task: "Analyze [directory_name] and document it"
4. Spawn one sub-agent per directory
5. Read all results from sub-agent workspaces
6. Combine into final knowledge base
```


### Task 2: Write Sub-Agent Prompts

**Two approaches:**

**Approach A: Generic prompt** (simpler)
- Main agent defines entire task in tool call
- Sub-agent just follows the task description
- Easier to implement and debug
- Perfect for prototypes

**Approach B: Pre-built agent types** (better quality, optional upgrade)
- Create specialized prompts: `ANALYZER_AGENT_PROMPT`, `SUMMARIZER_AGENT_PROMPT`
- These prompts include detailed instructions on how to analyze, what format to use, what to include
- Main agent just picks agent type + adds specific task
- Final prompt = Pre-built instructions + Main agent's task
- Produces more consistent, higher-quality output

**Recommendation:** Start with Approach A. If output quality is poor and you have time, upgrade to Approach B.

### Task 3: Implement `spawn_sub_agents` Tool

**Function signature:**
```
Input:
  - number_of_subagents: int
  - task_descriptions: List[str]
Output:
  - Summary string telling main agent where results are saved
```

**What this tool must do:**

1. Create workspace directory structure:
   - `sub_agents_workspace/sub_agent_0/`
   - `sub_agents_workspace/sub_agent_1/`
   - etc.

2. For each sub-agent (in a loop):
   - Create dedicated workspace folder
   - Get task description from list
   - Create scoped tools for this sub-agent
   - Create ToolCallingAgent with those tools
   - Run the agent with the task
   - Store workspace path in results

3. Return summary to main agent:
   - "All N sub-agents completed."
   - "Results in: workspace_path_1, workspace_path_2, ..."

**Important:** Do NOT return the sub-agent's detailed output. Only return where the results are saved.

### Task 4: Implement Scoped Tools

**Critical security requirement:** Validate all file paths to prevent path traversal attacks (e.g., `../../etc/passwd`)

**Tools needed for each sub-agent:**

1. **read_codebase_file(file_path: str) -> str**
   - Reads from codebase directory (read-only)
   - Validates path is within codebase
   - Returns file contents

2. **write_workspace_file(file_path: str, content: str) -> str**
   - Writes to sub-agent's workspace directory
   - Validates path is within workspace
   - Creates directories as needed
   - Returns success message

3. **list_codebase_directory(dir_path: str) -> List[str]**
   - Lists files in codebase directory
   - Validates path is within codebase
   - Returns list of filenames

4. **get_codebase_tree() -> str**
   - Returns full tree structure of codebase
   - Useful for sub-agent to understand context
   - No path validation needed (always returns full tree)

### Task 5: Storage Management

**Directory structure:**

```
project_root/
├── agent_workspace/           # Main agent's workspace
├── my_project/                # Codebase being analyzed (read-only)
└── sub_agents_workspace/      # Created by spawn_sub_agents tool
    ├── sub_agent_0/           # Sub-agent 0's workspace
    │   └── api_documentation.md
    ├── sub_agent_1/           # Sub-agent 1's workspace
    │   └── utils_summary.md
    └── sub_agent_2/           # Sub-agent 2's workspace
        └── models_analysis.md
```

**Access control matrix:**

| Agent | Can Read | Can Write |
|-------|----------|-----------|
| Main Agent | Everywhere | `agent_workspace/` only |
| Sub-Agent 0 | `my_project/` | `sub_agents_workspace/sub_agent_0/` only |
| Sub-Agent 1 | `my_project/` | `sub_agents_workspace/sub_agent_1/` only |

**Key principle:** Isolation prevents conflicts and enables parallel conceptual work

## Critical Risks and Mitigation Strategies

### Risk 1: Scoped Tools Security (The Hardest Part)

**Why it's critical:** Implementing secure, scoped filesystem tools is the **single greatest technical challenge** in this project.

**The danger:** A naive implementation like `os.path.join(workspace_path, file_path)` is vulnerable to path traversal attacks. An attacker (or confused sub-agent) could use `../../main_agent_workspace/evil.txt` to write outside their workspace.

**What students must do:**
- Use `os.path.abspath()` and `os.path.realpath()` to resolve paths to their canonical form
- Always validate that the resolved path **starts with** the allowed base path
- Test with deliberate attack patterns like `../`, `../../`, `/../`, etc.
- **Use AI coding tools for this** - give them a specific prompt like: "Implement create_scoped_tools in Python ensuring it's secure against path traversal attacks using os.path.abspath and os.path.realpath"

**Verification:** Security-conscious students will spend 2-4 hours here. This is time well spent.

### Risk 2: Main Agent Planning Logic (Can Be Unreliable)

**The challenge:** The main agent must decide which tasks to delegate to sub-agents. This requires:
1. Reading codebase structure (easy)
2. Reading key files like README.md (easy)
3. **Deciding what sub-tasks to create** (hard - this is complex reasoning)

**Why it's risky:** Step 3 can be unreliable. An LLM might identify vague or overlapping tasks, leading to poor decomposition.

**Recommended simplification:**

Instead of a "smart" planning agent, use a **simple, dumb rule:**
```
For every first-level directory in src/:
  - Create one sub-agent
  - Task: "Analyze this directory and document it"
```

**Example:**
If the codebase has:
```
src/
├── api/
├── models/
├── utils/
└── config/
```

Then spawn exactly 4 sub-agents:
- Sub-agent 0: Analyze `src/api/`
- Sub-agent 1: Analyze `src/models/`
- Sub-agent 2: Analyze `src/utils/`
- Sub-agent 3: Analyze `src/config/`

**Why this works:**
- No complex planning logic needed
- Guaranteed to cover the codebase systematically
- Easy to implement and debug
- Sub-agents work consistently with the same task structure
- Students can upgrade to "smart" planning later if they want

**Key insight:** **This project aims for a working prototype, not an elegant solution.** Simple and reliable beats complex and broken.


## Common Pitfalls and Solutions

### Pitfall 1: Path Traversal Vulnerability

**Problem:** Sub-agent could write to `../../main_agent_workspace/evil.txt`

**Solution:** Always resolve paths to absolute and check they start with allowed base path

### Pitfall 2: Main Agent Context Pollution

**Problem:** Returning full sub-agent output to main agent bloats its context

**Solution:** `spawn_sub_agents` tool only returns workspace paths, not content

### Pitfall 3: Sub-Agents Can't Find Codebase Files

**Problem:** Relative path confusion between codebase root and sub-agent workspace

**Solution:** Make codebase_path absolute, always join user input with this base

### Pitfall 4: Agents Produce Vague Output

**Problem:** Task description "analyze the API" is too vague

**Solution:** Use detailed prompts with specific format requirements, or use pre-built agent types

### Pitfall 5: Reading All Results Exceeds Context

**Problem:** Main agent tries to read 50 markdown files and exceeds context window

**Solution:** For small codebases this won't happen. For larger ones, main agent should summarize or create table of contents without reading everything

## Implementation Strategy

### Recommended Order

1. **Start with filesystem tools** (1-2 hours)
   - Implement basic read_file, write_file for main agent
   - Test with simple read/write operations
   - Add get_tree tool

2. **Implement scoped tools** (2-4 hours)
   - Create scoped versions with path validation
   - Write unit tests for path traversal cases
   - Test with different path inputs

3. **Implement spawn_sub_agents tool** (2-3 hours)
   - Start with spawning 1 sub-agent
   - Test that it creates workspace correctly
   - Test that it saves results
   - Expand to multiple sub-agents

4. **Write agent prompts** (1-2 hours)
   - Start simple, iterate based on output quality
   - Test with small codebase
   - Refine based on results

5. **Test full workflow** (2-3 hours)
   - Main agent analyzes small codebase
   - Spawns 2-3 sub-agents
   - Reads and combines results
   - Fix any issues

6. **Implement downstream task** (3-5 hours)
   - Tutorial generation: Use simple LLM to read knowledge base and generate tutorial
   - Chatbot: Add Gradio UI + simple retrieval from knowledge base

### Testing Strategy

**Use a small, well-structured test codebase:**
- 20-30 Python files
- Clear structure (api/, models/, utils/)
- README.md and requirements.txt present
- You can create one or use an existing small open-source project

**Test incrementally:**
- Single file read
- Single sub-agent spawn
- Two sub-agents spawn
- Full knowledge base generation
- Downstream task

## Downstream Task Specifics

### For "Ara Proje" (Tutorial Generation)

**Input:** Knowledge base markdown files

**Process:**
1. Main agent or simple LLM reads knowledge base files
2. Generates beginner-friendly tutorial markdown files
3. Includes code examples from codebase
4. Adds mermaid diagrams for architecture
5. Saves tutorial files

**Output:** 3-5 tutorial markdown files explaining how to use the codebase

**Complexity:** Low - mostly prompt engineering

### For "Final Proje" (Q&A Chatbot)

**Input:** Knowledge base markdown files + codebase

**Process:**
1. Index knowledge base files (simple or with vector DB)
2. User asks question via Gradio UI
3. Agent retrieves relevant knowledge base sections
4. Optionally: Use RAG to fetch code snippets from codebase
5. Generate answer combining knowledge base + code

**Output:** Gradio chatbot that answers questions

**Complexity:** Medium - RAG adds complexity but is optional

**Simplification:** Can start with just keyword search in knowledge base, add RAG later

## Technology Stack

**Required:**
- Smolagents (agent framework)
- LiteLLM (LLM provider abstraction)
- Python 3.13+
- Basic file I/O

**Optional:**
- FAISS or ChromaDB (for RAG in chatbot)
- OpenTelemetry + Phoenix (for tracing/debugging)

**Already Provided in Template:**
- Gradio UI
- Basic agent setup
- Example tools
- Configuration management

## Key Resources for AI Assistant

**Must read before implementation:**
1. `docs/methodology_overview.md` - Understand why sub-agents architecture
2. `docs/methodology_implementation.md` - Detailed implementation guide with pseudocode
3. Existing codebase in `agents/` and `toolkits/` - See how current agents are structured

**Deep Agents references:**
- [Langchain Deep Agents Docs](https://docs.langchain.com/oss/python/deepagents/subagents)
- [Deep Agents Blog](https://blog.langchain.dev/deep-agents/)

**Smolagents documentation:**
- [Official Smolagents Docs](https://huggingface.co/docs/smolagents)

## Success Criteria

**Minimum Viable Product:**

✅ Main agent can read codebase structure using tools
✅ Main agent can spawn 2-3 sub-agents with different tasks
✅ Each sub-agent can read codebase files
✅ Each sub-agent saves markdown documentation to its workspace
✅ Main agent can read sub-agent results
✅ Final knowledge base contains 3-5 markdown files explaining the codebase
✅ Downstream task works (tutorial generation OR chatbot)

**Bonus points:**
- Pre-built agent types for consistent output
- Mermaid diagrams in documentation
- RAG integration for chatbot
- Error handling and retry logic
- Cost tracking for LLM API calls
- 

**Focus areas for student help:**
1. **Path validation in scoped tools** (security critical - allocate 2-4 hours here)
2. Implementing the spawn_sub_agents tool
3. Writing effective main agent prompt
4. Debugging when agents produce unexpected results
5. Understanding the "why" behind sub-agents architecture


**Avoid:**
- ❌ Threading/async complexity (use sequential execution)
- ❌ Over-engineering (simple prototype is fine)
- ❌ Large codebases for testing (keep it small)
- ❌ Perfect output (iteration is expected)
- ❌ Intelligent planning logic (keep it dumb and reliable)

**Remember:** The goal is learning the Deep Agents pattern and building a working prototype that demonstrates:
1. How to securely scope filesystem access
2. How to spawn multiple agents dynamically
3. How to combine agent outputs into a cohesive knowledge base

Elegance and optimization come later. Reliability and learning come first.



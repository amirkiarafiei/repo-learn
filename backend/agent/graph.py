"""
RepoLearn Deep Agent Graph

This module creates the main DeepAgent for analyzing codebases and generating tutorials.
Uses CompositeBackend to sandbox file operations: read from repos, write to tutorials only.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend, CompositeBackend
from deepagents.backends.protocol import WriteResult, EditResult
from langchain_openai import ChatOpenAI

from agent.tools import git_clone, get_repo_path, get_tutorial_path, complete_tutorial
from agent.subagents import SUBAGENTS

# Load environment variables
load_dotenv()

# Paths
DATA_DIR = Path(__file__).parent.parent.parent / "data"
REPOS_DIR = DATA_DIR / "repositories"
TUTORIALS_DIR = DATA_DIR / "tutorials"

# Configure OpenRouter as the LLM provider
model = ChatOpenAI(
    model=os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001"),
    openai_api_base="https://openrouter.ai/api/v1",
    openai_api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": "https://github.com/amirkiarafiei/repo-learn",
        "X-Title": "RepoLearn",
    },
)

# System prompt for the main Brain agent
BRAIN_PROMPT = """You are RepoLearn Brain, the main orchestrator AI that helps developers understand codebases.

## ⚡ SPEED MODE: Keep everything SHORT and HIGH-LEVEL
- Write brief, concise responses (1-3 sentences max per section)
- Skip deep analysis - give quick overviews only
- Complete tasks quickly, don't overthink
- Still use todos and subagents (required for the system to work)

## ⚠️ CRITICAL: File Path Rules (READ CAREFULLY)

### Step 1: Parse the Request
The user message contains:
- A GitHub URL to analyze
- "Target audience: user" OR "Target audience: dev" - EXTRACT THIS VALUE

### Step 2: Get Tutorial Output Path (MANDATORY)
BEFORE writing ANY tutorial file, you MUST call:
```python
tutorial_path = get_tutorial_path(github_url, audience)
# Example: get_tutorial_path("https://github.com/owner/repo", "dev")
# Returns: "/tutorials/owner_repo/dev"
```

### Step 3: Write Files to THAT Path
ALL tutorial `write_file` calls MUST use the tutorial_path:
```python
write_file(f"{tutorial_path}/0_overview.md", content)  # ✅ CORRECT
write_file("/tutorials/owner_repo/0_overview.md", content)  # ❌ WRONG - missing audience
write_file("data/tutorials/owner_repo/dev/file.md", content)  # ❌ WRONG - wrong format
```

### What Happens If You Use Wrong Path
- Writing outside `/tutorials/` → ERROR: Permission denied
- Writing without audience subfolder → ERROR: Invalid path
- The system will reject incorrectly placed files

## CRITICAL: Always Use Todo List

You MUST use the `write_todos` tool to track your progress. This is REQUIRED.
- Call `write_todos` at the START with your initial plan (keep it to 3-4 items max)
- Update todos as you complete each step

**IMPORTANT: Only call `write_todos` ONCE per response.**

## Your Role

You are the "Brain" - delegate to your worker subagents:
- **code-analyzer**: Quick code overview
- **doc-writer**: Brief documentation

## CRITICAL: You MUST use BOTH subagents (at least once each)

## Quick Workflow

When given a GitHub repository URL:

### Phase 1: Setup (Create todo list first!)
Call `write_todos` with a SHORT plan:
```
[
  {"content": "Clone repo and get tutorial path", "status": "pending"},
  {"content": "DELEGATE: Quick code overview (code-analyzer)", "status": "pending"},
  {"content": "DELEGATE: Write brief docs (doc-writer)", "status": "pending"},
  {"content": "Create overview document", "status": "pending"}
]
```

### Phase 2: Clone & Get Paths
1. Clone with `git_clone(url)`
2. Get repo path: `repo_path = get_repo_path(url)`
3. **IMPORTANT**: Get tutorial path: `tutorial_path = get_tutorial_path(url, audience)`
4. Mark todo as completed

### Phase 3: Delegate to code-analyzer (REQUIRED)
Quick delegation:
```
task(
  subagent_type="code-analyzer",
  description="Give a 2-3 sentence overview of the main files and architecture"
)
```

### Phase 4: Delegate to doc-writer (REQUIRED)
Quick delegation:
```
task(
  subagent_type="doc-writer",
  description="Write a short getting started guide (max 10 lines)"
)
```

### Phase 5: Create Brief Overview
Use the tutorial_path from Step 2:
```python
write_file(f"{tutorial_path}/0_overview.md", content)
```

## Available Tools

- `write_todos`: Track progress (call first!)
- `read_todos`: Check todo state
- `task`: Delegate to subagents
- `git_clone`: Clone a repository
- `get_repo_path`: Get VIRTUAL path to read repository files (e.g., "/owner_repo")
- `get_tutorial_path(url, audience)`: Get VIRTUAL path for writing tutorials (MUST call before write_file)
- `ls`, `read_file`: Read files from repository (use the virtual repo path)
- `write_file`: Write tutorial files (ONLY to tutorial_path)
- `complete_tutorial`: Mark the tutorial as complete (MUST call before finishing)

## 🏁 How to Finish
1. Write all tutorial files
2. Call `complete_tutorial(github_url, audience, "Brief summary of work")`
3. Then provide your final response to the user.

Be FAST and BRIEF!"""

# Configure backends for path safety
class ReadOnlyFilesystemBackend(FilesystemBackend):
    """Prevents write/edit operations on the repositories folder."""
    def write(self, file_path: str, content: str) -> WriteResult:
        return WriteResult(error=f"PERMISSION DENIED: Write access not allowed in repository backend for {file_path}. Use /tutorials/ path for your output.")

    def edit(self, file_path: str, old_string: str, new_string: str, replace_all: bool = False) -> EditResult:
        return EditResult(error=f"PERMISSION DENIED: Edit access not allowed in repository backend for {file_path}. Use /tutorials/ path for your output.")

# Read-only access to cloned repositories
repos_backend = ReadOnlyFilesystemBackend(
    root_dir=str(REPOS_DIR),
    virtual_mode=True,  # Prevents path traversal
    max_file_size_mb=10,
)

# Read-write access to tutorials
tutorials_backend = FilesystemBackend(
    root_dir=str(TUTORIALS_DIR),
    virtual_mode=True,
    max_file_size_mb=5,
)

# Create the Deep Agent with CompositeBackend for path sandboxing
graph = create_deep_agent(
    model=model,
    tools=[git_clone, get_repo_path, get_tutorial_path, complete_tutorial],
    system_prompt=BRAIN_PROMPT,
    subagents=SUBAGENTS,
    # CompositeBackend: default reads from repos, /tutorials/ route writes to tutorials
    backend=CompositeBackend(
        default=repos_backend,
        routes={"/tutorials/": tutorials_backend},
    ),
)


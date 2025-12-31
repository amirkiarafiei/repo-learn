"""
RepoLearn Deep Agent Graph

This module creates the main DeepAgent for analyzing codebases and generating tutorials.
Phase 5: Added subagent integration for specialized analysis and documentation tasks.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from langchain_openai import ChatOpenAI

from agent.tools import git_clone, get_repo_path, get_tutorial_path
from agent.subagents import SUBAGENTS

# Load environment variables
load_dotenv()

# Paths
DATA_DIR = Path(__file__).parent.parent.parent / "data"
REPOS_DIR = DATA_DIR / "repositories"

# Configure OpenRouter as the LLM provider
model = ChatOpenAI(
    model=os.getenv("OPENROUTER_MODEL", "z-ai/glm-4.5-air:free"),
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
  {"content": "Clone and explore repo", "status": "pending"},
  {"content": "DELEGATE: Quick code overview (code-analyzer)", "status": "pending"},
  {"content": "DELEGATE: Write brief docs (doc-writer)", "status": "pending"},
  {"content": "Create overview document", "status": "pending"}
]
```

### Phase 2: Clone & Quick Look
- Clone with `git_clone`, do a quick `ls`
- Mark todo as completed

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
Write a SHORT `0_overview.md` (just the essentials, no fluff)

## Available Tools

- `write_todos`: Track progress (call first!)
- `read_todos`: Check todo state
- `task`: Delegate to subagents
- `git_clone`, `get_repo_path`, `get_tutorial_path`: Repo tools
- `ls`, `read_file`, `write_file`, `edit_file`: File operations

Be FAST and BRIEF!"""

# Create the Deep Agent with subagents and filesystem backend
graph = create_deep_agent(
    model=model,
    tools=[git_clone, get_repo_path, get_tutorial_path],
    system_prompt=BRAIN_PROMPT,
    # Subagents for specialized tasks
    subagents=SUBAGENTS,
    # FilesystemBackend allows the agent to read/write to the data directory
    backend=FilesystemBackend(root_dir=str(DATA_DIR)),
)

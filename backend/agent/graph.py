"""
RepoLearn Deep Agent Graph

This module creates the main DeepAgent for analyzing codebases and generating tutorials.
Phase 3: Added git_clone tool and FilesystemBackend for codebase discovery.
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from deepagents import create_deep_agent
from deepagents.backends import FilesystemBackend
from langchain_openai import ChatOpenAI

from agent.tools import git_clone, get_repo_path, get_tutorial_path

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

# System prompt for Phase 1: Discovery
DISCOVERY_PROMPT = """You are RepoLearn, an AI assistant that helps developers understand codebases.

## CRITICAL: Always Use Todo List

You MUST use the `write_todos` tool to track your progress. This is REQUIRED, not optional.
- Call `write_todos` at the START with your initial plan
- Update todos as you complete each step (change status to "completed" or "in_progress")
- The user can only see your progress through the todo list

## Your Workflow

When given a GitHub repository URL:

### Phase 1: Setup (Create todo list first!)
First, call `write_todos` with your plan:
```
[
  {"content": "Clone the repository", "status": "pending"},
  {"content": "Explore directory structure", "status": "pending"},
  {"content": "Read README and docs", "status": "pending"},
  {"content": "Identify tech stack", "status": "pending"},
  {"content": "Create overview document", "status": "pending"}
]
```

### Phase 2: Clone Repository
- Use the `git_clone` tool to download the repository
- Update todos: mark "Clone the repository" as "completed"

### Phase 3: Initial Discovery
- Use `ls` to list the root files and directories
- Read README.md, CONTRIBUTING.md (if they exist)
- Inspect configuration files: package.json, requirements.txt, Cargo.toml, go.mod, etc.
- Update todos as you complete each item

### Phase 4: Create Overview Document
- Write `0_overview.md` to the tutorial output directory containing:
  - Project purpose (from README)
  - Core technology stack
  - High-level architecture diagram (Mermaid syntax)
  - Directory structure summary
- Mark final todo as "completed"

## Important Rules

- ALWAYS call write_todos FIRST before any other action
- ALWAYS update todos after completing each step
- ALWAYS clone the repository before reading files
- Use `ls` to explore before diving into specific files
- Keep analysis focused and beginner-friendly

## Available Tools

- `write_todos`: REQUIRED - Track your progress (call this first!)
- `read_todos`: Check current todo state
- `git_clone`: Clone a GitHub repository
- `get_repo_path`: Get the local path of a cloned repo
- `get_tutorial_path`: Get where to save tutorial files
- `ls`, `read_file`, `write_file`, `edit_file`: File operations

Be helpful and thorough!"""

# Create the Deep Agent with custom tools and filesystem backend
graph = create_deep_agent(
    model=model,
    tools=[git_clone, get_repo_path, get_tutorial_path],
    system_prompt=DISCOVERY_PROMPT,
    # FilesystemBackend allows the agent to read/write to the data directory
    backend=FilesystemBackend(root_dir=str(DATA_DIR)),
)

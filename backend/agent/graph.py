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

## Your Workflow

When given a GitHub repository URL:

1. **Clone the Repository**
   - Use the `git_clone` tool to download the repository to the local filesystem
   - Note the paths returned for the repository and tutorial output

2. **Initial Discovery (First Glance)**
   - Use `ls` to list the root files and directories
   - Read high-level documentation: README.md, CONTRIBUTING.md (if they exist)
   - Inspect configuration files to identify the tech stack: package.json, requirements.txt, Cargo.toml, go.mod, etc.
   - Identify main entry points (src/index.ts, main.py, etc.)

3. **Create Overview Document**
   - Write a file called `0_overview.md` to the tutorial output directory
   - The overview should contain:
     - Project purpose (from README)
     - Core technology stack
     - High-level architecture diagram (using Mermaid syntax)
     - Directory structure summary
   - Use `write_file` to save this document

## Important Rules

- ALWAYS clone the repository first before trying to read any files
- Use `ls` to explore the structure before diving into specific files
- Keep your analysis focused and concise
- Write clear, beginner-friendly documentation

## Available Tools

You have access to:
- `git_clone`: Clone a GitHub repository
- `get_repo_path`: Get the local path of a cloned repo
- `get_tutorial_path`: Get where to save tutorial files
- `ls`, `read_file`, `write_file`, `edit_file`: File operations (from FilesystemMiddleware)
- `write_todos`: Track your progress with a todo list

Be helpful and thorough!"""

# Create the Deep Agent with custom tools and filesystem backend
graph = create_deep_agent(
    model=model,
    tools=[git_clone, get_repo_path, get_tutorial_path],
    system_prompt=DISCOVERY_PROMPT,
    # FilesystemBackend allows the agent to read/write to the data directory
    backend=FilesystemBackend(root_dir=str(DATA_DIR)),
)

"""
Custom tools for the RepoLearn Deep Agent.
"""

import os
import subprocess
import re
import json
from datetime import datetime
from pathlib import Path
from langchain_core.tools import tool

# Base directory for cloned repositories
DATA_DIR = Path(__file__).parent.parent.parent / "data"
REPOS_DIR = DATA_DIR / "repositories"
TUTORIALS_DIR = DATA_DIR / "tutorials"


def _sanitize_repo_name(url: str) -> str:
    """Convert a GitHub URL to a safe directory name."""
    # Extract owner/repo from URL
    # Handles: https://github.com/owner/repo, https://github.com/owner/repo.git
    match = re.search(r"github\.com[/:]([^/]+)/([^/]+?)(?:\.git)?$", url)
    if match:
        owner, repo = match.groups()
        return f"{owner}_{repo}".lower()
    # Fallback: use the last part of the URL
    return url.rstrip("/").split("/")[-1].replace(".git", "").lower()


@tool
def git_clone(github_url: str) -> str:
    """Clone a GitHub repository to the local filesystem for analysis.
    
    Args:
        github_url: The full GitHub URL (e.g., https://github.com/owner/repo)
    
    Returns:
        A message indicating success or failure, including the path where the repo was cloned.
    """
    try:
        # Sanitize and create target directory
        repo_name = _sanitize_repo_name(github_url)
        target_dir = REPOS_DIR / repo_name
        
        # Create directories if they don't exist
        REPOS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Check if already cloned
        if target_dir.exists():
            return f"Repository already exists at: {target_dir}"
        
        # Clone the repository
        result = subprocess.run(
            ["git", "clone", "--depth", "1", github_url, str(target_dir)],
            capture_output=True,
            text=True,
            timeout=120,
        )
        
        if result.returncode != 0:
            return f"Failed to clone repository: {result.stderr}"
        
        # Create tutorial output directory
        tutorial_dir = TUTORIALS_DIR / repo_name
        tutorial_dir.mkdir(parents=True, exist_ok=True)
        
        return f"Successfully cloned repository to: {target_dir}\nTutorial output will be saved to: {tutorial_dir}"
    
    except subprocess.TimeoutExpired:
        return "Error: Git clone timed out after 120 seconds"
    except Exception as e:
        return f"Error cloning repository: {str(e)}"


@tool
def get_repo_path(github_url: str) -> str:
    """Get the local filesystem path for a cloned GitHub repository.
    
    Args:
        github_url: The full GitHub URL
    
    Returns:
        The VIRTUAL path (e.g., "/owner_repo") where the repository is stored.
    """
    repo_name = _sanitize_repo_name(github_url)
    target_dir = REPOS_DIR / repo_name
    
    if target_dir.exists():
        return f"/{repo_name}"
    else:
        return f"Repository not found. Please clone it first using git_clone."


@tool
def get_tutorial_path(github_url: str, audience: str = "") -> str:
    """Get the REQUIRED path for saving tutorial files.
    
    You MUST call this BEFORE writing any tutorial files.
    You MUST use the returned path as the prefix for ALL write_file calls.
    
    Args:
        github_url: The GitHub URL being analyzed
        audience: REQUIRED - 'user' or 'dev' (check user message for 'Target audience: X')
    
    Returns:
        The virtual path for writing tutorials. Use this EXACTLY in write_file calls.
    
    Example:
        path = get_tutorial_path("https://github.com/a/b", "dev")
        # Returns: "/tutorials/a_b/dev"
        write_file(f"{path}/0_overview.md", content)
    """
    # Validate audience - STRICT
    if not audience:
        return (
            "ERROR: 'audience' parameter is REQUIRED.\n\n"
            "Look at the user message for 'Target audience: user' or 'Target audience: dev'\n"
            "Then call: get_tutorial_path(url, 'user') or get_tutorial_path(url, 'dev')"
        )
    
    audience = audience.lower().strip()
    if audience not in ("user", "dev"):
        return (
            f"ERROR: audience must be 'user' or 'dev', got '{audience}'.\n\n"
            "Check the user message for 'Target audience: X' and try again."
        )
    
    # Sanitize repo name
    repo_name = _sanitize_repo_name(github_url)
    if not repo_name:
        return f"ERROR: Could not parse repository from URL: {github_url}"
    
    # Create directory on real filesystem
    tutorial_dir = TUTORIALS_DIR / repo_name / audience
    try:
        tutorial_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        return f"ERROR: Failed to create tutorial directory: {e}"
    
    # Return virtual path for CompositeBackend routing
    virtual_path = f"/tutorials/{repo_name}/{audience}"
    
    return (
        f"Tutorial output path: {virtual_path}\n\n"
        f"You MUST use this path for ALL write_file calls:\n"
        f"  write_file(\"{virtual_path}/0_overview.md\", content)\n"
        f"  write_file(\"{virtual_path}/1_getting_started.md\", content)\n\n"
        f"Do NOT use any other path format."
    )


@tool
def complete_tutorial(github_url: str, audience: str, summary: str = "") -> str:
    """Mark the tutorial as complete. Call this ONLY after you have written ALL files.
    
    Args:
        github_url: The GitHub URL analyzed
        audience: 'user' or 'dev'
        summary: A 1-2 sentence summary of the generated tutorial.
    
    Returns:
        A message confirming completion.
    """
    repo_name = _sanitize_repo_name(github_url)
    metadata_path = TUTORIALS_DIR / repo_name / audience / "metadata.json"
    
    try:
        if not metadata_path.exists():
            # Try to create it if missing (recovery)
            metadata_path.parent.mkdir(parents=True, exist_ok=True)
            with open(metadata_path, 'w') as f:
                json.dump({
                    "id": f"{repo_name}_{audience}",
                    "repoId": repo_name,
                    "githubUrl": github_url,
                    "audience": audience, 
                    "status": "pending",
                    "createdAt": datetime.now().isoformat()
                }, f)
            
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
            
        metadata["status"] = "completed"
        metadata["updatedAt"] = datetime.now().isoformat()
        metadata["summary"] = summary
        
        # SAVE TOOL CALLS LOG for historical view (Option B)
        try:
            from langgraph.config import get_config
            from agent.tool_call_store import get_tool_call_store
            
            config = get_config()
            thread_id = config.get("configurable", {}).get("thread_id")
            
            if thread_id:
                store = get_tool_call_store()
                tool_entries = store.get_entries(thread_id)
                if tool_entries:
                    metadata["subagent_tool_log"] = tool_entries
        except Exception as e:
            # Don't fail the whole completion if log saving fails
            print(f"Warning: Failed to save tool call logs: {e}")
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
            
        return f"Successfully marked tutorial for {repo_name} ({audience}) as completed."
    except Exception as e:
        return f"Error marking tutorial as complete: {str(e)}"


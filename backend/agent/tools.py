"""
Custom tools for the RepoLearn Deep Agent.
"""

import os
import subprocess
import re
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
        The local path where the repository is stored, or an error if not found.
    """
    repo_name = _sanitize_repo_name(github_url)
    target_dir = REPOS_DIR / repo_name
    
    if target_dir.exists():
        return str(target_dir)
    else:
        return f"Repository not found. Please clone it first using git_clone."


@tool
def get_tutorial_path(github_url: str, audience: str = "dev") -> str:
    """Get the local filesystem path for tutorial output.
    
    Args:
        github_url: The full GitHub URL
        audience: Either 'user' or 'dev' (default: 'dev')
    
    Returns:
        The path where tutorials should be saved.
    """
    repo_name = _sanitize_repo_name(github_url)
    tutorial_dir = TUTORIALS_DIR / repo_name / audience
    tutorial_dir.mkdir(parents=True, exist_ok=True)
    return str(tutorial_dir)

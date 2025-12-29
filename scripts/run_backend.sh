#!/bin/bash
echo "🧠 Starting RepoLearn Backend (LangGraph Server)..."
cd "$(dirname "$0")/../backend"
langgraph dev --port 2024

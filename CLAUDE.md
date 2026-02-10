# RepoLearn - Developer Guide

## Core Commands
- **Start Project**: `./run.sh` (launches dev servers for both frontend and backend)
- **Frontend Dev**: `cd frontend && npm run dev` (Port 3000/3001)
- **Backend Dev**: `cd backend && langgraph dev` (Port 2024)
- **Install Deps**: `cd frontend && npm install` | `cd backend && uv sync`
- **Linting**: `cd frontend && npm run lint`

## Project Overview
RepoLearn is an automated codebase comprehension tool built on **Deep Agents (Agents 2.0)** and **Radical Transparency**. It uses an Architect agent to plan documentation and Analyst sub-agents to explore code recursively.

## Tech Stack
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide React.
  - *Key libs*: `react-markdown`, `mermaid`, `react-zoom-pan-pinch` (for diagramming).
- **Backend**: Python 3.12+, LangGraph (LangChain), FastAPI Sidecar.
  - *Key libs*: `deepagents` (recursive delegation), `langgraph-api`.

## Architecture Patterns & Code Style
- **Mono-repo Structure**: 
  - `/frontend`: Next.js UI with a 3-panel dashboard (Plan, Brain, Grid).
  - `/backend`: LangGraph agent definitions and repository filesystem tools.
  - `/data`: Local clones of repositories and generated tutorials.
- **UI/UX Guidelines**: 
  - Follow the **Premium Aesthetic**: Glassmorphism (`.glass`), dark mode (`#09090b`), blue/zinc accents, and smooth micro-animations.
  - Markdown components should handle Mermaid diagrams with pan-zoom support via `<MermaidDiagram />`.
- **Backend Patterns**:
  - Architects should NOT read raw code (prevents context pollution); they delegate to Specialists.
  - Use `CompositeBackend` for safe filesystem partitioning (read-only repo / restricted tutorial writes).
- **Consistency Rules**:
  - Always use **Absolute Paths** when interacting with the filesystem via tools.
  - Check **KI Summaries** (Knowledge Items) at the start of any research task to avoid duplication.
  - When adding UI components, ensure they support responsive layouts and match existing padding/spacing tokens.

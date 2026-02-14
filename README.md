# RepoLearn

<p align="center">
  <a href="https://deepwiki.com/amirkiarafiei/repo-learn">
    <img src="https://deepwiki.com/badge.svg" alt="DeepWiki Documentation">
  </a>
  <a href="https://www.youtube.com/watch?v=s3U6E9o94gk">
    <img src="https://img.shields.io/badge/YouTube-Video_Demo-red?style=flat-square&logo=youtube" alt="Video Demo">
  </a>
  <a href="https://arxiv.org/abs/2602.12654">
    <img src="https://img.shields.io/badge/arXiv-2602.12654-b31b1b?style=flat-square&logo=arxiv" alt="Paper">
  </a>
</p>

This repository contains the official implementation of the paper **"Visualizing Deep Agents in Long-Horizon Tasks: Towards Explainable and Trustworthy Agentic AI"**.

In this work, we propose a **4D visualization** framework (Temporal, Cognitive, Hierarchical, and Spatial) designed to make autonomous Deep Agents radically observable. We integrated this dashboard into **RepoLearn**, a tool that accepts any GitHub repository URL and autonomously generates comprehensive markdown tutorials to onboard both users and developers.

## Features

- 🧠 **Deep Agent Architecture** — Hierarchical AI agents for intelligent analysis
- 📊 **Real-Time Visualization** — Watch the agent think and plan live
- 📝 **Dual Audience Mode** — Tutorials for end-users or developers
- 📁 **Interactive IDE** — Browse source code with syntax highlighting
- 📤 **Export to Markdown/PDF** — Download tutorials as zip archives

## Demo Video

<div align="center">
  
[![RepoLearn Demo - Click to Watch](https://img.youtube.com/vi/s3U6E9o94gk/maxresdefault.jpg)](https://www.youtube.com/watch?v=s3U6E9o94gk)

**▶️ Click the image above to watch the full demo on YouTube**

</div>

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- [LangGraph CLI](https://langchain-ai.github.io/langgraph/tutorials/langgraph-platform/local-server/) (`uv tool install langgraph-cli[inmem]`)
- OpenRouter API key ([get one here](https://openrouter.ai/))

### 1. Clone & Setup

```bash
git clone https://github.com/amirkiarafiei/repo-learn.git
cd repo-learn
```

### 2. Backend Setup

```bash
cd backend
uv sync

# Copy and configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Start the LangGraph server
langgraph dev --port 2024
```

### 3. Frontend Setup (new terminal)

```bash
cd frontend
npm install

# Copy environment (optional, defaults work for local dev)
cp .env.example .env.local

# Start Next.js dev server
npm run dev
```

### 4. Open the App

Navigate to **http://localhost:3000** and enter a GitHub repository URL to generate your first tutorial!

## Quick Run Script

Alternatively, run both services at once (requires `gnome-terminal` or `xterm`):

```bash
./run.sh
```

## Screenshots

<table width="100%">
  <tr>
    <td width="33%" align="center">
      <img src="assets/add_repo.png" alt="Add Repository" width="100%"/>
      <br/><b>Figure 1:</b> <b>Entry Point.</b> Initiate tutorial generation by providing any public GitHub repository URL.
    </td>
    <td width="33%" align="center">
      <img src="assets/main.png" alt="Main Dashboard" width="100%"/>
      <br/><b>Figure 2:</b> <b>Tutorial Library.</b> The main landing page showcasing the collection of generated tutorials as interactive cards.
    </td>
    <td width="33%" align="center">
      <img src="assets/results.png" alt="Final Results" width="100%"/>
      <br/><b>Figure 5:</b> <b>Artifact Generation.</b> The final output: high-fidelity, dual-audience tutorials formatted in Markdown.
    </td>
  </tr>
  <tr>
    <td colspan="3" align="center">
      <img src="assets/viz_begin.png" alt="Visualization Start" width="100%"/>
      <br/><b>Figure 3:</b> <b>Analysis Inception.</b> The initial phase of the visualization dashboard where planning begins.
    </td>
  </tr>
  <tr>
    <td colspan="3" align="center">
      <img src="assets/viz_continue.png" alt="Visualization Progress" width="100%"/>
      <br/><b>Figure 4:</b> <b>Multidimensional Observability.</b> Radical transparency across the four agentic pillars: Spatial, Hierarchical, Temporal, and Cognitive.
    </td>
  </tr>
</table>


## License

MIT

## Citation

If you use this work in your research, please cite:

```bibtex
@article{rafiei2026repolearn,
  title={RepoLearn: Automated Codebase Comprehension through Multidimensional Deep Agent Observability},
  author={Rafiei, Amirikia},
  journal={arXiv preprint},
  year={2026}
}
```
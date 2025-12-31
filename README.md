# RepoLearn

**AI-powered tutorials from any codebase** — Give RepoLearn a GitHub URL, watch it analyze the code in real-time, and get beginner-friendly tutorials tailored for users or developers.

Built with Deep Agents (hierarchical AI agents) for intelligent codebase understanding.

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.12+
- [LangGraph CLI](https://langchain-ai.github.io/langgraph/tutorials/langgraph-platform/local-server/) (`pip install langgraph-cli[inmem]`)
- OpenRouter API key ([get one here](https://openrouter.ai/))

### 1. Clone & Setup

```bash
git clone https://github.com/amirkiarafiei/repo-learn.git
cd repo-learn
```

### 2. Backend Setup

```bash
cd backend
pip install -e .

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

## Features

- 🧠 **Deep Agent Architecture** — Hierarchical AI agents for intelligent analysis
- 📊 **Real-Time Visualization** — Watch the agent think and plan live
- 📝 **Dual Audience Mode** — Tutorials for end-users or developers
- 📁 **Interactive IDE** — Browse source code with syntax highlighting
- 📤 **Export to Markdown/PDF** — Download tutorials as zip archives

## Documentation

- [Current Progress & Architecture](docs/current_progress.md)
- [DeepAgent Q&A Reference](docs/deepagent_qa.md)
- [Design & Requirements](docs/design/design_srs.md)

## License

MIT

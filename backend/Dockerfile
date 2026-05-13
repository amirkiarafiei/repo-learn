FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

# Expose the port
EXPOSE 2024

# Start the LangGraph server
# Using 'dev' mode as per run.sh, but for production consider 'langgraph up'
CMD ["uv", "run", "langgraph", "dev", "--port", "2024", "--host", "0.0.0.0"]

#!/bin/bash

# This script opens the backend and frontend in separate terminal windows.
# It attempts to use gnome-terminal, but falls back to xterm or background processes if necessary.

if command -v gnome-terminal >/dev/null 2>&1; then
    echo "🚀 Launching in GNOME Terminal tabs..."
    gnome-terminal --title="RepoLearn Backend" -- bash -c "./scripts/run_backend.sh; exec bash"
    gnome-terminal --title="RepoLearn Frontend" -- bash -c "./scripts/run_frontend.sh; exec bash"
elif command -v xterm >/dev/null 2>&1; then
    echo "🚀 Launching in xterm windows..."
    xterm -title "RepoLearn Backend" -e "./scripts/run_backend.sh" &
    xterm -title "RepoLearn Frontend" -e "./scripts/run_frontend.sh" &
else
    echo "⚠️ No supported GUI terminal found. Running in background..."
    ./scripts/run_backend.sh &
    sleep 2
    ./scripts/run_frontend.sh &
    wait
fi

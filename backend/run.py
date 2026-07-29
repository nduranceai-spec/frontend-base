# NDURANCE AI — Backend Runner
# Copy .env.example to .env and configure before running

# Activate virtual environment first:
#   python -m venv .venv && source .venv/bin/activate (Linux/Mac)
#   python -m venv .venv && .venv\Scripts\activate   (Windows)
#
# Install dependencies:
#   pip install -r requirements.txt
#
# Run development server:
#   python run.py
#   OR: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ws_ping_interval=20,
        ws_ping_timeout=20,
        log_level="info",
    )

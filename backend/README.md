# NDURANCE AI Backend

This is the FastAPI backend for the NDURANCE AI motion analysis platform.

## Requirements

- Python 3.11+ (3.13 confirmed in the workspace)
- `pip`

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
cd backend
source .venv/bin/activate
python run.py
```

Alternatively:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API

- Health: `GET /api/health`
- Auth: `/api/auth/*`
- Sessions: `/api/sessions/*`
- Reports: `/api/reports/*`
- WebSocket: `/ws/camera/{camera_id}`

## Notes

- The backend uses `.env` for configuration.
- `app/config.py` loads settings with Pydantic.
- `app/main.py` enables CORS for `http://localhost:3000`.

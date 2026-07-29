# NDURANCE AI

This repository contains the NDURANCE AI application split into a Python backend and a Next.js frontend.

## Structure

- `backend/` — FastAPI backend service, Python dependencies, and database files.
- `frontend/` — Next.js frontend application, TypeScript, and client-side code.
- `Dockerfile` — Builds the backend service container using `backend/requirements.txt`.
- `docker-compose.yml` — Compose setup for local containerized development.
- `.gitignore` — Repository ignore rules for both backend and frontend.

## Quick start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker (optional)

```bash
docker-compose up --build
```

## Notes

- Backend configuration is loaded from `backend/.env`.
- Frontend configuration is loaded from `frontend/.env.local`.
- The root `Dockerfile` targets `backend/`.

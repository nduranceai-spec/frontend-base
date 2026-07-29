# NDURANCE AI Frontend

This is the Next.js frontend for the NDURANCE AI motion analysis platform.

## Requirements

- Node.js 20+ recommended
- npm

## Setup

```bash
cd frontend
npm install
```

## Run

```bash
cd frontend
npm run dev
```

The app will start by default at `http://127.0.0.1:3000`.

## Build

```bash
cd frontend
npm run build
```

## Project structure

- `app/` — Next.js App Router pages
- `components/` — reusable UI components
- `lib/` — API client, auth helpers, websockets
- `types/` — shared TypeScript types
- `public/` — static assets (if present)

## Environment

The frontend reads `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` from `.env.local`.

## Notes

- API requests use `frontend/lib/api.ts`.
- Live camera WebSocket handling is in `frontend/lib/websocket.ts`.
- Auth state is managed with Zustand in `frontend/lib/store.ts`.

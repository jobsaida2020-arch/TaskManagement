---
name: server-startup
description: Rules for starting this project's backend and frontend dev servers. Use this whenever asked to start, run, launch, or restart the backend (Spring Boot) or frontend (Vite) servers, open localhost in a browser, or when a port conflict (EADDRINUSE, "port already in use", "address already in use") comes up while starting either server. Also use when someone suggests starting on a different port to avoid a conflict — that workaround is not allowed here and this skill explains why.
---

# Server Startup Rules

This project pins the backend and frontend to fixed ports because they're hardcoded to expect each other there:

- Backend (Spring Boot) → **port 8080**. Its `WebConfig` hardcodes the CORS allowed origin to `http://localhost:5173`.
- Frontend (Vite) → **port 5173**. Its `VITE_API_BASE_URL` is hardcoded to `http://localhost:8080`.

Starting either one on a different port doesn't just risk a conflict — the app will be broken even if the server itself starts fine: CORS will reject the frontend's requests, or the frontend will call an API origin that doesn't exist. So a "just use another free port" workaround (e.g. `npm run dev -- --port 5174`, `--server.port=8081`) is never an acceptable fix for a port conflict here, even as a temporary measure.

## Startup procedure

1. **Check the target port before starting.**
   ```
   lsof -i :8080   # backend
   lsof -i :5173   # frontend
   ```
2. **If the port is free**, start normally on the fixed port (e.g. `./gradlew bootRun` for backend on 8080, `npm run dev` for frontend on 5173 — Vite's configured default).
3. **If the port is occupied**, don't switch ports. Instead:
   - Look at what `lsof -i :<port>` reports and judge whether the process is clearly a leftover/stale instance of this same project (e.g. an old `gradlew`/`java`/`node`/`vite` process from a previous run) or something unrelated.
   - If it's clearly this project's own stale process, stop it and start fresh on the fixed port:
     ```
     lsof -ti :8080 | xargs kill   # or :5173 for frontend
     ```
   - If there's any chance the process belongs to unrelated work (a different project, something the user started intentionally), **stop and ask the user for confirmation before killing it.** Don't guess.

## Also remember

The backend needs Postgres running (`docker compose up -d postgres` from the repo root) — without it, `bootRun` fails with a Hibernate dialect/connection error, which can look unrelated to the port rules but is a separate prerequisite.

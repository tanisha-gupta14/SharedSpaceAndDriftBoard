# LittleWorld Frontend

React + Vite + TypeScript + Tailwind client for the LittleWorld anonymous moment-sharing app.

## Run

```bash
# from repo root — start the Spring Boot backend on :8080 first
cd frontend
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

Vite proxies `/api`, `/uploads`, and `/ws` to `http://127.0.0.1:8080`.

## Views

- **Shared Space** — quick post bar, multipart image upload (`file` + optional `caption`), live feed via `GET /api/moments/recent` + STOMP `/topic/space`
- **Vibe Board** — board grid with `previewImageUrls` collages via `GET /api/boards` + `/topic/boards`; click through to `GET /api/boards/{id}`

## Upload

`POST /api/moments` expects `multipart/form-data` with required part `file` and optional `caption`. Response `imageUrl` is a web path like `/uploads/{uuid}_name.jpg`, served by the backend and proxied in dev.

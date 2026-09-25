# LittleWorld

LittleWorld is an anonymous, image-first moment-sharing application. People can upload photos with optional captions, browse the shared space, like moments, and explore automatically generated "vibe boards" that group visually similar images.

The project is split into three cooperating parts:

- **Spring Boot backend** in `LittleWorld/` for the REST API, persistence, uploads, asynchronous processing, and real-time events.
- **React frontend** in `LittleWorld/frontend/` for the shared space and vibe board user interface.
- **FastAPI ML service** in `ml-service/` for image embeddings, generated captions, and board names.

## How It Works

1. The frontend uploads an image to the Spring Boot backend.
2. The backend saves the image under `LittleWorld/uploads/`, stores a `PENDING` moment in PostgreSQL, and publishes the new moment to connected clients.
3. An asynchronous backend listener sends the image to the ML service for a generated caption and a normalized 512-value CLIP embedding.
4. The embedding is compared with existing board centroids. A cosine similarity of at least `0.55` adds the moment to the best matching board; otherwise, a new board is created.
5. Board names are generated from captions using the ML service. Boards are renamed as they grow, at member counts 3, 4, 8, 16, and so on.
6. The processed moment and board changes are broadcast to the frontend over STOMP/WebSocket.

## Architecture

```text
React + Vite frontend (:5173)
        |
        | REST: /api/*, uploads and SockJS: /ws
        v
Spring Boot backend (:8080) ---- PostgreSQL + pgvector (:5434)
        |
        | HTTP: /caption, /embed, /name-board
        v
FastAPI ML service (:8000)
        |
        +-- CLIP ViT-B/32        image embeddings
        +-- BLIP large           image captions
        +-- Qwen 2.5 1.5B        board names
```

### Backend events

- SockJS/STOMP endpoint: `/ws`
- Moment updates: `/topic/space`
- Board updates: `/topic/boards`
- Application destination prefix: `/app`

The backend currently uses a simple in-memory STOMP broker. Clients subscribe to topics; there are no inbound message handlers at present.

## Main API

### Moments

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/moments/recent` | Returns the 20 most recent moments. |
| `POST` | `/api/moments` | Uploads a multipart image and optional caption. Required part: `file`; optional part: `caption`. |
| `POST` | `/api/moments/{id}/like` | Increments a moment's like count. |

Example upload:

```bash
curl -X POST http://localhost:8080/api/moments \
  -F "file=@sample_images/example.jpg" \
  -F "caption=A quiet afternoon"
```

### Boards and uploads

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/boards` | Returns board summaries and up to five preview image URLs per board. |
| `GET` | `/api/boards/{id}` | Returns a board and its member moments. |
| `GET` | `/uploads/{filename}` | Serves a locally stored upload. |

### ML service

| Method | Path | Body | Description |
| --- | --- | --- |
| `POST` | `/embed` | Multipart `file` | Returns a normalized image embedding. |
| `POST` | `/caption` | Multipart `file` | Returns a generated image caption. |
| `POST` | `/name-board` | JSON `{ "captions": ["..."] }` | Returns a short board name. |

## Requirements

- Java 25
- Maven, or the included Maven wrapper
- Node.js and npm
- Python 3 with a virtual environment
- PostgreSQL with the `pgvector` extension
- Enough memory and disk space for the ML models; CUDA is used automatically when available

## Local Setup

### 1. Start PostgreSQL

The default backend configuration expects:

```text
Host:     localhost
Port:     5434
Database: littleworld
User:     postgres
Password: littleworld123
```

Create the database if necessary and enable the `vector` extension:

```sql
CREATE DATABASE littleworld;
\c littleworld
CREATE EXTENSION IF NOT EXISTS vector;
```

These values are development defaults in `LittleWorld/src/main/resources/application.yml`. Change them before using a different database or shared environment.

### 2. Start the ML service

From the workspace root:

```powershell
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The first startup downloads and loads CLIP, BLIP, and Qwen model weights. This can take time and may require substantial RAM or VRAM.

### 3. Start the Spring Boot backend

Open another terminal at the workspace root:

```powershell
cd LittleWorld
.\mvnw.cmd spring-boot:run
```

The backend runs at `http://localhost:8080`.

### 4. Start the frontend

Open a third terminal at the workspace root:

```powershell
cd LittleWorld\frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api`, `/uploads`, and `/ws` to the backend at `http://127.0.0.1:8080`.

## Build and Test

Backend commands, from `LittleWorld/`:

```powershell
.\mvnw.cmd test
.\mvnw.cmd clean package
```

Frontend commands, from `LittleWorld/frontend/`:

```powershell
npm run build
npm run preview
```

The current automated backend test is a Spring context-load test. There are no visible frontend or ML-service test suites yet.

## Project Layout

```text
.
├── LittleWorld/                 Spring Boot application
│   ├── frontend/                React + Vite + TypeScript client
│   ├── src/main/java/           Controllers, services, models, repositories
│   ├── src/main/resources/      Spring configuration and static resources
│   ├── src/test/                Backend tests
│   └── uploads/                  Runtime image storage
├── ml-service/                  FastAPI inference service
├── sample_images/               Example images for local experimentation
└── README.md
```

## Important Notes

- Upload processing is asynchronous. New moments initially have status `PENDING`; successful processing changes them to `PROCESSED`, and ML failures change them to `FAILED`.
- Uploads are stored on the local filesystem relative to the backend working directory. They are not object storage and are not safe to treat as durable production data.
- There is no authentication or authorization in the current implementation.
- Like deduplication is client-side only and is stored in the current browser tab. The backend accepts repeated like requests.
- JPA is configured with `ddl-auto: update`, SQL logging is enabled, and the default database credentials are development-only settings.
- The backend reads the ML URL from `ml.service.url`; the default is `http://localhost:8000`.
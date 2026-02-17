# AI-Powered Document Summarization App

Full-stack application with **real-time chat** and **AI-powered text summarization** using OpenAI GPT-4 and LangChain. Built with Python, FastAPI, React, TypeScript, PostgreSQL, Redis, and Docker.

## Features

- **Document summarization** – Paste text and get concise AI summaries (cached in Redis for sub-second repeat requests).
- **AI chat** – Ask questions and get answers; session history stored in PostgreSQL.
- **Summary history** – Browse and revisit past summaries.

## Tech Stack

| Layer      | Technology        |
|-----------|--------------------|
| Backend   | Python, FastAPI, LangChain, OpenAI |
| Frontend  | React, TypeScript, Vite           |
| Database  | PostgreSQL (async via SQLAlchemy + asyncpg) |
| Cache     | Redis (summary cache)              |
| Containers| Docker, Docker Compose             |

## Prerequisites

- Docker and Docker Compose
- [OpenAI API key](https://platform.openai.com/api-keys) (for GPT-4)

## Quick Start with Docker

1. **Clone and enter the project**
   ```bash
   cd "santhosh-AI-Powered Document Summarization App"
   ```

2. **Set your OpenAI API key**
   ```bash
   export OPENAI_API_KEY=sk-your-key-here
   ```

3. **Start all services**
   ```bash
   docker compose up --build
   ```

4. **Open the app**
   - Frontend: http://localhost:80 (or http://localhost if port 80 is in use)
   - API docs: http://localhost:8000/docs

## Local development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://app:appsecret@localhost:5432/summarization_db
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=sk-your-key-here
```

Run PostgreSQL and Redis (e.g. with Docker):

```bash
docker compose up postgres redis -d
```

Start the API:

```bash
 uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` and `/health` to the backend.

## Environment variables

| Variable        | Description                    | Default (backend) |
|----------------|--------------------------------|--------------------|
| `DATABASE_URL` | PostgreSQL connection string   | `postgresql+asyncpg://app:appsecret@localhost:5432/summarization_db` |
| `REDIS_URL`    | Redis connection string        | `redis://localhost:6379/0` |
| `OPENAI_API_KEY` | OpenAI API key (required)   | —                  |

## API overview

- `POST /api/documents/summarize` – Submit title + content, get summary (cached by content hash).
- `GET /api/documents` – List recent summarized documents.
- `GET /api/documents/{id}` – Get one document and its summary.
- `POST /api/chat/message` – Send a chat message, get AI reply (session persisted).
- `GET /health` – Health check.

## License

MIT.

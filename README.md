# Burmese-NestedNER Annotation Platform

## Overview
A web platform for creating **flat and nested Named Entity Recognition (NER)** datasets, built for the
Burmese-NestedNER senior project. Annotators tag tokens in a spreadsheet-style grid with multiple
nesting layers and real-time BIOES checks. The platform also supports inter-annotator agreement (IAA),
adjudication into a gold dataset, and CoNLL export.

Entity types, nesting rules, number of layers and tokenizer are configured per project, so other
Burmese NLP researchers can reuse it.

**Tech stack**

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, AG Grid |
| Backend | FastAPI, SQLAlchemy 2, Alembic |
| Database | PostgreSQL (Supabase) |

## Project Structure
```
annotation-platform/
├── backend/
│   ├── app/              FastAPI app (api, core, db, models)
│   ├── alembic/          database migrations
│   └── tests/
├── frontend/
│   └── src/              React app (api, pages)
├── .github/workflows/    CI
├── docker-compose.yml
└── .env.example
```

## Developer Guide

### Setup
Requires Python 3.10+ and Node.js 20+.

```bash
git clone https://github.com/burmese-nestedner/annotation-platform.git
cd annotation-platform
cp .env.example .env

cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"

cd ../frontend
npm install
```

### Environment Variables
Set in `.env` at the project root.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase Session pooler URL, starting with `postgresql+psycopg://` and ending with `?sslmode=require` |
| `JWT_SECRET` | Secret key for login tokens |
| `CORS_ORIGINS` | Allowed frontend origins, e.g. `["http://localhost:5173"]` |

### Development
```bash
# backend (http://localhost:8000/docs)
cd backend && uvicorn app.main:app --reload

# frontend (http://localhost:5173)
cd frontend && npm run dev
```

Apply database migrations only after the PR that adds them is merged into `dev`:
```bash
cd backend && alembic upgrade head
```

### Format
```bash
cd backend
ruff check . --fix
ruff format .
```

### Test
```bash
cd backend && pytest
```

### Build
```bash
cd frontend && npm run build
```

## Contributing
1. Create a new branch from `dev`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Commit your changes:
   ```bash
   git commit -m "feat: add your feature"
   ```
3. Push and open a Pull Request into `dev`.

## License
MIT

# Burmese-NestedNER Annotation Platform

A customizable web platform for **flat and nested NER annotation**, built for the
Burmese-NestedNER senior project (KMUTT, 2026–27). Entity types, nesting rules,
number of layers and tokenizer are configured per project, so other Burmese NLP
researchers can reuse it.

**Stack:** FastAPI · PostgreSQL (Supabase) · SQLAlchemy 2 + Alembic · React + Vite + AG Grid · Docker

## Quick start
Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) and access to the
team's Supabase project.

```bash
cp .env.example .env          # then paste the Supabase connection string into DATABASE_URL
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API docs | http://localhost:8000/docs |
| Health check | http://localhost:8000/api/health/db |

Migrations are **not** run automatically, because everyone shares one Supabase database.
Only run them when the team has agreed (see CONTRIBUTING.md):

```bash
docker compose run --rm backend alembic upgrade head
```

## Layout
```
backend/
  app/            FastAPI app (api/, core/, db/, models/)
  alembic/        database migrations
  tests/
frontend/src/     React app (api/, pages/)
docs/             design notes
```

## Data model
The tagging grid is only a view. Annotations are stored as one row per
**(token, layer, annotator)**, so the annotator grid, IAA comparison and gold table
are different queries over the same data. Absent rows mean `O`.
See `backend/app/models/schema.py`.

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
Code: MIT. Datasets produced with this platform carry their own licenses.

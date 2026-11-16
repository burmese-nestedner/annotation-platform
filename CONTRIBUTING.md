# Contributing

## Branches
| Branch | Purpose |
|---|---|
| `main` | Release only: demos and submissions (tags `v0.1-mvp`, `v0.2-phase2`, `v1.0-final`) |
| `dev` | Integration branch. Every PR merges here |
| `feat/…`, `fix/…`, `docs/…` | Work branches, created from `dev` |

Never push directly to `main` or `dev`; always open a PR.

## Commit messages
[Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`.

## Database migrations (important)
The whole team shares **one Supabase database**. A migration you apply affects everyone
immediately, so:

1. **Announce in the team chat before creating or applying a migration**, and pull `dev` first.
   (Two people creating migrations from the same head produces two Alembic heads.)
2. Apply to Supabase (`alembic upgrade head`) **only after the PR is merged into `dev`**.
3. Never run `alembic downgrade` on Supabase once real annotation data exists.
4. **Every new table must enable Row Level Security** in its migration
   (`ALTER TABLE "name" ENABLE ROW LEVEL SECURITY`). Supabase exposes `public` tables through
   its REST API; RLS with no policies blocks that, while FastAPI (the table owner) is unaffected.

```bash
docker compose exec backend alembic revision --autogenerate -m "short description"
```
Always read the generated file before committing. CI runs `alembic check` to make sure the
models and migrations match.

## Data
Never commit raw data, CoNLL dumps or model checkpoints. `data/` is git-ignored.

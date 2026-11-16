"""Enable row level security on all public tables."""

from collections.abc import Sequence

from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLES = (
    "users",
    "projects",
    "project_members",
    "entity_types",
    "nesting_rules",
    "documents",
    "sentences",
    "tokens",
    "batches",
    "batch_sentences",
    "batch_permissions",
    "annotations",
    "gold_annotations",
    "annotation_audit_log",
    "alembic_version",
)


def upgrade() -> None:
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY')


def downgrade() -> None:
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" DISABLE ROW LEVEL SECURITY')

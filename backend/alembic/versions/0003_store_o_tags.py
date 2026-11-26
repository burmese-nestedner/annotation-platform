"""Store O tags explicitly."""
from collections.abc import Sequence

from alembic import op

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLES = ("annotations", "gold_annotations")


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE tag_prefix ADD VALUE IF NOT EXISTS 'O'")
    for table in TABLES:
        op.alter_column(table, "entity_type_id", nullable=True)
        op.create_check_constraint(
            "ck_" + table + "_prefix_type_match",
            table,
            "(prefix = 'O') = (entity_type_id IS NULL)",
        )


def downgrade() -> None:
    for table in TABLES:
        op.drop_constraint("ck_" + table + "_prefix_type_match", table, type_="check")
        op.execute(f"DELETE FROM {table} WHERE prefix = 'O'")
        op.alter_column(table, "entity_type_id", nullable=False)
    # Postgres cannot remove an enum value; 'O' stays in tag_prefix.

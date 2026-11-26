"""Shared entity type catalog (empty; filled in later)."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "entity_type_catalog",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("label", sa.String(100), nullable=False),
        sa.Column("group_name", sa.String(50)),
        sa.Column("description", sa.Text),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id", name="pk_entity_type_catalog"),
        sa.UniqueConstraint("code", name="uq_entity_type_catalog_code"),
    )
    # same as every other public table (0002)
    op.execute('ALTER TABLE "entity_type_catalog" ENABLE ROW LEVEL SECURITY')


def downgrade() -> None:
    op.drop_table("entity_type_catalog")

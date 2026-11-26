"""Rename the O-tag check constraints from 0003.

0003 passed "ck_<table>_..." and the naming convention added "ck_<table>_" again,
so the constraints were created as ck_<table>_ck_<table>_prefix_type_match.
Raw SQL here so the naming convention is not applied a second time.
"""

from collections.abc import Sequence

from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

TABLES = ("annotations", "gold_annotations")


def _rename(table: str, old: str, new: str) -> None:
    op.execute(f'ALTER TABLE "{table}" RENAME CONSTRAINT "{old}" TO "{new}"')


def upgrade() -> None:
    for table in TABLES:
        _rename(table, f"ck_{table}_ck_{table}_prefix_type_match", f"ck_{table}_prefix_type_match")


def downgrade() -> None:
    # restore the 0003 names so 0003's downgrade still finds them
    for table in TABLES:
        _rename(table, f"ck_{table}_prefix_type_match", f"ck_{table}_ck_{table}_prefix_type_match")

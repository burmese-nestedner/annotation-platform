from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ENUMS = {
    "ner_mode": ("flat", "nested"),
    "project_role": ("owner", "annotator", "adjudicator"),
    "batch_purpose": ("annotation", "iaa", "gold"),
    "batch_access": ("edit", "view"),
    "tag_prefix": ("B", "I", "E", "S"),
    "gold_source": ("consensus", "adjudicated"),
    "audit_action": ("create", "update", "delete", "promote"),
}


def enum(name: str) -> pg.ENUM:
    return pg.ENUM(*ENUMS[name], name=name, create_type=False)


def fk(table: str, col: str, ref: str, ondelete: str | None = None) -> sa.ForeignKeyConstraint:
    return sa.ForeignKeyConstraint(
        [col], [f"{ref}.id"], name=f"fk_{table}_{col}_{ref}", ondelete=ondelete
    )


def created_at() -> sa.Column:
    return sa.Column(
        "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )


def upgrade() -> None:
    bind = op.get_bind()
    for name, values in ENUMS.items():
        pg.ENUM(*values, name=name).create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("display_name", sa.String(100), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default="true", nullable=False),
        created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_users"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("ner_mode", enum("ner_mode"), nullable=False),
        sa.Column("num_layers", sa.SmallInteger, server_default="1", nullable=False),
        sa.Column("tokenizer", sa.String(50), server_default="myword", nullable=False),
        sa.Column("created_by", sa.Integer),
        created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_projects"),
        fk("projects", "created_by", "users", "SET NULL"),
        sa.CheckConstraint("num_layers BETWEEN 1 AND 10", name="ck_projects_num_layers_range"),
    )

    op.create_table(
        "project_members",
        sa.Column("project_id", sa.Integer, nullable=False),
        sa.Column("user_id", sa.Integer, nullable=False),
        sa.Column("role", enum("project_role"), nullable=False),
        sa.PrimaryKeyConstraint("project_id", "user_id", name="pk_project_members"),
        fk("project_members", "project_id", "projects", "CASCADE"),
        fk("project_members", "user_id", "users", "CASCADE"),
    )

    op.create_table(
        "entity_types",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("project_id", sa.Integer, nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("label", sa.String(100), nullable=False),
        sa.Column("group_name", sa.String(50)),
        sa.Column("color", sa.String(9)),
        sa.Column("description", sa.Text),
        sa.PrimaryKeyConstraint("id", name="pk_entity_types"),
        fk("entity_types", "project_id", "projects", "CASCADE"),
        sa.UniqueConstraint("project_id", "code", name="uq_entity_types_project_id_code"),
    )

    op.create_table(
        "nesting_rules",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("project_id", sa.Integer, nullable=False),
        sa.Column("parent_type_id", sa.Integer, nullable=False),
        sa.Column("child_type_id", sa.Integer, nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_nesting_rules"),
        fk("nesting_rules", "project_id", "projects", "CASCADE"),
        fk("nesting_rules", "parent_type_id", "entity_types", "CASCADE"),
        fk("nesting_rules", "child_type_id", "entity_types", "CASCADE"),
        sa.UniqueConstraint(
            "project_id", "parent_type_id", "child_type_id",
            name="uq_nesting_rules_project_id_parent_type_id_child_type_id",
        ),
    )

    op.create_table(
        "documents",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("project_id", sa.Integer, nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("source", sa.String(100)),
        sa.Column("source_url", sa.Text),
        sa.Column("license", sa.String(50)),
        sa.Column("meta", pg.JSONB),
        created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_documents"),
        fk("documents", "project_id", "projects", "CASCADE"),
    )

    op.create_table(
        "sentences",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("document_id", sa.Integer, nullable=False),
        sa.Column("position", sa.Integer, nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_sentences"),
        fk("sentences", "document_id", "documents", "CASCADE"),
        sa.UniqueConstraint("document_id", "position", name="uq_sentences_document_id_position"),
    )

    op.create_table(
        "tokens",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("sentence_id", sa.Integer, nullable=False),
        sa.Column("position", sa.Integer, nullable=False),
        sa.Column("text", sa.String(200), nullable=False),
        sa.Column("pos_tag", sa.String(20)),
        sa.PrimaryKeyConstraint("id", name="pk_tokens"),
        fk("tokens", "sentence_id", "sentences", "CASCADE"),
        sa.UniqueConstraint("sentence_id", "position", name="uq_tokens_sentence_id_position"),
    )

    op.create_table(
        "batches",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("project_id", sa.Integer, nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("purpose", enum("batch_purpose"), nullable=False),
        created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_batches"),
        fk("batches", "project_id", "projects", "CASCADE"),
    )

    op.create_table(
        "batch_sentences",
        sa.Column("batch_id", sa.Integer, nullable=False),
        sa.Column("sentence_id", sa.Integer, nullable=False),
        sa.PrimaryKeyConstraint("batch_id", "sentence_id", name="pk_batch_sentences"),
        fk("batch_sentences", "batch_id", "batches", "CASCADE"),
        fk("batch_sentences", "sentence_id", "sentences", "CASCADE"),
    )

    op.create_table(
        "batch_permissions",
        sa.Column("batch_id", sa.Integer, nullable=False),
        sa.Column("user_id", sa.Integer, nullable=False),
        sa.Column("access", enum("batch_access"), nullable=False),
        sa.PrimaryKeyConstraint("batch_id", "user_id", name="pk_batch_permissions"),
        fk("batch_permissions", "batch_id", "batches", "CASCADE"),
        fk("batch_permissions", "user_id", "users", "CASCADE"),
    )

    op.create_table(
        "annotations",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("batch_id", sa.Integer, nullable=False),
        sa.Column("token_id", sa.Integer, nullable=False),
        sa.Column("layer", sa.SmallInteger, nullable=False),
        sa.Column("annotator_id", sa.Integer, nullable=False),
        sa.Column("prefix", enum("tag_prefix"), nullable=False),
        sa.Column("entity_type_id", sa.Integer, nullable=False),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id", name="pk_annotations"),
        fk("annotations", "batch_id", "batches", "CASCADE"),
        fk("annotations", "token_id", "tokens", "CASCADE"),
        fk("annotations", "annotator_id", "users", "CASCADE"),
        fk("annotations", "entity_type_id", "entity_types"),
        sa.UniqueConstraint(
            "batch_id", "token_id", "layer", "annotator_id",
            name="uq_annotations_batch_id_token_id_layer_annotator_id",
        ),
        sa.CheckConstraint("layer >= 1", name="ck_annotations_layer_positive"),
    )
    op.create_index("ix_annotations_batch_annotator", "annotations", ["batch_id", "annotator_id"])

    op.create_table(
        "gold_annotations",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("token_id", sa.Integer, nullable=False),
        sa.Column("layer", sa.SmallInteger, nullable=False),
        sa.Column("prefix", enum("tag_prefix"), nullable=False),
        sa.Column("entity_type_id", sa.Integer, nullable=False),
        sa.Column("source", enum("gold_source"), nullable=False),
        sa.Column("resolved_by", sa.Integer),
        sa.Column(
            "resolved_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id", name="pk_gold_annotations"),
        fk("gold_annotations", "token_id", "tokens", "CASCADE"),
        fk("gold_annotations", "entity_type_id", "entity_types"),
        fk("gold_annotations", "resolved_by", "users", "SET NULL"),
        sa.UniqueConstraint("token_id", "layer", name="uq_gold_annotations_token_id_layer"),
        sa.CheckConstraint("layer >= 1", name="ck_gold_annotations_layer_positive"),
    )

    op.create_table(
        "annotation_audit_log",
        sa.Column("id", sa.Integer, nullable=False),
        sa.Column("actor_id", sa.Integer),
        sa.Column("action", enum("audit_action"), nullable=False),
        sa.Column("target_table", sa.String(30), nullable=False),
        sa.Column("target_id", sa.Integer),
        sa.Column("batch_id", sa.Integer),
        sa.Column("token_id", sa.Integer, nullable=False),
        sa.Column("layer", sa.SmallInteger, nullable=False),
        sa.Column("old_value", pg.JSONB),
        sa.Column("new_value", pg.JSONB),
        created_at(),
        sa.PrimaryKeyConstraint("id", name="pk_annotation_audit_log"),
        fk("annotation_audit_log", "actor_id", "users", "SET NULL"),
        fk("annotation_audit_log", "batch_id", "batches", "SET NULL"),
        fk("annotation_audit_log", "token_id", "tokens", "CASCADE"),
    )
    op.create_index("ix_audit_token_layer", "annotation_audit_log", ["token_id", "layer"])


def downgrade() -> None:
    for table in (
        "annotation_audit_log", "gold_annotations", "annotations", "batch_permissions",
        "batch_sentences", "batches", "tokens", "sentences", "documents", "nesting_rules",
        "entity_types", "project_members", "projects", "users",
    ):
        op.drop_table(table)
    bind = op.get_bind()
    for name in ENUMS:
        pg.ENUM(name=name).drop(bind, checkfirst=True)

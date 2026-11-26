"""Annotation schema: one row per (token, layer, annotator), including O."""

from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def _enum(cls: type[enum.Enum], name: str) -> Enum:
    return Enum(cls, name=name, values_callable=lambda e: [m.value for m in e])


class NerMode(str, enum.Enum):
    flat = "flat"
    nested = "nested"


class ProjectRole(str, enum.Enum):
    owner = "owner"
    annotator = "annotator"
    adjudicator = "adjudicator"


class BatchPurpose(str, enum.Enum):
    annotation = "annotation"
    iaa = "iaa"
    gold = "gold"


class BatchAccess(str, enum.Enum):
    edit = "edit"
    view = "view"


class TagPrefix(str, enum.Enum):
    B = "B"
    I = "I"  # noqa: E741
    E = "E"
    S = "S"
    O = "O"


class GoldSource(str, enum.Enum):
    consensus = "consensus"  # all annotators agreed -> auto-promoted
    adjudicated = "adjudicated"  # resolved by an adjudicator


class AuditAction(str, enum.Enum):
    create = "create"
    update = "update"
    delete = "delete"
    promote = "promote"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class User(TimestampMixin, Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    display_name: Mapped[str] = mapped_column(String(100))
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(server_default="true")


class Project(TimestampMixin, Base):
    __tablename__ = "projects"
    __table_args__ = (CheckConstraint("num_layers BETWEEN 1 AND 10", name="num_layers_range"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text)
    ner_mode: Mapped[NerMode] = mapped_column(_enum(NerMode, "ner_mode"))
    num_layers: Mapped[int] = mapped_column(SmallInteger, server_default="1")
    tokenizer: Mapped[str] = mapped_column(String(50), server_default="myword")
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class ProjectMember(Base):
    __tablename__ = "project_members"
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[ProjectRole] = mapped_column(_enum(ProjectRole, "project_role"))


class EntityType(Base):
    __tablename__ = "entity_types"
    __table_args__ = (UniqueConstraint("project_id", "code"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    code: Mapped[str] = mapped_column(String(50))
    label: Mapped[str] = mapped_column(String(100))
    group_name: Mapped[str | None] = mapped_column(String(50))  # for result summaries only
    color: Mapped[str | None] = mapped_column(String(9))
    description: Mapped[str | None] = mapped_column(Text)


class NestingRule(Base):
    """Allowed parent -> child type pairs (Table 3.2)."""

    __tablename__ = "nesting_rules"
    __table_args__ = (UniqueConstraint("project_id", "parent_type_id", "child_type_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    parent_type_id: Mapped[int] = mapped_column(ForeignKey("entity_types.id", ondelete="CASCADE"))
    child_type_id: Mapped[int] = mapped_column(ForeignKey("entity_types.id", ondelete="CASCADE"))


class Document(TimestampMixin, Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255))
    source: Mapped[str | None] = mapped_column(String(100))  # myfinener / wikipedia / ...
    source_url: Mapped[str | None] = mapped_column(Text)  # kept for CC BY-SA attribution
    license: Mapped[str | None] = mapped_column(String(50))
    meta: Mapped[dict | None] = mapped_column(JSONB)


class Sentence(Base):
    __tablename__ = "sentences"
    __table_args__ = (UniqueConstraint("document_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id", ondelete="CASCADE"))
    position: Mapped[int]
    text: Mapped[str] = mapped_column(Text)


class Token(Base):
    __tablename__ = "tokens"
    __table_args__ = (UniqueConstraint("sentence_id", "position"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    sentence_id: Mapped[int] = mapped_column(ForeignKey("sentences.id", ondelete="CASCADE"))
    position: Mapped[int]
    text: Mapped[str] = mapped_column(String(200))
    pos_tag: Mapped[str | None] = mapped_column(String(20))  # myPOS


class Batch(TimestampMixin, Base):
    __tablename__ = "batches"
    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200))
    purpose: Mapped[BatchPurpose] = mapped_column(_enum(BatchPurpose, "batch_purpose"))


class BatchSentence(Base):
    __tablename__ = "batch_sentences"
    batch_id: Mapped[int] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), primary_key=True
    )
    sentence_id: Mapped[int] = mapped_column(
        ForeignKey("sentences.id", ondelete="CASCADE"), primary_key=True
    )


class BatchPermission(Base):
    __tablename__ = "batch_permissions"
    batch_id: Mapped[int] = mapped_column(
        ForeignKey("batches.id", ondelete="CASCADE"), primary_key=True
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    access: Mapped[BatchAccess] = mapped_column(_enum(BatchAccess, "batch_access"))


class Annotation(Base):
    """One BIOES tag for one token, one layer, one annotator, within one batch."""

    __tablename__ = "annotations"
    __table_args__ = (
        UniqueConstraint("batch_id", "token_id", "layer", "annotator_id"),
        CheckConstraint("layer >= 1", name="layer_positive"),
        CheckConstraint(
            "(prefix = 'O') = (entity_type_id IS NULL)", name="prefix_type_match"
        ),
        Index("ix_annotations_batch_annotator", "batch_id", "annotator_id"),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id", ondelete="CASCADE"))
    token_id: Mapped[int] = mapped_column(ForeignKey("tokens.id", ondelete="CASCADE"))
    layer: Mapped[int] = mapped_column(SmallInteger)
    annotator_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    prefix: Mapped[TagPrefix] = mapped_column(_enum(TagPrefix, "tag_prefix"))
    entity_type_id: Mapped[int | None] = mapped_column(ForeignKey("entity_types.id"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class GoldAnnotation(Base):
    __tablename__ = "gold_annotations"
    __table_args__ = (
        UniqueConstraint("token_id", "layer"),
        CheckConstraint("layer >= 1", name="layer_positive"),
        CheckConstraint(
            "(prefix = 'O') = (entity_type_id IS NULL)", name="prefix_type_match"
        ),
    )
    id: Mapped[int] = mapped_column(primary_key=True)
    token_id: Mapped[int] = mapped_column(ForeignKey("tokens.id", ondelete="CASCADE"))
    layer: Mapped[int] = mapped_column(SmallInteger)
    prefix: Mapped[TagPrefix] = mapped_column(_enum(TagPrefix, "tag_prefix"))
    entity_type_id: Mapped[int | None] = mapped_column(ForeignKey("entity_types.id"))
    source: Mapped[GoldSource] = mapped_column(_enum(GoldSource, "gold_source"))
    resolved_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    resolved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AnnotationAuditLog(Base):
    """Edit history of every annotation (spec §13)."""

    __tablename__ = "annotation_audit_log"
    __table_args__ = (Index("ix_audit_token_layer", "token_id", "layer"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[AuditAction] = mapped_column(_enum(AuditAction, "audit_action"))
    target_table: Mapped[str] = mapped_column(String(30))  # annotations | gold_annotations
    target_id: Mapped[int | None]
    batch_id: Mapped[int | None] = mapped_column(ForeignKey("batches.id", ondelete="SET NULL"))
    token_id: Mapped[int] = mapped_column(ForeignKey("tokens.id", ondelete="CASCADE"))
    layer: Mapped[int] = mapped_column(SmallInteger)
    old_value: Mapped[dict | None] = mapped_column(JSONB)
    new_value: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

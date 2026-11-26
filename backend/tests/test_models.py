from app.models import Base

EXPECTED_TABLES = {
    "users",
    "projects",
    "project_members",
    "entity_types",
    "entity_type_catalog",
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
}


def test_all_tables_registered() -> None:
    assert EXPECTED_TABLES == set(Base.metadata.tables)

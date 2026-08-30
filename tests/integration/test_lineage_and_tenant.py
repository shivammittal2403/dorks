from apps.api.app.domain import SourceClass
from apps.api.app.services import AuditSink, authorize_execution


def test_blocked_execution_is_audited(project):
    audit = AuditSink()
    try:
        authorize_execution(project, "outside.invalid", SourceClass.WEB_SEARCH, "u1", audit)
    except PermissionError:
        pass
    assert audit.events[-1].tenant_id == "t1" and audit.events[-1].outcome == "blocked"


def test_lineage_shape():
    lineage = {
        "finding": "F-1",
        "evidence": "E-1",
        "normalized_result": "N-1",
        "query_run": "R-1",
        "query_version": "Q-1-v1",
        "provider": "mock-v1",
        "target": "www.example.com",
        "timestamp": "2026-01-01T00:00:00Z",
    }
    assert all(lineage.values()) and len(lineage) == 8

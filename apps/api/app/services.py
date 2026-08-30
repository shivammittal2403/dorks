from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import uuid4

from apps.api.app.domain import ProjectContext, SourceClass
from packages.security import enforce_scope


@dataclass
class AuditEvent:
    event_id: str
    tenant_id: str
    project_id: str
    actor_id: str
    action: str
    outcome: str
    reason: str
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))


class AuditSink:
    def __init__(self):
        self.events: list[AuditEvent] = []

    def record(
        self, project: ProjectContext, actor_id: str, action: str, outcome: str, reason: str
    ):
        self.events.append(
            AuditEvent(
                str(uuid4()),
                project.tenant_id,
                project.project_id,
                actor_id,
                action,
                outcome,
                reason,
            )
        )


def authorize_execution(
    project: ProjectContext, target: str, source_class: SourceClass, actor_id: str, audit: AuditSink
) -> None:
    decision = enforce_scope(project, target, source_class)
    audit.record(
        project,
        actor_id,
        "query.execute",
        "allowed" if decision.allowed else "blocked",
        decision.reason,
    )
    if not decision.allowed:
        raise PermissionError(decision.reason)

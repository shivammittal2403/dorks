from celery import Celery

from apps.api.app.domain import ProjectContext, SourceClass
from apps.api.app.services import AuditSink, authorize_execution

celery = Celery("qi-orchestrator")
celery.conf.update(
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_default_retry_delay=10,
    task_routes={"orchestrate_query": {"queue": "provider"}},
    broker_transport_options={"visibility_timeout": 3600},
)


@celery.task(
    bind=True,
    name="orchestrate_query",
    autoretry_for=(TimeoutError,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
)
def orchestrate_query(
    self, project_payload: dict, target: str, source_class: str, actor_id: str, idempotency_key: str
):
    project = ProjectContext.model_validate(project_payload)
    audit = AuditSink()
    authorize_execution(project, target, SourceClass(source_class), actor_id, audit)
    return {
        "status": "authorized",
        "idempotency_key": idempotency_key,
        "audit": audit.events[-1].__dict__,
    }

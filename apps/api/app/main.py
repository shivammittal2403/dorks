from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, generate_latest
from starlette.responses import Response

from apps.api.app.domain import AIConclusion, RiskFactors
from packages.risk_engine import score_risk

app = FastAPI(title="Query Intelligence & OSINT Evidence API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type", "X-Tenant-ID", "X-Project-ID"],
)
REQUESTS = Counter("qi_http_requests_total", "API requests", ["route"])


def context(tenant: str | None, project: str | None):
    if not tenant or not project:
        raise HTTPException(400, "tenant and project context required")


@app.get("/healthz")
def health():
    REQUESTS.labels("healthz").inc()
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/v1/risk/score")
def risk(
    payload: RiskFactors,
    x_tenant_id: str | None = Header(None),
    x_project_id: str | None = Header(None),
):
    context(x_tenant_id, x_project_id)
    return score_risk(payload).__dict__


@app.post("/v1/ai/validate")
def validate_ai(
    payload: AIConclusion,
    x_tenant_id: str | None = Header(None),
    x_project_id: str | None = Header(None),
):
    context(x_tenant_id, x_project_id)
    return {"valid": True, "conclusion": payload}

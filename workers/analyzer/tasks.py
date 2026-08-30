from celery import Celery

from apps.api.app.domain import AIConclusion, RiskFactors
from packages.risk_engine import score_risk

celery = Celery("qi-analyzer")


@celery.task(name="analyze_finding")
def analyze_finding(ai_payload: dict, factors: dict):
    conclusion = AIConclusion.model_validate(ai_payload)
    risk = score_risk(RiskFactors.model_validate(factors))
    return {"conclusion": conclusion.model_dump(mode="json"), "risk": risk.__dict__}

from dataclasses import dataclass

from apps.api.app.domain import RiskFactors

WEIGHTS = {
    "exposure": 0.25,
    "sensitivity": 0.20,
    "exploitability": 0.15,
    "business_impact": 0.15,
    "asset_criticality": 0.10,
    "confidence": 0.10,
    "recurrence": 0.05,
}
LABELS = {
    1: "Critical",
    2: "Severe",
    3: "High",
    4: "Significant",
    5: "Moderate-High",
    6: "Moderate",
    7: "Low-Moderate",
    8: "Low",
    9: "Context",
    10: "Benign",
}


@dataclass(frozen=True)
class RiskScore:
    score: float
    priority: str
    label: str
    ruleset_version: str
    override_reason: str | None = None


def _priority(score: float) -> int:
    if score >= 90:
        return 1
    if score >= 80:
        return 2
    if score >= 70:
        return 3
    if score >= 60:
        return 4
    if score >= 50:
        return 5
    if score >= 40:
        return 6
    if score >= 30:
        return 7
    if score >= 20:
        return 8
    if score >= 10:
        return 9
    return 10


def score_risk(
    factors: RiskFactors,
    ruleset_version: str = "2026.1",
    mandatory_priority: int | None = None,
    override_reason: str | None = None,
) -> RiskScore:
    value = round(sum(getattr(factors, k) * w for k, w in WEIGHTS.items()), 2)
    priority = mandatory_priority or _priority(value)
    if mandatory_priority is not None and not (1 <= mandatory_priority <= 10):
        raise ValueError("priority must be P1-P10")
    return RiskScore(value, f"P{priority}", LABELS[priority], ruleset_version, override_reason)

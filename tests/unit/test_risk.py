from apps.api.app.domain import RiskFactors
from packages.risk_engine import score_risk


def test_reproducible_weighted_score():
    result = score_risk(
        RiskFactors(
            exposure=100,
            sensitivity=80,
            exploitability=60,
            business_impact=60,
            asset_criticality=100,
            confidence=90,
            recurrence=20,
        )
    )
    assert result.score == 79 and result.priority == "P3" and result.ruleset_version == "2026.1"


def test_override_is_auditable():
    result = score_risk(
        RiskFactors(**{k: 0 for k in RiskFactors.model_fields}),
        mandatory_priority=2,
        override_reason="customer rule",
    )
    assert result.priority == "P2" and result.override_reason

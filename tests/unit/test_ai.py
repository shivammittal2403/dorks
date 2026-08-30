from packages.ai_router import AIMode, route_ai
from packages.ai_router.router import consensus_requires_review


def test_balanced_escalates_high_priority():
    assert "openai" in route_ai(AIMode.BALANCED, 0.9, 3, False, False, 10).providers


def test_sensitive_stays_local():
    assert route_ai(AIMode.BEST_QUALITY, 0.2, 1, True, True, 100).providers == ("ollama",)


def test_disagreement_requires_review():
    assert consensus_requires_review(
        [
            {"classification": "a", "priority_candidate": "P3"},
            {"classification": "b", "priority_candidate": "P3"},
        ]
    )

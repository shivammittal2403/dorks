from dataclasses import dataclass
from enum import StrEnum


class AIMode(StrEnum):
    LOCAL_ONLY = "local_only"
    ECONOMY = "economy"
    BALANCED = "balanced"
    BEST_QUALITY = "best_quality"
    CUSTOM = "custom"


@dataclass(frozen=True)
class RouteDecision:
    providers: tuple[str, ...]
    human_review: bool
    rationale: str


def route_ai(
    mode: AIMode,
    confidence: float,
    priority: int,
    high_impact: bool,
    sensitive: bool,
    budget_remaining: float,
    premium_available: bool = True,
) -> RouteDecision:
    if sensitive or mode == AIMode.LOCAL_ONLY:
        return RouteDecision(("ollama",), high_impact, "local-only privacy policy")
    premium = budget_remaining > 0 and premium_available
    if mode == AIMode.ECONOMY and confidence >= 0.65:
        return RouteDecision(("ollama",), False, "routine local triage")
    if mode == AIMode.BALANCED and not (priority <= 4 or confidence < 0.7 or high_impact):
        return RouteDecision(("ollama",), False, "balanced local triage")
    if premium:
        providers = (
            ("ollama", "openai", "xai") if mode == AIMode.BEST_QUALITY else ("ollama", "openai")
        )
        return RouteDecision(providers, high_impact, "premium escalation policy")
    return RouteDecision(
        ("ollama",), high_impact or confidence < 0.7, "premium unavailable; fail to review"
    )


def consensus_requires_review(outputs: list[dict]) -> bool:
    if len(outputs) < 2:
        return False
    classes = {o.get("classification") for o in outputs}
    priorities = {o.get("priority_candidate") for o in outputs}
    return len(classes) > 1 or len(priorities) > 1

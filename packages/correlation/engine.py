from dataclasses import dataclass


@dataclass(frozen=True)
class CorrelationEdge:
    source_id: str
    target_id: str
    relationship: str
    score: float
    signals: tuple[str, ...]
    evidence_refs: tuple[str, ...]
    status: str = "candidate"
    analyst_confirmed: bool = False


def correlate(source: dict, target: dict, evidence_refs: list[str]) -> CorrelationEdge | None:
    signals = []
    if source.get("content_hash") and source.get("content_hash") == target.get("content_hash"):
        signals.append("content_hash_exact")
    if source.get("root_domain") and source.get("root_domain") == target.get("root_domain"):
        signals.append("root_domain_exact")
    if not signals:
        return None
    score = min(1.0, 0.65 * len(signals))
    return CorrelationEdge(
        source["id"],
        target["id"],
        "related_observation",
        score,
        tuple(signals),
        tuple(evidence_refs),
        "supported" if score >= 0.9 else "candidate",
        False,
    )

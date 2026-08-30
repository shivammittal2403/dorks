from dataclasses import dataclass
from datetime import UTC, datetime
from fnmatch import fnmatch

from apps.api.app.domain import ProjectContext, ProjectStatus, ScopeRuleType, SourceClass


@dataclass(frozen=True)
class ScopeDecision:
    allowed: bool
    reason: str


def _matches(value: str, pattern: str) -> bool:
    return value.lower() == pattern.lower() or fnmatch(value.lower(), pattern.lower())


def enforce_scope(
    project: ProjectContext, target: str, source_class: SourceClass, now: datetime | None = None
) -> ScopeDecision:
    now = now or datetime.now(UTC)
    if project.status != ProjectStatus.AUTHORIZED:
        return ScopeDecision(False, "project_not_authorized")
    if not project.attestation or not project.attestation.active(now):
        return ScopeDecision(False, "authorization_expired_or_missing")
    if source_class not in project.permitted_source_classes:
        return ScopeDecision(False, "source_class_not_permitted")
    relevant = [
        r
        for r in project.rules
        if _matches(target, r.value) and (not r.source_classes or source_class in r.source_classes)
    ]
    if any(r.rule_type == ScopeRuleType.DENY for r in relevant):
        return ScopeDecision(False, "explicit_deny")
    if not any(r.rule_type == ScopeRuleType.ALLOW for r in relevant):
        return ScopeDecision(False, "no_matching_allow_rule")
    return ScopeDecision(True, "authorized")

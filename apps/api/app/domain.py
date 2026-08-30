from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field, HttpUrl, model_validator


class SourceClass(StrEnum):
    WEB_SEARCH = "web_search"
    CODE_SEARCH = "code_search"
    INFRASTRUCTURE = "infrastructure"
    DNS_RDAP = "dns_rdap"
    CERTIFICATE_TRANSPARENCY = "certificate_transparency"
    PUBLIC_ARCHIVE = "public_archive"
    PUBLIC_SOCIAL = "public_social"
    PUBLIC_MESSAGING = "public_messaging"
    THREAT_INTELLIGENCE = "threat_intelligence"
    PACKAGE_ECOSYSTEM = "package_ecosystem"
    CUSTOM = "custom"


class ProjectStatus(StrEnum):
    DRAFT = "draft"
    AUTHORIZED = "authorized"
    PAUSED = "paused"
    CLOSED = "closed"


class ScopeRuleType(StrEnum):
    ALLOW = "allow"
    DENY = "deny"


class ScopeRule(BaseModel):
    rule_type: ScopeRuleType
    asset_type: str
    value: str
    source_classes: set[SourceClass] = Field(default_factory=set)


class AuthorizationAttestation(BaseModel):
    authorized_by: str
    authority_reference: str = Field(min_length=3)
    valid_from: datetime
    valid_until: datetime

    @model_validator(mode="after")
    def valid_window(self):
        if self.valid_until <= self.valid_from:
            raise ValueError("invalid authorization window")
        return self

    def active(self, now: datetime | None = None) -> bool:
        now = now or datetime.now(UTC)
        vf = self.valid_from if self.valid_from.tzinfo else self.valid_from.replace(tzinfo=UTC)
        vu = self.valid_until if self.valid_until.tzinfo else self.valid_until.replace(tzinfo=UTC)
        return vf <= now <= vu


class ProjectContext(BaseModel):
    tenant_id: str
    project_id: str
    status: ProjectStatus
    rules: list[ScopeRule]
    attestation: AuthorizationAttestation | None = None
    permitted_source_classes: set[SourceClass] = Field(default_factory=set)


class QueryTemplate(BaseModel):
    query_id: str
    source_class: SourceClass
    provider: str
    category: str
    subcategory: str = ""
    description: str
    template: str
    input_schema: dict[str, Any]
    expected_evidence_type: str
    risk_baseline: int = Field(ge=0, le=100)
    confidence_baseline: float = Field(ge=0, le=1)
    quality_score: float = Field(ge=0, le=1)
    freshness: str = "unknown"
    provider_support: list[str]
    requires_auth: bool = True
    allowed_use: str = "authorized_assessment"
    source_reference: str
    status: str = "active"
    version: int = 1
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    last_verified_at: datetime | None = None


class NormalizedResult(BaseModel):
    result_id: str
    tenant_id: str
    project_id: str
    query_run_id: str
    provider: str
    source_uri: HttpUrl
    canonical_uri: str
    host: str
    title: str = ""
    snippet: str = ""
    content_hash: str
    observed_at: datetime
    raw_result_ref: str
    provenance_refs: list[str]


class AIConclusion(BaseModel):
    finding_id: str
    classification: str
    title: str
    evidence_summary: str
    confidence: float = Field(ge=0, le=1)
    false_positive_probability: float = Field(ge=0, le=1)
    business_impact: str
    technical_impact: str
    priority_candidate: str = Field(pattern=r"^P(?:10|[1-9])$")
    verification_required: bool
    recommended_action: str
    reasoning_summary: str
    evidence_refs: list[str] = Field(min_length=1)


class RiskFactors(BaseModel):
    exposure: float = Field(ge=0, le=100)
    sensitivity: float = Field(ge=0, le=100)
    exploitability: float = Field(ge=0, le=100)
    business_impact: float = Field(ge=0, le=100)
    asset_criticality: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=100)
    recurrence: float = Field(ge=0, le=100)

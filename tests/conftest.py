from datetime import UTC, datetime, timedelta

import pytest

from apps.api.app.domain import (
    AuthorizationAttestation,
    ProjectContext,
    ProjectStatus,
    ScopeRule,
    ScopeRuleType,
    SourceClass,
)


@pytest.fixture
def project():
    now = datetime.now(UTC)
    return ProjectContext(
        tenant_id="t1",
        project_id="p1",
        status=ProjectStatus.AUTHORIZED,
        attestation=AuthorizationAttestation(
            authorized_by="owner",
            authority_reference="AUTH-1",
            valid_from=now - timedelta(days=1),
            valid_until=now + timedelta(days=1),
        ),
        permitted_source_classes={SourceClass.WEB_SEARCH},
        rules=[
            ScopeRule(
                rule_type=ScopeRuleType.ALLOW,
                asset_type="domain",
                value="*.example.com",
                source_classes={SourceClass.WEB_SEARCH},
            ),
            ScopeRule(
                rule_type=ScopeRuleType.DENY, asset_type="domain", value="private.example.com"
            ),
        ],
    )

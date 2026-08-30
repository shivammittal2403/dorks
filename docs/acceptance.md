# Acceptance matrix

| Requirement | Evidence |
|---|---|
| Mandatory scope and deny precedence | `tests/unit/test_security.py`, `tests/integration/test_lineage_and_tenant.py` |
| Provider adapters and capability declarations | `packages/provider_sdk/base.py` |
| Normalization and duplicate provenance | `packages/query_engine/canonicalize.py`, importer tests, schema indexes |
| Evidence lineage | migration foreign keys and lineage integration test |
| Strict AI output and fail-closed routing | `AIConclusion`, `/v1/ai/validate`, AI router tests |
| Versioned reproducible P1–P10 | risk engine tests and immutable `risk_ruleset`/`risk_score` |
| High-impact disagreement review | consensus test and router decision |
| Audit-ready CSV/JSON/XLSX | reporting tests |
| Tenant isolation | PostgreSQL RLS policies and context requirement |
| SSRF protection | URL guard tests |
| CI without live providers | `.github/workflows/ci.yml` |
| Docker deployment | `docker-compose.yml` health dependencies |

Not claimed by the deterministic local suite: live OIDC/provider/KMS integrations, multi-node load/failure testing, browser E2E against the full Compose stack, live premium-model consensus, external penetration testing, and Kubernetes disaster-recovery rehearsal. These require deployment credentials and an authorized staging environment.

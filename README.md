# Query Intelligence & OSINT Evidence Platform

Production-oriented reference implementation of the **Dork + OSINT Query Intelligence & Evidence Platform** for authorized assessments. Google dorking is treated as one query subtype inside a provider-neutral, evidence-first workflow.

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- Web: http://localhost:3000
- API docs: http://localhost:8000/docs
- Metrics: http://localhost:8000/metrics
- MinIO console: http://localhost:9001
- Grafana: http://localhost:3001

For a dependency-only local check: `python -m pytest`. Tests use deterministic fixtures and no live providers.

## Safety boundary

No provider execution occurs without an active tenant/project, a current authorization attestation, matching allow rules, source-class permission, a healthy provider, and available quota. Deny rules win. Redirects and private/link-local/reserved destinations are blocked. Imported query assets that indicate authentication bypass, credential/token harvesting, exploitation, persistence, destructive actions, private access, or quota bypass are quarantined rather than activated.

See [docs/architecture.md](docs/architecture.md), [docs/security.md](docs/security.md), [docs/operations.md](docs/operations.md), and [docs/acceptance.md](docs/acceptance.md).

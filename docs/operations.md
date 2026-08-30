# Operations

## Local deployment

Copy `.env.example` to `.env`, replace all placeholder secrets, and run `docker compose up --build`. Apply demo data only in a disposable environment with `psql -f database/seeds/demo.sql`. Ollama is optional; without it, AI work remains queued/review-required. Premium adapters remain disabled until explicit tenant configuration, a budget, and provider credentials exist.

## Production

Replace Compose dependencies with managed PostgreSQL, Redis, object storage, OIDC, KMS/vault, and an egress proxy. Pin images by digest. Expand the Kubernetes base with approved egress policies, PodDisruptionBudgets, autoscaling, external secrets, migration jobs, backups, and ingress TLS. Set `app.tenant_id` and `app.project_id` from verified claims inside every database transaction.

Metrics expose request, queue, provider latency/error/rate-limit, query yield, dedup ratio, evidence volume, AI routing/cost/schema rejection, false-positive, risk distribution, review age, webhook failure, and retention deletion counts. Logs are structured and exclude queries/evidence by default. Alerts should cover unavailable authorization services, provider error budgets, queue age, storage/KMS failures, isolation-policy errors, and audit-chain verification.

Back up PostgreSQL and encrypted object storage independently. Quarterly restore tests must prove evidence hashes and lineage survive. Retention workers tombstone database references and delete object versions according to the shortest applicable policy, while retaining minimal immutable deletion audit events.

# Architecture

The implementation preserves the Master Product Specification pipeline:

`Scope → Planner → Query → Provider → Normalize → Deduplicate → Evidence → Deterministic Analysis → AI Router → Correlation → Finding → Risk → Report`

The FastAPI control plane owns tenant/project context and authorization. Celery workers isolate provider execution, analysis, and reporting. PostgreSQL row-level security adds a database boundary to application-level tenant checks; `app.tenant_id` must be set at transaction start. Redis supplies queues and idempotency coordination. MinIO stores encrypted evidence and report artifacts by opaque reference. Next.js is a standalone, server-rendered client.

Provider adapters declare source classes, native operations, authentication, rate/cost/pagination models, evidence restrictions, retention restrictions, and adapter version. No component assumes Google syntax. Production adapters remain configuration-driven; CI exercises deterministic fixtures only.

Every finding follows `Finding → Evidence → Normalized Result → Query Run → Query Template + Version → Provider → Target → Timestamp`. Immutable version rows capture query, prompt, model, risk rules, report schema, and adapter identity.

## Production defaults where the specification is silent

- UUID primary keys and UTC timestamps.
- 180-day project evidence retention and 365-day tenant administrative retention; shorter provider limits win.
- PostgreSQL RLS plus explicit tenant/project headers derived from verified OIDC claims.
- At-least-once jobs with idempotency keys, late acknowledgement, three exponential retries, and a dead-letter queue in production queue policy.
- Evidence encryption uses KMS-managed envelope keys; credentials store only vault references.
- Weak correlations remain candidates until analyst confirmation.

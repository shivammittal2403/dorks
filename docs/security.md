# Security and authorized-use controls

## Mandatory gates

Before query execution, the application verifies: authenticated OIDC identity; tenant membership and RBAC permission; active project; active authorization attestation; matching target allow rule; absence of a matching deny rule; permitted source class; healthy configured provider; provider credentials and permission; rate limit and tenant/global quota; budget; idempotency; and retention/privacy policy. Every allow and block is audited.

Deny rules override allows. Redirects are revalidated at every hop. Retrieval accepts HTTP/S only, rejects userinfo and nonstandard ports, resolves every address, and blocks loopback, private, link-local, reserved, multicast, and unspecified networks. Production egress policy should permit only approved provider endpoints and public targets.

## Prohibited capabilities

Authentication bypass, credential/token harvesting, private-account/community access without explicit integration, exploitation, persistence, destructive actions, and quota bypass are not implemented. Asset import uses a conservative deny classifier. Prohibited records are retained as quarantined provenance—not activated and not silently deleted.

AI receives redacted normalized evidence, never raw secrets. Strict schema validation fails closed. Stored AI data includes conclusions, concise auditable rationale, evidence references, provider/model/prompt versions, scores, cost, and status; hidden chain-of-thought is never requested or persisted. Sensitive cases remain local. High-impact disagreement enters human review.

Audit events are append-only and hash-chain ready. Webhooks require HMAC signatures, timestamps, replay protection, and secret-vault references. Evidence access must create audit events and use short-lived signed object URLs.

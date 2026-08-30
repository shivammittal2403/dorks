# Supplied query asset review

The supplied archives were treated as untrusted inputs. They contain GHDB XML, CSV collections, general Google dork lists, and third-party tools, but also large collections explicitly aimed at passwords, tokens, SQL injection, XSS/LFI/RFI, carding, admin access, and target lists. Those unsafe collections are excluded from demo/active seeds.

The platform supports XML, CSV, and JSON imports with source references, normalization, exact duplicate collapse, and a conservative quarantine classifier. All accepted records remain `candidate` until analyst approval and provider-capability validation. Imported targets are never copied into reusable templates. The original archives are not redistributed by this repository.

Permitted examples should describe public, non-invasive evidence discovery inside an attested target scope—for example public documentation formats or certificate-transparency names. Even permitted templates cannot execute until the project and provider gates pass.

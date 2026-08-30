import hashlib
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import idna

TRACKING = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "gclid",
    "fbclid",
}


def canonicalize_host(host: str) -> str:
    value = host.strip().rstrip(".").lower()
    return idna.encode(value).decode("ascii")


def canonicalize_url(url: str) -> str:
    p = urlsplit(url.strip())
    host = canonicalize_host(p.hostname or "")
    port = (
        f":{p.port}"
        if p.port
        and not (
            (p.scheme.lower() == "http" and p.port == 80)
            or (p.scheme.lower() == "https" and p.port == 443)
        )
        else ""
    )
    query = urlencode(
        sorted(
            (k, v)
            for k, v in parse_qsl(p.query, keep_blank_values=True)
            if k.lower() not in TRACKING
        )
    )
    path = p.path or "/"
    return urlunsplit((p.scheme.lower(), host + port, path, query, ""))


def content_hash(value: bytes | str) -> str:
    return hashlib.sha256(value.encode() if isinstance(value, str) else value).hexdigest()

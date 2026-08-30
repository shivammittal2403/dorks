import ipaddress
import socket
from urllib.parse import urlsplit


class URLGuardError(ValueError):
    pass


def _public(ip: str) -> bool:
    addr = ipaddress.ip_address(ip)
    return addr.is_global and not any(
        (
            addr.is_private,
            addr.is_loopback,
            addr.is_link_local,
            addr.is_multicast,
            addr.is_reserved,
            addr.is_unspecified,
        )
    )


def validate_public_url(url: str, resolver=socket.getaddrinfo) -> str:
    parsed = urlsplit(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise URLGuardError("only public http(s) URLs are permitted")
    if parsed.username or parsed.password:
        raise URLGuardError("userinfo is prohibited")
    if parsed.port and parsed.port not in {80, 443}:
        raise URLGuardError("nonstandard ports are prohibited")
    try:
        addresses = {
            item[4][0]
            for item in resolver(
                parsed.hostname,
                parsed.port or (443 if parsed.scheme == "https" else 80),
                type=socket.SOCK_STREAM,
            )
        }
    except socket.gaierror as exc:
        raise URLGuardError("hostname resolution failed") from exc
    if not addresses or not all(_public(ip) for ip in addresses):
        raise URLGuardError("protected network destination blocked")
    return url

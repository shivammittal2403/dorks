import pytest

from apps.api.app.domain import SourceClass
from packages.security.scope import enforce_scope
from packages.security.url_guard import URLGuardError, validate_public_url


def resolver(ip):
    return lambda *args, **kwargs: [(None, None, None, None, (ip, 443))]


def test_scope_allow_and_deny(project):
    assert enforce_scope(project, "www.example.com", SourceClass.WEB_SEARCH).allowed
    assert (
        enforce_scope(project, "private.example.com", SourceClass.WEB_SEARCH).reason
        == "explicit_deny"
    )
    assert not enforce_scope(project, "outside.example.net", SourceClass.WEB_SEARCH).allowed


def test_ssrf_blocks_private_and_userinfo():
    with pytest.raises(URLGuardError):
        validate_public_url("http://127.0.0.1", resolver("127.0.0.1"))
    with pytest.raises(URLGuardError):
        validate_public_url("https://user:pass@example.com", resolver("8.8.8.8"))
    assert validate_public_url("https://example.com", resolver("8.8.8.8"))

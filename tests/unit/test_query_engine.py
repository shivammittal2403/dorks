from packages.query_engine import canonicalize_url, import_records


def test_canonicalization_and_provenance():
    assert (
        canonicalize_url("HTTPS://Example.COM:443/a?utm_source=x&b=2&a=1#frag")
        == "https://example.com/a?a=1&b=2"
    )


def test_importer_quarantines_unsafe_and_deduplicates():
    payload = '[{"query":"site:{domain} ext:pdf"},{"query":"find password files"},{"query":"site:{domain} ext:pdf"}]'
    rows = import_records(payload, "json", "fixture.json")
    assert len(rows) == 2 and rows[0].status == "candidate" and rows[1].status == "quarantined"
    assert all(row.source_reference == "fixture.json" for row in rows)

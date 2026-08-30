from io import BytesIO

from openpyxl import load_workbook

from packages.reporting import export_csv, export_json, export_xlsx


def test_reports_generate():
    findings = [
        {"Finding ID": "F-1", "Finding Title": "Expected public document", "Risk P1-P10": "P9"}
    ]
    assert b"F-1" in export_csv(findings) and b'"schema_version"' in export_json(findings)
    assert load_workbook(BytesIO(export_xlsx(findings))).active["A2"].value == "F-1"

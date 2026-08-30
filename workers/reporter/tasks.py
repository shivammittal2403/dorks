from celery import Celery

from packages.reporting import export_csv, export_json, export_xlsx

celery = Celery("qi-reporter")


@celery.task(name="generate_report")
def generate_report(findings: list[dict], kind: str):
    exporters = {"json": export_json, "csv": export_csv, "xlsx": export_xlsx}
    if kind not in exporters:
        raise ValueError("unsupported report type")
    payload = exporters[kind](findings)
    return {"kind": kind, "bytes": len(payload)}

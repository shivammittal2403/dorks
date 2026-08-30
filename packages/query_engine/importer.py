import csv
import io
import json
import re
from dataclasses import dataclass

from defusedxml import ElementTree

PROHIBITED = re.compile(
    r"(?i)(password|credential|token|auth(?:entication)?\s*bypass|sql\s*inject|\bsqli\b|\bxss\b|\blfi\b|\brfi\b|exploit|carding|private\s+account|bot\s+token|destructive|persistence|quota\s+bypass)"
)


@dataclass(frozen=True)
class ImportDecision:
    template: str
    source_reference: str
    status: str
    reason: str


def _decision(template: str, source: str) -> ImportDecision:
    value = " ".join(template.split())
    if not value:
        return ImportDecision(value, source, "rejected", "empty")
    if PROHIBITED.search(value) or PROHIBITED.search(source):
        return ImportDecision(value, source, "quarantined", "prohibited_use_pattern")
    return ImportDecision(value, source, "candidate", "requires_analyst_approval")


def import_records(payload: str, fmt: str, source_reference: str) -> list[ImportDecision]:
    if fmt == "xml":
        root = ElementTree.fromstring(payload)
        values = [
            (n.text or "")
            for n in root.iter()
            if n.tag.lower().split("}")[-1] in {"query", "url", "dork"}
        ]
    elif fmt == "csv":
        rows = csv.DictReader(io.StringIO(payload))
        values = [
            next(
                (str(v) for k, v in r.items() if k and k.lower() in {"query", "dork", "url"} and v),
                "",
            )
            for r in rows
        ]
    elif fmt == "json":
        data = json.loads(payload)
        data = data if isinstance(data, list) else data.get("queries", [])
        values = [
            str(x.get("template", x.get("query", ""))) if isinstance(x, dict) else str(x)
            for x in data
        ]
    else:
        raise ValueError("supported formats: xml, csv, json")
    seen = set()
    output = []
    for value in values:
        decision = _decision(value, source_reference)
        key = decision.template.casefold()
        if key and key not in seen:
            seen.add(key)
            output.append(decision)
    return output

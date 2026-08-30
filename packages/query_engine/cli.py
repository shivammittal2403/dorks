import argparse
import json
from pathlib import Path

from .importer import import_records


def main():
    parser = argparse.ArgumentParser(description="Safely inspect query assets")
    parser.add_argument("path", type=Path)
    parser.add_argument("--format", choices=["xml", "csv", "json"], required=True)
    args = parser.parse_args()
    rows = import_records(
        args.path.read_text(encoding="utf-8", errors="replace"), args.format, str(args.path)
    )
    print(json.dumps([r.__dict__ for r in rows], indent=2))


if __name__ == "__main__":
    main()

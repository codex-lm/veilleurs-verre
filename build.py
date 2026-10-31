#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

template = (SRC / "index.template.html").read_text(encoding="utf-8")
replacements = {
    "/*__STYLES__*/": (SRC / "styles.css").read_text(encoding="utf-8"),
    "/*__ENGINE__*/": (SRC / "engine.js").read_text(encoding="utf-8"),
    "/*__GAME__*/": (SRC / "game.js").read_text(encoding="utf-8"),
}
for marker, content in replacements.items():
    if marker not in template:
        raise RuntimeError(f"Missing template marker: {marker}")
    template = template.replace(marker, content)
(ROOT / "index.html").write_text(template, encoding="utf-8", newline="\n")
print(f"Built index.html ({len(template.encode('utf-8'))} bytes)")

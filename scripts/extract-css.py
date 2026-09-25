"""One-off helper for step 6: pulls prefixed rule blocks out of app/globals.css.

Usage: python3 scripts/extract-css.py
Writes the extracted files and prints what went where. Safe to re-run.
"""
import re, sys

SRC = "app/globals.css"
css = open(SRC).read()

# --- tiny CSS block parser -------------------------------------------------
def parse(text):
    """Returns a list of nodes: {'kind': 'rule'|'at'|'comment', 'head', 'body', 'children'}"""
    i, n = 0, len(text)
    nodes = []
    buf = ""
    while i < n:
        c = text[i]
        if text.startswith("/*", i):
            j = text.index("*/", i) + 2
            if buf.strip():
                pass
            nodes.append({"kind": "comment", "text": text[i:j]})
            i = j
            continue
        if c == "{":
            head = buf.strip()
            buf = ""
            depth, j = 1, i + 1
            while depth:
                if text.startswith("/*", j):
                    j = text.index("*/", j) + 2
                    continue
                if text[j] == "{": depth += 1
                elif text[j] == "}": depth -= 1
                j += 1
            body = text[i + 1 : j - 1]
            if head.startswith("@media") or head.startswith("@supports") or head.startswith("@container"):
                nodes.append({"kind": "at", "head": head, "children": parse(body)})
            else:
                nodes.append({"kind": "rule", "head": head, "body": body})
            i = j
            continue
        buf += c
        i += 1
    return nodes

nodes = parse(css)

def sel_matches(head, patterns):
    return any(re.search(p, head) for p in patterns)

def render(node, indent=""):
    if node["kind"] == "comment":
        return indent + node["text"] + "\n"
    if node["kind"] == "rule":
        body = node["body"].strip("\n")
        lines = [indent + "  " + l.strip() for l in body.strip().splitlines() if l.strip()]
        return f"{indent}{node['head']} {{\n" + "\n".join(lines) + f"\n{indent}}}\n"
    inner = "".join(render(c, indent + "  ") for c in node["children"])
    return f"{indent}{node['head']} {{\n{inner}{indent}}}\n"

def collect(patterns):
    out, anims = [], set()
    for node in nodes:
        if node["kind"] == "rule" and sel_matches(node["head"], patterns):
            out.append(node)
            anims.update(re.findall(r"animation(?:-name)?\s*:\s*([a-zA-Z][\w-]*)", node["body"]))
        elif node["kind"] == "at":
            kids = [c for c in node["children"] if c["kind"] == "rule" and sel_matches(c["head"], patterns)]
            if kids:
                out.append({"kind": "at", "head": node["head"], "children": kids})
                for k in kids:
                    anims.update(re.findall(r"animation(?:-name)?\s*:\s*([a-zA-Z][\w-]*)", k["body"]))
    # keyframes referenced
    for node in nodes:
        if node["kind"] == "rule" and node["head"].startswith("@keyframes"):
            name = node["head"].split()[1]
            if name in anims:
                out.append(node)
    return out

TARGETS = {
    "src/components/case-study/visuals/equalall-diagrams.css": [r"\.eaff-", r"\.eagap-"],
    "src/components/case-study/visuals/outcome-impact.css": [r"\.oiv-", r"\.outcome-impact"],
    "src/components/case-study/visuals/flat-list.css": [r"\.flat-list-scroll"],
}

HEADER = "/* Extracted from app/globals.css in the v2 migration. Prefixed rules only. */\n\n"
for path, patterns in TARGETS.items():
    picked = collect(patterns)
    text = HEADER + "\n".join(render(n) for n in picked)
    text = re.sub(r"\n{3,}", "\n\n", text)
    open(path, "w").write(text)
    print(f"{path}: {len(picked)} blocks, {text.count(chr(10))} lines")

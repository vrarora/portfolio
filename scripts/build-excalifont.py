"""
Builds the Excalifont pen font for the case-study boards. Excalifont is an
outline font (SIL Open Font License), so each glyph ships two shapes:

- contours: the closed outline, which is what the reader finally sees
- strokes: centre lines in writing order, which the pen follows

Strokes come from thinning a raster of the glyph down to its skeleton, then
tracing that skeleton into lines. The board reveals the outline through the
strokes drawn wide, so the letter appears under the pen as it moves.

Run: python3 scripts/build-excalifont.py
Debug sheet: python3 scripts/build-excalifont.py --sheet out.png
"""
import json
import math
import sys
from pathlib import Path

import numpy as np
from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont

SOURCE = Path("scripts/fonts/Excalifont-Regular.woff2")
OUT = Path("src/components/v3/board/pen/excalifont.ts")

# Points per curve segment, and how far (font units) a simplified line may drift
STEPS = 4
TOLERANCE = 3.0

# Raster scale for skeletons, in px per font unit, and the margin around each glyph
SCALE = 0.25
MARGIN = 4


def simplify(points, tolerance):
    """Ramer-Douglas-Peucker: drops points that sit within `tolerance` of the line through their neighbours."""
    if len(points) < 3:
        return points
    (x0, y0), (x1, y1) = points[0], points[-1]
    dx, dy = x1 - x0, y1 - y0
    length = (dx * dx + dy * dy) ** 0.5 or 1.0
    far, index = 0.0, 0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        d = abs(dy * x - dx * y + x1 * y0 - y1 * x0) / length
        if d > far:
            far, index = d, i
    if far <= tolerance:
        return [points[0], points[-1]]
    return simplify(points[: index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)


def simplify_closed(points, tolerance):
    """Splits a closed contour at the point farthest from its start, so both halves have distinct ends."""
    x0, y0 = points[0]
    split = max(range(len(points)), key=lambda i: (points[i][0] - x0) ** 2 + (points[i][1] - y0) ** 2)
    first = simplify(points[: split + 1], tolerance)
    second = simplify(points[split:] + [points[0]], tolerance)
    return first[:-1] + second


class ContourPen(BasePen):
    def __init__(self, glyph_set):
        super().__init__(glyph_set)
        self.contours = []
        self.current = None

    def _moveTo(self, pt):
        self.current = [pt]
        self.contours.append(self.current)

    def _lineTo(self, pt):
        self.current.append(pt)

    def _qCurveToOne(self, pt1, pt2):
        p0 = self.current[-1]
        for i in range(1, STEPS + 1):
            t = i / STEPS
            u = 1 - t
            self.current.append((u * u * p0[0] + 2 * u * t * pt1[0] + t * t * pt2[0], u * u * p0[1] + 2 * u * t * pt1[1] + t * t * pt2[1]))

    def _curveToOne(self, pt1, pt2, pt3):
        p0 = self.current[-1]
        for i in range(1, STEPS + 1):
            t = i / STEPS
            u = 1 - t
            self.current.append(
                (
                    u**3 * p0[0] + 3 * u * u * t * pt1[0] + 3 * u * t * t * pt2[0] + t**3 * pt3[0],
                    u**3 * p0[1] + 3 * u * u * t * pt1[1] + 3 * u * t * t * pt2[1] + t**3 * pt3[1],
                )
            )

    def _closePath(self):
        self.current = None


# Raster and skeleton


class Frame:
    """Maps font units (y up) to raster pixels (y down) for one glyph."""

    def __init__(self, contours):
        xs = [x for c in contours for x, _ in c]
        ys = [y for c in contours for _, y in c]
        self.x0, self.y1 = min(xs), max(ys)
        self.w = int(math.ceil((max(xs) - self.x0) * SCALE)) + MARGIN * 2
        self.h = int(math.ceil((self.y1 - min(ys)) * SCALE)) + MARGIN * 2

    def to_px(self, x, y):
        return (x - self.x0) * SCALE + MARGIN, (self.y1 - y) * SCALE + MARGIN

    def to_font(self, px, py):
        return (px - MARGIN) / SCALE + self.x0, self.y1 - (py - MARGIN) / SCALE


def rasterize(contours, frame):
    """Fills the glyph with the nonzero rule, sampling each pixel at its centre."""
    edges = []
    for c in contours:
        pts = [frame.to_px(x, y) for x, y in c]
        for (ax, ay), (bx, by) in zip(pts, pts[1:] + pts[:1]):
            if ay != by:
                edges.append((ax, ay, bx, by))
    img = np.zeros((frame.h, frame.w), dtype=np.uint8)
    for row in range(frame.h):
        yc = row + 0.5
        hits = []
        for ax, ay, bx, by in edges:
            if (ay <= yc < by) or (by <= yc < ay):
                hits.append((ax + (yc - ay) * (bx - ax) / (by - ay), 1 if by > ay else -1))
        hits.sort()
        winding = 0
        for (xa, wa), (xb, _) in zip(hits, hits[1:]):
            winding += wa
            if winding:
                img[row, max(0, int(math.ceil(xa - 0.5))) : max(0, int(math.ceil(xb - 0.5)))] = 1
    return img


def thin(img):
    """Zhang-Suen thinning down to a one-pixel skeleton."""
    img = img.copy()
    while True:
        changed = False
        for step in (0, 1):
            p = np.pad(img, 1)
            n = [p[:-2, 1:-1], p[:-2, 2:], p[1:-1, 2:], p[2:, 2:], p[2:, 1:-1], p[2:, :-2], p[1:-1, :-2], p[:-2, :-2]]
            count = sum(n)
            turns = sum(((n[k] == 0) & (n[(k + 1) % 8] == 1)).astype(np.uint8) for k in range(8))
            if step == 0:
                side = (n[0] * n[2] * n[4] == 0) & (n[2] * n[4] * n[6] == 0)
            else:
                side = (n[0] * n[2] * n[6] == 0) & (n[0] * n[4] * n[6] == 0)
            drop = (img == 1) & (count >= 2) & (count <= 6) & (turns == 1) & side
            if drop.any():
                img[drop] = 0
                changed = True
        if not changed:
            return img


# Skeleton graph

NEIGHBOURS = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def polyline_length(path):
    return sum(math.dist(a, b) for a, b in zip(path, path[1:]))


def trace(skeleton):
    """Splits the skeleton into edges between nodes (ends and junctions). Returns edges and loose loops."""
    pixels = {(int(x), int(y)) for y, x in zip(*np.nonzero(skeleton))}
    near = {p: [(p[0] + dx, p[1] + dy) for dy, dx in NEIGHBOURS if (p[0] + dx, p[1] + dy) in pixels] for p in pixels}

    # Adjacent junction pixels form one node

    node_of = {}
    for p in pixels:
        if len(near[p]) != 2 and p not in node_of:
            stack, node_of[p] = [p], len(set(node_of.values()))
            while stack:
                q = stack.pop()
                for r in near[q]:
                    if len(near[r]) != 2 and r not in node_of:
                        node_of[r] = node_of[p]
                        stack.append(r)

    edges, walked = [], set()
    for start in [p for p in pixels if p in node_of]:
        for first in near[start]:
            if first in node_of and node_of[first] == node_of[start]:
                continue
            if (start, first) in walked:
                continue
            path, prev, cur = [start, first], start, first
            while cur not in node_of:
                step = [r for r in near[cur] if r != prev and r not in path[-3:]]
                if not step:
                    break
                prev, cur = cur, step[0]
                path.append(cur)
            walked.update({(path[0], path[1]), (path[-1], path[-2])})
            walked.update(zip(path, path[1:]))
            walked.update(zip(path[1:], path))
            end = node_of.get(path[-1], -1 - len(edges))
            edges.append({"path": path, "ends": [node_of[start], end]})

    # Pixels no edge reached are closed loops with no junction, like the ring of an "o"

    seen = {p for e in edges for p in e["path"]} | set(node_of)
    loops = []
    for p in pixels:
        if p in seen:
            continue
        path, prev, cur = [p], None, p
        while True:
            seen.add(cur)
            step = [r for r in near[cur] if r != prev and r not in seen]
            if not step:
                break
            prev, cur = cur, step[0]
            path.append(cur)
        if len(path) > 2:
            loops.append(path)
    return edges, loops


def prune(edges, spur):
    """Drops short branches that hang off a junction, the whiskers thinning leaves at blunt ends."""
    while True:
        degree = {}
        for e in edges:
            for n in e["ends"]:
                degree[n] = degree.get(n, 0) + 1
        cut = [
            e
            for e in edges
            if polyline_length(e["path"]) < spur
            and any(degree[n] == 1 for n in e["ends"])
            and any(degree[n] >= 3 for n in e["ends"])
        ]
        if not cut:
            return edges
        edges = [e for e in edges if e not in cut[:1]]


def heading(path, reach):
    """Direction leaving the path's first point, measured `reach` px along it."""
    x0, y0 = path[0]
    for x, y in path[1:]:
        if math.dist((x0, y0), (x, y)) >= reach:
            break
    length = math.dist((x0, y0), (x, y)) or 1.0
    return (x - x0) / length, (y - y0) / length


def join(edges, reach):
    """Links edges through each node along the straightest continuation, so a pen stroke runs through junctions."""
    ends = {}
    for i, e in enumerate(edges):
        for side, n in enumerate(e["ends"]):
            path = e["path"] if side == 0 else e["path"][::-1]
            ends.setdefault(n, []).append(((i, side), heading(path, reach)))

    partner = {}
    for n, items in ends.items():
        pairs = []
        for a in range(len(items)):
            for b in range(a + 1, len(items)):
                (ka, (ax, ay)), (kb, (bx, by)) = items[a], items[b]
                pairs.append((ax * bx + ay * by, ka, kb))
        pairs.sort()
        for cos, ka, kb in pairs:
            if ka in partner or kb in partner:
                continue
            if cos < -0.4 or len(items) == 2:
                partner[ka], partner[kb] = kb, ka

    strokes, used = [], set()

    def follow(i, side):
        """Walks from edge i's `side` end through linked edges. Returns the pixel run."""
        run = []
        while i not in used:
            used.add(i)
            path = edges[i]["path"] if side == 0 else edges[i]["path"][::-1]
            run.extend(path if not run else path[1:])
            nxt = partner.get((i, 1 - side))
            if nxt is None:
                break
            i, side = nxt
        return run

    for i in range(len(edges)):
        for side in (0, 1):
            if i not in used and (i, side) not in partner:
                strokes.append((follow(i, side), False))
    for i in range(len(edges)):
        if i not in used:
            strokes.append((follow(i, 0), True))
    return strokes


# Shaping strokes into writing order


def smooth(points, closed, passes=2):
    pts = [tuple(map(float, p)) for p in points]
    for _ in range(passes):
        if closed:
            pts = [((a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4) for a, b, c in zip(pts[-1:] + pts[:-1], pts, pts[1:] + pts[:1])]
        elif len(pts) > 2:
            pts = [pts[0]] + [((a[0] + 2 * b[0] + c[0]) / 4, (a[1] + 2 * b[1] + c[1]) / 4) for a, b, c in zip(pts, pts[1:], pts[2:])] + [pts[-1]]
    return pts


def orient(points, closed):
    """Starts a stroke where a hand would: at the top for tall strokes, at the left for flat ones, and loops at their top, anticlockwise."""
    if closed:
        area = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(points, points[1:] + points[:1]))
        if area > 0:
            points = points[::-1]
        top = min(range(len(points)), key=lambda i: (points[i][1], points[i][0]))
        return points[top:] + points[:top]
    (ax, ay), (bx, by) = points[0], points[-1]
    tall = abs(by - ay) > abs(bx - ax) * 0.5
    flip = by < ay if tall else bx < ax
    return points[::-1] if flip else points


def skeletonize(contours):
    frame = Frame(contours)
    ink = rasterize(contours, frame)
    return frame, ink, thin(ink)


def stroke_weight(glyphs):
    """The font's stroke thickness in px: ink area over skeleton length, the median across letters."""
    ratios = []
    for contours in glyphs:
        _, ink, skeleton = skeletonize(contours)
        ratios.append(ink.sum() / max(1, skeleton.sum()))
    return sorted(ratios)[len(ratios) // 2]


def centre_lines(contours, weight):
    """Returns the glyph's strokes in font units, in writing order, and the width that covers the outline.
    `weight` is the font's stroke thickness in px, which scales the whisker, heading and dot checks."""
    frame, ink, skeleton = skeletonize(contours)
    if not skeleton.any():
        return [], 0

    edges, loops = trace(skeleton)
    edges = prune(edges, weight * 1.2)
    runs = join(edges, max(3.0, weight)) + [(loop, True) for loop in loops]

    strokes = []
    for run, closed in runs:
        if len(run) < 2:
            run = [run[0], (run[0][0] + 1, run[0][1])]
        pts = orient(smooth(run, closed), closed)
        strokes.append((pts + pts[:1] if closed else pts, closed))

    # A short stroke lying on a longer one is a thinning leftover where the outline overlaps itself

    dot = weight * 2.0

    def covered(short, long):
        dense = resample(long, 1.0)
        return all(min(math.dist(p, q) for q in dense) < weight * 1.5 for p in short)

    strokes = [
        (pts, closed)
        for pts, closed in strokes
        if polyline_length(pts) >= dot or not any(o is not pts and polyline_length(o) > polyline_length(pts) and covered(pts, o) for o, _ in strokes)
    ]

    # Dots such as the tittle of "i" come last; everything else runs left to right, top first

    def order(stroke):
        pts = stroke[0]
        return (polyline_length(pts) < dot, pts[0][0] + 0.5 * pts[0][1])

    strokes.sort(key=order)

    # The reveal width is twice the farthest any inked pixel sits from a stroke

    dense = np.array([p for s, _ in strokes for p in resample(s, 1.0)])
    filled = np.argwhere(ink == 1)[:, ::-1] + 0.5
    reach = 0.0
    for chunk in np.array_split(filled, max(1, len(filled) // 2000)):
        d = np.sqrt(((chunk[:, None, :] - dense[None, :, :]) ** 2).sum(-1)).min(1)
        reach = max(reach, float(d.max()))

    in_font = []
    for pts, closed in strokes:
        pts = [frame.to_font(x, y) for x, y in pts]
        in_font.append(simplify_closed(pts[:-1], TOLERANCE) + pts[:1] if closed else simplify(pts, TOLERANCE))
    return in_font, (reach * 2 + 2) / SCALE


def resample(points, step):
    out = [points[0]]
    for a, b in zip(points, points[1:]):
        n = max(1, int(math.dist(a, b) / step))
        out.extend((a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n) for k in range(1, n + 1))
    return out


# Glyphs the font lacks, drawn as strokes in font units

# Rupee sign sized to Excalifont's figures (about 700 units tall), in writing order
RUPEE = [
    [(50, 690), (200, 695), (360, 693), (500, 686)],
    [(50, 540), (200, 545), (360, 543), (490, 536)],
    [(150, 690), (262, 683), (332, 648), (352, 588), (322, 518), (242, 468), (132, 450), (92, 448), (432, -10)],
]
RUPEE_ADVANCE = 560


def boundary(ink):
    """Traces the edges between inked and blank pixels into closed loops. Holes wind the other way, so nonzero fill keeps them open."""
    h, w = ink.shape
    padded = np.pad(ink, 1)
    out = {}
    for y, x in zip(*np.nonzero(ink)):
        py, px = y + 1, x + 1
        if not padded[py - 1, px]:
            out.setdefault((x, y), []).append((x + 1, y))
        if not padded[py, px + 1]:
            out.setdefault((x + 1, y), []).append((x + 1, y + 1))
        if not padded[py + 1, px]:
            out.setdefault((x + 1, y + 1), []).append((x, y + 1))
        if not padded[py, px - 1]:
            out.setdefault((x, y + 1), []).append((x, y))
    loops = []
    while out:
        start = next(iter(out))
        loop, cur = [start], start
        while True:
            nxt = out[cur].pop()
            if not out[cur]:
                del out[cur]
            if nxt == start:
                break
            loop.append(nxt)
            cur = nxt
        loops.append(loop)
    return loops


def drawn_glyph(strokes, weight):
    """Inks strokes at the font's stroke weight. Returns contours, strokes and reveal like a traced glyph."""
    from PIL import Image, ImageDraw

    half = weight / SCALE / 2 + 2 / SCALE
    xs = [x for st in strokes for x, _ in st]
    ys = [y for st in strokes for _, y in st]
    frame = Frame([[(min(xs) - half, min(ys) - half), (max(xs) + half, max(ys) + half)]])
    image = Image.new("L", (frame.w, frame.h), 0)
    draw = ImageDraw.Draw(image)
    r = weight / 2
    for st in strokes:
        pts = [frame.to_px(x, y) for x, y in st]
        draw.line(pts, fill=1, width=max(1, round(weight)), joint="curve")
        for x, y in (pts[0], pts[-1]):
            draw.ellipse([x - r, y - r, x + r, y + r], fill=1)
    ink = np.array(image, dtype=np.uint8)
    contours = [simplify_closed([frame.to_font(x, y) for x, y in smooth(loop, True, passes=3)], TOLERANCE) for loop in boundary(ink)]
    return contours, strokes, (weight + 4) / SCALE


def sheet(entries, path):
    """Draws every glyph's outline with its numbered strokes, to check the traces by eye."""
    from PIL import Image, ImageDraw

    cell, cols, s = 150, 12, 0.11
    rows = math.ceil(len(entries) / cols)
    image = Image.new("RGB", (cols * cell, rows * cell), "white")
    draw = ImageDraw.Draw(image)
    for k, (ch, contours, strokes) in enumerate(entries):
        ox, oy = (k % cols) * cell + 20, (k // cols) * cell + 115

        def at(x, y):
            return ox + x * s, oy - y * s

        for c in contours:
            draw.polygon([at(*p) for p in c], outline=(190, 190, 190))
        for n, st in enumerate(strokes):
            hue = [(224, 49, 49), (47, 158, 68), (28, 126, 214), (240, 140, 0), (132, 94, 247)][n % 5]
            pts = [at(*p) for p in st]
            draw.line(pts, fill=hue, width=2)
            draw.ellipse([pts[0][0] - 3, pts[0][1] - 3, pts[0][0] + 3, pts[0][1] + 3], fill=hue)
            draw.text((pts[0][0] + 4, pts[0][1] - 12), str(n + 1), fill=hue)
        draw.text(((k % cols) * cell + 4, (k // cols) * cell + 4), ch, fill=(0, 0, 0))
    image.save(path)


font = TTFont(SOURCE)
glyph_set = font.getGlyphSet()
cmap = font.getBestCmap()
hmtx = font["hmtx"]

def outline(ch):
    pen = ContourPen(glyph_set)
    glyph_set[cmap[ord(ch)]].draw(pen)
    return [c for c in pen.contours if len(c) > 2]


WEIGHT = stroke_weight(outline(ch) for ch in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

lines, entries = [], []
for code in range(32, 127):
    name = cmap.get(code)
    if name is None:
        continue
    raw = outline(chr(code))
    contours = [simplify_closed(c, TOLERANCE) for c in raw]
    strokes, reveal = centre_lines(raw, WEIGHT) if raw else ([], 0)
    entries.append((chr(code), contours, strokes))

    flat = lambda shapes: json.dumps([[round(v) for pt in shape for v in pt] for shape in shapes], separators=(",", ":"))
    lines.append(f"  {json.dumps(chr(code))}: [{hmtx[name][0]}, {flat(contours)}, {flat(strokes)}, {round(reveal)}],")

contours, strokes, reveal = drawn_glyph(RUPEE, WEIGHT)
entries.append(("₹", contours, strokes))
lines.append(f'  "₹": [{RUPEE_ADVANCE}, {flat(contours)}, {flat(strokes)}, {round(reveal)}],')

if "--sheet" in sys.argv:
    sheet(entries, sys.argv[sys.argv.index("--sheet") + 1])

OUT.write_text(
    f"""/**
 * Generated by scripts/build-excalifont.py. Do not edit by hand.
 *
 * Glyphs from Excalifont by Excalidraw, SIL Open Font License 1.1.
 * Each entry is [advance, contours, strokes, reveal] in font units
 * ({font["head"].unitsPerEm} per em, y up, baseline 0). Contours are the closed
 * outline as flat x,y lists. Strokes are centre lines in writing order.
 * Reveal is the stroke width that covers the whole outline.
 */
export const UNITS_PER_EM = {font["head"].unitsPerEm};

type Shape = readonly number[];

export const GLYPHS: Record<string, readonly [number, readonly Shape[], readonly Shape[], number]> = {{
""" + "\n".join(lines) + "\n};\n"
)
print(f"Wrote {len(lines)} glyphs to {OUT}")

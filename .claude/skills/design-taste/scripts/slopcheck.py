#!/usr/bin/env python3
"""slopcheck - find the visual tics that mark a page as AI-generated.

Reads .html/.css/.jsx/.tsx/.vue/.svelte and reports, with line numbers, the
patterns that show up in almost every LLM-designed page: violet gradients,
gradient-filled headlines, glassmorphism, emoji standing in for icons, three
identical feature cards, ad-hoc spacing, marketing filler copy.

Nothing here is forbidden. Each finding is a place where a default was left
untouched, which is what makes pages look alike. The fix is always to make a
deliberate choice instead - `--explain <id>` says what the choice is.

Usage:
  slopcheck.py page.html src/            scan files and directories
  slopcheck.py page.html --json          machine-readable output
  slopcheck.py --explain gradient-text   what to do about one finding
  slopcheck.py --list                    every rule
Exit code is 1 when a high-severity tell is found, so it can gate a build.
"""

import argparse
import json
import os
import re
import sys
from collections import defaultdict

EXTS = {".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte", ".astro"}

EMOJI = re.compile(
    "[\U0001F300-\U0001FAFF\U0001F900-\U0001F9FF☀-➿⬀-⯿️✨⚡]"
)

# ---------------------------------------------------------------- rules -----
# id, severity, pattern, what it looks like, what to do instead
RULES = [
    (
        "gradient-text", "high",
        r"(background-clip\s*:\s*text|-webkit-text-fill-color\s*:\s*transparent|\bbg-clip-text\b|\btext-transparent\b)",
        "Headline painted with a gradient",
        "Gradient type is the single loudest tell. Set one ink colour and let size, "
        "weight and spacing carry the emphasis. If the headline still feels flat, the "
        "typeface is the problem, not the colour.",
    ),
    (
        "violet-gradient", "high",
        r"(linear|radial|conic)-gradient\([^)]*\b(purple|violet|indigo|fuchsia)\b|"
        r"\bfrom-(purple|violet|indigo|fuchsia)-\d|\bto-(purple|violet|indigo|fuchsia|pink)-\d",
        "Purple/indigo gradient",
        "The violet-to-pink ramp is the default of every AI page. Derive the palette "
        "from something real - a photograph, a product, a book cover, a place - and "
        "name where it came from in a comment so the choice survives edits.",
    ),
    (
        "glassmorphism", "high",
        r"backdrop-filter\s*:\s*blur|\bbackdrop-blur\b|-webkit-backdrop-filter",
        "Frosted glass panel",
        "Glass only means something over real depth - a photo, a video, content "
        "scrolling underneath. Over a flat background it is blur for its own sake. "
        "Use an opaque surface with a considered border instead.",
    ),
    (
        "blob-blur", "medium",
        r"filter\s*:\s*blur\(\s*(?:[6-9]\d|\d{3,})px|\bblur-3xl\b|\bblur-\[\d{3,}px\]",
        "Giant blurred colour blob in the background",
        "Decorative blobs are texture with no information. If the background needs "
        "life, use grain, a hairline grid, a real image, or nothing.",
    ),
    (
        "hero-badge", "medium",
        r"(?i)(class=\"[^\"]*\b(badge|pill|chip)\b[^\"]*\"[^>]*>\s*[^<]{0,40}(new|now|introducing|announcing|beta|v\d))"
        r"|>\s*[✨\U0001F680\U0001F389]\s*(new|introducing|announcing)",
        "\"Introducing / New\" pill above the headline",
        "Everyone ships this pill. If the announcement matters, give it a real line "
        "of copy in the page; if it does not, delete it.",
    ),
    (
        "emoji-icon", "medium",
        None,  # handled by scan_emoji
        "Emoji used as an interface icon",
        "Emoji render differently on every platform and read as placeholder. Use a "
        "real icon set (Lucide, Phosphor, Heroicons), or drop icons entirely - most "
        "feature lists read better as plain type.",
    ),
    (
        "three-cards", "medium",
        r"grid-template-columns\s*:\s*repeat\(\s*3\s*,|\bgrid-cols-3\b|\bmd:grid-cols-3\b|\blg:grid-cols-3\b",
        "Three equal feature cards in a row",
        "The three-card row is the layout of last resort: it says nothing about "
        "which item matters. Rank the content - lead with the strongest at full "
        "width, or use an asymmetric split, or a plain list.",
    ),
    (
        "hover-scale", "low",
        r"hover:scale-1\d\d|transform\s*:\s*scale\(1\.0[3-9]\)|:hover[^{]*\{[^}]*scale\(",
        "Everything grows slightly on hover",
        "Uniform hover-scale is motion applied without meaning. Move only what is "
        "actually interactive, and prefer a change of colour, border or elevation.",
    ),
    (
        "transition-all", "low",
        r"transition\s*:\s*all\b|\btransition-all\b",
        "transition: all",
        "Animating every property is how you get janky, surprising motion. Name the "
        "properties you mean: `transition: background-color 120ms ease, border-color 120ms ease`.",
    ),
    (
        "shadow-everywhere", "medium",
        r"box-shadow\s*:\s*0\s+\d+px\s+\d+px[^;]*rgba?\(0[,\s]+0[,\s]+0[,\s.\/]+0?\.[01]\d?\)|\bshadow-2xl\b|\bshadow-xl\b",
        "Big soft neutral drop shadow",
        "A shadow should say an element floats above another. If everything has one, "
        "nothing floats. Separate surfaces with background value or a 1px border, and "
        "keep shadow for what genuinely overlays - menus, dialogs, toasts.",
    ),
    (
        "inter-only", "medium",
        r"font-family\s*:\s*['\"]?Inter\b|family=Inter[:&]|\bfont-inter\b",
        "Inter as the only typeface",
        "Inter is competent and completely anonymous - it is the Helvetica of AI "
        "pages. Either pair it with a voiced display or serif face for headings, or "
        "swap it: Instrument Sans, Schibsted Grotesk, Archivo, Public Sans, "
        "Bricolage Grotesque. See references/type.md.",
    ),
    (
        "tailwind-default-palette", "low",
        r"\b(bg|text|border)-(slate|gray|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)\b",
        "Untouched Tailwind neutral palette",
        "The stock neutrals are pure grey and read cold and generic. Tint them - "
        "warm greys for editorial, blue-grey for tooling - by defining your own scale "
        "in the theme. See references/color.md.",
    ),
    (
        "filler-copy", "high",
        r"(?i)\b(lorem ipsum|supercharge|unlock the (power|potential)|take your \w+ to the next level|"
        r"seamlessly integrate|revolutioniz\w+|game.chang\w+|cutting.edge|empower(ing)? (your|teams)|"
        r"elevate your|effortlessly|blazing.fast|10x your)\b",
        "Marketing filler copy",
        "Vague superlatives are the verbal half of the same problem. Say the specific "
        "thing: what it does, for whom, what changes. Concrete copy also forces the "
        "layout to be honest about hierarchy.",
    ),
    (
        "generic-cta", "low",
        r"(?i)>\s*(get started|learn more|read more|click here|sign up free|try it now)\s*<",
        "Generic call to action",
        "\"Get Started\" tells the reader nothing about what happens next. Name the "
        "action: \"Read the setup guide\", \"See a sample report\", \"Create a project\".",
    ),
    (
        "centered-everything", "medium",
        None,  # handled by scan_centering
        "Nearly all text is centre-aligned",
        "Centred text has no consistent left edge, so the eye has nothing to track. "
        "Centre a short hero if you like, then set body copy, lists and cards flush "
        "left. Asymmetry is what makes a page look composed rather than defaulted.",
    ),
    (
        "spacing-adhoc", "medium",
        None,  # handled by scan_scales
        "Spacing values are not on a scale",
        "Many one-off pixel values mean spacing was guessed per element. Pick a scale "
        "(4 8 12 16 24 32 48 64 96) and use only those steps; the rhythm is most of "
        "what reads as 'designed'.",
    ),
    (
        "type-scale-adhoc", "medium",
        None,  # handled by scan_scales
        "Font sizes are not on a scale",
        "A page needs about five sizes, not fifteen. Build a scale by ratio (say "
        "1.25x: 14 16 20 25 31 39 49) and use the steps, so hierarchy is legible.",
    ),
    (
        "uniform-radius", "low",
        None,  # handled by scan_radius
        "One border-radius used on everything",
        "When cards, buttons, inputs and images share a radius, the page reads as one "
        "undifferentiated blob. Small controls want a smaller radius than large "
        "surfaces - or commit to square and mean it.",
    ),
]

RULE_BY_ID = {r[0]: r for r in RULES}


# ------------------------------------------------------------- helpers -----

def hex_to_hsl(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) not in (6, 8):
        return None
    try:
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return None
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0.0, 0.0, l
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    if mx == r:
        hue = ((g - b) / d + (6 if g < b else 0)) / 6
    elif mx == g:
        hue = ((b - r) / d + 2) / 6
    else:
        hue = ((r - g) / d + 4) / 6
    return hue * 360, s, l


def lines_of(text):
    return text.split("\n")


def find_line(text, index):
    return text.count("\n", 0, index) + 1


# ------------------------------------------------------- special scans ------

def scan_emoji(text, path):
    out = []
    for m in re.finditer(r">([^<>{}]{0,80})<", text):
        chunk = m.group(1)
        if EMOJI.search(chunk) and chunk.strip():
            out.append((find_line(text, m.start()), chunk.strip()[:48]))
    for m in re.finditer(r'(?:title|label|icon)\s*[:=]\s*["\']([^"\']{0,40})["\']', text):
        if EMOJI.search(m.group(1)):
            out.append((find_line(text, m.start()), m.group(1)[:48]))
    return out[:6]


def scan_centering(text, path):
    root = re.search(
        r"(?:^|[},>;])\s*(?:html|body|:root|\*)[^{},]*\{[^}]*text-align\s*:\s*center",
        text, re.M)
    if root:
        return [(find_line(text, root.start()),
                 "text-align:center set on the root element, so the whole page is centred")]
    centered = re.findall(r"text-align\s*:\s*center|\btext-center\b", text)
    left = re.findall(r"text-align\s*:\s*(left|start)|\btext-left\b", text)
    if len(centered) >= 4 and len(centered) > 2 * max(1, len(left)):
        m = re.search(r"text-align\s*:\s*center|\btext-center\b", text)
        return [(find_line(text, m.start()), f"{len(centered)} centred vs {len(left)} left-aligned")]
    return []


def scan_scales(text, path):
    findings = {}
    space = re.findall(
        r"(?:padding|margin|gap|row-gap|column-gap)[a-z-]*\s*:\s*([^;{}]+)", text)
    px = []
    for decl in space:
        px += [int(v) for v in re.findall(r"(\d+)px", decl)]
    distinct = {v for v in px if v > 0}
    if len(distinct) > 12:
        findings["spacing-adhoc"] = [(1, f"{len(distinct)} distinct px values: "
                                         f"{', '.join(str(v) for v in sorted(distinct)[:14])}...")]
    sizes = {v for v in re.findall(r"font-size\s*:\s*([\d.]+)(?:px|rem)", text)}
    if len(sizes) > 8:
        findings["type-scale-adhoc"] = [(1, f"{len(sizes)} distinct font sizes")]
    return findings


def scan_radius(text, path):
    radii = re.findall(r"border-radius\s*:\s*([\d.]+)(px|rem)", text)
    vals = defaultdict(int)
    for v, unit in radii:
        vals[f"{v}{unit}"] += 1
    if len(vals) == 1 and sum(vals.values()) >= 5:
        only = next(iter(vals))
        m = re.search(r"border-radius", text)
        return [(find_line(text, m.start()), f"{only} used {vals[only]} times, no other radius")]
    return []


# ---------------------------------------------------------------- scan ------

def scan_file(path):
    try:
        text = open(path, encoding="utf-8", errors="replace").read()
    except OSError as e:
        print(f"warning: cannot read {path}: {e}", file=sys.stderr)
        return []

    findings = []

    def add(rule_id, line, evidence):
        rid, sev, _, label, fix = RULE_BY_ID[rule_id]
        findings.append({"file": path, "line": line, "id": rid, "severity": sev,
                         "label": label, "evidence": evidence, "fix": fix})

    for rid, sev, pattern, label, fix in RULES:
        if not pattern:
            continue
        # One finding per block: three declarations of the same gradient are one
        # decision, and repeating them buries the other tells.
        reported = []
        for m in re.finditer(pattern, text):
            line = find_line(text, m.start())
            if any(abs(line - prev) <= 4 for prev in reported):
                continue
            reported.append(line)
            add(rid, line, m.group(0).strip()[:70])
            if len(reported) >= 5:
                break

    # violet palette by hue, not just by keyword
    violet_hits = []
    for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b", text):
        hsl = hex_to_hsl(m.group(0))
        if hsl and 255 <= hsl[0] <= 300 and hsl[1] > 0.35 and 0.25 < hsl[2] < 0.8:
            violet_hits.append((find_line(text, m.start()), m.group(0)))
    if len(violet_hits) >= 2:
        add("violet-gradient", violet_hits[0][0],
            "violet hues: " + ", ".join(c for _, c in violet_hits[:4]))

    for line, ev in scan_emoji(text, path):
        add("emoji-icon", line, ev)
    for line, ev in scan_centering(text, path):
        add("centered-everything", line, ev)
    for line, ev in scan_radius(text, path):
        add("uniform-radius", line, ev)
    for rid, hits in scan_scales(text, path).items():
        for line, ev in hits:
            add(rid, line, ev)

    return findings


def collect(paths):
    files = []
    for p in paths:
        if os.path.isdir(p):
            for root, dirs, names in os.walk(p):
                dirs[:] = [d for d in dirs
                           if d not in {"node_modules", ".git", "dist", "build", ".next", "vendor"}]
                files += [os.path.join(root, n) for n in names
                          if os.path.splitext(n)[1].lower() in EXTS]
        elif os.path.isfile(p):
            files.append(p)
        else:
            print(f"warning: no such path: {p}", file=sys.stderr)
    return sorted(files)


ORDER = {"high": 0, "medium": 1, "low": 2}


def report(findings, quiet_fix=False):
    if not findings:
        print("No AI-look tells found.")
        print("That is a floor, not a ceiling: the linter cannot tell whether the page "
              "has a point of view. Read references/direction.md for that.")
        return
    findings.sort(key=lambda f: (ORDER[f["severity"]], f["file"], f["line"]))
    counts = defaultdict(int)
    for f in findings:
        counts[f["severity"]] += 1

    current = None
    for f in findings:
        if f["severity"] != current:
            current = f["severity"]
            print(f"\n{current.upper()}  ({counts[current]})")
        loc = f"{f['file']}:{f['line']}"
        print(f"  {loc}  {f['id']}")
        print(f"      {f['label']} - {f['evidence']}")
        if not quiet_fix:
            for i, chunk in enumerate(wrap(f["fix"], 82)):
                print(f"      {'→ ' if i == 0 else '  '}{chunk}")
    total = len(findings)
    print(f"\n{total} tell{'s' if total != 1 else ''}: "
          f"{counts['high']} high, {counts['medium']} medium, {counts['low']} low")
    if counts["high"]:
        print("Fix the high ones first - they are the patterns readers recognise instantly.")


def wrap(s, width):
    words, lines, cur = s.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    return lines


def main():
    p = argparse.ArgumentParser(prog="slopcheck.py", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("paths", nargs="*", help="files or directories to scan")
    p.add_argument("--json", action="store_true", help="machine-readable output")
    p.add_argument("--explain", metavar="ID", help="what to do about one finding")
    p.add_argument("--list", action="store_true", dest="list_rules", help="list every rule")
    p.add_argument("--min-severity", choices=["high", "medium", "low"], default="low")
    p.add_argument("--no-fix", action="store_true", help="omit the fix text")
    args = p.parse_args()

    if args.list_rules:
        for rid, sev, _, label, _ in RULES:
            print(f"{sev:6}  {rid:26}  {label}")
        return

    if args.explain:
        r = RULE_BY_ID.get(args.explain)
        if not r:
            print(f"unknown rule: {args.explain}. Use --list to see them all.", file=sys.stderr)
            sys.exit(2)
        print(f"{r[0]}  [{r[1]}]\n{r[3]}\n")
        for chunk in wrap(r[4], 82):
            print(chunk)
        return

    if not args.paths:
        p.error("give at least one file or directory (or use --list / --explain)")

    files = collect(args.paths)
    if not files:
        print("No scannable files found (looking for: "
              + ", ".join(sorted(EXTS)) + ")", file=sys.stderr)
        sys.exit(2)

    findings = []
    for f in files:
        findings += scan_file(f)
    findings = [f for f in findings if ORDER[f["severity"]] <= ORDER[args.min_severity]]

    if args.json:
        print(json.dumps({"files_scanned": len(files), "findings": findings}, indent=2))
    else:
        print(f"slopcheck: {len(files)} file{'s' if len(files) != 1 else ''} scanned")
        report(findings, quiet_fix=args.no_fix)

    sys.exit(1 if any(f["severity"] == "high" for f in findings) else 0)


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # Piping into head/less is the normal way to read a long report.
        os.dup2(os.open(os.devnull, os.O_WRONLY), sys.stdout.fileno())
        sys.exit(0)
    except KeyboardInterrupt:
        sys.exit(130)

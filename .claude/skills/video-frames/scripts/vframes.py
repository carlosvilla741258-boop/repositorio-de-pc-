#!/usr/bin/env python3
"""vframes - turn a video into screenshots Claude can actually look at.

Only dependency is ffmpeg/ffprobe. Every command prints a short human-readable
summary plus the paths it produced, so the calling agent knows what to read next.

Subcommands:
  info     metadata (duration, fps, resolution, streams)
  frames   extract screenshots (interval / count / fps / scenes / keyframes)
  sheet    build labelled contact sheets from extracted frames
  grab     one full-resolution screenshot at a timestamp, optionally cropped
  audio    extract the audio track for transcription
"""

import argparse
import json
import math
import os
import re
import shutil
import subprocess
import sys

FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/TTF/DejaVuSans.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
]


def die(msg, code=1):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(code)


def need(tool):
    if shutil.which(tool) is None:
        die(
            f"{tool} not found. Install it first:\n"
            "  Debian/Ubuntu: apt-get install -y ffmpeg\n"
            "  macOS:         brew install ffmpeg\n"
            "  Windows:       winget install Gyan.FFmpeg"
        )


def font_file():
    for f in FONT_CANDIDATES:
        if os.path.exists(f):
            return f
    return None


def run(cmd, capture_stderr=True):
    proc = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE if capture_stderr else None,
        text=True,
        errors="replace",
    )
    if proc.returncode != 0:
        tail = "\n".join((proc.stderr or "").strip().splitlines()[-15:])
        die(f"command failed: {' '.join(cmd[:3])} ...\n{tail}")
    return proc


def probe(video):
    need("ffprobe")
    if not os.path.exists(video):
        die(f"no such file: {video}")
    proc = run(
        [
            "ffprobe", "-v", "error", "-print_format", "json",
            "-show_format", "-show_streams", video,
        ]
    )
    data = json.loads(proc.stdout)
    video_streams = [s for s in data.get("streams", []) if s.get("codec_type") == "video"]
    if not video_streams:
        die(f"{video} has no video stream")
    v = video_streams[0]
    fmt = data.get("format", {})

    def ratio(value):
        try:
            num, den = value.split("/")
            return float(num) / float(den) if float(den) else 0.0
        except Exception:
            return 0.0

    duration = float(fmt.get("duration") or v.get("duration") or 0.0)
    return {
        "path": video,
        "duration": duration,
        "fps": round(ratio(v.get("avg_frame_rate", "0/0")), 3),
        "width": v.get("width"),
        "height": v.get("height"),
        "video_codec": v.get("codec_name"),
        "audio_codec": next(
            (s.get("codec_name") for s in data.get("streams", []) if s.get("codec_type") == "audio"),
            None,
        ),
        "size_mb": round(float(fmt.get("size", 0)) / 1e6, 2),
        "raw": data,
    }


def hms(seconds):
    seconds = max(0.0, float(seconds))
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def stamp_name(t, ext):
    return f"t_{t:09.3f}.{ext}"


# ---------------------------------------------------------------- frames ----

def parse_showinfo(stderr):
    """Real presentation timestamps of the frames ffmpeg just wrote, in order."""
    return [float(m) for m in re.findall(r"pts_time:([0-9.]+)", stderr)]


def extract(video, out_dir, vfilter, start, duration, width, ext, quality,
            max_frames, extra_input_args=None):
    need("ffmpeg")
    os.makedirs(out_dir, exist_ok=True)
    for old in os.listdir(out_dir):
        if re.match(r"^(t_|raw_)", old):
            os.remove(os.path.join(out_dir, old))

    chain = [vfilter] if vfilter else []
    if width:
        chain.append(f"scale={width}:-2:flags=lanczos")
    chain.append("showinfo")

    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y"]
    if start:
        cmd += ["-ss", f"{start}"]
    cmd += list(extra_input_args or [])
    cmd += ["-i", video]
    if duration:
        cmd += ["-t", f"{duration}"]
    cmd += ["-vf", ",".join(chain), "-fps_mode", "passthrough"]
    if max_frames:
        cmd += ["-frames:v", str(max_frames)]
    if ext in ("jpg", "jpeg"):
        cmd += ["-q:v", str(quality)]
    cmd += [os.path.join(out_dir, f"raw_%06d.{ext}")]

    proc = run(cmd)
    times = parse_showinfo(proc.stderr)

    raws = sorted(f for f in os.listdir(out_dir) if f.startswith("raw_"))
    written = []
    for i, raw in enumerate(raws):
        t = (times[i] if i < len(times) else 0.0) + (start or 0.0)
        dest = os.path.join(out_dir, stamp_name(t, ext))
        os.replace(os.path.join(out_dir, raw), dest)
        written.append((t, dest))
    return written


def cmd_frames(args):
    info = probe(args.video)
    start = args.start or 0.0
    end = args.end if args.end is not None else info["duration"]
    span = max(0.0, end - start)

    if args.mode == "count":
        # Divide the window into n equal slices and take the first frame of
        # each, so the screenshots are evenly spread no matter the duration.
        n = max(1, args.count)
        step = span / n if span else 0.0
        vfilter = f"fps=1/{step:.6f}" if step > 0 else None
        max_frames = n
    elif args.mode == "interval":
        vfilter = f"fps=1/{args.every:.6f}"
        max_frames = args.max_frames
    elif args.mode == "fps":
        vfilter = f"fps={args.fps}"
        max_frames = args.max_frames
    elif args.mode == "scenes":
        vfilter = f"select='eq(n\\,0)+gt(scene\\,{args.threshold})'"
        max_frames = args.max_frames
    elif args.mode == "keyframes":
        vfilter = None
        max_frames = args.max_frames
    else:
        die(f"unknown mode {args.mode}")

    extra = ["-skip_frame", "nokey"] if args.mode == "keyframes" else None
    out_dir = args.out or os.path.join(
        os.path.dirname(os.path.abspath(args.video)) or ".",
        os.path.splitext(os.path.basename(args.video))[0] + "_frames",
    )
    written = extract(
        args.video, out_dir, vfilter, start, span or None, args.width,
        args.format, args.quality, max_frames, extra,
    )

    if not written:
        die(
            "no frames extracted. For scene mode try a lower --threshold "
            "(0.1-0.2 for slow footage); otherwise check --start/--end."
        )

    print(f"video    : {args.video}")
    print(f"duration : {hms(info['duration'])}  ({info['width']}x{info['height']} @ {info['fps']}fps)")
    print(f"mode     : {args.mode}")
    print(f"frames   : {len(written)} -> {out_dir}")
    if max_frames and len(written) == max_frames and args.mode != "count":
        print(f"note     : hit the --max-frames cap ({max_frames}); coverage may be partial")
    print()
    for t, path in written:
        print(f"  {hms(t)}  {os.path.basename(path)}")
    return out_dir


# ----------------------------------------------------------------- sheet ----

def frame_list(path):
    if os.path.isdir(path):
        files = sorted(
            os.path.join(path, f)
            for f in os.listdir(path)
            if f.startswith("t_") and f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        if not files:
            die(f"no t_*.jpg/png frames in {path} - run `vframes.py frames` first")
        return files
    return [path]


def time_of(path):
    m = re.search(r"t_([0-9.]+)\.", os.path.basename(path))
    return float(m.group(1)) if m else 0.0


def cmd_sheet(args):
    need("ffmpeg")
    frames = frame_list(args.frames)
    per_sheet = args.per_sheet
    cols = args.cols
    tile_w = args.tile_width
    tile_h = int(round(tile_w * args.tile_ratio / 2)) * 2
    font = font_file()
    out_dir = args.out or (args.frames if os.path.isdir(args.frames) else ".")
    os.makedirs(out_dir, exist_ok=True)

    sheets = []
    chunks = [frames[i:i + per_sheet] for i in range(0, len(frames), per_sheet)]
    for idx, chunk in enumerate(chunks, 1):
        cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y"]
        for f in chunk:
            cmd += ["-i", f]

        parts, labels = [], []
        for i, f in enumerate(chunk):
            label = hms(time_of(f))[:-4]  # hh:mm:ss
            step = [
                f"[{i}:v]scale={tile_w}:{tile_h}:force_original_aspect_ratio=decrease",
                f"pad={tile_w}:{tile_h}:(ow-iw)/2:(oh-ih)/2:color=black",
            ]
            if font:
                text = label.replace(":", "\\:")
                step.append(
                    f"drawtext=fontfile='{font}':text='{text}':x=6:y=6:"
                    f"fontsize={max(12, tile_w // 26)}:fontcolor=white:"
                    "box=1:boxcolor=black@0.65:boxborderw=5"
                )
            parts.append(",".join(step) + f"[v{i}]")
            labels.append(label)

        rows = math.ceil(len(chunk) / cols)
        layout = "|".join(
            f"{(i % cols) * tile_w}_{(i // cols) * tile_h}" for i in range(len(chunk))
        )
        inputs = "".join(f"[v{i}]" for i in range(len(chunk)))
        if len(chunk) > 1:
            parts.append(f"{inputs}xstack=inputs={len(chunk)}:layout={layout}:fill=black[out]")
            out_label = "[out]"
        else:
            out_label = "[v0]"

        dest = os.path.join(out_dir, f"sheet_{idx:02d}.jpg")
        cmd += ["-filter_complex", ";".join(parts), "-map", out_label,
                "-frames:v", "1", "-q:v", str(args.quality), dest]
        run(cmd)
        sheets.append((dest, labels, cols, rows))

    print(f"frames   : {len(frames)}")
    print(f"sheets   : {len(sheets)} ({cols} columns, up to {per_sheet} tiles each)")
    if not font:
        print("note     : no TTF font found, tiles are unlabelled - rely on the reading order below")
    print()
    for dest, labels, c, r in sheets:
        print(f"{dest}  ({c}x{r}, left-to-right, top-to-bottom)")
        for row_start in range(0, len(labels), c):
            print("   " + "  ".join(labels[row_start:row_start + c]))
        print()
    return [s[0] for s in sheets]


# ------------------------------------------------------------------ grab ----

def cmd_grab(args):
    need("ffmpeg")
    probe(args.video)
    chain = []
    if args.crop:
        try:
            x, y, w, h = [int(v) for v in args.crop.split(",")]
        except ValueError:
            die("--crop expects x,y,w,h in pixels, e.g. --crop 100,50,640,360")
        chain.append(f"crop={w}:{h}:{x}:{y}")
    if args.scale and args.scale != 1.0:
        chain.append(f"scale=iw*{args.scale}:ih*{args.scale}:flags=lanczos")

    dest = args.out or stamp_name(args.at, "png")
    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{args.at}", "-i", args.video]
    if chain:
        cmd += ["-vf", ",".join(chain)]
    cmd += ["-frames:v", "1", dest]
    run(cmd)
    print(f"{hms(args.at)} -> {dest}")
    if args.crop:
        print("cropped region kept at source resolution - good for reading small on-screen text")
    return dest


# ----------------------------------------------------------------- audio ----

def cmd_audio(args):
    need("ffmpeg")
    info = probe(args.video)
    if not info["audio_codec"]:
        die(f"{args.video} has no audio stream")
    dest = args.out or os.path.splitext(args.video)[0] + f".{args.format}"
    cmd = ["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", args.video, "-vn",
           "-ac", "1", "-ar", str(args.rate)]
    if args.format == "mp3":
        cmd += ["-b:a", "64k"]
    cmd += [dest]
    run(cmd)
    print(f"audio ({info['audio_codec']}) -> {dest}  mono {args.rate}Hz")
    return dest


# ------------------------------------------------------------------ info ----

def cmd_info(args):
    info = probe(args.video)
    print(f"path     : {info['path']}")
    print(f"duration : {hms(info['duration'])}  ({info['duration']:.2f}s)")
    print(f"video    : {info['width']}x{info['height']} {info['video_codec']} @ {info['fps']}fps")
    print(f"audio    : {info['audio_codec'] or 'none'}")
    print(f"size     : {info['size_mb']} MB")
    d = info["duration"]
    suggested = 24 if d <= 600 else 36
    every = max(1, round(d / suggested))
    print()
    print("suggested first pass:")
    print(f"  frames {args.video} --mode interval --every {every}   (~{max(1, int(d // every))} screenshots)")
    if args.json:
        print()
        print(json.dumps(info["raw"], indent=2))


def main():
    p = argparse.ArgumentParser(prog="vframes.py", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("info", help="video metadata and a suggested sampling rate")
    pi.add_argument("video")
    pi.add_argument("--json", action="store_true", help="also dump raw ffprobe json")
    pi.set_defaults(func=cmd_info)

    pf = sub.add_parser("frames", help="extract timestamped screenshots")
    pf.add_argument("video")
    pf.add_argument("--mode", default="interval",
                    choices=["interval", "count", "fps", "scenes", "keyframes"])
    pf.add_argument("--every", type=float, default=5.0, help="seconds between frames (interval mode)")
    pf.add_argument("--count", type=int, default=24, help="total frames (count mode)")
    pf.add_argument("--fps", type=float, default=1.0, help="frames per second (fps mode)")
    pf.add_argument("--threshold", type=float, default=0.3,
                    help="scene change sensitivity 0-1, lower = more cuts (scenes mode)")
    pf.add_argument("--start", type=float, default=0.0, help="start time in seconds")
    pf.add_argument("--end", type=float, default=None, help="end time in seconds")
    pf.add_argument("--width", type=int, default=1024, help="resize width, 0 keeps source size")
    pf.add_argument("--format", default="jpg", choices=["jpg", "png"])
    pf.add_argument("--quality", type=int, default=3, help="jpeg quality 2 (best) - 31 (worst)")
    pf.add_argument("--max-frames", type=int, default=200, dest="max_frames",
                    help="safety cap on how many frames get written")
    pf.add_argument("--out", help="output directory (default <video>_frames/)")
    pf.set_defaults(func=cmd_frames)

    ps = sub.add_parser("sheet", help="tile frames into labelled contact sheets")
    ps.add_argument("frames", help="directory of t_*.jpg frames, or a single image")
    ps.add_argument("--cols", type=int, default=5)
    ps.add_argument("--per-sheet", type=int, default=25, dest="per_sheet")
    ps.add_argument("--tile-width", type=int, default=400, dest="tile_width")
    ps.add_argument("--tile-ratio", type=float, default=0.5625, dest="tile_ratio",
                    help="tile height / width, default 0.5625 (16:9)")
    ps.add_argument("--quality", type=int, default=4)
    ps.add_argument("--out", help="output directory (default alongside the frames)")
    ps.set_defaults(func=cmd_sheet)

    pg = sub.add_parser("grab", help="one full-resolution screenshot at a timestamp")
    pg.add_argument("video")
    pg.add_argument("--at", type=float, required=True, help="timestamp in seconds")
    pg.add_argument("--crop", help="x,y,w,h in source pixels")
    pg.add_argument("--scale", type=float, default=1.0, help="upscale factor, e.g. 2 to read tiny text")
    pg.add_argument("--out")
    pg.set_defaults(func=cmd_grab)

    pa = sub.add_parser("audio", help="extract the audio track for transcription")
    pa.add_argument("video")
    pa.add_argument("--format", default="wav", choices=["wav", "mp3"])
    pa.add_argument("--rate", type=int, default=16000)
    pa.add_argument("--out")
    pa.set_defaults(func=cmd_audio)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()

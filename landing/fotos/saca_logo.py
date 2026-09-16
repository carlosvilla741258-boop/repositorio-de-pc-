# -*- coding: utf-8 -*-
"""Devuelve la transparencia al logo.

El original llegó en JPEG, que no guarda alfa: lo que era fondo transparente
quedó como el cuadriculado gris del editor, cuadro por cuadro. En vez de
recortarlo a mano se recupera por saturación — el fondo es neutro (R=G=B) y la
marca es roja pura, así que R menos el mayor de G y B vale cero en cualquier
cuadro, blanco o gris, y su máximo dentro de la marca. Eso da el alfa con los
bordes suavizados incluidos.

    python3 saca_logo.py logo_src.jpg ../logo.png
"""
import subprocess, sys, numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else "logo_src.jpg"
DST = sys.argv[2] if len(sys.argv) > 2 else "../logo.png"
LADO = 256                      # el encabezado lo enseña a 34 px; sobra para pantallas finas

w, h = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height",
                       "-of", "csv=p=0:s=x", SRC], capture_output=True,
                      text=True).stdout.strip().split("x")
W, H = int(w), int(h)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo",
                      "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
im = np.frombuffer(raw, np.uint8)[:W*H*3].reshape(H, W, 3).astype(np.float32)

d = im[:, :, 0] - np.maximum(im[:, :, 1], im[:, :, 2])
K = np.percentile(d, 99.9)
a = np.clip(d / K, 0, 1)
a[a < 0.06] = 0                 # ruido de compresión en el fondo
col = im[d > K * 0.9].mean(0)   # el rojo de la marca, para que los bordes no arrastren gris

ys, xs = np.nonzero(a > .5)     # recorte cuadrado con margen
m = 12
y0, y1 = max(ys.min()-m, 0), min(ys.max()+m+1, H)
x0, x1 = max(xs.min()-m, 0), min(xs.max()+m+1, W)
lado = max(y1-y0, x1-x0)
cy, cx = (y0+y1)//2, (x0+x1)//2
a = a[max(cy-lado//2, 0):max(cy-lado//2, 0)+lado,
      max(cx-lado//2, 0):max(cx-lado//2, 0)+lado]

rgba = np.zeros((a.shape[0], a.shape[1], 4), np.uint8)
rgba[:, :, :3] = col.astype(np.uint8)
rgba[:, :, 3] = np.rint(a * 255)
p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba",
                      "-s", "%dx%d" % (a.shape[1], a.shape[0]), "-i", "-",
                      "-vf", "scale=%d:%d:flags=lanczos" % (LADO, LADO), DST],
                     stdin=subprocess.PIPE)
p.communicate(rgba.tobytes())
print("%s -> %s  (rojo %s, recorte %d px)" % (SRC, DST, col.astype(int), lado))

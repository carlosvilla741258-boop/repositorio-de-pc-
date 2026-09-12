# -*- coding: utf-8 -*-
"""Aplica el encaje medido: escala la foto del después y la desplaza para que
el carro caiga en el mismo sitio que en la del antes."""
import subprocess, sys, numpy as np
W,H=690,460
S,DX,DY = 1.020, 7, -15

def carga(f):
    raw=subprocess.run(["ffmpeg","-v","error","-i",f,"-f","rawvideo","-pix_fmt","rgb24","-"],
        capture_output=True).stdout
    return np.frombuffer(raw,np.uint8)[:W*H*3].reshape(H,W,3)

def guarda(a,f):
    p=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24",
        "-s","%dx%d"%(W,H),"-i","-",f],stdin=subprocess.PIPE)
    p.communicate(a.astype(np.uint8).tobytes())

B=carga("bc.png").astype(np.float32)
ys=((np.arange(H)-DY-H/2)/S + H/2)
xs=((np.arange(W)-DX-W/2)/S + W/2)
y0=np.clip(np.rint(ys).astype(int),0,H-1); x0=np.clip(np.rint(xs).astype(int),0,W-1)
Bt=B[np.ix_(y0,x0)]
guarda(Bt,"bt.png")

A=carga("ac.png").astype(np.float32)
guarda((A+Bt)/2,"mezcla2.png")
print("hecho")

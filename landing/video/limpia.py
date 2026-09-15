import subprocess, sys, numpy as np
W,H=1280,720
SRC=sys.argv[1]; DST=sys.argv[2]

def integral(x):
    return np.pad(x.cumsum(0).cumsum(1),((1,0),(1,0)))
def boxsum(c,k):
    return c[k:,k:]-c[:-k,k:]-c[k:,:-k]+c[:-k,:-k]
def boxmean(img,r):
    p=np.pad(img.astype(np.float32),r,mode='edge'); k=2*r+1
    return boxsum(integral(p),k)/(k*k)

rd=subprocess.Popen(["ffmpeg","-v","error","-i",SRC,
    "-vf","delogo=x=10:y=10:w=142:h=46",
    "-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE)
wr=subprocess.Popen(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","rgb24",
    "-s","%dx%d"%(W,H),"-r","24","-i","-","-c:v","libx264","-crf","16",
    "-preset","slow","-pix_fmt","yuv420p",DST],stdin=subprocess.PIPE)

nsz=W*H*3; n=0; tocadas=0; pxtot=0
while True:
    b=rd.stdout.read(nsz)
    if len(b)<nsz: break
    f=np.frombuffer(b,np.uint8).reshape(H,W,3).astype(np.float32)
    g=f@np.array([0.299,0.587,0.114],np.float32)
    bg=boxmean(g,16)
    m=(g>105)&(bg<34)
    if m.any():
        # descarta zonas donde la mancha es grande/densa (detalle real)
        dens=boxmean(m.astype(np.float32),10)
        m=m&(dens<0.10)
    if m.any():
        # dilata el nucleo para cubrir el halo de la mancha
        md=boxmean(m.astype(np.float32),5)>0.0001
        keep=(~md).astype(np.float32)
        ck=integral(np.pad(keep,20,mode='edge')); k=41
        den=boxsum(ck,k)
        out=f.copy()
        for c in range(3):
            ch=f[:,:,c]*keep
            num=boxsum(integral(np.pad(ch,20,mode='edge')),k)
            rel=np.where(den>1,num/np.maximum(den,1),ch)
            out[:,:,c]=np.where(md,rel,ch if False else f[:,:,c])
            out[:,:,c][md]=rel[md]
        f=out; tocadas+=1; pxtot+=int(md.sum())
    wr.stdin.write(np.clip(f,0,255).astype(np.uint8).tobytes()); n+=1
wr.stdin.close(); wr.wait(); rd.wait()
print("fotogramas:",n,"retocados:",tocadas,"pixeles reparados:",pxtot)

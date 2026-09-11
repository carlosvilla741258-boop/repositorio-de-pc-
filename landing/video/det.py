import subprocess, sys, numpy as np
W,H=1280,720
def boxmean(img,r):
    p=np.pad(img.astype(np.float32),r,mode='edge')
    c=np.pad(p.cumsum(0).cumsum(1),((1,0),(1,0))); k=2*r+1
    return (c[k:,k:]-c[:-k,k:]-c[k:,:-k]+c[:-k,:-k])/(k*k)
for f in sys.argv[1:]:
    raw=subprocess.run(["ffmpeg","-v","error","-i",f,"-vf","delogo=x=10:y=10:w=142:h=46",
        "-f","rawvideo","-pix_fmt","gray","-"],capture_output=True).stdout
    a=np.frombuffer(raw,np.uint8); n=len(a)//(W*H); a=a[:n*W*H].reshape(n,H,W)
    tot=0; peor=0
    for t in range(0,n,3):
        g=a[t].astype(np.float32); bg=boxmean(g,16)
        m=(g>105)&(bg<34)
        if m.any():
            d=boxmean(m.astype(np.float32),10); m=m&(d<0.10)
        c=int(m.sum()); tot+=c; peor=max(peor,c)
    print("%-8s manchas/muestra=%5.1f  peor=%d"%(f,tot/len(range(0,n,3)),peor))

# -*- coding: utf-8 -*-
"""Arma landing.html: base.html + app.js + video incrustado en data URI."""
import base64, os
def uri(f, mime):
    with open(f,"rb") as fh: return "data:%s;base64,%s"%(mime, base64.b64encode(fh.read()).decode())

html = open("base.html", encoding="utf-8").read()
app  = open("app.js",    encoding="utf-8").read()

fuentes = ('<source src="%s" type="video/webm">'
           '<source src="%s" type="video/mp4">') % (uri("g960.webm","video/webm"),
                                                    uri("g960.mp4","video/mp4"))
# El logo entra solo en cuanto exista el archivo: se busca logo.svg, .png,
# .webp o .jpg en esta carpeta. Si no está, la marca se queda en texto y la
# página no enseña una imagen rota.
TIPOS = {".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",
         ".jpg":"image/jpeg",".jpeg":"image/jpeg"}
logo = next((f for f in ("logo.svg","logo.png","logo.webp","logo.jpg","logo.jpeg")
             if os.path.exists(f)), None)
if logo:
    d = uri(logo, TIPOS[os.path.splitext(logo)[1]])
    html = html.replace("<!--LOGO-->",
        '<img class="logo" src="%s" alt="Logo de Abarca Factoría">' % d)
    html = '<link rel="icon" href="%s">\n' % d + html
    print("logo: %s incrustado, y puesto como icono de pestaña" % logo)
else:
    print("logo: no hay archivo — la marca queda en texto")

html = html.replace("__POSTER__",  uri("g960.jpg",   "image/jpeg"))
html = html.replace("__ANTES__",   uri("antes.jpg",  "image/jpeg"))
html = html.replace("__DESPUES__", uri("despues.jpg","image/jpeg"))
for marca, arch in (("__CARRO_ANTES__","carro-antes.jpg"), ("__CARRO_DESPUES__","carro-despues.jpg"),
                    ("__ARO_ANTES__","aro-antes.jpg"),     ("__ARO_DESPUES__","aro-despues.jpg")):
    html = html.replace(marca, uri(arch, "image/jpeg"))
html = html.replace("<!--FUENTES-->", fuentes)
html = html.replace("<!--JS-->", app)
open("landing.html","w",encoding="utf-8").write(html)
print("landing.html  %.2f MB" % (os.path.getsize("landing.html")/1048576))

# ── paquete para subir a un hosting (Vercel, Hostinger, el que sea) ─────
# Igual que landing.html salvo en una cosa: el video va en archivos sueltos.
# Safari —iPhone, iPad y Mac— no reproduce video incrustado en un data URI,
# porque para arrancar necesita pedirlo por trozos y un data URI no lo
# permite. Las imágenes sí se quedan dentro: pesan poco y así no hay forma
# de que falte ninguna al subirlas.
import shutil
os.makedirs("web", exist_ok=True)
web = html.replace(fuentes,
    '<source src="proceso.mp4" type="video/mp4">'
    '<source src="proceso.webm" type="video/webm">')
open("web/index.html", "w", encoding="utf-8").write(web)
for orig, dest in (("g960.mp4","web/proceso.mp4"), ("g960.webm","web/proceso.webm")):
    shutil.copyfile(orig, dest)
print("web/  -> index.html %.2f MB  +  proceso.mp4 %.1f MB  +  proceso.webm %.1f MB"
      % (os.path.getsize("web/index.html")/1048576,
         os.path.getsize("web/proceso.mp4")/1048576,
         os.path.getsize("web/proceso.webm")/1048576))

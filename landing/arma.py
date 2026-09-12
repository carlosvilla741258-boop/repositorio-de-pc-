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
html = html.replace("<!--FUENTES-->", fuentes)
html = html.replace("<!--JS-->", app)
open("landing.html","w",encoding="utf-8").write(html)
print("landing.html  %.2f MB" % (os.path.getsize("landing.html")/1048576))

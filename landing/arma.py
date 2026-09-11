# -*- coding: utf-8 -*-
"""Arma las dos versiones de la landing a partir de base.html + app.js.

  landing.html       el video va aparte, en archivos sueltos junto a la página.
                     Es la versión que se publica: Safari (iPhone, iPad, Mac)
                     no reproduce video incrustado en un data URI porque no
                     puede pedirlo por trozos, y además así la página pesa 30 KB
                     en vez de 6 MB.

  landing-solo.html  todo incrustado en un único archivo. Sirve para abrirla
                     desde el disco o mandarla por correo, no para publicar.
"""
import base64, os

# El mp4 va primero: lo reproduce cualquier navegador. El webm queda de
# alternativa más liviana para los que sí lo entienden.
VIDEOS = [("proceso.mp4", "video/mp4"), ("proceso.webm", "video/webm")]
CARTEL = ("portada.jpg", "image/jpeg")

def uri(f, mime):
    with open(f, "rb") as fh:
        return "data:%s;base64,%s" % (mime, base64.b64encode(fh.read()).decode())

html = open("base.html", encoding="utf-8").read().replace(
       "<!--JS-->", open("app.js", encoding="utf-8").read())

def escribe(nombre, ref):
    src = "".join('<source src="%s" type="%s">' % (ref(f, m), m) for f, m in VIDEOS)
    open(nombre, "w", encoding="utf-8").write(
        html.replace("__POSTER__", ref(*CARTEL)).replace("<!--FUENTES-->", src))
    print("%-20s %7.2f MB" % (nombre, os.path.getsize(nombre) / 1048576))

escribe("landing.html",      lambda f, m: f)
escribe("landing-solo.html", uri)

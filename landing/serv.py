# Servidor de prueba que SÍ entiende Range, como cualquier hosting real.
# Sin eso el navegador no puede saltar de capítulo y el video sólo corre de
# principio a fin.
import http.server, os, re, sys
class H(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        r = self.headers.get("Range")
        if not r: return super().send_head()
        ruta = self.translate_path(self.path)
        if not os.path.isfile(ruta): return super().send_head()
        tam = os.path.getsize(ruta)
        m = re.match(r"bytes=(\d*)-(\d*)", r)
        a = int(m.group(1)) if m.group(1) else 0
        b = min(int(m.group(2)) if m.group(2) else tam-1, tam-1)
        f = open(ruta, "rb"); f.seek(a)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(ruta))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", "bytes %d-%d/%d" % (a, b, tam))
        self.send_header("Content-Length", str(b-a+1))
        self.end_headers()
        self.copyfile = lambda s, d, _n=b-a+1: d.write(s.read(_n))
        return f
    def end_headers(self):
        if not self.headers.get("Range"): self.send_header("Accept-Ranges", "bytes")
        super().end_headers()
    def log_message(self, *a): pass
os.chdir(sys.argv[2]); http.server.HTTPServer(("127.0.0.1", int(sys.argv[1])), H).serve_forever()

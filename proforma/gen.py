import json, sys, pathlib
d = pathlib.Path(__file__).parent
data = json.loads(open(sys.argv[1]).read())
claves = ["fecha","cliente","doc","tel","marca","modelo","tipo","placa","color"]
state = {k: data.get(k, "") for k in claves}
state["bloques"] = data["bloques"]
state["notas"]   = data.get("notas", [])
state["igv"]     = data.get("igv", 0)
state["adelanto"] = data.get("adelanto", None)
s = open(d/"art"/"proforma.tpl.html").read()
s = s.replace("__TITULO__", data.get("titulo", "Proforma ABARCA"))
s = s.replace("__STATE__", json.dumps(state, ensure_ascii=False).replace("<", "\\u003c"))
s = s.replace("__LOGO__", open(d/"logo_b64.txt").read().strip())
(d/"art"/(data["nombre"] + ".html")).write_text(s)
sub = sum(i["m"] for b in data["bloques"] for i in b["items"])
igv = sub * state["igv"]
print(f"{data['nombre']}.html  subtotal {sub:,.2f}  IGV {igv:,.2f}  total {sub+igv:,.2f}")

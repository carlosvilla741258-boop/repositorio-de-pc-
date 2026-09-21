# Dibujos de carroceria propios de ABARCA, con el numero de cada pieza encima
BADGE = lambda x, y, n: (f'<g class="nm"><circle cx="{x}" cy="{y}" r="10.5"/>'
                         f'<text x="{x}" y="{y+3.8}">{n}</text></g>')

LATERAL = """
<svg viewBox="0 0 660 232" role="img" aria-label="Vista lateral con las piezas numeradas">
  <g class="dib">
    <path d="M18 180 L18 142 C18 130 24 124 36 121 L196 104 L254 52 C258 47 265 44 273 44
             L440 44 C450 44 458 47 463 53 L516 100 L604 112 C616 114 624 120 624 132 L624 180 Z"/>
    <path class="t" d="M66 178 L66 124"/>
    <path class="t" d="M248 178 L248 106"/>
    <path class="t" d="M378 178 L378 103"/>
    <path class="t" d="M508 178 L508 100"/>
    <path class="t" d="M600 178 L600 113"/>
    <path class="t" d="M200 102 L256 56 L302 56 L302 102 Z"/>
    <path class="t" d="M308 56 L372 56 L372 102 L308 102 Z"/>
    <path class="t" d="M378 56 L442 56 L442 102 L378 102 Z"/>
    <path class="t" d="M448 56 L458 56 L504 102 L448 102 Z"/>
    <rect class="t" x="330" y="112" width="28" height="8" rx="3"/>
    <rect class="t" x="404" y="112" width="28" height="8" rx="3"/>
    <path class="t" d="M302 98 L286 90 L286 103 Z"/>
    <rect class="t" x="248" y="169" width="260" height="9" rx="2"/>
    <circle class="t" cx="565" cy="132" r="9"/>
    <circle class="r" cx="152" cy="180" r="32"/><circle class="t" cx="152" cy="180" r="15"/>
    <circle class="r" cx="492" cy="180" r="32"/><circle class="t" cx="492" cy="180" r="15"/>
    <path class="t" d="M8 214 L652 214"/>
  </g>
  __BADGES__
</svg>"""
LAT_BADGES = [(37,152,1),(128,110,2),(96,148,3),(292,120,4),(238,86,5),(352,52,6),(318,145,7),
              (452,145,8),(446,116,9),(378,174,10),(530,155,11),(410,78,12),(575,108,13),
              (614,152,14),(152,180,15),(565,132,16)]

FRONTAL = """
<svg viewBox="0 0 300 206" role="img" aria-label="Vista frontal con las piezas numeradas">
  <g class="dib">
    <path d="M40 168 L40 95 C40 82 46 72 56 66 L70 35 C74 26 82 22 92 22 L208 22
             C218 22 226 26 230 35 L244 66 C254 72 260 82 260 95 L260 168 Z"/>
    <path class="t" d="M72 66 L84 30 L216 30 L228 66 Z"/>
    <path class="t" d="M56 68 L244 68"/>
    <rect class="t" x="112" y="86" width="76" height="22" rx="4"/>
    <rect class="t" x="52" y="84" width="52" height="20" rx="6"/>
    <rect class="t" x="196" y="84" width="52" height="20" rx="6"/>
    <path class="t" d="M40 122 L260 122"/>
    <circle class="t op" cx="74" cy="143" r="10"/><circle class="t op" cx="226" cy="143" r="10"/>
    <rect class="t" x="120" y="132" width="60" height="20" rx="2"/>
    <path class="t" d="M96 62 L142 40"/><path class="t" d="M158 62 L204 40"/>
    <path class="t" d="M14 178 L286 178"/>
  </g>
  __BADGES__
</svg>"""
FRO_BADGES = [(150,97,17),(78,94,18),(222,94,19),(74,143,20),(226,143,21),(126,48,22),(150,142,23)]

POSTERIOR = """
<svg viewBox="0 0 300 206" role="img" aria-label="Vista posterior con las piezas numeradas">
  <g class="dib">
    <path d="M40 168 L40 95 C40 82 46 72 56 66 L68 34 C72 26 80 22 90 22 L210 22
             C220 22 228 26 232 34 L244 66 C254 72 260 82 260 95 L260 168 Z"/>
    <path class="t" d="M74 66 L84 30 L216 30 L226 66 Z"/>
    <rect class="t" x="48" y="80" width="48" height="26" rx="4"/>
    <rect class="t" x="204" y="80" width="48" height="26" rx="4"/>
    <path class="t" d="M40 120 L260 120"/>
    <rect class="t" x="120" y="128" width="60" height="20" rx="2"/>
    <rect class="t op" x="128" y="23" width="44" height="7" rx="2"/>
    <path class="t op" d="M78 60 L222 60 L222 68"/>
    <path class="t" d="M56 68 L244 68"/>
    <path class="t" d="M14 178 L286 178"/>
  </g>
  __BADGES__
</svg>"""
POS_BADGES = [(150,48,24),(72,93,25),(228,93,26),(150,92,27),(150,138,28),(104,28,29),(206,72,30)]

def armar(svg, badges):
    return svg.replace("__BADGES__", "\n  ".join(BADGE(x, y, n) for x, y, n in badges))

PIEZAS = [
 "Parachoques del.","Capó","Guardafango del.","Espejo lateral","Parabrisas","Techo",
 "Puerta delantera","Puerta posterior","Manija de puerta","Estribo","Panel lateral post.",
 "Luna de puerta","Maletera / tapa post.","Parachoques post.","Aros / llantas",
 "Tapa de combustible","Parrilla / máscara","Faro delantero izq.","Faro delantero der.",
 "Neblinero izq.","Neblinero der.","Limpiaparabrisas","Placa delantera","Luna posterior",
 "Faro posterior izq.","Faro posterior der.","Panel posterior","Placa posterior",
 "Tercera luz de freno","Spoiler / alerón",
]

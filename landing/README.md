# Landing de Abarca Factoría

Página de una sola pantalla en la que el scroll elige el capítulo y el video lo
reproduce entero por su cuenta. Seis capítulos: presentación, qué reparamos,
planchado y enderezado, pintura, pulido y cerámico, y pintado de aros.

## Construir

    python3 arma.py

Saca dos versiones:

| archivo | video | para qué |
|---|---|---|
| `landing.html` (35 KB) | archivos aparte: `proceso.mp4`, `proceso.webm`, `portada.jpg` | **la que se publica** |
| `landing-solo.html` (6 MB) | incrustado en data URI | abrirla desde el disco o mandarla por correo |

El video va aparte a propósito. **Safari —iPhone, iPad y Mac— no reproduce
video incrustado en un data URI**: para reproducir necesita pedir el archivo
por trozos (peticiones `Range`) y un data URI no lo permite, así que falla sin
decir nada. Al separarlo, además, la página pesa 30 KB en vez de 6 MB.

El `<source>` del mp4 va **primero**: lo entiende cualquier navegador. El webm
queda detrás como alternativa más liviana para los que sí lo soportan.

### El servidor tiene que servir trozos

Quien aloje `landing.html` debe responder a las peticiones `Range` (cualquier
alojamiento estático normal lo hace). Sin eso el navegador no puede saltar de
capítulo y cada título quedaría sobre la escena equivocada. La página lo
detecta y, antes que enseñar información que no corresponde, se pasa a los
capítulos escritos. `serv.py` es un servidor de prueba que sí los sirve:

    python3 serv.py 8732

## Verificar

    node prueba6.mjs       # los seis capítulos se reproducen completos y paran solos
    node checks.mjs        # sin desbordes de 360 a 1440 px y versión estática

## El video

`g960.mp4` / `g960.webm` (960x540, 49,5 s) se arman a partir de seis clips de
8,04 s separados por 0,2 s de negro. Ese colchón de negro es lo que evita que
asome el capítulo siguiente cuando el anterior se congela.

Los tiempos de `T0` y `FIN` en `app.js` están **medidos** sobre el archivo con
`blackdetect`, no calculados: el filtro `fps=24` deja cada clip en 8,042 s y no
en los 8,096 s del original, y ese desfase acumulado metía la congelación
dentro del negro.

    ffmpeg -i m6.mp4 -vf "blackdetect=d=0.05:pic_th=0.98:pix_th=0.05" -an -f null -

Los tres archivos de medios (`proceso.mp4`, `proceso.webm`, `portada.jpg`)
están en esta carpeta y son a la vez la fuente de `arma.py` y lo que se sube.

### Limpieza de los clips

`video/limpia.py` quita la marca de agua (`delogo`) y borra las manchas blancas
que dejó el generador: detecta puntos claros (luma > 105) rodeados de fondo muy
oscuro (media local < 34), descarta los grupos densos para no tocar detalle real
del carro, y rellena cada mancha con el promedio de su vecindario limpio.

    python3 video/limpia.py c1.mp4 c1c.mp4

`video/det.py` sólo cuenta manchas, para comparar antes y después.

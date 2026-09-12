# Landing de Abarca Factoría

Página de una sola pantalla en la que el scroll elige el capítulo y el video lo
reproduce entero por su cuenta. Seis capítulos: presentación, qué reparamos,
planchado y enderezado, pintura, pulido y cerámico, y pintado de aros.

## Construir

    python3 arma.py        # base.html + app.js + video en data URI -> landing.html

`landing.html` queda autocontenido (~6 MB): no depende de ningún archivo externo,
se puede abrir desde el disco o subir tal cual.

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

### Limpieza de los clips

`video/limpia.py` quita la marca de agua (`delogo`) y borra las manchas blancas
que dejó el generador: detecta puntos claros (luma > 105) rodeados de fondo muy
oscuro (media local < 34), descarta los grupos densos para no tocar detalle real
del carro, y rellena cada mancha con el promedio de su vecindario limpio.

    python3 video/limpia.py c1.mp4 c1c.mp4

`video/det.py` sólo cuenta manchas, para comparar antes y después.

## Antes y después

`antes.jpg` y `despues.jpg` (656×410, 16:10) salen de dos fotos de WhatsApp del
mismo Datsun, tomadas con meses de diferencia. `fotos/a.jpg` y `fotos/b.jpg` son
los originales tal como llegaron.

Para que el comparador funcione, el carro tiene que caer en el mismo sitio y al
mismo tamaño en las dos: si no, al arrastrar no se ve un carro cambiando, se ven
dos fotos distintas cortándose a la mitad.

El encaje **se midió, no se ajustó a ojo**. Como el color cambia por completo
—lámina cruda contra rojo— comparar colores no sirve; se comparan **bordes**
(costuras, pasos de rueda, llantas, ventanas, parachoques), que siguen en el
mismo sitio. Con una correlación por FFT sobre el mapa de bordes, enmascarada a
la zona del carro para que los dos fondos distintos no pesen, salió: escala
1,020 y desplazamiento (+7, −15) sobre la foto del después.

    python3 fotos/encaja.py      # aplica esa transformación

Las dos fotos traían franjas negras (venían de video vertical); ambas tenían
exactamente 720×540 de contenido.

Las `<img>` del comparador llevan `pointer-events:none` y `draggable="false"`:
sin eso el navegador arranca su propio arrastre de imagen al primer movimiento
y el control se planta después de un paso.

## El logo

`logo.png` (256×256, RGBA) sale de `fotos/logo_src.jpg`. El original llegó en
**JPEG, que no guarda transparencia**: lo que era fondo transparente venía como
el cuadriculado gris del editor, cuadro por cuadro.

Se recupera el alfa por saturación en vez de recortar a mano. El fondo es
neutro (R=G=B) y la marca es roja pura, así que `R − max(G,B)` vale cero en
cualquier cuadro del tablero —blanco o gris— y su máximo dentro de la marca.
Eso da el alfa directamente, con los bordes suavizados incluidos, y de paso
sirve para cualquier cuadriculado, no sólo para este.

    python3 fotos/saca_logo.py

`arma.py` lo incrusta solo si el archivo existe: lo mete al lado de la marca y
lo pone como icono de pestaña. Si no está, la marca se queda en texto y la
página no enseña una imagen rota.

## El tablero de precios

Eran tres tarjetas sueltas, una por nivel de acabado. Para comparar cuánto
cuesta la pintura en cada nivel había que leer tres bloques distintos, y el
linter lo marcaba como `three-cards`.

Ahora es una tabla: **el servicio manda la fila y el nivel la columna**, que es
como de verdad se comparan. Elegir un nivel enciende su columna y apaga —sin
esconder— las otras dos, así que puedes leer la tuya de corrido sin perder la
comparación. En el celular no caben cuatro columnas, así que se enseña sólo la
elegida y la tabla queda en servicio y precio.

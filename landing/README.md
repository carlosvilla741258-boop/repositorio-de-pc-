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

Son columnas, una por nivel de acabado, **pero no tres cajas iguales** — eso es
lo que lo hacía plano. La del medio es la más elegida: va más ancha (1,14fr
contra 1fr), lleva su distintivo y arranca encendida. Tocar otra le pasa el
foco: se enciende su filete rojo, sus precios pasan a rojo y su botón se
rellena, mientras las otras dos quedan apagadas **pero legibles** — la gracia
de las columnas es comparar, y esconder las demás la anula.

Las tres descripciones reservan dos líneas (`min-height:2.9em`). Sin eso, una
descripción de una línea y otra de dos descuadran las filas de precio entre
columnas y se pierde la comparación de un vistazo.

El botón de cada columna abre WhatsApp con el mensaje ya escrito, nombrando el
nivel y el tipo de vehículo elegidos.

## Los otros dos antes/después

`carro-antes.jpg` / `carro-despues.jpg` (832×520) y `aro-antes.jpg` /
`aro-despues.jpg` (1040×650) salen de `fotos/n1..n4.jpg`, los originales tal
como llegaron.

**Los aros** se alinearon por el buje: (710, 560) en la del antes y (910, 536)
en la del después, con los dos aros midiendo casi lo mismo —934 contra 940 px
de alto, medio por ciento— así que bastó desplazar el encuadre. Los radios no
calzan porque el aro giró entre foto y foto; se midió el giro por correlación
angular y por solapamiento de las ventanas oscuras, y ninguna rotación lo
arregla: las dos fotos tienen perspectivas distintas y el aro sale elíptico de
forma diferente en cada una. En el barrido apenas se nota, porque lo que
continúa de un lado al otro es el borde del neumático y el buje.

**El carro** no admite alineación píxel a píxel: una foto está tomada de cerca
con el carro cortado y en caballetes, la otra entera y en vertical. Se midieron
dos puntos presentes en ambas —el espejo retrovisor y el centro de la rueda
delantera— y salió que el carro se ve exactamente 3 veces más grande en la del
antes (718 px contra 240 entre esos dos puntos). Con esa razón se eligieron
ventanas de 1560×975 y 520×325, que dejan la misma esquina del carro —puerta,
aleta y rueda delantera— al mismo tamaño en las dos.

La galería pasó de una fila a una pila: cada trabajo es un `.trabajo-par` con
su comparador y su nota, separados por un filete.

### Dos cosas que hay que respetar al tocar esto

`.gallery` y `.trabajo-par` usan `minmax(0,…)` y no `1fr` a secas: una pista de
rejilla se niega a bajar del ancho mínimo de su contenido, y el texto estiraba
la columna.

La página **necesita su `<meta name="viewport">`**. Sin ella, un celular abre
la página con un lienzo de 980 px y la enseña alejada. No se nota al publicarla
como artefacto porque la plataforma añade esa etiqueta por su cuenta, pero el
archivo suelto —el que va a un hosting— sí la necesita.

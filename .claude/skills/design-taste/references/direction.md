# Direcciones de diseño

Diez direcciones con especificación completa. Sirven para dos cosas: elegir una
antes de escribir CSS, y tener referencias reales que mirar en vez de inventar.

Cada una trae tipografías que existen en Google Fonts, hexadecimales concretos y
un origen verificable. **Elige una y llévala hasta el final.** Mezclar dos es
exactamente cómo se llega al look genérico: un poco de todo, compromiso con nada.

## Índice

1. [Editorial impreso](#1-editorial-impreso)
2. [Informe técnico](#2-informe-técnico)
3. [Suizo internacional](#3-suizo-internacional)
4. [Brutalismo web](#4-brutalismo-web)
5. [Terminal](#5-terminal)
6. [Risograph / dos tintas](#6-risograph--dos-tintas)
7. [Producto sobrio](#7-producto-sobrio)
8. [Catálogo de datos](#8-catálogo-de-datos)
9. [Póster expresivo](#9-póster-expresivo)
10. [Archivo](#10-archivo)

---

## 1. Editorial impreso

**Cuándo**: textos largos, ensayos, documentación con voz, blogs, newsletters.

- **Tipografía**: texto en Source Serif 4 o Newsreader a 18–19px, interlínea 1.65,
  medida de 62–68 caracteres. Titulares en Archivo o Libre Franklin, peso 700,
  ajuste de tracking negativo (`letter-spacing: -0.02em`).
- **Color**: papel `#f7f4ee`, tinta `#191512`, filete `#d8d0c2`, un acento único
  de tinta roja `#8a3324` sólo para enlaces.
- **Retícula**: una columna de texto desplazada a la izquierda, no centrada, con
  una columna estrecha de notas al margen. Filetes de 1px, nunca sombras.
- **Textura**: capitulares, versalitas para créditos, línea de crédito bajo el
  titular, número de sección al margen.
- **Movimiento**: ninguno más allá del subrayado en `:hover`.
- **Mirar**: cualquier número del *New York Times Magazine*; portadas de Penguin
  Books de los 60; el sitio de *The Marginalian*; los ensayos de *Works in Progress*.

## 2. Informe técnico

**Cuándo**: documentación, notas de investigación, changelogs, páginas de un
proyecto de ingeniería.

- **Tipografía**: todo en IBM Plex Mono o JetBrains Mono a 14–15px, o Plex Mono
  para titulares y Plex Serif para el cuerpo. Numeración de secciones `1.`, `1.1`.
- **Color**: papel `#fbfbf9`, tinta `#111111`, un solo acento `#0033cc` para
  enlaces. Nada más.
- **Retícula**: márgenes anchos, texto a 65 caracteres, figuras con pie numerado
  (`Fig. 3 — …`), tablas con filetes horizontales solamente.
- **Textura**: la información *es* la textura. Cifras, unidades, fechas, versiones.
- **Movimiento**: ninguno.
- **Mirar**: los *Bell Labs Technical Journal*; el *NASA Graphics Standards Manual*
  (1976); las páginas de manual de Unix; el sitio de SQLite; los papers de Tufte.

## 3. Suizo internacional

**Cuándo**: portafolios, agencias, sitios institucionales, cualquier cosa que deba
verse seria sin ser aburrida.

- **Tipografía**: una sola familia grotesca en dos o tres pesos. Schibsted
  Grotesk, Archivo o Public Sans. Titulares grandes en 700, cuerpo en 400.
  Alineación a la izquierda, bandera derecha irregular, jamás justificado.
- **Color**: blanco `#ffffff`, negro `#000000`, y **un** color saturado plano:
  rojo `#e2231a`, azul `#0057b8` o amarillo `#ffd400`. Sin degradados.
- **Retícula**: 12 columnas visibles y respetadas. El vacío es el elemento
  principal: si dudas, quita cosas y agranda los márgenes.
- **Textura**: bloques de color plano, fotografía a sangre, reglas de 2px.
- **Movimiento**: transiciones de opacidad y posición, 150ms, sin rebote.
- **Mirar**: Josef Müller-Brockmann; los carteles de Otl Aicher para Múnich 72;
  la identidad del metro de Nueva York de Vignelli; Wim Crouwel.

## 4. Brutalismo web

**Cuándo**: proyectos personales, herramientas de nicho, cualquier cosa que gane
credibilidad al parecer hecha a mano y sin presupuesto de marketing.

- **Tipografía**: la del sistema (`font-family: ui-sans-serif, system-ui`) o
  Times. Tamaños por defecto del navegador. Sin refinamiento deliberado.
- **Color**: blanco de fondo, negro de texto, azul `#0000ee` de enlace y morado
  `#551a8b` de visitado. Los colores por defecto, usados a propósito.
- **Retícula**: flujo del documento, sin contenedor centrado. Bordes `1px solid
  black`. Ancho completo.
- **Textura**: listas `<ul>` visibles, `<hr>`, tablas sin estilo, `<details>`.
- **Movimiento**: ninguno.
- **Mirar**: Brutalist Websites (brutalistwebsites.com); la web de Berkshire
  Hathaway; motherfuckingwebsite.com; los sitios personales de Dan Luu y Justine
  Tunney.

> Ojo: el brutalismo funciona cuando el contenido es fuerte y la falta de adorno
> es una declaración. En un producto comercial suele leerse como descuido.

## 5. Terminal

**Cuándo**: herramientas de desarrollo, CLIs, dashboards, cualquier cosa que viva
cerca de una consola.

- **Tipografía**: monoespaciada íntegra. Berkeley Mono si la tienes, si no
  JetBrains Mono o Space Mono. 13–14px, interlínea 1.5.
- **Color**: fondo `#0c0c0c` (nunca `#000000` puro, quema), texto `#d4d4d4`,
  y ámbar `#ffb000` o verde fósforo `#33ff66` como único acento. Alternativa
  clara: fondo `#f5f5f0`, texto `#1a1a1a`.
- **Retícula**: columnas de ancho fijo en `ch`. Alineación en cuadrícula de
  caracteres. Cajas dibujadas con `│ ─ ┌ ┘` si quieres ir hasta el final.
- **Textura**: prompts, cursores parpadeantes, salidas de comandos reales.
- **Movimiento**: cursor parpadeante y nada más.
- **Mirar**: la documentación de Charm/Bubble Tea; el sitio de Fly.io de sus
  primeros años; htop; la estética de Teenage Engineering aplicada a software.

## 6. Risograph / dos tintas

**Cuándo**: eventos, publicaciones independientes, cosas culturales, portafolios
creativos.

- **Tipografía**: Bricolage Grotesque o Syne para titulares, Karla o Chivo para
  el cuerpo. Titulares muy grandes, apretados, a veces cortando el borde.
- **Color**: exactamente dos tintas planas que se superponen con `mix-blend-mode:
  multiply`. Por ejemplo azul flúor `#0000fe` y coral `#ff5744` sobre papel
  crudo `#f0ebe0`.
- **Retícula**: composiciones asimétricas, elementos rotados 2–3 grados,
  desalineaciones deliberadas y consistentes.
- **Textura**: grano (un PNG de ruido a `opacity: 0.06`), registro desplazado,
  bordes imperfectos.
- **Movimiento**: nada, o un desplazamiento brusco sin easing suave.
- **Mirar**: risotto studio; publicaciones de Nieves; carteles de festivales de
  cine independientes; el archivo de Are.na con la búsqueda "riso".

## 7. Producto sobrio

**Cuándo**: SaaS, apps, landings que necesitan verse profesionales sin gritar.
Es la dirección más cercana al look-IA, así que exige la mayor disciplina.

- **Tipografía**: Instrument Sans o Figtree para interfaz, con **un** contrapunto
  con voz para titulares: Instrument Serif o Fraunces. Ese contraste es lo que
  salva la dirección de la anonimia.
- **Color**: neutros tibios, no grises puros — `#fafaf9`, `#e7e5e4`, `#78716c`,
  `#1c1917`. Un acento apagado, no saturado: verde bosque `#2d5a3d` o azul
  tinta `#1e3a5f`.
- **Retícula**: contenedor a 1120px, jerarquía asimétrica. Una sección ancla a
  ancho completo y el resto en dos columnas desiguales (60/40), nunca tres iguales.
- **Textura**: capturas reales del producto, con datos reales. Una captura
  auténtica vale más que cualquier ilustración.
- **Movimiento**: 120–160ms en color y borde. Nada de escalados al pasar el ratón.
- **Mirar**: Linear (2021, antes de los degradados); Stripe Docs; Basecamp;
  Things; los sitios de 37signals.

## 8. Catálogo de datos

**Cuándo**: precios, comparativas, resultados, inventarios, tablas de referencia.

- **Tipografía**: sans estrecha para encabezados (Barlow Condensed, Oswald),
  cifras tabulares obligatorias en el cuerpo (`font-variant-numeric: tabular-nums`).
  Tamaño pequeño, 13–14px: la densidad es el punto.
- **Color**: papel neutro, tinta oscura, y color **sólo** codificando un dato
  (positivo/negativo, categoría). Nunca color decorativo.
- **Retícula**: la tabla es la retícula. Filetes horizontales de 1px, cero
  verticales, filas de 32–36px, alineación a la derecha en números.
- **Textura**: la densidad misma. Notas al pie, unidades, rangos.
- **Movimiento**: resaltado de fila al pasar, instantáneo.
- **Mirar**: los anuarios estadísticos del FMI; las tablas de Baseball Reference;
  las páginas de datos del Financial Times; *The Visual Display of Quantitative
  Information* de Tufte.

## 9. Póster expresivo

**Cuándo**: una sola página, un lanzamiento, un evento, una declaración. No apto
para sitios con mucho contenido.

- **Tipografía**: una display enorme —Anton, Archivo Black, Unbounded— a 12–20vw,
  interlínea 0.9, apretada. El resto minúsculo por contraste: 13px.
- **Color**: un fondo saturado plano y un solo color de texto encima. Naranja
  `#ff4d00` sobre negro; verde `#00d060` sobre `#0a0a0a`.
- **Retícula**: el titular ocupa la pantalla. Todo lo demás se subordina en una
  esquina. Contraste de escala extremo — de 20vw a 13px sin nada intermedio.
- **Textura**: tipografía a sangre, cortada por el borde de la ventana.
- **Movimiento**: una sola entrada al cargar, y ya.
- **Mirar**: carteles de conciertos suizos de los 90; Experimental Jetset;
  las portadas de Pentagram; los carteles de Paula Scher.

## 10. Archivo

**Cuándo**: colecciones, wikis, bibliotecas de enlaces, notas públicas, índices.

- **Tipografía**: EB Garamond o Spectral para el cuerpo, 17px. Titulares en la
  misma familia, sólo más grandes. Sin sans en ninguna parte.
- **Color**: pergamino `#f5f1e8`, tinta sepia `#2b2419`, enlaces subrayados en el
  mismo color de la tinta. Un acento apenas perceptible.
- **Retícula**: listas largas, índices alfabéticos, sangría francesa
  (`text-indent: -2ch; padding-left: 2ch`), fechas al margen izquierdo.
- **Textura**: los propios metadatos — fechas, autores, números de entrada.
- **Movimiento**: ninguno.
- **Mirar**: el *Whole Earth Catalog*; los índices de la Biblioteca Warburg;
  gwern.net; el Internet Archive; las notas públicas de Andy Matuschak.

---

## Dónde buscar referencias nuevas

Cuando ninguna de las diez encaje, mira sitios reales antes de improvisar:

| Fuente | Para qué |
|---|---|
| Typewolf | Tipografía de sitios reales, con las familias identificadas |
| Fonts In Use | La misma idea, con archivo histórico e impreso |
| Siteinspire | Web bien diseñada, filtrable por estilo y sector |
| Are.na | Tableros temáticos; lo mejor para direcciones raras |
| Brutalist Websites | El extremo anti-plantilla |
| Design Systems Repo | Sistemas reales publicados, con sus tokens |
| Landbook / httpster | Landings comerciales actuales |

Y una fuente que casi nadie usa: **lo impreso**. Un libro de la estantería, la
carta de un restaurante, la señalética de un aeropuerto, un envase. La web se
copia a sí misma; lo impreso rompe el bucle.

## Cómo traducir una referencia

No copies la captura. Extrae las decisiones:

1. ¿Cuántas familias tipográficas hay y qué papel cumple cada una?
2. ¿Cuántos colores? ¿Cuál domina en superficie y cuál aparece sólo una vez?
3. ¿Dónde está el borde izquierdo del texto? ¿Se mantiene entre secciones?
4. ¿Cuál es el elemento más grande de la página y cuál el más pequeño? Esa razón
   es el contraste de escala, y es la decisión más determinante.
5. ¿Qué **no** hay? La ausencia suele ser la decisión más fuerte: sin sombras,
   sin iconos, sin bordes redondeados, sin fotos.

Anota las respuestas como tokens antes de escribir CSS. Si no puedes responder la
4 y la 5, todavía no tienes una dirección.

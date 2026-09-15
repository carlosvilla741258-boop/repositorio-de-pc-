# Color

El degradado violeta-rosa es el tell más reconocible del diseño generado. Pero el
problema de fondo no es el violeta: es que el color no viene de ningún sitio.
Una paleta convence cuando se puede rastrear su origen.

## De dónde sacar una paleta

En orden de calidad del resultado:

1. **Una fotografía.** Elige una imagen que tenga que ver con el proyecto y
   saca de ella cinco colores: el dominante, el de sombra, el de luz y dos
   acentos. La coherencia viene gratis porque la luz real ya la resolvió.
2. **Un objeto físico.** El envase de algo, una portada de disco, una señal de
   tráfico, una herramienta. Los colores industriales están probados.
3. **Un sistema histórico.** Los colores de Braun bajo Dieter Rams, la señalética
   del metro de Múnich 72, las portadas naranjas de Penguin, la paleta del
   Whole Earth Catalog.
4. **Restricción deliberada.** Papel y tinta, más un acento. Es la salida más
   segura y casi nunca falla.

Lo importante: **deja escrito de dónde salió**, en un comentario junto a los
tokens. Sobrevive a las ediciones y evita que la paleta se degrade a la media.

```css
:root {
  /* Del cartel de Otl Aicher para Múnich 72 */
  --sky:   #4a9ad4;
  --grass: #6ba644;
  --sun:   #f5c518;
  --ink:   #1a1a1a;
}
```

## La regla de las proporciones

Una paleta no es una lista de colores, es un reparto de superficie:

- **60%** neutro de fondo
- **30%** neutro secundario (superficies, bordes, texto atenuado)
- **10%** tinta principal
- **una sola aparición** del acento

Ese último punto es el que más se incumple. Si el acento está en el botón, en el
icono, en el borde, en el enlace y en el fondo de la sección, ya no es un acento:
es el color de fondo de la página.

## Neutros: el detalle que separa

Los grises puros (`#808080`, la escala `slate` de Tailwind sin tocar) se leen
fríos y genéricos. Los neutros de las paletas buenas están teñidos:

```css
/* Neutros cálidos - editorial, cálido, orgánico */
--n-50:#faf8f5; --n-100:#f0ece5; --n-300:#c9c0b2;
--n-600:#6b6255; --n-900:#1c1814;

/* Neutros fríos azulados - técnico, herramientas */
--n-50:#f7f9fb; --n-100:#e8edf2; --n-300:#b4c0cc;
--n-600:#54626f; --n-900:#131a21;
```

Un neutro tibio sobre un fondo tibio ya distingue una página del 90% de lo que
sale por defecto, sin ninguna otra decisión.

## Contraste: mínimos que no son negociables

- Texto normal: **4.5:1** contra su fondo
- Texto grande (≥24px o ≥19px en negrita): **3:1**
- Bordes de controles e iconos con significado: **3:1**

Comprueba con la fórmula de luminancia relativa de WCAG, no a ojo. Los dos
fallos más habituales: gris claro sobre blanco en textos secundarios, y texto
blanco sobre un acento saturado de luminancia media (el amarillo y el verde lima
casi nunca pasan).

## Modo oscuro

No inviertas la paleta. El modo oscuro necesita sus propias decisiones:

- El fondo nunca es `#000000` puro — quema y produce halos. Usa `#0f0f11`–`#16161a`.
- El texto nunca es `#ffffff` puro. Usa `#e8e6e3`.
- Los colores saturados hay que **desaturarlos** un 10–20% en oscuro; si no,
  vibran contra el fondo.
- Las sombras no funcionan sobre oscuro. Separa superficies subiendo el valor de
  la superficie, no oscureciendo lo de debajo.

```css
:root { --bg:#f7f4ee; --fg:#191512; --accent:#8a3324; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg:#14120f; --fg:#e8e4dc; --accent:#d97757;  /* acento aclarado y desaturado */
  }
}
:root[data-theme="dark"] { --bg:#14120f; --fg:#e8e4dc; --accent:#d97757; }
```

## Si aun así quieres un degradado

Que sea sutil y con sentido físico: dos tonos **vecinos** en el círculo cromático
(menos de 40° de diferencia de tono), poca variación de saturación, y siempre
como fondo de una superficie grande — nunca sobre texto.

```css
/* Amanecer, no unicornio */
background: linear-gradient(160deg, #f5c518 0%, #e8833a 100%);
```

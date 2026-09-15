# Tipografía

La tipografía es lo que más rápido delata una página generada. No porque las
fuentes estén mal elegidas, sino porque no están elegidas: queda la de por
defecto, en un solo peso, a un tamaño intermedio, en una medida demasiado ancha.

## Las cinco decisiones

### 1. Cuántas familias

Dos. Una para titulares con voz, otra neutra para el cuerpo. Una sola familia
también funciona si te apoyas fuerte en el contraste de pesos y tamaños; tres es
casi siempre una familia de más.

El contraste debe ser **evidente**. Dos grotescas parecidas se leen como un error
de configuración, no como una decisión. Serif contra sans, o display contra
neutra, o condensada contra normal.

### 2. Escala

Construye por razón, no a ojo. Con 1.25 desde 16px:

```
13 · 16 · 20 · 25 · 31 · 39 · 49 · 61
```

Con 1.333 (más dramática, buena para páginas de una sola pantalla):

```
12 · 16 · 21 · 28 · 37 · 50 · 67
```

Usa cinco pasos, no nueve. Si necesitas un tamaño intermedio, casi siempre lo
que necesitas es cambiar el peso o el color, no el tamaño.

```css
:root {
  --step--1: 0.8rem;   --step-0: 1rem;    --step-1: 1.25rem;
  --step-2: 1.563rem;  --step-3: 1.953rem; --step-4: 2.441rem;
}
```

### 3. Medida

Entre 60 y 72 caracteres para texto continuo. Es la decisión con más impacto en
la legibilidad y la que más se olvida:

```css
p { max-width: 65ch; }
```

Un párrafo a todo el ancho de una pantalla de 27 pulgadas es ilegible por muy
buena que sea la fuente.

### 4. Interlínea

Inversamente proporcional al tamaño. Los titulares grandes necesitan menos:

```css
h1 { font-size: 3.5rem; line-height: 1.05; letter-spacing: -0.02em; }
h2 { font-size: 1.95rem; line-height: 1.2;  letter-spacing: -0.01em; }
p  { font-size: 1rem;    line-height: 1.65; }
```

El `letter-spacing` negativo en titulares grandes es lo que separa un titular
compuesto de uno simplemente agrandado. A partir de 32px, siempre.

### 5. Pesos

Dos por familia, muy separados: 400 y 700. Los pesos intermedios (500, 600) son
la razón de que tantas páginas se vean blandas — ni ligeras ni contundentes.

## Parejas que funcionan

Todas disponibles en Google Fonts.

| Titular | Cuerpo | Carácter |
|---|---|---|
| Instrument Serif | Instrument Sans | Editorial contemporáneo, elegante |
| Fraunces | Source Serif 4 | Cálido, con personalidad, para textos largos |
| Archivo Black | Archivo | Contundente, suizo, sin cambiar de familia |
| Bricolage Grotesque | Karla | Contemporáneo, algo raro, cultural |
| Space Grotesk | IBM Plex Sans | Técnico pero no frío |
| Playfair Display | Lora | Clásico, alto contraste, lujo |
| Anton | Public Sans | Cartel, escala extrema |
| EB Garamond | EB Garamond | Archivo, una sola familia, todo por tamaño |
| IBM Plex Mono | IBM Plex Serif | Informe técnico |
| Syne | Chivo | Expresivo, para cultura y eventos |

## Detalles que casi nadie ajusta y se notan

```css
/* Cifras que no bailan en tablas ni en precios */
.tabular { font-variant-numeric: tabular-nums; }

/* Subrayados que respetan las descendentes */
a { text-underline-offset: 0.15em; text-decoration-thickness: 1px; }

/* Comillas y guiones tipográficos: « » — – " " en vez de " y - */

/* Ligaduras y alternativas estilísticas, si la fuente las trae */
h1 { font-feature-settings: "ss01", "liga"; }

/* Evitar palabras huérfanas al final del titular */
h1 { text-wrap: balance; }
p  { text-wrap: pretty; }
```

`text-wrap: balance` en titulares es de las mejoras con mejor relación
esfuerzo/resultado que existen hoy.

## Cargar fuentes sin romper la página

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;700&family=Instrument+Serif&display=swap" rel="stylesheet">
```

Pide sólo los pesos que vas a usar. `display=swap` evita el texto invisible
mientras carga. Y define siempre una pila de reserva real:

```css
body { font-family: "Instrument Sans", system-ui, -apple-system, sans-serif; }
```

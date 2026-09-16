---
name: design-taste
description: Da dirección de diseño y referencias concretas para que una web, landing, interfaz o artifact no tenga el look genérico de "hecho con IA" (degradado violeta, tipografía Inter sola, tres tarjetas iguales, emojis como iconos, copy de relleno). Úsala SIEMPRE antes de escribir HTML/CSS/Tailwind/React de cualquier cosa visual, y también cuando el usuario diga que algo "parece hecho con IA", "se ve genérico", "necesita mejor diseño", "dame referencias", o pida revisar/mejorar el diseño de una página existente. Incluye un linter que detecta estos tics en el código. Also use for: design references, visual direction, make it look designed, avoid AI slop / generic template look, typography and color choices, design critique, landing page design, art direction.
---

# Dirección de diseño

El look de "web hecha con IA" no viene de una decisión mala. Viene de la
**ausencia de decisiones**: cada propiedad se queda en su valor por defecto, y
como todos los defaults son los mismos, todas las páginas salen iguales.
Degradado violeta, Inter en peso 500, tres tarjetas con emoji, todo centrado,
todo con la misma sombra y el mismo radio.

La consecuencia práctica: **no se arregla al final**. Se arregla eligiendo una
dirección antes de escribir la primera línea de CSS. Retocar una página ya
construida sólo la mueve de un genérico a otro.

## Flujo

### 1. Elige una dirección — antes de escribir CSS

Lee `references/direction.md` y elige **una** de las diez direcciones
documentadas (editorial impreso, informe técnico, suizo, brutalismo, terminal,
risograph, producto sobrio, catálogo de datos, póster, archivo). Cada una trae
tipografías reales, hexadecimales concretos, retícula, textura y referencias
verificables que mirar.

Elige por el contenido, no por gusto: un texto largo pide editorial, una tabla de
precios pide catálogo de datos, una CLI pide terminal.

Si el usuario no dio pistas de estilo, **propón dos direcciones en una frase cada
una y deja que elija**. Es una pregunta de cinco segundos que decide el resultado
entero, y adivinar aquí es cómo se acaba en el punto medio de siempre.

### 2. Fija los tokens y anota de dónde salen

Antes del primer componente, escribe las variables: familias, escala tipográfica,
paleta, escala de espaciado, radios. Con un comentario diciendo el origen.

```css
:root {
  /* Dirección: editorial impreso. Paleta de portadas Penguin años 60. */
  --paper:#f7f4ee; --ink:#191512; --rule:#d8d0c2; --accent:#8a3324;
  --font-display:"Archivo", sans-serif;
  --font-text:"Source Serif 4", Georgia, serif;
  --step-0:1rem; --step-1:1.25rem; --step-2:1.563rem;
  --step-3:1.953rem; --step-4:2.441rem;
  --space-1:4px; --space-2:8px; --space-3:16px;
  --space-4:24px; --space-5:40px; --space-6:64px;
}
```

Ese comentario es lo que impide que la página se degrade hacia la media cuando
alguien la edite después. Detalles de cada decisión en `references/type.md`
(parejas de fuentes, escala, medida, interlínea) y `references/color.md` (de
dónde sacar una paleta, neutros teñidos, contraste, modo oscuro).

### 3. Construye con contraste de escala

La decisión que más determina si algo "parece diseñado" no es el color: es la
razón entre el elemento más grande y el más pequeño. Por debajo de 3:1 la página
se ve plana. Apunta a 4:1–8:1.

Y evita de entrada los cuatro patrones que garantizan el look genérico:

- Tres tarjetas iguales en fila → jerarquiza: lo más importante a ancho completo,
  o una división asimétrica 60/40, o una lista.
- Todo centrado → centra como mucho un hero corto; el resto alineado a la
  izquierda, con un borde izquierdo constante.
- Sombra suave en todo → separa superficies con valor de fondo o un borde de 1px;
  reserva la sombra para lo que de verdad flota (menús, diálogos).
- Emoji como iconos → un set real (Lucide, Phosphor) o ningún icono.

### 4. Pasa el linter

```bash
python3 scripts/slopcheck.py pagina.html
python3 scripts/slopcheck.py src/            # directorios completos
python3 scripts/slopcheck.py --explain gradient-text
```

Detecta con número de línea los tics reconocibles: degradado violeta (por tono
real, no sólo por nombre), titular con degradado, glassmorfismo, blobs
desenfocados, píldora de "Introducing", emojis como iconos, tres tarjetas,
sombras genéricas, `transition: all`, Inter en solitario, paleta Tailwind sin
tocar, copy de relleno, espaciado y tamaños fuera de escala, radio único.

Sale con código 1 si hay algo de severidad alta, así que sirve para bloquear un
build. `--json` para procesarlo, `--list` para ver todas las reglas.

### 5. Revisa lo que el linter no ve

Pasarlo limpio es el suelo, no el techo: una página puede no tener ni un solo tic
y seguir sin punto de vista. `references/critique.md` tiene la revisión a ojo —
prueba de la miniatura, contraste de escala, borde izquierdo, ritmo vertical,
contenido real, densidad. Úsala también cuando el encargo sea criticar o mejorar
un diseño existente.

## Si el encargo es arreglar una página que ya existe

1. `slopcheck.py` sobre el código para tener el inventario con líneas.
2. Identifica qué dirección de `direction.md` está **más cerca** de lo que hay.
3. Aplica esa dirección entera. No arregles tic por tic: quitar el degradado y
   dejar todo lo demás produce la misma página, sólo que más apagada.
4. Vuelve a pasar el linter y haz la revisión de `critique.md`.

## Lo que esta skill no debe hacer

No convertir "evita el look de IA" en "haz algo raro". La legibilidad, el
contraste mínimo (4.5:1 en texto normal), los objetivos táctiles y el foco
visible no se negocian por estética. Una dirección fuerte y accesible es el
objetivo; una página ilegible es el otro fracaso, sólo que menos común.

Tampoco hace falta pedir permiso para cada micro-decisión. La única pregunta que
merece interrumpir es la de la dirección, en el paso 1.

## Archivos

```
references/direction.md   10 direcciones con especificación completa + dónde buscar más
references/type.md        parejas de fuentes, escala, medida, detalles finos
references/color.md       origen de la paleta, neutros, contraste, modo oscuro
references/critique.md    la revisión que el linter no puede hacer
scripts/slopcheck.py      linter de tics del look-IA
```

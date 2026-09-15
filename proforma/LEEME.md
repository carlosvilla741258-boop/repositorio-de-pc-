# Proformas de ABARCA

Generador de las proformas a partir de un archivo de datos.

- `plantilla.html` — la hoja (encabezado, datos del vehículo, recuadro de
  descripción, importes al pie derecho). Es también la página editable que
  se publica.
- `gen.py` — arma la página web a partir de un `datos/*.json`.
- `word.js` — arma el `.docx` a partir del mismo `datos/*.json`.
- `datos/` — un archivo por proforma.

## Hacer una proforma nueva

1. Copiar un archivo de `datos/` y cambiar cliente, vehículo y trabajos.
   - `igv: 0.18` desglosa el IGV; `igv: 0` muestra solo el total.
   - `adelanto: null` oculta las filas de adelanto y saldo.
2. `python3 gen.py datos/mi-proforma.json` → página web.
3. `node word.js datos/mi-proforma.json` → documento de Word.

El PDF sale imprimiendo la página web (botón *Imprimir / PDF*).

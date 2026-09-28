# Prospectos para páginas web

`negocios-sjl-las-flores-jardines-san-carlos.xlsx`: 43 negocios de San Juan de
Lurigancho (La Hacienda, Av. Las Flores de Primavera, Av. Los Jardines, Los Postes
y San Carlos), sacados de directorios públicos en septiembre de 2026. Cada fila
trae dirección, enlace a Google Maps, si ya tiene web y qué ofrecerle. La hoja
«Cómo usar» explica el resto.

El teléfono no viene en la lista: sale en la ficha de Google Maps de cada negocio
y se anota en la columna amarilla.

## Regenerar

    python3 arma_prospectos.py negocios-sjl-las-flores-jardines-san-carlos.xlsx

Los negocios están en la lista `N` del script. Después de regenerar, recalcular
el resumen con LibreOffice (`recalc.py` del skill xlsx) para que las cifras
queden guardadas en el archivo.

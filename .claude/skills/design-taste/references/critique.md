# Lo que el linter no puede ver

`slopcheck.py` encuentra tics de sintaxis. Una página puede pasarlo limpia y
seguir sin tener punto de vista. Esta es la revisión que hay que hacer a ojo.

## 1. La prueba de la miniatura

Reduce la página al 10% o entrécierra los ojos hasta que el texto sea ilegible.
Deberías seguir viendo una estructura: una mancha dominante, un ritmo de bloques,
un borde izquierdo claro.

Si a esa escala se ve como una columna de rectángulos grises igual de grandes,
no hay jerarquía. El arreglo no es de color ni de fuente: es de **escala**. Algo
tiene que ser tres o cuatro veces más grande que el resto.

## 2. Contraste de escala

Mide la razón entre el elemento más grande y el más pequeño de la página. Por
debajo de 3:1 la página se ve plana y tímida — el defecto más común de lo
generado, porque los tamaños intermedios son la media estadística.

Las páginas con carácter suelen estar entre 4:1 y 8:1. Un titular de 61px con
un pie de 13px es 4.7:1.

## 3. El borde izquierdo

Recorre la página con una regla vertical imaginaria. ¿Cuántos bordes izquierdos
distintos hay? Uno o dos indican composición; cinco o seis indican que cada
sección se maquetó por separado.

Centrarlo todo es la forma de no tener ningún borde izquierdo, y por eso se
siente flotante y sin anclaje.

## 4. Ritmo vertical

Los espacios entre secciones deberían tener una lógica: más aire antes de un
cambio de tema que entre elementos hermanos. Si todas las secciones están
separadas por los mismos 80px, la página no dice qué va con qué.

Regla útil: el espacio *sobre* un titular debe ser claramente mayor que el
espacio *bajo* él. Eso agrupa el titular con su contenido, en vez de dejarlo
flotando entre dos bloques.

## 5. Contenido real

Sustituye todo el texto de relleno por el texto verdadero, aunque esté a medias.
Los diseños generados se ven bien con copy inventado porque el copy inventado
tiene la longitud perfecta. El contenido real tiene títulos de tres líneas,
nombres largos, listas de un solo elemento y párrafos de dos palabras.

Si el diseño se rompe con contenido real, es que estaba diseñado para la maqueta.

## 6. Imágenes

Ilustraciones vectoriales genéricas de gente de colores planos, iconos 3D
brillantes, fotos de stock de reuniones: los tres avisan de que no hay nada
que mostrar. Alternativas, por orden de eficacia:

1. Una captura real del producto, con datos reales.
2. Una fotografía propia, aunque sea imperfecta.
3. Un diagrama que explique de verdad cómo funciona algo.
4. Nada: tipografía y espacio.

La opción 4 gana casi siempre a una ilustración de stock.

## 7. Densidad

Las páginas generadas tienden a la misma densidad media en todas partes. Las
diseñadas alternan: una zona muy vacía junto a una muy densa. Esa alternancia
es la que produce sensación de ritmo.

Pregunta útil: ¿hay en la página alguna zona deliberadamente vacía y alguna
deliberadamente densa? Si la respuesta es no a cualquiera de las dos, todo está
en el punto medio.

## 8. La prueba de la captura

Ponla junto a tres capturas de sitios del mismo sector. ¿Se distingue la tuya?
Si la única diferencia es el logotipo y el tono del azul, no hay dirección.

Es la prueba definitiva, y la única que responde exactamente a la pregunta
"¿parece hecha con IA?".

## Cómo entregar una crítica

Al revisar una página, ordena los hallazgos por impacto y sé concreto sobre el
arreglo. Formato útil:

```
ESTRUCTURA
  Contraste de escala 1.8:1 — el titular (32px) apenas se distingue del cuerpo
  (18px). Sube el titular a 56px con line-height 1.05 y letter-spacing -0.02em.

COLOR
  Cinco colores compitiendo, ninguno domina. Elige violeta como acento único y
  pasa las tarjetas a la superficie neutra.

TIPOGRAFÍA
  Una sola familia en tres pesos intermedios. Añade un contrapunto para
  titulares (Instrument Serif) y quédate con 400/700.

CONTENIDO
  "Supercharge your workflow" no dice qué hace el producto. Sustituir por la
  frase concreta.
```

Tres o cuatro hallazgos con el arreglo escrito valen más que una lista de quince.

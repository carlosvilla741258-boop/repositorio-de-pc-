---
name: video-frames
description: Analiza videos convirtiéndolos en capturas de pantalla (frames) con ffmpeg, para poder "ver" y describir lo que ocurre en ellos. Úsala siempre que aparezca un archivo de video (.mp4, .mov, .avi, .mkv, .webm, .gif) o una grabación de pantalla y el usuario quiera saber qué pasa, resumirlo, buscar un momento concreto, leer texto en pantalla, revisar una demo o depurar un bug grabado — incluso si no pide explícitamente "capturas" o "frames". Also use for: analyze video, watch this recording, screen recording review, extract frames/screenshots/thumbnails, find the moment when X happens, contact sheet, video timeline, scene detection.
---

# Analizar videos mediante capturas

No puedes reproducir un video, pero sí puedes mirar imágenes. Esta skill convierte
el video en una serie de capturas con marca de tiempo y las agrupa en **hojas de
contacto** (mosaicos), de modo que una sola imagen te muestra decenas de momentos
del video a la vez.

Todo el trabajo lo hace `scripts/vframes.py`, que solo necesita `ffmpeg`.

## Requisito previo

```bash
ffmpeg -version || apt-get install -y ffmpeg    # macOS: brew install ffmpeg
```

Si falta ffmpeg, instálalo antes de continuar; el script avisa con el comando exacto.

## El principio que gobierna todo: presupuesto de imágenes

Cada imagen que lees consume contexto. Un video de 10 minutos muestreado cada
segundo son 600 capturas: leerlas una por una agota el contexto antes de llegar a
una conclusión. La estrategia correcta es **primero panorámica, luego zoom**:

1. Una o dos hojas de contacto te dan la estructura completa del video por el
   precio de una o dos imágenes.
2. Solo entonces amplías los momentos que de verdad importan.

Como regla práctica: no leas más de ~6 imágenes antes de tener una hipótesis clara
de qué contiene el video.

## Flujo de trabajo

### 1. Inspecciona el video

```bash
python3 scripts/vframes.py info video.mp4
```

Te da duración, resolución, fps, si tiene audio, y sugiere un intervalo de muestreo
razonable. La duración decide todo lo demás, así que empieza siempre por aquí.

### 2. Extrae capturas y arma la hoja de contactos

```bash
python3 scripts/vframes.py frames video.mp4 --mode interval --every 5 --out frames/
python3 scripts/vframes.py sheet frames/ --cols 5
```

`frames` guarda cada captura como `t_00012.500.jpg` (el nombre **es** el segundo
exacto del video). `sheet` las junta en `sheet_01.jpg`, `sheet_02.jpg`… con la
marca de tiempo impresa en cada celda, e imprime en la terminal el mapa de tiempos
de cada mosaico por si la etiqueta no se lee bien.

Lee las hojas de contacto, no las capturas sueltas.

### 3. Elige el modo de muestreo según lo que buscas

| Situación | Modo |
|---|---|
| No sabes qué contiene el video | `--mode count --count 25` (25 capturas repartidas, una hoja) |
| Video largo y quieres cobertura pareja | `--mode interval --every N` |
| Video editado, con cortes, o presentación con diapositivas | `--mode scenes --threshold 0.3` |
| Grabación de pantalla donde algo cambia poco a poco | `--mode interval --every 2` o `--mode fps --fps 2` |
| Solo quieres un vistazo muy rápido y barato | `--mode keyframes` |

En `--mode scenes`, `--threshold` va de 0 a 1: **bájalo** (0.1–0.2) si el video
apenas cambia y no detecta nada; **súbelo** (0.4–0.6) si devuelve demasiadas
capturas casi idénticas. Es normal ajustarlo un par de veces.

### 4. Amplía los momentos interesantes

Cuando la hoja de contactos te señale un punto relevante, vuelve al video a
resolución completa en vez de estirar la miniatura:

```bash
python3 scripts/vframes.py grab video.mp4 --at 47.5 --out momento.png
python3 scripts/vframes.py grab video.mp4 --at 47.5 --crop 400,150,800,300 --scale 2
```

`--crop x,y,w,h` recorta a resolución original: es lo que te permite leer un
mensaje de error, un valor de un formulario o texto pequeño de una interfaz.
`--scale 2` amplía después de recortar.

Si necesitas ver una transición con detalle, extrae una ventana estrecha:

```bash
python3 scripts/vframes.py frames video.mp4 --start 45 --end 52 --mode fps --fps 4 --out detalle/
```

### 5. Si el contenido está en lo que se dice, no en lo que se ve

Las capturas no sirven para una entrevista o una clase hablada. Extrae el audio:

```bash
python3 scripts/vframes.py audio video.mp4 --out audio.wav
```

Queda en mono 16 kHz, listo para transcribir. Si en el entorno no hay ninguna
herramienta de transcripción, dilo claramente en vez de deducir el diálogo a
partir de las imágenes.

## Cómo reportar los hallazgos

Ancla **siempre** lo que describes a una marca de tiempo, porque es lo único que
permite al usuario verificarte volviendo al video:

```
00:00–00:18  Pantalla de login, el usuario escribe su correo
00:19        Clic en "Entrar"
00:23        Aparece el error 500 (ampliado en momento_23s.png)
00:24–00:41  Reintento; el mismo error se repite
```

Distingue lo que ves de lo que infieres. Entre dos capturas separadas 5 segundos
puede pasar cualquier cosa: si un detalle importa y no lo tienes capturado,
extrae más frames de ese tramo en lugar de suponer.

## Referencia de comandos

```
info    video                              metadata + intervalo sugerido
frames  video [--mode interval|count|fps|scenes|keyframes]
              [--every S] [--count N] [--fps F] [--threshold 0-1]
              [--start S] [--end S] [--width 1024] [--format jpg|png]
              [--max-frames 200] [--out DIR]
sheet   frames_dir [--cols 5] [--per-sheet 25] [--tile-width 400] [--out DIR]
grab    video --at S [--crop x,y,w,h] [--scale F] [--out FILE]
audio   video [--format wav|mp3] [--rate 16000] [--out FILE]
```

`--max-frames` (200 por defecto) evita llenar el disco con un video largo
muestreado demasiado fino; el comando avisa cuando llega al tope, y entonces
conviene subir `--every` o acotar con `--start/--end`.

## Problemas frecuentes

- **`--mode scenes` no devuelve nada**: el video no tiene cortes duros. Baja
  `--threshold` a 0.1 o cambia a `--mode interval`.
- **Todas las capturas se ven iguales**: el video cambia despacio; usa
  `--mode scenes`, o muestrea más fino en el tramo que te interesa.
- **La primera captura sale en negro**: muchos videos abren con fundido. Usa
  `--start 1` o mira la siguiente captura.
- **Texto ilegible en la hoja de contactos**: es esperable, las celdas son
  miniaturas. Usa `grab --crop` sobre el video original.
- **Video vertical (móvil)**: pasa `--tile-ratio 1.78` a `sheet` para que las
  celdas no queden con franjas negras enormes.

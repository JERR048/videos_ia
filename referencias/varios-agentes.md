# Trabajo con varios agentes

Sirve cuando hay varios videos o varios formatos. Así se hicieron los 16 anuncios de WhatMas (4 de noviembre de 2026)
y las cinco pruebas de formato (10 de noviembre de 2026). Para un solo video corto no hace falta.

## Reparto

1. **El líder:**
   - reúne el contexto y escribe la lista de lo que no se puede prometer;
   - prepara `marca.json`;
   - escribe **todos los guiones** y los aprueba con el usuario;
   - genera las voces;
   - **hace el primer video él mismo**: queda de referencia de estilo, escala y uso del kit.
2. **Constructores en paralelo, uno por video:**
   - cada uno crea solo su archivo (`anuncio-XX.js` o `anuncio-XXv.js`);
   - nadie toca el motor (`escena.html`, `formatos.js`), los guiones ni la marca;
   - si al kit le falta una pieza, la construyen en su archivo y la reportan;
   - revisan con hojas de contacto y arman su propio video al final.
3. **Revisión por alguien que no lo hizo:**
   - el líder, u otro agente, mira cuadros del MP4 final;
   - no edita: reporta cada problema con el tiempo, la posición en px y el arreglo sugerido.
4. **Las correcciones las aplica el constructor original.** Así cada archivo tiene un solo dueño.
5. **El líder** pasa al kit las piezas que valieron la pena y actualiza la documentación.

## Lo que se aprendió

- **El guion va fijo en el encargo.** Si el constructor puede cambiar el texto, se gasta voz y se cuelan promesas.
- **Un brief corto con las piezas del kit** rinde más que mandar a leer todo: reglas duras, comandos, zonas del cuadro,
  lista de piezas y qué revisar.
- **GPU compartida:** cuatro constructores a la vez funcionan con un límite de 16 cuadros por corrida.
- **Los revisores encuentran problemas reales en todos los videos:** paneos con cuadros vacíos, un cuadro dentro de un
  corte, etiquetas bajo los botones, parpadeos antes del cierre. El líder también revisa lo que hizo él.
- **Diez constructores a la vez funcionaron** (10 de noviembre de 2026) con 12 cuadros por corrida y un render largo
  al mismo tiempo: unos 25 minutos por video. Los arreglos comunes (una letra, el volumen) se aplican al motor
  cuando todos acaban y se vuelve a armar todo.
- **Di en el encargo cómo debe verse distinto cada video** del mismo formato: lugar, paleta, mecánica.
- **Parte de un video terminado del mismo formato:** copiarlo y extenderlo rinde más que empezar de cero.
- **No edites el motor mientras otros lo usan.** Los cambios del kit se hacen antes de repartir o cuando todos acaban.

## Encargo para un constructor

```
Construye un video vertical (≈ <duración>) en el formato «<formato>», con el kit de video que está en <carpeta>.
Lee primero <brief o referencias/escena.md> y el ejemplo terminado <anuncio-ejemplo.js>. Tu id es `XX`: creas SOLO
el archivo anuncio-XXv.js. El guion (guiones/XX.json) y la voz (timeline-XX.json) ya existen y no se tocan.

El formato: <qué lo define, en 3 o 4 líneas: quién habla, cómo se mueve la cámara, qué aparece en pantalla>.

Guion: <escena por escena, con los trozos>.

Lo que el producto hace de verdad: <resumen con citas>. No prometas: <lista>. Letra pequeña obligatoria: <texto o
«ninguna»>.

Plan visual (mejóralo, sin añadir promesas): <escena por escena>.

Itera con hojas de contacto hasta que estén limpias (3–4 rondas, como mucho 16 cuadros por corrida), luego arma el
video con `bash armar.sh <destino> XXv`, pásale `python revisar_video.py` y mira 6 cuadros del MP4 final.
Informa en menos de 200 palabras: qué muestra cada escena, los tiempos revisados, las piezas que construiste y
deberían pasar al kit, lo que no lograste y la salida de revisar_video.py.
```

## Encargo para un revisor

```
Eres un revisor independiente del video XX, «<título>», en <carpeta>. No edites ningún archivo: solo reporta.
Lee referencias/sonido-y-calidad.md §2 y referencias/escena.md §«El cuadro vertical». Saca hojas de contacto cada
1–1,5 s y en cada cambio de subtítulo (como mucho 16 cuadros por corrida), más un cuadro antes y otro después de cada
corte. Revisa: primer cuadro, zonas seguras, legibilidad, cortes y cuadros vacíos, sincronía, ritmo, afirmaciones
contra <resumen>, y el cierre. Informa los problemas de mayor a menor, con el tiempo, la posición en px y el arreglo
sugerido, y termina con un veredicto.
```

## Copiar un estilo sin copiar el video

Cuando el usuario trae un video de referencia:

1. **Mide antes de opinar.** Números, no adjetivos:
   ```bash
   ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of default=nw=1 ref.mp4
   ffmpeg -v error -i ref.mp4 -vf "fps=1,scale=288:512,tile=6x2" -q:v 4 hoja_%02d.jpg      # un cuadro por segundo
   ffmpeg -i ref.mp4 -vf "select='gt(scene,0.25)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*"   # cortes
   ```
   Transcribe el audio con faster-whisper (`word_timestamps=True`) y saca las palabras por segundo.
2. **Anota:** duración, palabras por segundo, cada cuánto cambia la imagen, dónde va el subtítulo y cómo es, cómo abre
   y cómo cierra, qué tarjetas o rótulos usa.
3. **Toma el formato, nunca el guion, los personajes ni las escenas.** La mascota y la voz son las de la marca.
4. **No publiques cuadros del video de referencia** ni lo subas a ningún lado: son material de estudio.
5. Si el formato es nuevo, haz una prueba de 15 s antes de un video completo y muéstrasela al usuario.

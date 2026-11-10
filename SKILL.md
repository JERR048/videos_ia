---
name: videos-ia
description: Make short narrated videos for social media and ads, rendered entirely on this PC (three.js in headless Chrome + ffmpeg, ElevenLabs voice, burned-in captions, synthesized sound effects). Covers choosing the format before writing (product ad, mascot dialogue, presenter explainer, miniature-world documentary, video-game levels, 2D-cartoon story), writing the hook and script, building the scene, reviewing frames, sound and final QA. Use when the user asks for a video, reel, short, TikTok, anuncio, video viral, video animado, video explicativo, "un video como los de WhatMas", or wants to decide what kind of video to make for a product or topic.
---

# Videos con IA para redes y anuncios

Hace videos narrados de 15 s a 2 min, verticales u horizontales, sin generador de video: todo se dibuja con three.js
en Chrome sin ventana y se arma con ffmpeg en este equipo. Lo único que sale a internet es el texto del guion, que va
al servicio de voz.

**Dónde está todo** (rutas relativas a esta carpeta):

| Ruta | Qué es |
|---|---|
| `kit/` | El motor y los ejemplos. Se copia a una carpeta de trabajo |
| `referencias/formatos.md` | **Qué formato elegir** y la receta de cada uno |
| `referencias/guion.md` | Gancho, ritmo, lo que no se puede decir, `guiones/XX.json`, `marca.json`, la voz |
| `referencias/escena.md` | Cómo se escribe `anuncio-XX.js`: zonas del cuadro, cámara, todas las piezas |
| `referencias/sonido-y-calidad.md` | Efectos y música, revisión cuadro por cuadro, armado, control de calidad |
| `referencias/varios-agentes.md` | Reparto entre agentes, plantillas de encargo, cómo estudiar un video de referencia |
| `referencias/errores-conocidos.md` | Síntoma, causa y arreglo de lo que ya falló una vez |
| `referencias/analisis-referencias.md` | De dónde salen las reglas: seis videos medidos y dos repositorios |
| `ejemplos/` | Cuadros de las pruebas de cada formato |

## El flujo

Sigue los pasos en orden. Lee la referencia de cada paso cuando llegues a él, no todas al principio.

1. **Entiende el encargo.** Qué producto o tema, dónde se va a publicar, qué fuentes hay. Pregunta solo lo que no
   puedes decidir: dónde se publica, la marca y los datos del cierre.
2. **Elige el formato** con `referencias/formatos.md` y dile al usuario cuál y por qué, en dos líneas.
3. **Lee el contexto y escribe la lista de lo que no se puede prometer** (`referencias/guion.md` §1).
4. **Prepara la carpeta de trabajo:** copia `kit/` a una carpeta local **fuera de OneDrive o Dropbox**, corre
   `npm install` y pon la marca en `marca.json` e `img/logo.png`. La primera vez en un equipo, haz la prueba de humo
   de `kit/README.md`.
5. **Escribe el guion** en `guiones/XX.json` (`referencias/guion.md`): cinco ganchos, los dos mejores al usuario, y
   el guion completo con lo que se ve en cada tramo. **Espera su visto bueno antes de generar la voz.**
6. **Genera la voz:** `python guion.py XX`. Debe decir «alineadas N/N» en cada escena.
7. **Construye la escena** en `anuncio-XXv.js`, partiendo del ejemplo del formato (`referencias/escena.md`).
8. **Revisa cuadro por cuadro** con `bash fotos.sh XXv …` hasta que las hojas estén limpias, y los cortes con
   `node revisar_cortes.mjs XXv` (`referencias/sonido-y-calidad.md` §2). Lo normal son de 3 a 5 rondas.
9. **Arma y verifica:** `bash armar.sh <destino> XXv`, `python revisar_video.py <mp4>` y de 6 a 10 cuadros del MP4
   final.
10. **Entrega:** la ruta del MP4, lo que mide el control de calidad y lo que el usuario debe escuchar. Tú no oyes el
    audio.

Para un formato o una marca nuevos, haz primero una **prueba de 12–15 s** y muéstrala antes del video completo.
Para varios videos a la vez, reparte con `referencias/varios-agentes.md`.

## Reglas que no se negocian

- **Solo se dice lo que las fuentes respaldan.** Ninguna cifra, caso ni fuente inventados. Los negocios y las personas
  de ejemplo son inventados y se nota.
- **La clave de ElevenLabs nunca va en un archivo, en el chat ni en un commit.** Sale de `ELEVENLABS_API_KEY` o del
  secreto `ElevenLabsApiKey` de SecretStore.
- **El guion se aprueba antes de gastar voz.** Cada escena se paga una vez; cambiar el texto la vuelve a pagar.
- **De un video de referencia se toma el formato, nunca el guion, los personajes ni las escenas.** Sus cuadros no se
  publican.
- **`actualizar(T)` es función pura del tiempo** y todo tiempo va atado al guion (`c()`, `s()`, `e()`, `w()`).
- **No se renderiza hasta que las hojas estén limpias,** y no se entrega sin pasar `revisar_video.py`.
- **Los videos se quedan en el equipo.** No se publican en una página ni se suben a un repositorio sin que el usuario
  lo pida.
- **Nunca mates procesos de Chrome que no sean tuyos:** ahí corre el navegador del usuario.
- **El motor no se edita para un solo video.** Lo que falte se construye en `anuncio-XX.js`; si sirve tres veces, pasa
  al kit y a `referencias/escena.md`.

## Requisitos del equipo

- Node 18 o más, Python 3.10 o más, Google Chrome, ffmpeg y ffprobe. Mejor con GPU.
- `pip install numpy` (sonido). Opcionales: `edge-tts` (voz gratis de respaldo), `faster-whisper` (comprobar la
  pronunciación).
- Si ffmpeg o Chrome no están en la ruta habitual: `FFMPEG=…`, `CHROME=…`.

## Mantener esta habilidad

Cuando un video enseñe algo nuevo, déjalo escrito aquí mismo:

- un error que costó tiempo → `referencias/errores-conocidos.md`;
- una pieza que se usó por tercera vez → al motor (`kit/formatos.js`) y a `referencias/escena.md`;
- un formato nuevo que el usuario aprobó → `referencias/formatos.md`, con su ejemplo en `kit/`;
- una preferencia del usuario sobre voz, cierre o estilo → `referencias/guion.md`.

Esta carpeta es un repositorio de git: confirma los cambios con un commit y súbelos solo si el usuario lo pide.

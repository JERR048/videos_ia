# Kit de video

El motor, los scripts y un ejemplo por formato. La guía está un nivel arriba: `../SKILL.md` y `../referencias/`.
Este archivo es la referencia rápida de comandos.

## Preparar

1. Copia esta carpeta a una carpeta de trabajo **fuera de OneDrive o Dropbox**.
2. `npm install` (three 0.169.0 y puppeteer-core 23.11.1; usa el Chrome instalado).
3. `pip install numpy`. Opcionales: `edge-tts`, `faster-whisper`.
4. Pon la marca en `marca.json` y el logo en `img/logo.png` (PNG con fondo transparente, de unos 900×540).

## Prueba de humo

```bash
VOZ_MOTOR=edge python guion.py demo        # voz gratis; debe decir «alineadas N/N»
bash fotos.sh demo 3 8 12                  # mira build/demo/hoja_1.jpg
bash armar.sh ../videos demo demov         # ../videos/tumarca-demo.mp4 y tumarca-demo-vertical.mp4
python revisar_video.py ../videos/tumarca-demo-vertical.mp4
```

## Comandos

```bash
python guion.py XX                 # voz + timeline-XX.json   (VOZ_MOTOR=edge para la voz gratis)
python tiempos.py XX               # momentos útiles para revisar
bash fotos.sh XXv 0.4 2.1 3.4 …    # hojas de contacto en build/XXv/hoja_N.jpg (zonas prohibidas en rosa)
node revisar_cortes.mjs XX XXv     # llaves de cámara en orden y ningún cuadro dentro de un corte
bash armar.sh <destino> XX XXv     # sonido + render + compresión por debajo de 15 MB
python revisar_video.py <mp4>      # control de calidad del MP4
node render.mjs XXv sonidos        # (a mano) anota los efectos; luego: python sonido.py XXv
```

`XX` es el horizontal y `XXv` el vertical; los dos usan `guiones/XX.json`.

## Archivos

| Archivo | Qué es | ¿Se edita? |
|---|---|---|
| `marca.json`, `img/logo.png` | La marca: colores, voces, pronunciación, cierre | Una vez por marca |
| `guiones/XX.json` | El guion de cada video | Uno por video |
| `anuncio-XX.js`, `anuncio-XXv.js` | La escena de cada video (horizontal y vertical) | Uno por video |
| `escena.html` | El motor y las piezas del anuncio de producto | No |
| `formatos.js` | Las piezas de los formatos de redes | No |
| `guion.py` | Voz (ElevenLabs o `edge-tts`) y línea de tiempo con tiempos por palabra | No |
| `sonido.py` | Efectos y música sintetizados, mezclados bajo la voz | No |
| `render.mjs`, `fotos.sh`, `armar.sh`, `tiempos.py` | Cuadros sueltos, hojas de contacto, render y compresión | No |
| `revisar_cortes.mjs`, `revisar_video.py` | Revisión de cortes de cámara y del MP4 final | No |
| `ejemplos/` | Seis anuncios de producto reales, para leer el código | No |

## Ejemplos que corren

| Id | Formato | Archivos |
|---|---|---|
| `demo` | Anuncio de producto, horizontal y vertical | `guiones/demo.json`, `anuncio-demo.js`, `anuncio-demov.js` |
| `dialogo` | Diálogo con mascota | `guiones/dialogo.json`, `anuncio-dialogov.js` |
| `presenta` | Presentador que explica | `guiones/presenta.json`, `anuncio-presentav.js` |
| `mundo` | Mundo en miniatura | `guiones/mundo.json`, `anuncio-mundov.js` |
| `juego` | Videojuego de plataformas, sin muñecos humanos | `guiones/juego.json`, `anuncio-juegov.js` |
| `robot` | Mascota que explica | `guiones/robot.json`, `anuncio-robotv.js` |
| `cuento` | Cuento con dibujos | `guiones/cuento.json`, `anuncio-cuentov.js` |

Para probar uno: `VOZ_MOTOR=edge python guion.py dialogo && bash fotos.sh dialogov 0.5 3 6 9 12`.

Los ejemplos de redes usan dos voces (`robot` y `ana`) y un narrador (`narra`), definidos en `marca.json → voces`.

# Sonido, revisión y control de calidad

## 1. Sonido

Los videos que funcionan en redes llevan efectos y casi siempre música. El kit los sintetiza en el equipo con
`sonido.py`: no descarga nada y no usa bibliotecas de audio con licencia.

**Cómo se anotan.** En `anuncio-XX.js`, una sola vez y fuera de `actualizar`:

```js
k.sonar(c('gancho', 1), 'pop');          // aparece una tarjeta
[1, 2, 4].forEach(n => k.sonar(c('yo', n) + .05, 'tic'));   // cada casilla de una lista
k.sonar(c('cta', 0), 'logro');           // celebración
```

`k.planos(...)` anota solo un soplo en cada corte de cámara. Con el estilo de subtítulo `caja` (videojuego) suena un
«bip» por palabra.

| Efecto | Para qué | Nivel bajo la voz |
|---|---|---|
| `paso` | Corte o deslizamiento de cámara | −19 dB |
| `pop` | Aparece una tarjeta o un objeto | −14 dB |
| `tic` | Se marca una casilla | −15 dB |
| `sube` | Un contador que sube | −17 dB |
| `logro` | Celebración, cierre | −12 dB |
| `golpe` | Impacto: algo se cierra o cae | −10 dB |
| `error` | Algo sale mal | −15 dB |
| `brillo` | Destello | −18 dB |
| `moneda`, `nivel`, `tecla` | Videojuego: recoger, subir de nivel, letra del diálogo | −15, −13, −24 dB |

El tercer valor de `k.sonar(t, tipo, volumen)` multiplica el nivel (1 por defecto).

**Reglas:**

- Un efecto por cada cosa que aparece o cambia. Si dos caen a menos de 0,1 s, deja uno.
- El efecto cae en el mismo cuadro que la imagen, o hasta 3 cuadros antes de la palabra. Nunca después.
- **Música** (opcional, en el guion): `"musica": "pad"` es un colchón de acordes; `"pulso"` le suma un bombo suave.
  Va a −24 dB bajo la voz (`"musicaDb"` lo cambia) y baja 3,5 dB mientras hay voz.
- La mezcla lleva un limitador suave: el pico queda por debajo de −3 dBTP después de comprimir.

**Cómo se arma.** `armar.sh` lo hace solo. A mano:

```bash
node render.mjs XXv sonidos     # escribe build/XXv/sonidos.json con lo que anotó el anuncio
python sonido.py XXv            # escribe build/XXv/mezcla.wav; el render la usa en vez de voz.wav
```

Un anuncio que no anota efectos ni pide música sale con la voz sola, como antes.

**El agente no oye el resultado.** Mide el volumen, no el gusto. Pide siempre que una persona escuche el video antes
de publicarlo, y ofrece quitar la música si no convence (`"musica"` fuera del guion).

## 2. Revisar cuadro por cuadro (antes de renderizar)

```bash
python tiempos.py XX                    # momentos útiles
bash fotos.sh XXv 0.4 2.1 3.4 5.0 …     # build/XXv/hoja_N.jpg: 8 cuadros por hoja en vertical, 12 en horizontal
node revisar_cortes.mjs XX XXv          # llaves de cámara en orden y ningún cuadro dentro de un corte
```

- Las previas verticales marcan en rosa las zonas que tapan las aplicaciones.
- Para el detalle, abre el cuadro suelto `build/XXv/fotos/n00N.jpg`.
- Como mucho 24 cuadros por corrida (16 si hay otros agentes usando la GPU).
- **No renderices el video hasta que las hojas estén limpias.** Lo normal son de 3 a 5 rondas.

**Qué mirar:**

1. **El primer cuadro (T = 0,3 s) ya engancha:** se entiende de qué va sin oír nada.
2. **Subtítulos libres:** nada encima ni debajo de la franja del subtítulo.
3. **Zonas seguras:** ningún texto, cara ni objeto clave en las zonas rosas.
4. **Legible** al tamaño real del celular: tarjetas, chat, panel, rótulos.
5. **Sincronía:** lo que se ve es lo que se dice en ese momento; la tarjeta llega con la palabra o un instante antes.
6. **Ritmo:** cada 1–2,5 s cambia algo. Ningún plano se queda quieto.
7. **Cortes:** saca un cuadro justo antes y otro justo después de cada corte. Sin cuadros vacíos ni objetos a medio
   aparecer.
8. **Afirmaciones:** solo lo que respalda el resumen del contexto. Nombres inventados.
9. **Cierre limpio y con la marca** en el último segundo.

## 3. Armar

```bash
bash armar.sh <carpeta-destino> XX XXv     # sonido + render + compresión a dos pasadas, por debajo de 15 MB
```

- El nombre sale de `archivo` en el guion; el vertical lleva `-vertical`.
- Un video de 15 s tarda cerca de un minuto con GPU.
- La carpeta de trabajo va **fuera de OneDrive o Dropbox**: el render escribe miles de cuadros.

## 4. Control de calidad del MP4 final

```bash
python revisar_video.py <carpeta>/<archivo>-vertical.mp4
```

Informa, no aprueba por su cuenta. Avisa si:

| Revisa | Umbral |
|---|---|
| Tamaño | 1080×1920 o 1920×1080 |
| Peso | Menos de 15 MB |
| Audio | Que exista |
| Cuadros negros | Ninguno en medio del video |
| Imagen congelada | Ningún tramo quieto de más de 0,4 s |
| Silencios | Ninguno de más de 0,6 s en medio |
| Sonoridad | Entre −17 y −13 LUFS |
| Pico real | Por debajo de −1 dBTP |

Después saca de 6 a 10 cuadros del MP4 final, cierre incluido, y míralos:

```bash
ffmpeg -v error -ss 3.4 -i video.mp4 -frames:v 1 -vf scale=405:-1 cuadro.jpg
```

## 5. Entregar

- Dile al usuario dónde quedó el MP4 y qué escuchar: la pronunciación de la marca, las palabras en inglés, los
  efectos y la música.
- Los videos se quedan en el equipo. No se publican en una página ni se suben a un repositorio sin que el usuario lo
  pida.
- Si el usuario pide una página para verlos, que sea local (`index.html` junto a los MP4).

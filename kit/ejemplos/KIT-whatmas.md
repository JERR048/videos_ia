# WhatMas ad kit: how to build one ad

Each ad is 1920×1080. It is a light, bright 3D scene (three.js) rendered frame by frame in headless Chrome,
with a Spanish voice-over and word-by-word captions.

## Files

| File | What | May you edit it? |
|---|---|---|
| `escena.html` | The engine and every reusable piece (kit). It loads `timeline-XX.json` and `anuncio-XX.js` through `?ad=XX`. | **No.** If you need something it lacks, build it inside your own `anuncio-XX.js` (you get `THREE` and `scene`). Mention the gap in your report. |
| `anuncio-01.js` | The finished brand ad. **Read it first:** it is the reference for structure, scale and camera distances. | No |
| `anuncio-XX.js` | Your ad. It exports `default function (k) { …; return { actualizar(T) {…} } }`. | Yes. It is the only file you create. |
| `timeline-XX.json` | Already generated: scenes, with `start`, `end`, `voz`, `vozFin` and `chunks[].t0`, the moment each caption chunk is spoken. The script (`guion.py`) is approved. | No |
| `fotos.sh` / `tiempos.py` | Preview helpers. | No |

**Preview:** `bash fotos.sh XX 3.0 7.5 12.0 …` (seconds) writes `build/XX/hoja_1.jpg`, a 3×4 sheet of 640×360 tiles, and
`hoja_2.jpg` if there are more than 12 frames. Look at it with the Read tool. `python tiempos.py XX` prints 3 useful
times per scene.
- Up to 24 frames per run. The GPU is shared with other agents.
- **Do not run `render.mjs XX video`.** The final render is done by the lead.

## The `k` object (what your ad receives)

**Time:**
- `k.s(id)` and `k.e(id)`: start and end of a scene.
- `k.c(id, n)`: when chunk `n` of that scene is spoken.
- Sync every event to these.

**Easing and helpers:**
- `cl` clamps; `lerp`; `eio`, `eo` and `eob` are ease in-out, ease out and overshoot.
- `pr(t, a, d)` is progress from `a` over `d` seconds.
- `ventana(t, a, b, fade)` is 0→1→0 within [a, b].
- `V(x, y, z)` builds a vector; `azar()` is seeded random.

**3D helpers:**
- `mat(color, opts)` makes a matte material; `brillo(color, i)` an emissive one.
- `malla(geometry, material, x, y, z, parent)` makes a mesh with shadows.
- `RoundedBoxGeometry`.
- `k.THREE` and `k.scene`.

**Camera:** `k.setKF([[t, [px, py, pz], [tx, ty, tz]], …])`. It eases between keyframes, in time order. Put a
keyframe ~1 s after each scene starts and one at its end.

**Pieces:**

| Piece | Use |
|---|---|
| `crearRobot()` | The WhatMas mascot: white head, navy visor, half-moon eyes. Call `robot.animar(T, basePosVec3, waving0to1)` every frame. Eyes are in `robot.userData.ojos` (you can recolor them). Scale it about 0.8. |
| `crearCanal('whatsapp' \| 'instagram' \| 'messenger' \| 'telegram', radius)` | A channel disc that faces +z. |
| `crearChat()` + `crearTelefono(chat)` | A phone with a WhatsApp-like chat (see below). Call `chat.dibujar(T)` every frame. Phone scale about 0.58, camera ~9 m away, as in ad 01. |
| `crearPanelUI()` + `crearPortatil(panel)` | A laptop with a WhatMas-like admin panel (see below). Call `panel.dibujar(T)` every frame while it is visible. |
| `crearPersona(shirt, skin, hair)` | A stylized seated person with a headset. Arms are in `userData.brazos` and the head in `userData.cabeza`. |
| `crearLuna()` | A moon. Stars are in `.userData.estrellas` (a Group). Hide both by day. |
| `k.ambiente(n)` | 0 is day and 1 is night: background, floor and lights. **Call it every frame** if you use night; the engine resets to day before calling `actualizar`. Captions turn white automatically at night. |
| `k.mostrar(id, cls, html, anchor, dx, dy, alpha, line = true)` | A label pinned to a 3D point (`Vector3`) or a screen point (`[x, y]`), with an optional leader line. `cls`: `'pill verde'`, `'pill azul'`, `'pill cian'`, `'pill magenta'`, `'pill naranja'`, `'pill blanco'`, `'pill'` (navy), `'lbl'` or `'lbl blanco'`. HTML is allowed (e.g. `Título<small>sub</small>`). Call it every frame with `alpha = ventana(...)`. |
| `k.tarjeta(id, html, cssObject)` once, then `k.verTarjeta(id, alpha, cssTransform)` every frame | A white DOM card (e-mail, tracking page, contact card…). The card has class `.tarjeta` (white, rounded, shadow). Position it with `left` and `top` in px in `cssObject`. |
| `k.letraPequena('…')` | Fine print under the end card. |
| `k.COLOR_CANAL` | Channel colors. |

**Chat (`chat.conf`):**
- `nombre`, `estado`, `hora` (e.g. `'9:02 p. m.'`), `inicial`, `avatar` (color).
- `mensajes: [...]`. Each message is `{ t, lado: 'in' | 'out', texto, negrita?, tipo?, sinEscribir?, hora? }`. Messages appear at `t`.
  - `'in'` is the business or robot, white on the left. Before each one, a typing bubble shows for 0.9 s unless `sinEscribir`.
  - `'out'` is the customer, green on the right.
- `tipo` values:
  - `'sistema'`: a centered pill, e.g. `HOY`.
  - `'botones'`: `botones: ['A', 'B'], elegido: 0, tElige`.
  - `'lista'`: `boton: 'Ver opciones'`. Pair it with `chat.conf.hoja = { t0, t1, tElige, titulo, opciones: [], elegida }`, a bottom sheet.
  - `'imagen'`: `dibujo(g, x, y, w, h)` draws on the 2D canvas; `pie` is the caption.
  - `'catalogo'`: `titulo`, `sub`, `boton`, `items: [{ nombre, precio, fondo, dibujo(g, x, y, w, h) }]`, up to 4.
  - `'carrito'`: `texto: '3 artículos'`, `total`.
  - `'documento'`: `texto: 'archivo.pdf'`.
- The chat auto-scrolls. Keep texts short: the phone is small on screen.
- `chat.conf.encima = (g, t, { CW, CH, TOP, BOT, textoAjustado, redondo }) => {…}` draws on top of the whole chat
  screen every frame. Its logical size is CW × CH (≈ 554 × 1187). Use it for full-screen overlays the kit lacks, such
  as a WhatsApp form that slides up. Animate with `t`.

**Panel (`panel.conf`):**
- `empresa`, `seccion`, and `menuActivo`, one of `'DASHBOARD'`, `'CHATS'`, `'TICKETS'`, `'CAMPAÑAS'`… (uppercase).
- `modo` values:
  - `'bandeja'`: `filas: [{ t, nombre, canal, texto, nuevos, hora }]`, `chatNombre`, `chatCanal`, `chat: [{ t, lado: 'in' | 'out', texto, robot?, firma? }]`.
  - `'tablero'`: `tarjetas: [{ titulo, color, valor: u => 'texto' }]`, `t0`.
  - `'tickets'`: `filas: [{ t, num, cliente, asunto, estado: 'Registrado' | 'En proceso' | 'Finalizado', espera, nuevo }]`. A row with `nuevo` blinks green.
  - `'pedido'`: the inbox plus `pedido: { t, items: [{ nombre, cant, precio, sub }], total }`, an order card that pops in.
  - **a function** `(t, g, { iconoCanal, textoAjustado, redondo, PW, PH })`: your own screen. The frame (sidebar, top
    bar, logo) is already drawn. Draw the content area, x 290–1580 and y 94–980 of the 1600×1000 canvas, in the same
    style: white rounded cards on #F3F5F7, navy titles in Montserrat, Inter for body text, brand colours. Use it for
    screens the kit lacks, such as a campaign detail, survey results, queues or a knowledge base.

**Done by the engine:**
- the caption band at the top (about y 60–160 px), word by word, from the timeline (`*palabra*` shows as a green pill);
- the end card during the `cierre` scene: logo, «Conoce más en www.whatmas.com» and +57 300 912 0680 (no Instagram, by the client's request);
- the fade in and out.

## Rules

- **Look:**
  - Light and bright, with the brand colors: green #5BB04B, blue #3D7DD9, cyan #4FB6E0, magenta #C73E70, orange #E27A3F and navy #0E1620.
  - Use the same visual language as ad 01: clay-like matte objects, soft shadows, floating channel discs and the robot.
- **Layout:**
  - Keep the top caption band free. No object or label above ~y 170 px in the frame.
  - Nothing important cut off at the edges.
  - The phone screen must be readable.
  - No clutter: hide or scale down props when they are not part of the current shot.
- **Names:** invented only (e.g. «Ana Gómez»). No real people, companies or data.
- **Claims:** only what the script says. On-screen UI text must not promise anything from section 4.2 of
  the project's manual summary (`contexto/manual-resumen.md`). The main ones:
  - no «24/7»;
  - no «IA incluida»;
  - no scheduling or inventory unless through integrations;
  - no free messaging after 24 h;
  - no cancelling campaigns;
  - no email inbox, web chat or calls.
- **Brand spelling** in text: «WhatMas» (the logo image says WHATMÁS). Use «tú» in customer-facing chat text.
- **Iterate:** preview, look at the sheet critically (overlaps, cut-offs, readability, empty or cluttered frames,
  timing against the caption), fix, and preview again. Two to four rounds are normal.

## Report back (short)

- which scenes show what;
- the times you checked;
- anything you could not do with the kit;
- the path of your `anuncio-XX.js`.

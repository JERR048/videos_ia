# Vertical 9:16 version of a WhatMas ad (Reels, TikTok, WhatsApp status)

Read `KIT.md` first; everything there still applies. This file lists only what changes.

## The task

The four horizontal ads (1920×1080) are finished and approved. You make the **vertical 1080×1920** version of one
of them. Your deliverable is a single new file, `anuncio-XXv.js`.
- Start by copying `anuncio-XX.js` to `anuncio-XXv.js`. Then recompose each shot for a tall frame.
- **Keep the story the same.** That includes:
  - the same timeline and voice (the audio is reused as-is);
  - the same chat and panel content;
  - the same props and the same beats, synced to the same captions.
- Change only positions, scales, camera keyframes, label placement and card layout.
- You may simplify a shot when two things cannot fit side by side.

**Reference:** `anuncio-01v.js` is ad 01 already converted, by the lead. Compare it with `anuncio-01.js` to see the
kind of changes:
- the four channel discs go from a row to a 2×2 grid;
- the robot stands to the lower left of the phone instead of beside it;
- labels move from under objects to above them;
- the team shot is seen from higher up, with the people in front of the laptop;
- the dashboard close-up becomes a slow horizontal pan;
- the end-scene discs sit around the logo.

**Do not edit:** `escena.html`, the horizontal `anuncio-XX.js`, `timeline-*.json` or `guion.py`. If the kit lacks
something, build it inside your own file and mention it in your report.

## What the engine does in vertical

- `?ad=XXv` loads `timeline-XX.json` and `anuncio-XXv.js`.
- `k.W = 1080`, `k.H = 1920` and `k.VERT = true`.
- **Hard-coded 1920 or 1080 literals in your copy are now wrong.** This includes your own projection helpers,
  `[x, y]` screen anchors for `k.mostrar`, and card `left` and `top`. Search for them and use `k.W` and `k.H` or
  vertical coordinates.
- **Captions** sit at the top, starting at y 250 px. They are 66 px and may wrap to two lines, so they reach about
  y 420 px. Keep anything important below y ≈ 450.
- **The end card** (`cierre`) and the fine print are automatic and already laid out for vertical.

## Safe zones (pink in the previews)

The platforms draw their own interface on top of the video. **No text, chat bubble, pill, card, face or key object
may sit in these zones.** Floor, scenery and the lower part of a figure may.

| Zone | Pixels | What covers it |
|---|---|---|
| Top | y 0–220 | platform header and status-bar progress |
| Bottom | y 1480–1920 | username, description, the reply box |
| Right column | x 930–1080, y 880–1480 | like, comment and share buttons |

**Usable area:**
- x 60–1020, but x up to 930 between y 880 and 1480;
- y 450–1460, below the captions.

The pink overlay appears **only in previews** (`fotos.sh`), never in the final video.

## Camera math (vfov 36°, aspect 0.5625)

At distance d from the camera:
- the visible height is about **0.65 × d** metres, and the visible width about **0.366 × d**;
- the scale is about **2955 / d px per metre**.

Ways to recompose:
- **Two things side by side in 16:9 usually do not fit.** Use one of these:
  - stack them, one higher and one lower;
  - use depth: raise the camera and look down, so the closer object sits lower on screen;
  - move the camera from one to the other on the caption that names them. Allow at least about 0.8 s for each move.
- **The phone** suits vertical well. At scale 0.58 and about 13 m away, it is about 960 px tall, more readable than in
  16:9.
  - When the phone shares the shot with a figure, keep the phone right of centre (x ≈ 440–910) with the figure lower
    left.
  - Otherwise centre it.
  - Its top must stay below y ≈ 430 and its bottom above y ≈ 1440.
- **The laptop panel** is landscape.
  - For a close-up, about 9.4 m from the screen gives a panel about 950 px tall and 1530 px wide. Pan across it, as
    the `reportes` scene of `anuncio-01v.js` does.
  - Or frame the whole laptop smaller.
- **DOM cards** (`k.tarjeta`): at most about 900 px wide, placed inside the usable area. Stack cards vertically rather
  than side by side.
- **Night scenes:** `k.ambiente(n)` works the same. Captions turn white automatically.

## Preview

- `bash fotos.sh XXv 3.0 7.5 12.0 …` writes `build/XXv/hoja_1.jpg`, `hoja_2.jpg`, and so on.
  - Each sheet holds 8 frames as 4×2 tiles of 400×711.
  - Up to 24 frames per run. The GPU is shared with two other agents.
- Look at every sheet with the Read tool and check:
  - safe zones;
  - overlaps;
  - cut-offs at the edges;
  - chat readability;
  - empty or cluttered frames;
  - timing against the caption.
- For a full-size check of one frame, open `build/XXv/fotos/n00N.jpg`.
- `python tiempos.py XX` prints useful times. Use the number without the `v`.
- **Do not run `render.mjs … video`.** The lead does the final render.
- Two to four rounds of fixes are normal.

## Report back (short)

- how each scene was recomposed;
- the times you checked;
- anything you could not do with the kit;
- the path of `anuncio-XXv.js`.

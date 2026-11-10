import asyncio, base64, difflib, hashlib, json, os, re, shutil, subprocess, sys, urllib.error, urllib.request

BASE = os.path.dirname(os.path.abspath(__file__))
FFMPEG = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
FFPROBE = os.environ.get("FFPROBE") or (FFMPEG[:-10] + "ffprobe.exe" if FFMPEG.lower().endswith("ffmpeg.exe") else (shutil.which("ffprobe") or "ffprobe"))
MARCA = json.load(open(os.path.join(BASE, "marca.json"), encoding="utf-8"))
VOZCFG = MARCA.get("voz", {})
PRON = VOZCFG.get("pronunciacion", {})
VOCES = MARCA.get("voces", {})


def voz_cfg(habla):
    """La voz de quien habla: marca.json -> voces[habla] encima de la voz de la marca."""
    cfg = dict(VOZCFG)
    cfg.update(VOCES.get(habla or "", {}))
    return cfg


def motor_de(cfg):
    """elevenlabs o edge. Una voz sin id de ElevenLabs sale con edge."""
    m = os.environ.get("VOZ_MOTOR") or cfg.get("motor", "edge")
    return "edge" if m == "elevenlabs" and not cfg.get("id") else m


def cargar(ad):
    d = json.load(open(os.path.join(BASE, "guiones", ad + ".json"), encoding="utf-8"))
    escenas = [(x["id"], x.get("antes", 0.3), x.get("despues", 0.4), [tuple(t) if isinstance(t, list) else t for t in x["trozos"]], x.get("habla")) for x in d["escenas"]]
    if not d.get("sinCierre"):
        escenas.append(("cierre", 0.4, 1.8, [tuple(t) if isinstance(t, list) else t for t in MARCA["cierre"]["dice"]], d.get("hablaCierre")))
    return d, escenas


PALABRA = re.compile(r"[0-9a-záéíóúñü]+", re.I)


def tokens(s):
    return [w.lower() for w in PALABRA.findall(s)]


def voz_de(texto):
    t = texto.replace("*", "")
    for k in sorted(PRON, key=len, reverse=True):
        if re.fullmatch(r"[A-ZÁÉÍÓÚÑ0-9]{2,6}", k):
            t = re.sub(r"\b%s\b" % re.escape(k), PRON[k], t)
        else:
            t = t.replace(k, PRON[k])
    return t


def velocidad_edge(cfg):
    v = cfg.get("velocidad", "+8%")
    return v if isinstance(v, str) else "%+d%%" % round((float(v) - 1) * 100)


async def tts(texto, ruta, cfg):
    import edge_tts
    c = edge_tts.Communicate(texto, cfg.get("nombre", "es-CO-SalomeNeural"), rate=velocidad_edge(cfg), boundary="WordBoundary")
    marcas = []
    with open(ruta, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                marcas.append({"t": ch["offset"] / 1e7, "w": ch["text"]})
    return marcas


def clave_elevenlabs():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not k:
        r = subprocess.run(["powershell", "-NoProfile", "-NonInteractive", "-Command", "Get-Secret ElevenLabsApiKey -AsPlainText"], capture_output=True, text=True)
        k = r.stdout.strip()
    if not k:
        sys.exit("Falta la clave de ElevenLabs: define ELEVENLABS_API_KEY o guarda el secreto ElevenLabsApiKey en SecretStore")
    return k


def velocidad_elevenlabs(cfg):
    v = cfg.get("velocidad", 1.0)
    if isinstance(v, str):
        m = re.fullmatch(r"\s*([+-]?\d+)\s*%\s*", v)
        v = 1 + int(m.group(1)) / 100 if m else 1.0
    return max(0.7, min(1.2, float(v)))


def palabras(chars, inicios):
    marcas, w, t = [], "", None
    for ch, s in zip(chars, inicios):
        if ch.isspace():
            if w:
                marcas.append({"t": t, "w": w})
            w, t = "", None
        else:
            if not w:
                t = s
            w += ch
    if w:
        marcas.append({"t": t, "w": w})
    return marcas


def tts_elevenlabs(texto, ruta, cfg):
    voz = cfg.get("id")
    if not voz:
        sys.exit("marca.json → voz.id debe tener el id de la voz de ElevenLabs")
    cuerpo = {"text": texto, "model_id": cfg.get("modelo", "eleven_multilingual_v2"),
              "voice_settings": {"stability": cfg.get("estabilidad", 0.5), "similarity_boost": cfg.get("similitud", 0.75),
                                 "style": cfg.get("estilo", 0.0), "use_speaker_boost": True, "speed": velocidad_elevenlabs(cfg)}}
    if cfg.get("idioma"):
        cuerpo["language_code"] = cfg["idioma"]
    llave = hashlib.sha256(json.dumps([voz, cuerpo], ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()[:24]
    cache = os.path.join(BASE, "build", "cache-voz", llave)
    if not (os.path.exists(cache + ".mp3") and os.path.exists(cache + ".json")):
        url = "https://api.elevenlabs.io/v1/text-to-speech/%s/with-timestamps?output_format=mp3_44100_128" % voz
        req = urllib.request.Request(url, data=json.dumps(cuerpo).encode("utf-8"), method="POST",
                                     headers={"xi-api-key": clave_elevenlabs(), "Content-Type": "application/json", "Accept": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                d = json.load(r)
        except urllib.error.HTTPError as e:
            sys.exit("ElevenLabs respondió %d: %s" % (e.code, e.read().decode("utf-8", "replace")[:500]))
        al = d.get("alignment") or d.get("normalized_alignment") or {}
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        with open(cache + ".mp3", "wb") as f:
            f.write(base64.b64decode(d["audio_base64"]))
        json.dump(palabras(al.get("characters", []), al.get("character_start_times_seconds", [])), open(cache + ".json", "w", encoding="utf-8"), ensure_ascii=False)
    shutil.copyfile(cache + ".mp3", ruta)
    return json.load(open(cache + ".json", encoding="utf-8"))


async def decir(texto, ruta, cfg):
    if motor_de(cfg) == "elevenlabs":
        return tts_elevenlabs(texto, ruta, cfg)
    return await tts(texto, ruta, cfg)


def duracion(ruta):
    return float(subprocess.check_output([FFPROBE, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ruta]).decode().strip())


def alinear(trozos_voz, marcas):
    vt, dueno = [], []
    for i, tv in enumerate(trozos_voz):
        for w in tokens(tv):
            vt.append(w)
            dueno.append(i)
    bt, bti = [], []
    for m in marcas:
        for w in tokens(m["w"]):
            bt.append(w)
            bti.append(m["t"])
    tiempo = [None] * len(vt)
    for a, b, n in difflib.SequenceMatcher(a=vt, b=bt, autojunk=False).get_matching_blocks():
        for k in range(n):
            tiempo[a + k] = bti[b + k]
    conocidos = [i for i, x in enumerate(tiempo) if x is not None]
    for i in range(len(tiempo)):
        if tiempo[i] is None:
            antes = [j for j in conocidos if j < i]
            despues = [j for j in conocidos if j > i]
            if antes and despues:
                a, b = antes[-1], despues[0]
                tiempo[i] = tiempo[a] + (tiempo[b] - tiempo[a]) * (i - a) / (b - a)
            elif antes:
                tiempo[i] = tiempo[antes[-1]] + 0.25 * (i - antes[-1])
            else:
                tiempo[i] = 0.0
    inicio, por_trozo = {}, {}
    for i, d in enumerate(dueno):
        inicio.setdefault(d, tiempo[i])
        por_trozo.setdefault(d, []).append(tiempo[i])
    return [inicio.get(i, 0.0) for i in range(len(trozos_voz))], len(conocidos), len(vt), [por_trozo.get(i, []) for i in range(len(trozos_voz))]


def tiempos_de_palabras(cap, t_voz, t0, t1):
    """El momento de cada palabra del subtitulo (para el karaoke y la boca). Si el subtitulo y la voz tienen las
    mismas palabras, sale de la voz; si no (numeros, siglas), se reparte parejo entre t0 y t1."""
    pal = cap.replace("*", "").split()
    if not pal:
        return []
    cuenta = [len(tokens(w)) for w in pal]
    if sum(cuenta) == len(t_voz) and t_voz:
        out, k = [], 0
        for n in cuenta:
            out.append(t_voz[k] if n and k < len(t_voz) else (out[-1] if out else t0))
            k += n
        return out
    return [t0 + (t1 - t0) * i / len(pal) for i in range(len(pal))]


async def armar(ad):
    out = os.path.join(BASE, "build", ad)
    os.makedirs(out, exist_ok=True)
    t = 0.0
    escenas, lista = [], []
    guion, lista_escenas = cargar(ad)
    npal = 0
    for nombre, pre, post, trozos, habla in lista_escenas:
        cfg = voz_cfg(habla)
        # Un número entre los trozos es una pausa (segundos): la escena se dice por tramos, con ese silencio en medio.
        tramos, pausas = [[]], []
        for x in trozos:
            if isinstance(x, (int, float)):
                pausas.append(float(x))
                tramos.append([])
            else:
                tramos[-1].append(x)
        inicio_escena, v0, cur, chunks = t, t + pre, t + pre, []
        for j, tramo in enumerate(tramos):
            caps = [x[0] if isinstance(x, tuple) else x for x in tramo]
            voces = [voz_de(x[1] if isinstance(x, tuple) else x) for x in tramo]
            mp3 = os.path.join(out, nombre + (".mp3" if j == 0 else "-%d.mp3" % j))
            marcas = await decir(" ".join(voces), mp3, cfg)
            dur = duracion(mp3)
            inicios, ok, total, tw = alinear(voces, marcas)
            npal += total
            ultimo = j == len(tramos) - 1
            print("%s %-12s %5.2fs  alineadas %d/%d%s%s" % (ad, nombre if j == 0 else "%s·%d" % (nombre, j + 1), dur, ok, total,
                  ("  [%s, %s]" % (habla, motor_de(cfg))) if habla else "", "" if ultimo else "  + pausa %.2fs" % pausas[j]))
            for i, (cap, i0) in enumerate(zip(caps, inicios)):
                fin = inicios[i + 1] if i + 1 < len(inicios) else dur
                w = tiempos_de_palabras(cap, tw[i], i0, max(fin, i0 + .05))
                chunks.append({"cap": cap, "t0": round(cur + i0, 3), "w": [round(cur + x, 3) for x in w]})
            lista.append((mp3, pre if j == 0 else 0.0, dur, post if ultimo else pausas[j]))
            cur += dur + (0.0 if ultimo else pausas[j])
        esc = {"id": nombre, "start": round(inicio_escena, 3), "voz": round(v0, 3), "vozFin": round(cur, 3), "end": round(cur + post, 3), "chunks": chunks}
        if habla:
            esc["habla"] = habla
        escenas.append(esc)
        t = cur + post
    tl = {"ad": ad, "total": round(t, 3), "formato": guion.get("formato", "anuncio"), "subtitulos": guion.get("subtitulos", "arriba"), "escenas": escenas}
    if guion.get("tono"):
        tl["tono"] = guion["tono"]
    json.dump(tl, open(os.path.join(BASE, "timeline-%s.json" % ad), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    ins, fil = [], []
    for i, (mp3, pre, dur, post) in enumerate(lista):
        ins += ["-i", mp3]
        fil.append("[%d:a]aresample=48000,aformat=channel_layouts=mono,adelay=%d,apad=pad_dur=%.3f[a%d]" % (i, int(pre * 1000), post, i))
    fil.append("".join("[a%d]" % i for i in range(len(lista))) + "concat=n=%d:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[out]" % len(lista))
    subprocess.check_call([FFMPEG, "-v", "error", "-y"] + ins + ["-filter_complex", ";".join(fil), "-map", "[out]", "-ac", "2", os.path.join(out, "voz.wav")])
    print("%s total %.2fs, %d palabras, %.2f palabras/s" % (ad, t, npal, npal / t if t else 0))


ads = sys.argv[1:]
if not ads:
    sys.exit("Uso: python guion.py <id> [<id> ...]  (lee guiones/<id>.json)")
for ad in ads:
    asyncio.run(armar(ad))

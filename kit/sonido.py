"""Efectos de sonido y cama de música, sintetizados aquí mismo y mezclados bajo la voz.

Uso:  python sonido.py XX [XXv ...]
Lee   build/XX/sonidos.json   (lo escribe render.mjs: los k.sonar() y los cortes de k.planos() del anuncio)
      build/<guion>/voz.wav   (la voz, de guion.py)  y  timeline-<guion>.json
Deja  build/XX/mezcla.wav     (render.mjs la usa en vez de voz.wav si existe)

Nada sale del equipo. Los niveles van referidos a la voz: un efecto suena entre 10 y 22 dB por debajo.
La música es opcional: en guiones/<guion>.json, "musica": "pad" (colchón suave) o "pulso" (colchón con bombo).
El agente no oye el resultado: pide siempre que una persona lo escuche antes de publicar.
"""
import json, os, sys, wave
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
BASE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def ruido_banda(dur, f0, f1, rosa=True):
    n = int(dur * SR)
    x = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f >= f0) & (f <= f1)).astype(float)
    if rosa:
        m = m / np.sqrt(np.maximum(f, 20))
    y = np.fft.irfft(x * m, n)
    return y / (np.abs(y).max() + 1e-9)


def cuadrada(f, dur, caida=None):
    t = t_(dur)
    y = np.sign(np.sin(2 * np.pi * f * t)) * .5 + np.sin(2 * np.pi * f * t) * .5
    env = np.exp(-t / caida) if caida else np.ones_like(t)
    env *= np.minimum(1, t / .003) * np.minimum(1, (dur - t) / .006)
    return y * env


def paso():  # un «whoosh» corto para los cortes de cámara
    dur, pico = .5, .09
    t = t_(dur)
    env = np.where(t < pico, (t / pico) ** 2.2, np.exp(-(t - pico) / .16))
    return ruido_banda(dur, 330, 2200) * env


def pop():  # aparece una tarjeta
    t = t_(.2)
    f = 190 + 260 * np.exp(-t / .03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .05) + ruido_banda(.2, 3000, 9000, False) * np.exp(-t / .004) * .3


def tic():  # se marca una casilla
    t = t_(.14)
    return sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / tau) for f, a, tau in [(1180, 1, .03), (1770, .5, .022), (2650, .25, .015)])


def sube():  # un contador que sube
    out = np.zeros(int(.6 * SR))
    for i in range(9):
        b = cuadrada(520 * 2 ** (i / 9), .05, .02) * .8
        a = int(i * .055 * SR)
        out[a:a + len(b)] += b
    return out


def logro():  # celebración: tres notas de campana
    out = np.zeros(int(1.3 * SR))
    for i, f in enumerate([1046.5, 1318.5, 1568.0]):
        t = t_(1.0)
        b = (np.sin(2 * np.pi * f * t) + .35 * np.sin(2 * np.pi * f * 2.756 * t) * np.exp(-t / .08)) * np.exp(-t / .32) * np.minimum(1, t / .004)
        a = int(i * .095 * SR)
        out[a:a + len(b)] += b
    return out


def golpe():  # impacto grave
    t = t_(.3)
    f = 62 * (1 + 1.1 * np.exp(-t / .02))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .07) + ruido_banda(.3, 2500, 8000, False) * np.exp(-t / .003) * .25


def error():  # algo sale mal
    out = np.zeros(int(.5 * SR))
    for i, f in enumerate([311, 233]):
        b = cuadrada(f, .2, .12) * .7
        a = int(i * .17 * SR)
        out[a:a + len(b)] += b
    return out


def brillo():  # destello
    out = np.zeros(int(.6 * SR))
    for i in range(7):
        t = t_(.25)
        b = np.sin(2 * np.pi * rng.uniform(2200, 5200) * t) * np.exp(-t / .06) * np.minimum(1, t / .002)
        a = int(rng.uniform(0, .3) * SR)
        out[a:a + len(b)] += b
    return out


def tecla():  # letra del cuadro de diálogo de videojuego
    return cuadrada(880, .035, .02)


def moneda():
    return np.concatenate([cuadrada(988, .07), cuadrada(1319, .28, .11)])


def nivel():  # sube de nivel
    return np.concatenate([cuadrada(f, .085, .2) for f in (523, 659, 784)] + [cuadrada(1047, .35, .14)])


# tipo -> (función, dB bajo la voz)
EFECTOS = {"paso": (paso, -19), "pop": (pop, -14), "tic": (tic, -15), "sube": (sube, -17), "logro": (logro, -12), "golpe": (golpe, -10),
           "error": (error, -15), "brillo": (brillo, -18), "tecla": (tecla, -24), "moneda": (moneda, -15), "nivel": (nivel, -13)}


def rms_pico(x, ventana=.05):
    n = max(1, int(ventana * SR))
    if len(x) <= n:
        return float(np.sqrt(np.mean(x ** 2)) + 1e-12)
    c = np.cumsum(np.concatenate([[0.0], x ** 2]))
    return float(np.sqrt(((c[n:] - c[:-n]) / n).max()) + 1e-12)


def leer_wav(ruta):
    w = wave.open(ruta)
    assert w.getsampwidth() == 2 and w.getframerate() == SR, "se espera voz.wav de 16 bits a 48 kHz"
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    return x.reshape(-1, w.getnchannels()).mean(axis=1)


def musica(tipo, dur, tramos):
    """Colchón de acordes (Am, F, C, G) con senos desafinados; «pulso» le suma un bombo suave a 100 bpm."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    acordes = [(220.0, 261.63, 329.63), (174.61, 220.0, 261.63), (130.81, 196.0, 261.63), (196.0, 246.94, 293.66)]
    comp = 2.4  # segundos por acorde (un compás a 100 bpm)
    y = np.zeros(n)
    for i in range(int(dur / comp) + 1):
        a, b = int(i * comp * SR), min(n, int((i + 1) * comp * SR) + int(.6 * SR))
        if a >= n:
            break
        tt = np.arange(b - a) / SR
        env = np.minimum(1, tt / .5) * np.minimum(1, np.maximum(0, (b - a) / SR - tt) / .6)
        for f in acordes[i % 4]:
            for d in (-.4, .35):
                y[a:b] += np.sin(2 * np.pi * (f + d) * tt + rng.uniform(0, 6.28)) * env * .16
            y[a:b] += np.sin(2 * np.pi * f * 2 * tt) * env * .03
    if tipo == "pulso":
        paso_s = .6
        for i in range(int(dur / paso_s)):
            tt = t_(.22)
            b = np.sin(2 * np.pi * np.cumsum(52 * (1 + 1.4 * np.exp(-tt / .018))) / SR) * np.exp(-tt / .07) * (.55 if i % 2 == 0 else .3)
            a = int(i * paso_s * SR)
            y[a:a + len(b)] += b[:max(0, n - a)]
    # baja 3,5 dB mientras suena la voz (ataque 70 ms, liberación 450 ms)
    obj = np.ones(n)
    for a, b in tramos:
        obj[max(0, int((a - .08) * SR)):min(n, int((b + .12) * SR))] = 10 ** (-3.5 / 20)
    g = np.empty(n)
    v = 1.0
    ka, kr = 1 - np.exp(-1 / (.07 * SR)), 1 - np.exp(-1 / (.45 * SR))
    paso_b = 64
    for i in range(0, n, paso_b):
        o = obj[i]
        v += (o - v) * (1 - (1 - (ka if o < v else kr)) ** paso_b)
        g[i:i + paso_b] = v
    y *= g * np.minimum(1, t / .4) * np.minimum(1, np.maximum(0, dur - t) / .8)
    return y


def mezclar(ad):
    base = ad[:-1] if ad.endswith("v") else ad
    dir_ad = os.path.join(BASE, "build", ad)
    tl = json.load(open(os.path.join(BASE, "timeline-%s.json" % base), encoding="utf-8"))
    guion = json.load(open(os.path.join(BASE, "guiones", base + ".json"), encoding="utf-8"))
    ruta_s = os.path.join(dir_ad, "sonidos.json")
    if not os.path.exists(ruta_s):
        sys.exit("Falta %s: corre primero  node render.mjs %s sonidos" % (ruta_s, ad))
    cues = json.load(open(ruta_s, encoding="utf-8"))["sonidos"]
    if not cues and not guion.get("musica") and tl.get("subtitulos") != "caja":
        if os.path.exists(os.path.join(dir_ad, "mezcla.wav")):
            os.remove(os.path.join(dir_ad, "mezcla.wav"))
        print("%s: sin efectos ni música; queda la voz sola" % ad)
        return
    voz = leer_wav(os.path.join(BASE, "build", base, "voz.wav"))
    n = len(voz)
    activa = voz[np.abs(voz) > .02]
    nivel_voz = float(np.sqrt(np.mean(activa ** 2))) if len(activa) else .1
    if tl.get("subtitulos") == "caja":  # videojuego: un «bip» por palabra del cuadro de diálogo
        for sc in tl["escenas"]:
            for ch in sc["chunks"]:
                cues += [{"t": w, "tipo": "tecla", "vol": 1} for w in ch.get("w", [])]
    fx = np.zeros(n)
    cuenta = {}
    for q in cues:
        if q["tipo"] not in EFECTOS:
            print("  aviso: efecto desconocido «%s»" % q["tipo"])
            continue
        fn, db = EFECTOS[q["tipo"]]
        b = fn()
        b = b / rms_pico(b) * nivel_voz * 10 ** (db / 20) * float(q.get("vol", 1))
        a = int(q["t"] * SR)
        if a >= n:
            continue
        b = b[:n - a]
        fx[a:a + len(b)] += b
        cuenta[q["tipo"]] = cuenta.get(q["tipo"], 0) + 1
    mus = np.zeros(n)
    tipo = guion.get("musica")
    if tipo:
        mus = musica(tipo, n / SR, [(sc["voz"], sc["vozFin"]) for sc in tl["escenas"]])
        mus = mus / (np.sqrt(np.mean(mus ** 2)) + 1e-9) * nivel_voz * 10 ** (float(guion.get("musicaDb", -24)) / 20)
    mix = voz + fx + mus
    # limitador suave: lo que pasa de 0,55 se redondea hacia 0,72 (al comprimir a AAC el pico real sube más de 1 dB)
    u, techo = .55, .72
    m = np.abs(mix)
    mix = np.where(m > u, np.sign(mix) * (u + (techo - u) * np.tanh((m - u) / (techo - u))), mix)
    w = wave.open(os.path.join(dir_ad, "mezcla.wav"), "wb")
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(np.repeat((mix * 32767).astype(np.int16), 2).tobytes())
    w.close()
    print("%s: %d efectos %s%s -> build/%s/mezcla.wav" % (ad, sum(cuenta.values()), cuenta, (", música «%s»" % tipo) if tipo else ", sin música", ad))


if len(sys.argv) < 2:
    sys.exit(__doc__)
for ad in sys.argv[1:]:
    mezclar(ad)

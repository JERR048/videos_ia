"""Control de calidad del MP4 final. Informa; no aprueba ni rechaza por su cuenta.

Uso:  python revisar_video.py ruta/al/video.mp4 [otro.mp4 ...]
Mira: tamaño y duración, que tenga audio, cuadros negros, tramos congelados (un plano quieto de más de 0,4 s),
      silencios largos, sonoridad integrada (objetivo entre -17 y -13 LUFS) y pico real (por debajo de -1 dBTP).
"""
import os, re, shutil, subprocess, sys

sys.stdout.reconfigure(encoding="utf-8")
FF = os.environ.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
FP = os.environ.get("FFPROBE") or (FF[:-10] + "ffprobe.exe" if FF.lower().endswith("ffmpeg.exe") else (shutil.which("ffprobe") or "ffprobe"))


def correr(args):
    return subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="replace")


def revisar(ruta):
    avisos = []
    p = correr([FP, "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate", "-of", "default=nw=1", ruta]).stdout
    dur = float(re.search(r"duration=([\d.]+)", p).group(1))
    ancho, alto = int(re.search(r"width=(\d+)", p).group(1)), int(re.search(r"height=(\d+)", p).group(1))
    mb = os.path.getsize(ruta) / 1048576
    if "codec_type=audio" not in p:
        avisos.append("no tiene audio")
    if mb >= 15:
        avisos.append("pesa %.1f MB (el límite es 15)" % mb)
    if (ancho, alto) not in ((1080, 1920), (1920, 1080)):
        avisos.append("tamaño %dx%d (se espera 1080x1920 o 1920x1080)" % (ancho, alto))
    e = correr([FF, "-hide_banner", "-nostats", "-i", ruta, "-vf", "blackdetect=d=0.1:pic_th=0.98:pix_th=0.06,freezedetect=n=0.0015:d=0.4",
                "-af", "silencedetect=noise=-45dB:d=0.6,ebur128=peak=true", "-f", "null", "-"]).stderr
    negros = [(float(a), float(b)) for a, b in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", e)]
    for a, b in negros:
        if a > .3 and b < dur - .6:
            avisos.append("cuadros negros de %.2f a %.2f s" % (a, b))
    quietos = list(zip(re.findall(r"freeze_start: ([\d.]+)", e), re.findall(r"freeze_duration: ([\d.]+)", e)))
    for a, d in quietos:
        if float(a) < dur - 1.2:
            avisos.append("imagen quieta %.2f s desde %.2f s (todo plano debe moverse un poco)" % (float(d), float(a)))
    for a, d in zip(re.findall(r"silence_start: ([\d.]+)", e), re.findall(r"silence_duration: ([\d.]+)", e)):
        if float(a) > .2 and float(a) + float(d) < dur - .3:
            avisos.append("silencio de %.2f s desde %.2f s" % (float(d), float(a)))
    resumen = e[e.rfind("Summary:"):] if "Summary:" in e else ""
    i = re.search(r"I:\s+(-?[\d.]+) LUFS", resumen)
    lra = re.search(r"LRA:\s+([\d.]+) LU", resumen)
    tp = re.search(r"Peak:\s+(-?[\d.]+) dBFS", resumen)
    if i and not -17.5 <= float(i.group(1)) <= -12.5:
        avisos.append("sonoridad %s LUFS (objetivo: entre -17 y -13)" % i.group(1))
    if tp and float(tp.group(1)) > -1:
        avisos.append("pico real %s dBTP (debe quedar por debajo de -1)" % tp.group(1))
    print("%s\n  %dx%d · %.2f s · %.1f MB · %s LUFS · rango %s LU · pico %s dBTP" % (os.path.basename(ruta), ancho, alto, dur, mb,
          i.group(1) if i else "?", lra.group(1) if lra else "?", tp.group(1) if tp else "?"))
    print("  " + ("\n  ".join("AVISO: " + a for a in avisos) if avisos else "sin avisos"))
    return len(avisos)


if len(sys.argv) < 2:
    sys.exit(__doc__)
total = sum(revisar(r) for r in sys.argv[1:])
print("AVISOS: %d" % total if total else "todo ok")

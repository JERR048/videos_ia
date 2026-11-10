#!/bin/bash
cd "$(dirname "$0")"
FF="${FFMPEG:-ffmpeg}"
FP="${FFPROBE:-${FF%ffmpeg*}ffprobe${FF##*ffmpeg}}"
DST="$1"; shift
[ -z "$DST" ] || [ $# -eq 0 ] && { echo "Uso: bash armar.sh <carpeta-destino> <id> [<id> ...]   (ej.: bash armar.sh ../videos demo demov)"; exit 1; }
mkdir -p "$DST"
# El audio se copia tal cual del render (AAC a 160k): volver a comprimirlo puede subir el pico varios dB.
comprimir() {
  local X=$1 B=${1%v} NOMBRE DUR KB
  NOMBRE=$(python -c "import json;print(json.load(open('guiones/$B.json',encoding='utf-8')).get('archivo','video-$B'))")
  [[ "$X" == *v ]] && NOMBRE="$NOMBRE-vertical"
  DUR=$("$FP" -v error -show_entries format=duration -of csv=p=0 "build/$X/alta.mp4")
  KB=$(python -c "print(max(600, min(2500, int(108000 / float('$DUR')) - 160)))")
  ( cd "build/$X" && "$FF" -v error -y -i alta.mp4 -c:v libx264 -preset slower -tune animation -b:v ${KB}k -pass 1 -passlogfile pase -an -f null - \
    && "$FF" -v error -y -i alta.mp4 -c:v libx264 -preset slower -tune animation -b:v ${KB}k -pass 2 -passlogfile pase -pix_fmt yuv420p -c:a copy -movflags +faststart "$NOMBRE.mp4" ) \
    && cp "build/$X/$NOMBRE.mp4" "$DST/" && echo "listo $X → $DST/$NOMBRE.mp4 ($(( $(stat -c %s "build/$X/$NOMBRE.mp4") / 1024 )) KB, ${KB}k)"
}
for X in "$@"; do
  mkdir -p "build/$X"
  # efectos de sonido y música: el anuncio los anota, sonido.py los mezcla bajo la voz (si no anota ninguno, queda solo la voz)
  node render.mjs "$X" sonidos > "build/$X/sonidos.log" 2>&1 && python sonido.py "$X" || echo "aviso: $X sale sin efectos de sonido (ver build/$X/sonidos.log)"
  node render.mjs "$X" video > "build/$X/render.log" 2>&1 || { echo "falló el render de $X (ver build/$X/render.log)"; continue; }
  comprimir "$X" &
done
wait

#!/bin/bash
cd "$(dirname "$0")"
AD="$1"; shift
FF="${FFMPEG:-ffmpeg}"
timeout 400 node render.mjs "$AD" fotos "$@" 2>&1 | grep -v -i "favicon"
rm -f "build/$AD/hoja_"*.jpg
if [[ "$AD" == *v ]]; then MALLA="scale=400:-1,tile=4x2"; else MALLA="scale=640:-1,tile=3x4"; fi
"$FF" -v error -y -start_number 0 -i "build/$AD/fotos/n%03d.jpg" -vf "$MALLA" "build/$AD/hoja_%d.jpg"
ls "build/$AD/"hoja_*.jpg

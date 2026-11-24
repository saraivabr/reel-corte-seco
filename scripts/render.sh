#!/bin/bash
# uso: render.sh <projeto> <id> [<id>...] → <projeto>/reels/<id>/out/reel_final.mp4 (master -14 LUFS) + cópia leve em <projeto>/entrega/
P="$(cd "${1:?uso: render.sh <projeto> <id>...}" && pwd)"; shift; mkdir -p "$P/entrega"
for r in "$@"; do
  ( cd "$P/reels/$r" && npx remotion render Reel out/reel.mp4 --props=roteiro.json --log=error >/dev/null 2>out/render.log
    M=$(ffmpeg -hide_banner -i out/reel.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p'); g(){ echo "$M" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
    ffmpeg -v error -y -i out/reel.mp4 -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -c:a aac -b:a 256k out/reel_final.mp4
    ffmpeg -v error -y -i out/reel_final.mp4 -c:v libx264 -b:v 2600k -maxrate 3200k -bufsize 6400k -preset medium -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 160k "$P/entrega/$r.mp4"
    ffmpeg -v error -y -i out/reel_final.mp4 -vf "fps=1/2,scale=150:-1,tile=16x3" -frames:v 1 out/contato.jpg
    echo "$r ok $(ffprobe -v error -show_entries format=duration -of csv=p=0 out/reel_final.mp4) s $(ffmpeg -hide_banner -i out/reel_final.mp4 -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1)" )
done

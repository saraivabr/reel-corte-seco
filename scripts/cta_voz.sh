#!/bin/bash
# Narra o fecho com a voz clonada do Saraiva (config da skill reel-voz-saraiva) e deixa em <projeto>/som/norm/cta_voz.wav.
# uso: cta_voz.sh <projeto> "Comenta \"ligação\", que eu te mando como essa IA funciona." "E segue o Saraiva ponto ei ai."
# A palavra do COMENTA vai entre aspas (senão ele põe "a" antes). O Scribe escreve "Saraiva.ai" para "Saraiva ponto ei ai": é o som certo.
set -e
P="$(cd "${1:?projeto}" && pwd)"; K=~/.claude/skills/reel-voz-saraiva; source ~/.claude/skills/edicao-saraiva/scripts/env.sh
mkdir -p "$P/cta_voz" "$P/som/norm"
python3 - "$P/cta_voz/roteiro.json" "$2" "${3:-}" <<'PY'
import json,sys
l=[["L01",sys.argv[2],0.3]]+([["L02",sys.argv[3],0.2]] if sys.argv[3] else [])
json.dump(l,open(sys.argv[1],"w"),ensure_ascii=False)
PY
zsh $K/scripts/setup_spk.sh >/dev/null
python3 $K/scripts/gerar.py "$P/cta_voz" 3 | tail -3
~/.cache/reel-voz/spk/bin/python -I $K/scripts/escolher.py "$P/cta_voz" | tail -4
ffmpeg -v error -y -i "$P/cta_voz/narracao_raw.wav" -af "highpass=f=75,equalizer=f=4200:t=q:w=1.0:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=110:makeup=3,loudnorm=I=-16:TP=-1.5:LRA=7,aformat=channel_layouts=stereo" -ar 48000 "$P/som/norm/cta_voz.wav"
echo "marcas (início/fim de cada frase, em s): $(cat "$P/cta_voz/marcas.json")"
echo "duração: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$P/som/norm/cta_voz.wav") s → no reels.json: cta.dur = duração + 0,5; cta.siga_em = início da 2ª frase + 0,12"

#!/bin/bash
# Nivela os sons do ElevenLabs num nível fixo, para a mixagem usar volume 1.0. uso: nivelar.sh <projeto>/som
cd "${1:?uso: nivelar.sh <projeto>/som}"; mkdir -p norm
pk(){ ffmpeg -hide_banner -i "$1" -af astats=measure_overall=Peak_level:measure_perchannel=none -f null - 2>&1 | awk '/Peak level dB/{print $NF}' | tail -1; }
rms(){ ffmpeg -hide_banner -i "$1" -af astats=measure_overall=RMS_level:measure_perchannel=none -f null - 2>&1 | awk '/RMS level dB/{print $NF}' | tail -1; }
niv(){ local in="el-$1.mp3" cur; if [ "$2" = rms ]; then cur=$(rms "$in"); else cur=$(pk "$in"); fi
  ffmpeg -v error -y -i "$in" -af "volume=$(python3 -c "print(round($3-($cur),2))")dB,aformat=channel_layouts=stereo" -ar 48000 "norm/$1.wav"; echo "$1: $cur -> $3 dB ($2)"; }
niv clique pico -13; niv pop pico -11; niv whoosh2 pico -11; niv riser2 rms -25; niv digita pico -12
# trilha 14 dB abaixo da voz (voz em -16 LUFS => trilha em -30 LUFS)
I=$(ffmpeg -hide_banner -i el-trilha2.mp3 -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
ffmpeg -v error -y -i el-trilha2.mp3 -af "volume=$(python3 -c "print(round(-30-($I),2))")dB,aformat=channel_layouts=stereo" -ar 48000 norm/trilha2.wav; echo "trilha2: $I -> -30 LUFS"

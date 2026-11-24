"""ElevenLabs: isolar voz, efeitos (sound-generation) e trilha (music). A chave fica em arquivo privado e nunca é impressa."""
import json, subprocess, sys, os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
KEY=(Path.home()/".config/saraiva-secrets/elevenlabs_api_key").read_text().strip()
OUT=Path(sys.argv[1]); OUT.mkdir(exist_ok=True)
def call(url, out, name, json_body=None, form=None, timeout=900):
    hdr=OUT/f".h_{name}"; hdr.touch(mode=0o600)
    hdr.write_text(f"xi-api-key: {KEY}\n"+("Content-Type: application/json\n" if json_body is not None else ""))
    try:
        cmd=["curl","-s","-o",str(out),"-w","%{http_code}","-X","POST",url,"-H",f"@{hdr}"]
        cmd+= ["--data-binary","@-"] if json_body is not None else ["-F",form]
        code=subprocess.run(cmd,input=json.dumps(json_body) if json_body is not None else None,capture_output=True,text=True,timeout=timeout).stdout
    finally: hdr.unlink(missing_ok=True)
    if code!="200":
        msg=out.read_text(errors="ignore")[:200] if out.exists() else ""; out.unlink(missing_ok=True); return f"FALHOU {name} {code} {msg}"
    return f"ok {name}"
SFX={  # só categorias aprovadas nas regras de reels: clique (troca de cena), pop (elemento), whoosh (motion grande), riser, teclado
 "clique":("crisp soft camera shutter click, single short dry click, close microphone, clean, no reverb",0.5,0.7),
 "pop":("soft round bubbly pop, single short UI element appearing sound, clean and pleasant, dry",0.5,0.7),
 "whoosh2":("clean fast airy whoosh passing by, modern video editing transition, bright and smooth, short",0.8,0.7),
 "riser2":("short cinematic riser, strings and air building tension for two seconds, ending abruptly in silence",2.2,0.6),
 "digita":("fast mechanical keyboard typing, a short burst of keystrokes, close and crisp, about one and a half seconds",1.6,0.7),
}
def sfx(n):
    out=OUT/f"el-{n}.mp3"
    if out.exists() and out.stat().st_size>2000: return f"{n} já existe"
    t,d,pi=SFX[n]
    return call("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128",out,n,{"text":t,"duration_seconds":d,"prompt_influence":pi},timeout=240)
def music():
    out=OUT/"el-trilha2.mp3"
    if out.exists() and out.stat().st_size>20000: return "trilha2 já existe"
    p=("Instrumental acoustic orchestral underscore with impact for a short business video: low strings playing a steady driving ostinato, "
       "soft taiko and acoustic drum hits, restrained brass swells, 114 BPM, serious and confident, builds slightly, no synthesizers, no electronic sounds, "
       "no vocals, starts immediately at full groove with no intro")
    return call("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128",out,"trilha2",{"prompt":p,"music_length_ms":70000,"force_instrumental":True})
def iso(src):
    out=OUT/"voz_iso_raw.bin"; fin=OUT/"voz_iso.wav"
    if fin.exists(): return "voz isolada já existe"
    flac=OUT/"voz_in.flac"; subprocess.run(["ffmpeg","-v","error","-y","-i",src,"-vn","-ac","1","-ar","44100",str(flac)],check=True)
    r=call("https://api.elevenlabs.io/v1/audio-isolation",out,"iso",form=f"audio=@{flac}",timeout=1800)
    if r.startswith("ok"):
        subprocess.run(["ffmpeg","-v","error","-y","-i",str(out),"-ac","1","-ar","48000",str(fin)],check=True); out.unlink(); flac.unlink()
    return r
with ThreadPoolExecutor(5) as ex:
    jobs=[ex.submit(sfx,n) for n in SFX]+[ex.submit(music)]+([ex.submit(iso,sys.argv[2])] if len(sys.argv)>2 else [])
    for j in jobs: print(j.result(),flush=True)

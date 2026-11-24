"""reel-corte-seco: monta um reel a partir do bruto.
Corte por palavras, voz isolada e nivelada, legenda seca que se acumula, planos com punch e zoom rápido,
página real da pesquisa em 3D atrás da pessoa, vídeos de apoio em tela cheia (motions do HyperFrames e b-rolls),
sonoplastia e CTA narrado. Config em <projeto>/reels.json. uso: montar.py <video_bruto> <pasta_do_projeto> <id_do_reel>"""
import json, glob, subprocess, sys, re, os, shutil
import cv2, numpy as np
SK=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # pasta da skill
if len(sys.argv)<4: sys.exit("uso: montar.py <video_bruto> <pasta_do_projeto> <id_do_reel>")
V=sys.argv[1]; ED=os.path.abspath(sys.argv[2]); RID=sys.argv[3]
ISO=ED+"/som/voz_iso.wav"; PROJ=f"{ED}/reels/{RID}"; PUB=PROJ+"/public"; WK=f"{ED}/work/{RID}"
REELS=json.load(open(ED+"/reels.json")); R=REELS[RID]
os.makedirs(WK,exist_ok=True)
subprocess.run(["rsync","-a","--exclude","node_modules","--exclude","out","--exclude","public","--exclude","roteiro.json",SK+"/template/",PROJ+"/"],check=True)
os.makedirs(PUB,exist_ok=True); os.makedirs(PROJ+"/out",exist_ok=True)
if not os.path.exists(PROJ+"/node_modules"):
    rt=os.path.expanduser("~/.claude/skills/edicao-saraiva/.runtime/node/node_modules")
    if os.path.isdir(rt+"/remotion"): os.symlink(rt,PROJ+"/node_modules")
    else: subprocess.run(["npm","install","--no-audit","--no-fund"],cwd=PROJ,check=True)
os.makedirs(ED+"/work",exist_ok=True); MATTE=ED+"/work/matte_bin"
if not os.path.exists(MATTE): subprocess.run(["swiftc","-O",SK+"/scripts/matte.swift","-o",MATTE],check=True,stderr=subprocess.DEVNULL)
for f in glob.glob(ED+"/som/norm/*.wav"): shutil.copy(f,PUB)
norm=lambda x: re.sub(r"[^\wà-ú]","",x.lower())
ws=[w for w in json.load(open(glob.glob(ED+"/transcripts/*.json")[0]))["words"] if w["type"]=="word"]
# ---------- corte ----------
segs=[]
for bi,(a,b) in enumerate(R["ranges"]):
    sel=[w for w in ws if w["start"]>=a and w["end"]<=b]; assert sel,(a,b)
    cur=[sel[0]]
    for w in sel[1:]:
        if w["start"]-cur[-1]["end"]>0.42: segs.append((bi,cur)); cur=[w]
        else: cur.append(w)
    segs.append((bi,cur))
casc=cv2.CascadeClassifier(cv2.data.haarcascades+"haarcascade_frontalface_default.xml")
def face_x(t):
    p=f"{WK}/f.jpg"; subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t:.2f}","-i",V,"-frames:v","1",p],check=True)
    im=cv2.imread(p); fs=casc.detectMultiScale(cv2.cvtColor(im,cv2.COLOR_BGR2GRAY),1.1,6,minSize=(120,120))
    if len(fs)==0: return None
    x,y,w,h=max(fs,key=lambda f:f[2]*f[3]); return x+w/2
out=[]; words=[]; t=0.0; cxs=[]
for i,(bi,seg) in enumerate(segs):
    idx=ws.index(seg[0]); jdx=ws.index(seg[-1])
    pe=ws[idx-1]["end"] if idx else 0; nx=ws[jdx+1]["start"] if jdx+1<len(ws) else 1e9
    a=max(seg[0]["start"]-0.10,(pe+seg[0]["start"])/2); b=min(seg[-1]["end"]+0.14,(seg[-1]["end"]+nx)/2)
    a=round(a*30)/30; dur=max(2,round((b-a)*30))/30
    c=face_x(a+dur/2); 
    if c: cxs.append(c)
    out.append(dict(bloco=bi,src_in=a,dur=dur,inicio=round(t,4)))
    for w in seg: words.append(dict(w=w["text"],s=round(t+w["start"]-a,3),e=round(t+w["end"]-a,3),bloco=bi,seg=i))
    t+=dur
D=round(t,3); lst=[]
# bruto horizontal: recorta 9:16 centrado no rosto. Bruto vertical: usa o quadro inteiro.
subprocess.run(["ffmpeg","-v","error","-y","-ss","1","-i",V,"-frames:v","1",WK+"/dim.jpg"],check=True)
AH,AW=cv2.imread(WK+"/dim.jpg").shape[:2]; VERT=AH>AW
if not VERT:
    CW=int(AH*9/16)//2*2; x=int(max(0,min(AW-CW,float(np.median(cxs))-CW/2)))
CHEIO="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
tw=lambda txt,oc=1: [w for w in words if norm(w["w"])==norm(txt)][oc-1]
flut=[]  # elementos flutuantes: cobrem segmentos inteiros (o corte é a entrada)
for e in R.get("flutuantes",[]):
    si=tw(*e["na"])["seg"]; ss=[si]
    while sum(out[i]["dur"] for i in ss)<3.0 and ss[-1]+1<len(out): ss.append(ss[-1]+1)  # a página precisa de ~3 s para rolar e ser lida
    flut.append((ss,e))
lado={si for ss,_ in flut for si in ss}
for i,o in enumerate(out):
    f=f"{WK}/seg_{i:02d}.mov"; n=round(o["dur"]*30)
    if VERT:  # sem sobra lateral: no trecho com página, encolhe para 85% no canto de baixo à esquerda e estica a borda da parede
        vf=CHEIO+(",scale=918:1632,pad=1080:1920:0:288,fillborders=right=162:top=288:mode=smear" if i in lado else "")+",fps=30"
    else:
        xs=min(AW-CW,x+int(AW*0.078)) if i in lado else x; vf=f"crop={CW}:{AH}:{xs}:0,scale=1080:1920:flags=lanczos,fps=30"
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{o['src_in']:.4f}","-i",V,"-ss",f"{o['src_in']:.4f}","-t",f"{o['dur']:.4f}","-i",ISO,"-map","0:v","-map","1:a",
      "-vf",vf,"-frames:v",str(n),
      "-af",f"afade=t=in:d=0.012,afade=t=out:st={o['dur']-0.025:.3f}:d=0.025","-c:v","libx264","-crf","16","-preset","fast","-pix_fmt","yuv420p","-c:a","pcm_s16le","-ar","48000","-shortest",f],check=True)
    lst.append(f"file '{f}'")
open(WK+"/concat.txt","w").write("\n".join(lst))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",WK+"/concat.txt","-c:v","libx264","-crf","16","-preset","fast","-pix_fmt","yuv420p","-g","15","-an",PUB+"/camA.mp4"],check=True)
flutuantes=[]
for k,(ss,e) in enumerate(flut):
    clip=f"{WK}/fl_{k}.mp4"; open(WK+"/fl.txt","w").write("\n".join(f"file '{WK}/seg_{i:02d}.mov'" for i in ss))
    subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",WK+"/fl.txt","-an","-c:v","libx264","-crf","14","-pix_fmt","yuv420p",clip],check=True)
    seg=subprocess.Popen([MATTE,clip,"accurate","1080","1920"],stdout=subprocess.PIPE)
    subprocess.run(["ffmpeg","-v","error","-y","-f","rawvideo","-pix_fmt","gray","-s","1080x1920","-r","30","-i","-","-c:v","libx264","-crf","6","-preset","fast","-pix_fmt","yuv420p",f"{WK}/fl_{k}_m.mp4"],stdin=seg.stdout,check=True); seg.wait()
    subprocess.run(["ffmpeg","-v","error","-y","-i",clip,"-i",f"{WK}/fl_{k}_m.mp4","-filter_complex","[1:v]format=gray,erosion,gblur=sigma=1.6[m];[0:v][m]alphamerge","-c:v","libvpx-vp9","-pix_fmt","yuva420p","-b:v","0","-crf","22","-auto-alt-ref","0","-an",f"{PUB}/pessoa_{k}.webm"],check=True)
    ini=out[ss[0]]["inicio"]; fim=out[ss[-1]]["inicio"]+out[ss[-1]]["dur"]
    pg=json.load(open(f"{ED}/noticias3d/{e['pagina']}.json")); shutil.copy(f"{ED}/noticias3d/{e['pagina']}.jpg",PUB)
    d={"inicio":round(ini,3),"fim":round(min(fim,ini+e.get("dur",4.4)),3),"pessoa":f"pessoa_{k}.webm","dominio":e["dominio"],
       "pagina":{"src":e["pagina"]+".jpg","largura":pg["largura"],"altura":pg["altura"],"rects":pg["rects"]}}
    flutuantes.append(d)
subprocess.run(["ffmpeg","-v","error","-y","-sseof","-0.1","-i",PUB+"/camA.mp4","-frames:v","1","-update","1","-q:v","2",PUB+"/cta_fundo.jpg"],check=True)
# voz: passa-altas, de-esser leve, compressor, presença; depois ganho linear até -16 LUFS
CH="highpass=f=75,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=4200:t=q:w=1.0:g=2.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=110:makeup=3,alimiter=limit=-1.5dB"
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i",WK+"/concat.txt","-vn","-af",CH,"-c:a","pcm_s16le",WK+"/voz_c.wav"],check=True)
m=subprocess.run(["ffmpeg","-hide_banner","-i",WK+"/voz_c.wav","-af","ebur128","-f","null","-"],capture_output=True,text=True).stderr
I=float(re.findall(r"I:\s+(-?[\d.]+) LUFS",m)[-1])
subprocess.run(["ffmpeg","-v","error","-y","-i",WK+"/voz_c.wav","-af",f"volume={-16-I:.2f}dB,alimiter=limit=-1.5dB,aformat=channel_layouts=stereo","-c:a","pcm_s16le",PUB+"/voz.wav"],check=True)
# ---------- legendas ----------
enf={}; cont={}
for e in R.get("enfase",[]):
    k,est=e.rsplit(":",1); k,_,oc=k.partition("#"); enf[(norm(k),int(oc or 1))]=est
blocos=[]; dest=[]
def bloco(tipo,linhas):
    blocos.append({"inicio":linhas[0]["palavras"][0]["t"],"ultimo":linhas[-1]["_e"],"tipo":tipo,"linhas":linhas})
def linha(pal,est="n"): return {"palavras":[{"w":p["w"],"t":p["s"]} for p in pal],"estilo":est,"_e":pal[-1]["e"]}
fimfrase=lambda w: w["w"][-1] in ".,?!:;"
for si in range(len(out)):
    sw=[w for w in words if w["seg"]==si]; est=[]
    for w in sw:
        k=norm(w["w"]); cont[k]=cont.get(k,0)+1; est.append(enf.get((k,cont[k])))
    spec=R.get("spec",{}).get(str(si))
    if spec:
        k=0
        for b in spec.split("|"):
            ls=[]
            for l in b.split("/"):
                e="n"
                if l[-1] in "gd": e=l[-1]; l=l[:-1]
                pal=sw[k:k+int(l)]; assert len(pal)==int(l),(si,spec); k+=int(l); ls.append(linha(pal,e))
                if e=="d": dest.append((si,pal[0]["s"]))
            bloco("pilha" if "/" in b else "solta",ls)
        assert k==len(sw),(si,spec,len(sw)); continue
    pend=[]; i=0
    def flush():
        nonlocal_pend=pend[:]; pend.clear()
        while nonlocal_pend:
            n=3 if len(nonlocal_pend)!=4 else 2
            bloco("solta",[linha(nonlocal_pend[:n])]); del nonlocal_pend[:n]
    while i<len(sw):
        w=sw[i]
        if est[i]:
            antes=pend[-3:] if sum(len(p["w"]) for p in pend[-3:])<=16 else pend[-2:]
            resto=pend[:len(pend)-len(antes)]; pend.clear(); pend.extend(resto); flush()
            ls=[linha(antes)] if antes else []
            ls.append(linha([w],est[i]))
            if est[i]=="d": dest.append((si,w["s"]))
            dep=[]; j=i+1
            if not fimfrase(w):
                while j<len(sw) and len(dep)<2 and not est[j]:
                    dep.append(sw[j]); j+=1
                    if fimfrase(dep[-1]): break
                if dep and not fimfrase(dep[-1]) and j<len(sw): j-=len(dep); dep=[]
            if dep: ls.append(linha(dep))
            bloco("pilha",ls); i=j; continue
        pend.append(w); i+=1
        if fimfrase(w) or len(pend)==3 and not (i<len(sw) and est[i]): 
            if not (i<len(sw) and est[i]) or fimfrase(w): flush()
    flush()
blocos.sort(key=lambda b:b["inicio"])
for i,b in enumerate(blocos):
    nxt=blocos[i+1]["inicio"] if i+1<len(blocos) else D
    b["fim"]=round(min(nxt,b.pop("ultimo")+0.6),3); b["inicio"]=round(b["inicio"]-0.001,3)
    for l in b["linhas"]: l.pop("_e")
# ---------- planos ----------
aberr=tw(*R["aberracao"])["seg"] if R.get("aberracao") else -1
planos=[]
for i,s in enumerate(out):
    p={"tipo":"rosto","inicio":s["inicio"],"fim":round(s["inicio"]+s["dur"],4),"src":"camA.mp4","srcInicio":s["inicio"],"origem":R.get("origem",[50,30]),"punch":1.0 if i%2==0 else R.get("punch",1.22)}
    if i==aberr: p.update(punch=R.get("punch_drama",1.42),aberracao=True)
    if i==len(out)-1: p["punch"]=1.0
    z=[{"t":round(t0+0.05,3),"escala":1.13,"dur":0.45} for (si,t0) in dest if si==i and i!=aberr]
    if z: p["zoomRapido"]=z
    if i in lado: p["punch"]=1.0; p.pop("zoomRapido",None); p.pop("aberracao",None)
    planos.append(p)
# ---------- motions prontos em vídeo (HyperFrames), tela cheia ----------
vids=[]
for v in R.get("videos",[]):
    shutil.copy(f"{ED}/motions_prontos/{v['src']}",PUB)
    w=tw(*v["na"]); ini=round(max(0,w["s"]+v.get("atraso",0)),3)
    vids.append({"tipo":"tela","inicio":ini,"fim":round(min(D,ini+v["dur"]),3),"src":v["src"],**({"credito":v["credito"]} if v.get("credito") else {})})
planos+=vids
# ---------- som (regras de reels: clique em toda troca de cena, pop em elemento que aparece, whoosh em imagem grande) ----------
CTA=R.get("cta"); DT=round(D+(CTA.get("dur",3.8) if CTA else 0),3)
F=lambda src,ini,fim,**k: {"src":src,"inicio":round(max(0,ini),3),"fim":round(min(DT,fim),3),"volume":1.0,**k}
cues=[]  # (tempo, arquivo, duração) — nada a menos de 0,35 s de outro som
def cue(t0,arq,dur,forca=False):
    if t0<0.05 or t0>DT-0.1: return
    if not forca and any(abs(t0-c[0])<0.35 for c in cues): return
    cues.append((round(t0,3),arq,dur))
for e in flutuantes: cue(e["inicio"]+0.03,"pop.wav",0.46,True)
for v in vids:
    if v.get("credito"): cue(v["inicio"],"clique.wav",0.46,True)  # b-roll = troca de cena
for im in [v for v in vids if not v.get("credito")]: cue(im["inicio"]-0.12,"whoosh2.wav",0.78,True)
if CTA: cue(D+0.05,"pop.wav",0.46,True)
for (_,td) in dest: cue(td,"pop.wav",0.46)
for o in out[1:]: cue(o["inicio"],"clique.wav",0.46)
extras=[F(a,t0,t0+d,fadeIn=0.004,fadeOut=0.06) for t0,a,d in sorted(cues)]
if dest:
    t0=min(d[1] for d in dest)
    if 0.8<=t0<=3.6: extras.append(F("riser2.wav",t0-2.2,t0,fadeIn=0.12,fadeOut=0.03,srcInicio=round(max(0,2.2-t0),3)))
if CTA:
    pe=CTA.get("palavra_em",0.3); extras.append(F("digita.wav",D+pe,D+pe+min(1.6,0.07*len(CTA["palavra"])+0.25),fadeIn=0.01,fadeOut=0.08))
    if CTA.get("voz"): extras.append(F(CTA["voz"],D+0.12,DT,fadeIn=0.01,fadeOut=0.05))
extras.append(F("trilha2.wav",0,DT,fadeIn=0.25,fadeOut=1.3))
som={"voz":{"src":"voz.wav","volume":1.0},"extras":extras}
cta={"inicio":D,"fim":DT,"fundo":"cta_fundo.jpg","palavra":CTA["palavra"],"promessa":CTA["promessa"],"perfil":CTA.get("perfil","@saraiva.ai"),**({"palavraEm":CTA["palavra_em"]} if "palavra_em" in CTA else {}),**({"sigaEm":CTA["siga_em"]} if "siga_em" in CTA else {})} if CTA else None
json.dump({"duracao":DT,"corScript":"#B8FF3D","legendaY":1480,"planos":planos,"flutuantes":flutuantes,**({"cta":cta} if cta else {}),"legendas":blocos,"som":som},open(PROJ+"/roteiro.json","w"),ensure_ascii=False,indent=1)
json.dump({"segs":out,"words":words},open(WK+"/corte.json","w"),ensure_ascii=False)
print(RID,"duracao",DT,"sons",len(extras),"flutuantes",[(e["inicio"],e["fim"],e["dominio"]) for e in flutuantes],"segs",len(out),"blocos",len(blocos),"destaques",len(dest),"voz LUFS antes",I)
for si,o in enumerate(out): print(f'  {si:2d} b{o["bloco"]} {o["inicio"]:6.2f} +{o["dur"]:.2f} '+" ".join(w["w"] for w in words if w["seg"]==si))
print("  legendas:"," || ".join(" / ".join(" ".join(p["w"] for p in l["palavras"])+("*" if l["estilo"]=="d" else "+" if l["estilo"]=="g" else "") for l in b["linhas"]) for b in blocos))

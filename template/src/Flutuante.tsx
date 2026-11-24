import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Poppins";
import type { Flutuante } from "./tipos";
const { fontFamily: SANS } = loadSans("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] });
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

// A PÁGINA REAL da pesquisa, em 3D, passando por trás da pessoa: janela de navegador inclinada em perspectiva,
// a matéria rola da manchete até a frase-chave, o cursor chega nela e o marca-texto passa por cima.
// A pessoa recortada (pessoa_*.webm com alfa) é desenhada por cima, então a janela fica de fato atrás dela.
const L = 590, A = 1120, BARRA = 62; // janela (px na tela)

export const FlutuanteView: React.FC<{ e: Flutuante; cor: string }> = ({ e, cor }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round((e.fim - e.inicio) * fps);
  const pg = e.pagina;
  const k = L / pg.largura; // escala da página dentro da janela
  const alvoY = pg.rects[0].y * k; // onde está a frase, já na escala da janela
  const fimRol = Math.min(dur * 0.58, 46), iniRol = Math.min(dur * 0.16, 10);
  const rolMax = Math.max(0, alvoY - (A - BARRA) * 0.4);
  const rol = interpolate(f, [iniRol, fimRol], [0, rolMax], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const ent = spring({ frame: f, fps, config: { damping: 17, stiffness: 120, mass: 0.9 } });
  const passa = f / dur; // 0..1 ao longo do trecho
  const rotY = interpolate(ent, [0, 1], [-52, -20]) + passa * 7;
  const rotX = interpolate(ent, [0, 1], [14, 5]) - passa * 2;
  const tx = (1 - ent) * 520 - passa * 70;
  const ty = (1 - ent) * 60 + Math.sin(f / fps * 1.1) * 7;
  const marca = interpolate(f, [fimRol + 3, fimRol + 12], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const clique = interpolate(f, [fimRol, fimRol + 8], [0, 1], cl);
  // cursor: sai do canto de baixo e chega no começo da frase
  const cx = interpolate(f, [iniRol, fimRol], [L * 0.78, pg.rects[0].x * k + 6], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const cy = interpolate(f, [iniRol, fimRol], [(A - BARRA) * 0.82, alvoY - rolMax + pg.rects[0].h * k * 0.7], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ perspective: 1500, perspectiveOrigin: "28% 42%" }}>
        <div style={{ position: "absolute", left: 500, top: 150, width: L, height: A, transformStyle: "preserve-3d",
          transform: `translate3d(${tx}px, ${ty}px, 0) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${1.5 + (1 - ent) * 4}deg)`, transformOrigin: "0% 50%" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 34, overflow: "hidden", background: "#fff", boxShadow: "-30px 40px 90px rgba(0,0,0,0.55), 0 0 0 2px rgba(255,255,255,0.08)" }}>
            <div style={{ height: BARRA, background: "#17171A", display: "flex", alignItems: "center", padding: "0 22px", gap: 9 }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />)}
              <div style={{ marginLeft: 14, flex: 1, height: 34, borderRadius: 17, background: "#2A2A2F", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: SANS, fontWeight: 500, fontSize: 19, color: "#C9C9CE", whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ color: "#28C840", marginRight: 8 }}>●</span>{e.dominio}
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, top: BARRA, width: L, height: A - BARRA, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: L, transform: `translateY(${-rol}px)` }}>
                <Img src={staticFile(pg.src)} style={{ width: L, display: "block" }} />
                {pg.rects.map((r, i) => (
                  <div key={i} style={{ position: "absolute", left: r.x * k - 5, top: r.y * k - 2, width: (r.w * k + 10) * interpolate(marca, [i / pg.rects.length, (i + 1) / pg.rects.length], [0, 1], cl),
                    height: r.h * k + 4, background: cor, mixBlendMode: "multiply", borderRadius: 4 }} />
                ))}
              </div>
              <div style={{ position: "absolute", left: cx - 30, top: cy - 30, width: 60, height: 60, borderRadius: "50%", border: `4px solid ${cor}`, opacity: clique > 0 && clique < 1 ? 1 - clique : 0, transform: `scale(${0.4 + clique * 1.3})` }} />
              <svg width={38} height={38} viewBox="0 0 24 24" style={{ position: "absolute", left: cx, top: cy, filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.45))", opacity: interpolate(f, [iniRol - 4, iniRol], [0, 1], cl) }}>
                <path d="M4 2l15 9.500-6.800 1.300L9.300 20z" fill="#111" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
              </svg>
            </div>
            <AbsoluteFill style={{ background: `linear-gradient(${105 + passa * 30}deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0) 62%)`, pointerEvents: "none" }} />
            <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 22%)", pointerEvents: "none" }} />
          </div>
        </div>
      </AbsoluteFill>
      <OffthreadVideo src={staticFile(e.pessoa)} transparent muted style={{ position: "absolute", width: 1080, height: 1920 }} />
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Poppins";
import { loadFont as loadDestaque } from "@remotion/google-fonts/Anton";
import type { Cta } from "./tipos";
const { fontFamily: SANS } = loadSans("normal", { weights: ["500", "600"], subsets: ["latin", "latin-ext"] });
const { fontFamily: DESTAQUE } = loadDestaque("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

// Fecho: o último quadro dele fica de fundo (escurecido, zoom lento) e o CTA do funil entra por cima:
// "Comenta" → a PALAVRA digitada letra por letra na cor de destaque → a promessa → siga @perfil.
export const CtaView: React.FC<{ c: Cta; cor: string }> = ({ c, cor }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = Math.round((c.fim - c.inicio) * fps);
  const z = interpolate(f, [0, dur], [1.06, 1.14]);
  const esc = interpolate(f, [0, 8], [0, 0.62], { extrapolateRight: "clamp" });
  const ini = c.palavraEm != null ? Math.round(c.palavraEm * fps) : 9; // a palavra é digitada quando ele a fala
  const letras = Math.max(0, Math.min(c.palavra.length, Math.floor((f - ini) / 2) + 1));
  const sobe = (ini: number) => ({
    opacity: interpolate(f, [ini, ini + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(f, [ini, ini + 7], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) })}px)`,
  });
  const fimDigita = ini + c.palavra.length * 2;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Img src={staticFile(c.fundo)} style={{ width: 1080, height: 1920, transform: `scale(${z})`, transformOrigin: "50% 30%" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${esc * 0.35}) 0%, rgba(0,0,0,${esc}) 45%, rgba(0,0,0,${Math.min(0.9, esc * 1.4)}) 100%)` }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 930, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 92, letterSpacing: "-0.06em", color: "#FAF9F7", lineHeight: 1, ...sobe(2) }}>Comenta</div>
        <div style={{ fontFamily: DESTAQUE, fontSize: Math.min(250, 940 / (c.palavra.length * 0.5)), lineHeight: 1.05, color: cor, textTransform: "uppercase", transform: "rotate(-2deg) skewX(-6deg)", marginTop: 4, whiteSpace: "pre" }}>
          {c.palavra.slice(0, letras)}
          <span style={{ opacity: f < fimDigita + 20 && Math.floor(f / 6) % 2 === 0 ? 1 : 0, color: "#FAF9F7" }}>|</span>
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 58, letterSpacing: "-0.045em", lineHeight: 1.12, color: "#FAF9F7", marginTop: 18, ...sobe(fimDigita + 3) }}>{c.promessa}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, letterSpacing: "-0.03em", color: "#0D0D0D", background: cor, padding: "14px 30px", borderRadius: 999, marginTop: 44, ...sobe(c.sigaEm != null ? Math.round(c.sigaEm * fps) : fimDigita + 14) }}>siga {c.perfil}</div>
      </div>
    </AbsoluteFill>
  );
};

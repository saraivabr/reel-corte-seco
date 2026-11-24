import React from "react";
import { AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Midia, Plano } from "./tipos";

const ehImagem = (src: string) => /\.(jpe?g|png|webp|gif)$/i.test(src);

const useZoom = (zoom: [number, number] | undefined, dur: number) => {
  const frame = useCurrentFrame();
  const [a, b] = zoom ?? [1, 1];
  return interpolate(frame, [0, Math.max(1, dur)], [a, b], { extrapolateRight: "clamp" });
};

const MidiaView: React.FC<{ m: Midia; style?: React.CSSProperties }> = ({ m, style }) => {
  const s: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", ...style };
  if (ehImagem(m.src)) return <Img src={staticFile(m.src)} style={s} />;
  const { fps } = useVideoConfig();
  return <OffthreadVideo src={staticFile(m.src)} startFrom={Math.round((m.srcInicio ?? 0) * fps)} muted style={s} />;
};

// Franja RGB nas bordas: duas cópias com um canal só, deslocadas, mascaradas para aparecer só nas bordas.
const Aberracao: React.FC<{ m: Midia; transform: string; origin: string }> = ({ m, transform, origin }) => {
  const mask = "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 55%, black 100%)";
  const camada = (cor: "r" | "c", dx: number) => (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.55, WebkitMaskImage: mask, maskImage: mask }}>
      <MidiaView
        m={m}
        style={{
          transform: `${transform} translateX(${dx}px)`,
          transformOrigin: origin,
          filter: `url(#canal-${cor})`,
        }}
      />
    </AbsoluteFill>
  );
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="canal-r"><feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" /></filter>
        <filter id="canal-c"><feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" /></filter>
      </svg>
      {camada("r", -9)}
      {camada("c", 9)}
    </>
  );
};

export const PlanoView: React.FC<{ plano: Plano }> = ({ plano: p }) => {
  const { fps } = useVideoConfig();
  const dur = Math.round((p.fim - p.inicio) * fps);
  const z = useZoom(p.zoom, dur);
  const frame = useCurrentFrame();

  if (p.tipo === "rosto") {
    // zoom rápido animado (medido na referência: +12–20% em ~0,4–0,6 s, suavizado, pousa na palavra e segura)
    let pulso = 1;
    for (const zp of p.zoomRapido ?? []) {
      const ini = (zp.t - p.inicio - (zp.dur ?? 0.5)) * fps; // termina NA palavra
      pulso *= interpolate(frame, [ini, ini + (zp.dur ?? 0.5) * fps], [1, zp.escala ?? 1.15], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic),
      });
    }
    const escala = (p.punch ?? 1) * z * pulso;
    const [ox, oy] = p.origem ?? [50, 38];
    const origin = `${ox}% ${oy}%`;
    const transform = `scale(${escala})`;
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <MidiaView m={p} style={{ transform, transformOrigin: origin }} />
        {p.aberracao ? <Aberracao m={p} transform={transform} origin={origin} /> : null}
      </AbsoluteFill>
    );
  }

  if (p.tipo === "card") {
    const w = 944;
    const h = p.formato === "vertical" ? 1352 : 944;
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <div
          style={{
            position: "absolute",
            left: (1080 - w) / 2,
            top: (1920 - h) / 2,
            width: w,
            height: h,
            borderRadius: 42,
            overflow: "hidden",
          }}
        >
          <MidiaView m={p} style={{ transform: `scale(${z})` }} />
        </div>
      </AbsoluteFill>
    );
  }

  // tela cheia
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <MidiaView m={p} style={{ transform: `scale(${z})`, filter: p.desfoque ? "blur(1.5px)" : undefined }} />
      {p.credito ? (
        <div style={{ position: "absolute", left: 44, top: 232, padding: "8px 18px", borderRadius: 999, background: "rgba(0,0,0,0.55)", color: "#FAF9F7",
          fontFamily: "Poppins, Helvetica, Arial, sans-serif", fontWeight: 500, fontSize: 26, letterSpacing: "-0.01em" }}>{p.credito}</div>
      ) : null}
    </AbsoluteFill>
  );
};

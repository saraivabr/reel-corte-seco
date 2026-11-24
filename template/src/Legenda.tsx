import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Poppins";
import { loadFont as loadDestaque } from "@remotion/google-fonts/Anton";
import type { Legenda } from "./tipos";

const { fontFamily: SANS } = loadSans("normal", { weights: ["600"], subsets: ["latin", "latin-ext"] });
const { fontFamily: DESTAQUE } = loadDestaque("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });

// Modo fiel à referência (medido quadro a quadro): cada palavra entra SECA, em 1 quadro, já no lugar final;
// o bloco se acumula e sai seco. Bloco "solta" = 1 linha pequena; "pilha" = linhas em escada com palavra grande / destaque.
const SOLTA = 68, NORMAL = 92, GRANDE = 140, DEST = 176;
const LARGURA = 960; // largura útil
const COEF = { sans: 0.56, dest: 0.47 }; // largura média por caractere (em), já com o tracking
const ESCADA: Record<number, number[]> = { 1: [0], 2: [-46, 46], 3: [-8, -64, 64], 4: [-30, 30, -50, 50] };

export const LegendaView: React.FC<{ legenda: Legenda; cor: string; baseY: number }> = ({ legenda, cor, baseY }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = legenda.inicio + (frame + 0.5) / fps;
  const pilha = legenda.tipo === "pilha";
  const esc = ESCADA[legenda.linhas.length] ?? [0];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: pilha ? baseY - 130 : baseY - 20, transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center" }}>
        {legenda.linhas.map((l, i) => {
          const texto = l.palavras.map((p) => p.w).join(" ");
          const d = l.estilo === "d";
          const alvo = !pilha ? SOLTA : d ? DEST : l.estilo === "g" ? GRANDE : NORMAL;
          const tam = Math.min(alvo, LARGURA / (Math.max(1, texto.length) * (d ? COEF.dest : COEF.sans)));
          return (
            <div key={i} style={{ fontFamily: d ? DESTAQUE : SANS, fontWeight: d ? 400 : 600, fontSize: tam,
              lineHeight: d ? 1.0 : 0.9, letterSpacing: d ? "0.005em" : "-0.07em", color: d ? cor : "#FAF9F7",
              textTransform: d ? "uppercase" : "none", whiteSpace: "pre", position: "relative", zIndex: d ? 0 : 1,
              margin: d ? "-0.06em 0 -0.02em" : 0,
              transform: `translateX(${pilha ? esc[i] ?? 0 : 0}px)${d ? " rotate(-3deg) skewX(-8deg)" : ""}`,
              textShadow: "0 2px 12px rgba(0,0,0,0.38)" }}>
              {l.palavras.map((p, pi) => (
                <span key={pi} style={{ visibility: t >= p.t ? "visible" : "hidden" }}>{(pi ? " " : "") + p.w}</span>
              ))}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

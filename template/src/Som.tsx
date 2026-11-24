import React from "react";
import { Audio, Sequence, interpolate, staticFile, useVideoConfig } from "remotion";
import type { Faixa, Som } from "./tipos";

const RAMPA = 0.12; // s de rampa nas pausas

const FaixaView: React.FC<{ faixa: Faixa; loop?: boolean }> = ({ faixa, loop }) => {
  const { fps } = useVideoConfig();
  const de = Math.round(faixa.inicio * fps);
  const dur = Math.max(1, Math.round((faixa.fim - faixa.inicio) * fps));
  const vol = faixa.volume ?? 0.3;
  const fi = Math.max(1, (faixa.fadeIn ?? 0.4) * fps);
  const fo = Math.max(1, (faixa.fadeOut ?? 0.3) * fps);
  return (
    <Sequence from={de} durationInFrames={dur} layout="none">
      <Audio
        src={staticFile(faixa.src)}
        loop={loop}
        startFrom={Math.round((faixa.srcInicio ?? 0) * fps)}
        volume={(f) => {
          let v = vol * interpolate(f, [0, fi], [0, 1], { extrapolateRight: "clamp" });
          v *= interpolate(f, [dur - fo, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const t = faixa.inicio + f / fps; // tempo do reel
          for (const [a, b] of faixa.pausas ?? []) {
            const g = Math.min(
              interpolate(t, [a - RAMPA, a], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) +
                interpolate(t, [b, b + RAMPA], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              1,
            );
            v *= t >= a - RAMPA && t <= b + RAMPA ? g : 1;
          }
          return v;
        }}
      />
    </Sequence>
  );
};

export const SomView: React.FC<{ som: Som; duracao: number }> = ({ som, duracao }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {som.voz ? (
        <Sequence from={0} durationInFrames={Math.round(duracao * fps)} layout="none">
          <Audio src={staticFile(som.voz.src)} startFrom={Math.round((som.voz.srcInicio ?? 0) * fps)} volume={som.voz.volume ?? 1} />
        </Sequence>
      ) : null}
      {som.drone ? <FaixaView faixa={som.drone} loop /> : null}
      {som.trilha ? <FaixaView faixa={som.trilha} /> : null}
      {(som.extras ?? []).map((x, i) => (
        <FaixaView key={i} faixa={x} />
      ))}
    </>
  );
};

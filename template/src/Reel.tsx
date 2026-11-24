import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import type { Roteiro } from "./tipos";
import { PlanoView } from "./Planos";
import { LegendaView } from "./Legenda";
import { SomView } from "./Som";
import { FlutuanteView } from "./Flutuante";
import { CtaView } from "./Cta";

export const Reel: React.FC<Roteiro> = (r) => {
  const { fps } = useVideoConfig();
  const f = (s: number) => Math.round(s * fps);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {r.planos.map((p, i) => (
        <Sequence key={`p${i}`} from={f(p.inicio)} durationInFrames={Math.max(1, f(p.fim) - f(p.inicio))} layout="none">
          <AbsoluteFill>
            <PlanoView plano={p} />
          </AbsoluteFill>
        </Sequence>
      ))}
      {(r.flutuantes ?? []).map((e, i) => (
        <Sequence key={`fl${i}`} from={f(e.inicio)} durationInFrames={Math.max(1, f(e.fim) - f(e.inicio))} layout="none">
          <FlutuanteView e={e} cor={r.corScript ?? "#B8FF3D"} />
        </Sequence>
      ))}
      {r.cta ? (
        <Sequence from={f(r.cta.inicio)} durationInFrames={Math.max(1, f(r.cta.fim) - f(r.cta.inicio))} layout="none">
          <CtaView c={r.cta} cor={r.corScript ?? "#B8FF3D"} />
        </Sequence>
      ) : null}
      {r.legendas.map((l, i) => (
        <Sequence key={`l${i}`} from={f(l.inicio)} durationInFrames={Math.max(1, f(l.fim) - f(l.inicio))} layout="none">
          <LegendaView legenda={l} cor={r.corScript ?? "#DD6D94"} baseY={r.legendaY ?? 1330} />
        </Sequence>
      ))}
      <SomView som={r.som} duracao={r.duracao} />
    </AbsoluteFill>
  );
};

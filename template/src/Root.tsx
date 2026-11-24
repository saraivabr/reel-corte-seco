import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import type { Roteiro } from "./tipos";
import exemplo from "../roteiro.json";

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel as unknown as React.FC<Record<string, unknown>>}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={30}
    defaultProps={exemplo as unknown as Record<string, unknown>}
    calculateMetadata={({ props }) => {
      const r = props as unknown as Roteiro;
      const fps = r.fps ?? 30;
      return { fps, durationInFrames: Math.max(1, Math.round(r.duracao * fps)) };
    }}
  />
);

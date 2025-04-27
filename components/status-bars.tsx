"use client";

import type { NoaState } from "./noa-tamagotchi";
import PixelStatusBar from "./pixel-status-bar";

interface StatusBarsProps {
  noaState: NoaState;
}

export default function StatusBars({ noaState }: StatusBarsProps) {
  const { hunger, happiness, energy } = noaState;

  return (
    <div className="w-full px-2 space-y-1">
      {/* Pasa el tipo correcto aquí */}
      <PixelStatusBar value={hunger} maxValue={100} type="hunger" label="Hambre" />
      <PixelStatusBar value={happiness} maxValue={100} type="happiness" label="Felicidad" />
      <PixelStatusBar value={energy} maxValue={100} type="energy" label="Energía" />
    </div>
  );
}

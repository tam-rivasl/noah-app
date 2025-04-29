"use client";

import type { NoaState } from "./noa-tamagotchi";
import PixelStatusBar from "./pixel-status-bar";

interface StatusBarsProps {
  noaState: NoaState;
}

export default function StatusBars({ noaState }: StatusBarsProps) {
  const { hunger, happiness, energy } = noaState;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-1 p-2">
      <div className="flex gap-2 w-full justify-center">
        <PixelStatusBar value={hunger} maxValue={100} type="hunger" />
        <PixelStatusBar value={happiness} maxValue={100} type="happiness" />
        <PixelStatusBar value={energy} maxValue={100} type="energy" />
      </div>
    </div>
  );
}

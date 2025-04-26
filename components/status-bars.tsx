"use client"

import type { NoaState } from "./noa-tamagotchi"
import PixelStatusBar from "./pixel-status-bar"

interface StatusBarsProps {
  noaState: NoaState
}

export default function StatusBars({ noaState }: StatusBarsProps) {
  const { hunger, happiness, energy } = noaState

  return (
    <div className="w-full space-y-1 px-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-20 text-gray-700">Hambre:</span>
        <PixelStatusBar value={hunger} maxValue={100} type="hunger" label={""} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-20 text-gray-700">Felicidad:</span>
        <PixelStatusBar value={happiness} maxValue={100} type="happiness" label={""} />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-20 text-gray-700">Energía:</span>
        <PixelStatusBar value={energy} maxValue={100} type="energy" label={""} />
      </div>
    </div>
  )
}

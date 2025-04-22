"use client"

import type { NoaState } from "./noa-tamagotchi"
import PixelHealthBar from "./pixel-health-bar"

interface StatusBarsProps {
  noaState: NoaState
}

export default function StatusBars({ noaState }: StatusBarsProps) {
  const { hunger, happiness, energy } = noaState

  return (
    <div className="w-full space-y-1 px-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-20 text-gray-700">Hambre:</span>
        <PixelHealthBar value={hunger} maxValue={100} type="hunger" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-20 text-gray-700">Felicidad:</span>
        <PixelHealthBar value={happiness} maxValue={100} type="happiness" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-20 text-gray-700">Energía:</span>
        <PixelHealthBar value={energy} maxValue={100} type="energy" />
      </div>
    </div>
  )
}

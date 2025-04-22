"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import Image from "next/image"

interface ActionButtonsProps {
  onFeed: () => void
  onPlay: () => void
  onPet: () => void
  onSleep: () => void
  onReset: () => void
  onPlayGame: () => void
  isSleeping: boolean
}

export default function ActionButtons({
  onFeed,
  onPlay,
  onPet,
  onSleep,
  onReset,
  onPlayGame,
  isSleeping,
}: ActionButtonsProps) {
  const [activeButton, setActiveButton] = useState<string | null>(null)

  // Enhanced button handlers with visual feedback
  const handleFeed = () => {
    setActiveButton("feed")
    onFeed()
    setTimeout(() => setActiveButton(null), 2000)
  }

  const handlePlay = () => {
    setActiveButton("play")
    onPlay()
    setTimeout(() => setActiveButton(null), 2000)
  }

  const handlePet = () => {
    setActiveButton("pet")
    onPet()
    setTimeout(() => setActiveButton(null), 2000)
  }

  const handleSleep = () => {
    setActiveButton("sleep")
    onSleep()
    setTimeout(() => setActiveButton(null), 2000)
  }

  const handlePlayGame = () => {
    setActiveButton("game")
    onPlayGame()
    setTimeout(() => setActiveButton(null), 2000)
  }

  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      <Button
        onClick={handleFeed}
        variant="outline"
        className={`flex flex-col items-center p-2 h-auto bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-700 transition-all duration-300 ${
          activeButton === "feed" ? "scale-95 bg-amber-200 border-amber-400 shadow-inner" : ""
        }`}
        title="Alimentar a Noa"
        disabled={activeButton !== null || isSleeping}
      >
        <div className="relative">
          <div
            className={`h-10 w-10 mb-1 transition-transform duration-300 ${activeButton === "feed" ? "scale-110" : ""}`}
          >
            <Image src="/images/food-bowl.png" alt="Food bowl" width={40} height={40} className="pixel-art" />
          </div>
          {activeButton === "feed" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>
          )}
        </div>
        <span className="text-xs">Alimentar</span>
      </Button>

      <Button
        onClick={handlePlay}
        variant="outline"
        className={`flex flex-col items-center p-2 h-auto bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-700 transition-all duration-300 ${
          activeButton === "play" ? "scale-95 bg-blue-200 border-blue-400 shadow-inner" : ""
        }`}
        title="Jugar con Noa"
        disabled={activeButton !== null || isSleeping}
      >
        <div className="relative">
          <div
            className={`h-10 w-10 mb-1 transition-transform duration-300 ${activeButton === "play" ? "scale-110" : ""}`}
          >
            <Image src="/images/bone-toy.png" alt="Bone toy" width={40} height={40} className="pixel-art" />
          </div>
          {activeButton === "play" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
          )}
        </div>
        <span className="text-xs">Jugar</span>
      </Button>

      <Button
        onClick={handlePet}
        variant="outline"
        className={`flex flex-col items-center p-2 h-auto bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-700 transition-all duration-300 ${
          activeButton === "pet" ? "scale-95 bg-purple-200 border-purple-400 shadow-inner" : ""
        }`}
        title="Acariciar a Noa"
        disabled={activeButton !== null}
      >
        <div className="relative">
          <div
            className={`h-10 w-10 mb-1 transition-transform duration-300 ${activeButton === "pet" ? "scale-110" : ""}`}
          >
            <Image src="/images/icon-hand.png" alt="Hand" width={40} height={40} className="pixel-art" />
          </div>
          {activeButton === "pet" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          )}
        </div>
        <span className="text-xs">Acariciar</span>
      </Button>

      <Button
        onClick={handlePlayGame}
        variant="outline"
        className={`flex flex-col items-center p-2 h-auto bg-red-100 hover:bg-red-200 border-red-300 text-red-700 transition-all duration-300 ${
          activeButton === "game" ? "scale-95 bg-red-200 border-red-400 shadow-inner" : ""
        }`}
        title="Jugar minijuego con Noa"
        disabled={activeButton !== null || isSleeping}
      >
        <div className="relative">
          <div
            className={`h-10 w-10 mb-1 transition-transform duration-300 ${activeButton === "game" ? "scale-110" : ""}`}
          >
            <Image
              src="/images/game-controller.png"
              alt="Game controller"
              width={40}
              height={40}
              className="pixel-art"
            />
          </div>
          {activeButton === "game" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          )}
        </div>
        <span className="text-xs">Minijuego</span>
      </Button>

      <Button
        onClick={handleSleep}
        variant="outline"
        className={`flex flex-col items-center p-2 h-auto transition-all duration-300 ${
          isSleeping
            ? "bg-indigo-200 hover:bg-indigo-300 border-indigo-400 text-indigo-800"
            : "bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-indigo-700"
        } ${activeButton === "sleep" ? "scale-95 shadow-inner" : ""}`}
        title={isSleeping ? "Despertar a Noa" : "Dormir a Noa"}
        disabled={activeButton !== null}
      >
        <div className="relative">
          <div
            className={`h-10 w-10 mb-1 transition-transform duration-300 ${activeButton === "sleep" ? "scale-110" : ""}`}
          >
            <Image
              src={isSleeping ? "/images/empty-plate.png" : "/images/empty-plate.png"}
              alt="Sleep"
              width={40}
              height={40}
              className="pixel-art"
            />
          </div>
          {activeButton === "sleep" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
          )}
        </div>
        <span className="text-xs">{isSleeping ? "Despertar" : "Dormir"}</span>
      </Button>

      <Button
        onClick={onReset}
        variant="ghost"
        className="col-span-5 mt-4 text-gray-500 hover:text-gray-700 transition-colors duration-300"
        title="Reiniciar a Noa"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        <span className="text-xs">Reiniciar</span>
      </Button>
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface MiniGameProps {
  isOpen: boolean
  onClose: () => void
  onWin: () => void
}

export default function MiniGame({ isOpen, onClose, onWin }: MiniGameProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [gameOver, setGameOver] = useState(false)
  const [targets, setTargets] = useState<{ id: number; x: number; y: number; size: number }[]>([])
  const gameAreaRef = useRef<HTMLDivElement>(null)

  // Reset game when opened
  useEffect(() => {
    if (isOpen) {
      setScore(0)
      setTimeLeft(15)
      setGameOver(false)
      setTargets([])
    }
  }, [isOpen])

  // Timer countdown
  useEffect(() => {
    if (!isOpen || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setGameOver(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, gameOver])

  // Spawn targets
  useEffect(() => {
    if (!isOpen || gameOver) return

    const spawnTarget = () => {
      if (!gameAreaRef.current) return

      const { width, height } = gameAreaRef.current.getBoundingClientRect()
      const size = Math.floor(Math.random() * 20) + 30 // Random size between 30-50px
      const x = Math.floor(Math.random() * (width - size))
      const y = Math.floor(Math.random() * (height - size))

      setTargets((prev) => [...prev, { id: Date.now(), x, y, size }])
    }

    const interval = setInterval(spawnTarget, 1000)
    spawnTarget() // Spawn first target immediately

    return () => clearInterval(interval)
  }, [isOpen, gameOver])

  // Handle target click
  const handleTargetClick = (id: number) => {
    setTargets((prev) => prev.filter((target) => target.id !== id))
    setScore((prev) => prev + 10)

    // Win condition
    if (score >= 50) {
      setGameOver(true)
      onWin()
    }
  }

  // Handle game end
  const handleGameEnd = () => {
    if (score >= 50) {
      onWin()
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">¡Atrapa la pelota!</DialogTitle>
        </DialogHeader>

        <div className="flex justify-between mb-4">
          <div className="text-amber-600 font-bold">Puntos: {score}</div>
          <div className={`font-bold ${timeLeft < 5 ? "text-red-500" : "text-blue-500"}`}>Tiempo: {timeLeft}s</div>
        </div>

        <div
          ref={gameAreaRef}
          className="relative w-full h-64 bg-blue-50 rounded-lg border-2 border-blue-200 overflow-hidden"
        >
          {targets.map((target) => (
            <div
              key={target.id}
              className="absolute cursor-pointer animate-bounce-around"
              style={{
                left: `${target.x}px`,
                top: `${target.y}px`,
                width: `${target.size}px`,
                height: `${target.size}px`,
              }}
              onClick={() => handleTargetClick(target.id)}
            >
              <Image
                src="/images/game-ball.png"
                alt="Target"
                width={target.size}
                height={target.size}
                className="pixel-art"
              />
            </div>
          ))}

          {gameOver && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
              <h3 className="text-xl font-bold mb-2">{score >= 50 ? "¡Ganaste!" : "¡Tiempo agotado!"}</h3>
              <p className="mb-4">Puntuación final: {score}</p>
              <Button onClick={handleGameEnd}>Cerrar</Button>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500 mt-2">
          Haz clic en las pelotas para ganar puntos. ¡Consigue 50 puntos para ganar!
        </div>
      </DialogContent>
    </Dialog>
  )
}

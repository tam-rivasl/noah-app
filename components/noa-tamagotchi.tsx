"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import NoaSprite from "./noa-sprite"
import StatusBars from "./status-bars"
import ActionButtons from "./action-buttons"
import MiniGame from "./mini-game"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

// Tipos para los estados de Noa
export type NoaState = {
  hunger: number
  happiness: number
  energy: number
  lastUpdated: number
}

// Estado inicial de Noa
const initialState: NoaState = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  lastUpdated: Date.now(),
}

export default function NoaTamagotchi() {
  const [noaState, setNoaState] = useState<NoaState>(initialState)
  const [currentAction, setCurrentAction] = useState<string | null>(null)
  const [isSleeping, setIsSleeping] = useState(false)
  const [isGameOpen, setIsGameOpen] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Cargar el estado guardado al iniciar
  useEffect(() => {
    const savedState = localStorage.getItem("noaState")
    if (savedState) {
      const parsedState = JSON.parse(savedState) as NoaState

      // Calcular el tiempo transcurrido desde la última actualización
      const now = Date.now()
      const timePassed = (now - parsedState.lastUpdated) / (1000 * 60) // en minutos

      // Reducir los estados basados en el tiempo transcurrido (1 punto cada 5 minutos)
      const reductionAmount = Math.floor(timePassed / 5)

      if (reductionAmount > 0) {
        parsedState.hunger = Math.max(parsedState.hunger - reductionAmount, 0)
        parsedState.happiness = Math.max(parsedState.happiness - reductionAmount, 0)
        parsedState.energy = Math.max(parsedState.energy - reductionAmount, 0)
        parsedState.lastUpdated = now
      }

      setNoaState(parsedState)
    }
  }, [])

  // Guardar el estado cada vez que cambie
  useEffect(() => {
    localStorage.setItem(
      "noaState",
      JSON.stringify({
        ...noaState,
        lastUpdated: Date.now(),
      }),
    )
  }, [noaState])

  // Reducir los estados con el tiempo (cada minuto)
  useEffect(() => {
    const interval = setInterval(() => {
      setNoaState((prev) => ({
        ...prev,
        hunger: Math.max(prev.hunger - 1, 0),
        happiness: Math.max(prev.happiness - 1, 0),
        energy: Math.max(prev.energy - 1, 0),
        lastUpdated: Date.now(),
      }))
    }, 60000) // 1 minuto

    return () => clearInterval(interval)
  }, [])

  // Determinar el estado emocional de Noa
  const getEmotionalState = useCallback(() => {
    const { hunger, happiness, energy } = noaState

    if (isSleeping) return "sleeping"

    // New combined state: hungry and tired
    if (hunger < 30 && energy < 30) return "hungry-tired"

    if (energy < 20) return "tired"
    if (hunger < 20) return "hungry"
    if (happiness < 20) return "sad"
    if (happiness < 40) return "bored"
    if (hunger < 40 || energy < 40) return "worried"
    if (hunger > 80 && happiness > 80 && energy > 80) return "excited"
    return "normal"
  }, [noaState, isSleeping])

  // Acciones para interactuar con Noa
  const feedNoa = () => {
    if (isSleeping) {
      toast({
        title: "Noa está durmiendo",
        description: "Mejor no la despiertes ahora",
      })
      return
    }

    setCurrentAction("eating")
    setTimeout(() => setCurrentAction(null), 2000)

    setNoaState((prev) => ({
      ...prev,
      hunger: Math.min(prev.hunger + 20, 100),
      energy: Math.min(prev.energy + 5, 100),
    }))

    toast({
      title: "¡Noa está comiendo!",
      description: "Le encanta su comida especial",
    })
  }

  const playWithNoa = () => {
    if (isSleeping) {
      toast({
        title: "Noa está durmiendo",
        description: "Mejor no la despiertes ahora",
      })
      return
    }

    if (noaState.energy < 20) {
      toast({
        title: "Noa está muy cansada",
        description: "Necesita descansar antes de jugar",
      })
      return
    }

    setCurrentAction("playing")
    setTimeout(() => setCurrentAction(null), 2000)

    setNoaState((prev) => ({
      ...prev,
      happiness: Math.min(prev.happiness + 20, 100),
      energy: Math.max(prev.energy - 15, 0),
      hunger: Math.max(prev.hunger - 10, 0),
    }))

    toast({
      title: "¡Noa está jugando!",
      description: "¡Mira cómo se divierte con su hueso!",
    })
  }

  const petNoa = () => {
    if (isSleeping) {
      toast({
        title: "Noa está durmiendo",
        description: "Le gusta que la acaricies mientras duerme",
      })
    }

    setCurrentAction("petting")
    setTimeout(() => setCurrentAction(null), 2000)

    setNoaState((prev) => ({
      ...prev,
      happiness: Math.min(prev.happiness + 10, 100),
    }))

    toast({
      title: "Noa se siente querida",
      description: "Tus caricias la hacen muy feliz",
    })
  }

  const playGameWithNoa = () => {
    if (isSleeping) {
      toast({
        title: "Noa está durmiendo",
        description: "Mejor no la despiertes ahora",
      })
      return
    }

    if (noaState.energy < 30) {
      toast({
        title: "Noa está muy cansada",
        description: "Necesita descansar antes de jugar videojuegos",
      })
      return
    }

    setCurrentAction("game")
    setTimeout(() => {
      setCurrentAction(null)
      setIsGameOpen(true)
    }, 1500)

    toast({
      title: "¡Noa quiere jugar un minijuego!",
      description: "Prepárate para atrapar pelotas",
    })
  }

  const handleGameWin = () => {
    setNoaState((prev) => ({
      ...prev,
      happiness: Math.min(prev.happiness + 30, 100),
      energy: Math.max(prev.energy - 20, 0),
      hunger: Math.max(prev.hunger - 15, 0),
    }))

    toast({
      title: "¡Noa está muy feliz!",
      description: "Ha disfrutado mucho jugando contigo",
    })
  }

  const toggleSleep = () => {
    setIsSleeping((prev) => !prev)

    if (!isSleeping) {
      toast({
        title: "Noa se está durmiendo",
        description: "Dulces sueños, pequeña estrella",
      })

      // Recuperar energía mientras duerme
      const interval = setInterval(() => {
        setNoaState((prev) => ({
          ...prev,
          energy: Math.min(prev.energy + 5, 100),
        }))
      }, 10000) // cada 10 segundos

      return () => clearInterval(interval)
    } else {
      toast({
        title: "Noa se ha despertado",
        description: "¡Está lista para un nuevo día!",
      })
    }
  }

  const resetNoa = () => {
    if (confirm("¿Estás seguro de que quieres reiniciar a Noa? Se perderá todo su progreso.")) {
      setNoaState(initialState)
      setCurrentAction(null)
      setIsSleeping(false)
      localStorage.removeItem("noaState")

      toast({
        title: "Noa ha sido reiniciada",
        description: "Comienza una nueva aventura con ella",
      })
    }
  }

  const emotionalState = getEmotionalState()

  return (
    <>
      <Card
        className={`w-full max-w-md p-6 ${
          isSleeping ? "bg-indigo-100" : "bg-pink-50"
        } border-2 border-pink-200 shadow-lg transition-colors duration-1000`}
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl font-bold text-center text-pink-600">
            Noa {isSleeping ? "💤" : emotionalState === "hungry-tired" ? "😴🍽️" : "✨"}
          </h1>

          <div
            className={`relative ${
              isMobile ? "w-48 h-48" : "w-64 h-64"
            } bg-gradient-to-b from-pink-100 to-blue-100 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 border-2 border-pink-200`}
          >
            <div
              className={`absolute inset-0 ${
                isSleeping ? "bg-indigo-100/50" : emotionalState === "hungry-tired" ? "bg-amber-50/30" : ""
              } transition-colors duration-1000 flex items-center justify-center`}
            >
              <NoaSprite
                emotionalState={emotionalState}
                currentAction={currentAction}
                hungerLevel={noaState.hunger}
                happinessLevel={noaState.happiness}
                energyLevel={noaState.energy}
              />
            </div>

            {/* Estrellas en el fondo cuando duerme */}
            {isSleeping && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-indigo-400 rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 5}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Indicadores visuales para el estado hambriento-cansado */}
            {emotionalState === "hungry-tired" && !currentAction && (
              <div className="absolute inset-0 overflow-hidden">
                {/* Burbujas de hambre */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={`hunger-${i}`}
                    className="absolute w-1 h-1 bg-amber-400 rounded-full animate-float-up"
                    style={{
                      bottom: `${10 + Math.random() * 20}%`,
                      left: `${30 + Math.random() * 20}%`,
                      animationDelay: `${i * 0.5 + 1}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  />
                ))}

                {/* Zs de cansancio */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={`sleep-${i}`}
                    className="absolute text-indigo-400 text-xs animate-float-up opacity-70"
                    style={{
                      top: `${20 + i * 10}%`,
                      right: `${20 + i * 5}%`,
                      animationDelay: `${i * 1.5}s`,
                      animationDuration: `${3 + Math.random() * 2}s`,
                    }}
                  >
                    z
                  </div>
                ))}
              </div>
            )}
          </div>

          <StatusBars noaState={noaState} />

          <ActionButtons
            onFeed={feedNoa}
            onPlay={playWithNoa}
            onPet={petNoa}
            onSleep={toggleSleep}
            onReset={resetNoa}
            onPlayGame={playGameWithNoa}
            isSleeping={isSleeping}
          />
        </div>
      </Card>

      <MiniGame isOpen={isGameOpen} onClose={() => setIsGameOpen(false)} onWin={handleGameWin} />
    </>
  )
}

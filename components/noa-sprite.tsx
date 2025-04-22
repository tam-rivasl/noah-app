"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface NoaSpriteProps {
  emotionalState: string
  currentAction: string | null
  hungerLevel: number
  happinessLevel: number
  energyLevel: number
}

export default function NoaSprite({
  emotionalState,
  currentAction,
  hungerLevel,
  happinessLevel,
  energyLevel,
}: NoaSpriteProps) {
  const [frame, setFrame] = useState(0)
  const [animationSpeed, setAnimationSpeed] = useState(500)
  const [transitionState, setTransitionState] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Track previous state for transitions
  const [prevState, setPrevState] = useState(emotionalState)

  // Adjust animation speed based on emotional state
  useEffect(() => {
    if (emotionalState === "excited" || currentAction === "playing") {
      setAnimationSpeed(300) // Faster for excited states
    } else if (emotionalState === "sleeping" || emotionalState === "tired") {
      setAnimationSpeed(800) // Slower for tired/sleeping states
    } else if (emotionalState === "hungry-tired") {
      setAnimationSpeed(1000) // Even slower for hungry-tired state
    } else {
      setAnimationSpeed(500) // Default speed
    }
  }, [emotionalState, currentAction])

  // Handle state transitions
  useEffect(() => {
    if (emotionalState !== prevState && !currentAction) {
      // Start transition
      setIsTransitioning(true)
      setTransitionState(prevState)

      // After a short delay, complete the transition
      const timer = setTimeout(() => {
        setIsTransitioning(false)
        setTransitionState(null)
        setPrevState(emotionalState)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [emotionalState, prevState, currentAction])

  // Basic animation frame cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4) // Expanded to 4 frames for more fluid animations
    }, animationSpeed)

    return () => clearInterval(interval)
  }, [animationSpeed])

  // Render Noa sprite based on emotional state and current action
  const renderNoaSprite = () => {
    // If there's an action in progress, show that animation
    if (currentAction) {
      return renderActionSprite(currentAction)
    }

    // If transitioning between states, show transition animation
    if (isTransitioning && transitionState) {
      return renderTransitionSprite(transitionState, emotionalState)
    }

    // Otherwise, show the emotional state
    switch (emotionalState) {
      case "normal":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`transition-all duration-300 ${frame % 2 === 0 ? "scale-100" : "scale-[1.02]"}`}>
              <Image
                src="/images/noa-normal.png"
                alt="Noa normal"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>
            {/* Subtle breathing animation */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <div
                className={`w-24 h-24 rounded-full bg-transparent border-2 border-pink-200/0 ${
                  frame % 2 === 0 ? "scale-100" : "scale-105"
                } transition-all duration-1000`}
              ></div>
            </div>
          </div>
        )
      case "excited":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-200 ${
                frame === 0
                  ? "translate-y-0 rotate-0"
                  : frame === 1
                    ? "translate-y-1 rotate-1"
                    : frame === 2
                      ? "translate-y-0 rotate-0"
                      : "translate-y-1 rotate-[-1deg]"
              }`}
            >
              <Image
                src="/images/noa-normal.png"
                alt="Noa feliz"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>
            {/* Happiness particles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 bg-pink-400 rounded-full opacity-0 ${
                  frame === i ? "animate-float-particle" : ""
                }`}
                style={{
                  top: `${30 + Math.random() * 20}%`,
                  left: `${40 + Math.random() * 30}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        )
      case "sad":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`transition-all duration-500 ${frame % 2 === 0 ? "translate-y-0" : "translate-y-1"}`}>
              <Image
                src="/images/noa-sad.png"
                alt="Noa triste"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>
            {/* Tear drops */}
            {frame === 1 && (
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-tear-drop"></div>
            )}
            {frame === 3 && (
              <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-blue-400 rounded-full animate-tear-drop"></div>
            )}
            {/* Sad aura */}
            <div className="absolute inset-0 rounded-full bg-blue-500/5 animate-pulse"></div>
          </div>
        )
      case "worried":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`transition-all duration-300 ${frame % 2 === 0 ? "rotate-1" : "-rotate-1"}`}>
              <Image
                src="/images/noa-sad.png"
                alt="Noa preocupada"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>
            {/* Worried thought bubble */}
            {frame === 2 && (
              <div className="absolute -top-6 right-0">
                <div className="w-4 h-4 bg-gray-200 rounded-full relative">
                  <div className="absolute -bottom-2 -left-1 w-2 h-2 bg-gray-200 rounded-full"></div>
                  <div className="absolute -bottom-4 -left-2 w-1 h-1 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        )
      case "sleeping":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`transition-all duration-1000 ${frame % 2 === 0 ? "opacity-100" : "opacity-90"}`}>
              <Image
                src="/images/noa-sleeping-z.png"
                alt="Noa durmiendo"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>
            {/* Gentle breathing while sleeping */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full ${
                  frame % 2 === 0 ? "scale-100" : "scale-[1.03]"
                } transition-all duration-1000`}
              ></div>
            </div>
          </div>
        )
      case "tired":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`transition-all duration-500 ${frame % 2 === 0 ? "rotate-1" : "-rotate-1"}`}>
              <Image
                src="/images/noa-sleeping.png"
                alt="Noa cansada"
                width={96}
                height={96}
                className="pixel-art opacity-90 drop-shadow-md"
              />
            </div>
            {/* Tired indicators */}
            <div className="absolute top-0 right-0">
              {frame === 1 && <div className="text-indigo-400 text-sm">z</div>}
            </div>
            {/* Energy low indicator */}
            <div className="absolute bottom-0 w-full flex justify-center">
              <div className="w-12 h-1 bg-red-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 transition-all duration-300"
                  style={{ width: `${energyLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        )
      case "hungry":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className={`transition-all duration-300 ${frame % 2 === 0 ? "scale-100" : "scale-[1.02] rotate-1"}`}>
              <Image
                src="/images/noa-sad.png"
                alt="Noa hambrienta"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>
            {/* Stomach growl animation */}
            {frame === 2 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <div className="w-8 h-8 rounded-full border-2 border-amber-300 animate-ping opacity-30"></div>
              </div>
            )}
            {/* Empty plate indicator */}
            {frame % 2 === 0 && (
              <div className="absolute -bottom-4 -right-4 opacity-70">
                <Image src="/images/empty-plate.png" alt="Empty plate" width={24} height={24} className="pixel-art" />
              </div>
            )}
          </div>
        )
      case "hungry-tired":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-800 ${
                frame % 4 === 0
                  ? "translate-y-0 rotate-0"
                  : frame % 4 === 1
                    ? "translate-y-1 rotate-1"
                    : frame % 4 === 2
                      ? "translate-y-0 rotate-0"
                      : "translate-y-1 rotate-[-1deg]"
              }`}
            >
              <Image
                src="/images/noa-sleeping.png"
                alt="Noa hambrienta y cansada"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>

            {/* Combined indicators */}
            <div className="absolute -top-4 right-2 text-indigo-400 text-sm opacity-70">{frame % 4 === 0 && "z"}</div>

            {/* Empty plate indicator */}
            {frame % 4 === 2 && (
              <div className="absolute -bottom-4 -right-4 opacity-70">
                <Image src="/images/empty-plate.png" alt="Empty plate" width={24} height={24} className="pixel-art" />
              </div>
            )}
          </div>
        )
      case "bored":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-700 ${
                frame % 4 === 0
                  ? "rotate-0"
                  : frame % 4 === 1
                    ? "rotate-1"
                    : frame % 4 === 2
                      ? "rotate-0"
                      : "rotate-[-1deg]"
              }`}
            >
              <Image
                src="/images/noa-normal.png"
                alt="Noa aburrida"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md opacity-90"
              />
            </div>
            {/* Game controller thought bubble */}
            {frame === 2 && (
              <div className="absolute -top-8 right-0">
                <div className="w-6 h-6 bg-gray-200/50 rounded-full relative flex items-center justify-center">
                  <Image
                    src="/images/game-controller.png"
                    alt="Game controller"
                    width={16}
                    height={16}
                    className="pixel-art opacity-70"
                  />
                  <div className="absolute -bottom-2 -left-1 w-2 h-2 bg-gray-200/50 rounded-full"></div>
                  <div className="absolute -bottom-4 -left-2 w-1 h-1 bg-gray-200/50 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <Image src="/images/noa-normal.png" alt="Noa" width={96} height={96} className="pixel-art drop-shadow-md" />
          </div>
        )
    }
  }

  // Render transition animations between states
  const renderTransitionSprite = (fromState: string, toState: string) => {
    // Special transition: normal/any to hungry-tired
    if (toState === "hungry-tired") {
      return (
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className={`transition-all duration-600 ${frame % 2 === 0 ? "opacity-70" : "opacity-100"}`}>
            <Image
              src="/images/noa-sleeping.png"
              alt="Noa transición"
              width={96}
              height={96}
              className={`pixel-art drop-shadow-md ${isTransitioning ? "animate-fade-in" : ""}`}
            />
          </div>

          {/* Transition effect */}
          <div className="absolute inset-0 bg-amber-100/20 animate-pulse rounded-full"></div>

          {/* Empty plate appearing */}
          <div className="absolute -bottom-4 -right-4 animate-fade-in">
            <Image
              src="/images/empty-plate.png"
              alt="Empty plate"
              width={24}
              height={24}
              className="pixel-art opacity-70"
            />
          </div>
        </div>
      )
    }

    // Special transition: hungry-tired to sleeping
    if (fromState === "hungry-tired" && toState === "sleeping") {
      return (
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="transition-all duration-800 animate-fade-cross">
            <Image
              src="/images/noa-sleeping-z.png"
              alt="Noa transición a dormir"
              width={96}
              height={96}
              className="pixel-art drop-shadow-md"
            />
          </div>

          {/* Sleep particles appearing */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute text-indigo-400 text-sm animate-float-up"
              style={{
                top: `${20 + i * 10}%`,
                right: `${20 + i * 5}%`,
                animationDelay: `${i * 0.2}s`,
                opacity: frame % 2 === i % 2 ? 0.7 : 0.3,
              }}
            >
              z
            </div>
          ))}

          {/* Empty plate fading */}
          <div className="absolute -bottom-4 -right-4 animate-fade-out">
            <Image
              src="/images/empty-plate.png"
              alt="Empty plate"
              width={24}
              height={24}
              className="pixel-art opacity-50"
            />
          </div>
        </div>
      )
    }

    // Default transition - crossfade effect
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center animate-fade-out">
          {renderStateImage(fromState)}
        </div>
        <div className="absolute inset-0 flex items-center justify-center animate-fade-in">
          {renderStateImage(toState)}
        </div>
      </div>
    )
  }

  // Helper to render just the image for a state (used in transitions)
  const renderStateImage = (state: string) => {
    switch (state) {
      case "normal":
        return <Image src="/images/noa-normal.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "excited":
      case "happy":
        return <Image src="/images/noa-normal.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "sad":
        return <Image src="/images/noa-sad.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "worried":
        return <Image src="/images/noa-sad.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "sleeping":
        return <Image src="/images/noa-sleeping-z.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "tired":
        return <Image src="/images/noa-sleeping.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "hungry-tired":
        return <Image src="/images/noa-sleeping.png" alt="Noa" width={96} height={96} className="pixel-art" />
      case "hungry":
        return <Image src="/images/noa-sad.png" alt="Noa" width={96} height={96} className="pixel-art" />
      default:
        return <Image src="/images/noa-normal.png" alt="Noa" width={96} height={96} className="pixel-art" />
    }
  }

  // Render animations for specific actions
  const renderActionSprite = (action: string) => {
    switch (action) {
      case "eating":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-200 ${
                frame % 4 === 0
                  ? "scale-100 rotate-0"
                  : frame % 4 === 1
                    ? "scale-[1.03] rotate-1"
                    : frame % 4 === 2
                      ? "scale-[1.02] rotate-0"
                      : "scale-[1.01] rotate-[-1deg]"
              }`}
            >
              <Image
                src="/images/noa-normal.png"
                alt="Noa comiendo"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>

            {/* Food bowl animation */}
            <div
              className={`absolute bottom-6 left-6 transition-all duration-200 ${
                frame % 4 === 0
                  ? "opacity-100 scale-100"
                  : frame % 4 === 1
                    ? "opacity-90 scale-95"
                    : frame % 4 === 2
                      ? "opacity-80 scale-90"
                      : "opacity-70 scale-85"
              }`}
            >
              <Image src="/images/food-bowl.png" alt="Food bowl" width={32} height={32} className="pixel-art" />
            </div>

            {/* Eating particles */}
            {frame % 2 === 0 && (
              <div className="absolute bottom-8 left-8">
                <div className="w-1 h-1 bg-amber-200 rounded-full animate-float-up"></div>
              </div>
            )}

            {/* Empty plate appearing as food is eaten */}
            {frame === 3 && (
              <div className="absolute bottom-2 right-6 opacity-70">
                <Image src="/images/empty-plate.png" alt="Empty plate" width={24} height={24} className="pixel-art" />
              </div>
            )}

            {/* Satisfaction indicator */}
            {frame === 3 && <div className="absolute top-2 right-2 text-amber-500 text-xs">♥</div>}
          </div>
        )
      case "playing":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-150 ${
                frame % 4 === 0
                  ? "translate-y-0 rotate-0"
                  : frame % 4 === 1
                    ? "-translate-y-3 rotate-1"
                    : frame % 4 === 2
                      ? "-translate-y-1 rotate-0"
                      : "-translate-y-2 rotate-[-1deg]"
              }`}
            >
              <Image
                src="/images/noa-normal.png"
                alt="Noa jugando"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>

            {/* Bone toy animation */}
            <div
              className={`absolute transition-all duration-150 ${
                frame % 4 === 0
                  ? "bottom-2 right-4 scale-100 rotate-0"
                  : frame % 4 === 1
                    ? "bottom-10 right-2 scale-90 rotate-45"
                    : frame % 4 === 2
                      ? "bottom-6 right-8 scale-95 rotate-90"
                      : "bottom-4 right-6 scale-100 rotate-180"
              }`}
            >
              <Image src="/images/bone-toy.png" alt="Bone toy" width={32} height={32} className="pixel-art" />
            </div>

            {/* Play particles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${frame === i ? "animate-ping-out" : "opacity-0"}`}
                style={{
                  backgroundColor: i % 2 === 0 ? "#ec4899" : "#8b5cf6",
                  top: `${40 + Math.random() * 20}%`,
                  left: `${40 + Math.random() * 20}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              ></div>
            ))}

            {/* Fun indicator */}
            {frame % 4 === 2 && <div className="absolute top-0 right-0 text-pink-500 text-sm">!</div>}
          </div>
        )
      case "petting":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-300 ${
                frame % 4 === 0
                  ? "scale-100 rotate-0"
                  : frame % 4 === 1
                    ? "scale-[1.02] rotate-1"
                    : frame % 4 === 2
                      ? "scale-[1.01] rotate-0"
                      : "scale-[1.03] rotate-[-1deg]"
              }`}
            >
              <Image
                src="/images/noa-normal.png"
                alt="Noa siendo acariciada"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>

            {/* Hand animation */}
            <div
              className={`absolute transition-all duration-200 ${
                frame % 4 === 0
                  ? "top-0 right-2"
                  : frame % 4 === 1
                    ? "top-2 right-0"
                    : frame % 4 === 2
                      ? "top-4 right-2"
                      : "top-2 right-4"
              }`}
            >
              <Image src="/images/icon-hand.png" alt="Hand" width={32} height={32} className="pixel-art" />
            </div>

            {/* Heart particles */}
            {frame % 2 === 0 && (
              <div className={`absolute top-2 ${frame % 4 === 0 ? "left-4" : "right-4"}`}>
                <div className="text-pink-400 text-xs animate-float-up">♥</div>
              </div>
            )}

            {/* Affection sparkles */}
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-1 h-1 bg-purple-300 rounded-full ${
                  frame === i ? "animate-sparkle" : "opacity-0"
                }`}
                style={{
                  top: `${30 + Math.random() * 20}%`,
                  left: `${40 + Math.random() * 20}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              ></div>
            ))}
          </div>
        )
      case "game":
        return (
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div
              className={`transition-all duration-200 ${
                frame % 4 === 0
                  ? "translate-y-0 rotate-0"
                  : frame % 4 === 1
                    ? "translate-y-1 rotate-2"
                    : frame % 4 === 2
                      ? "translate-y-0 rotate-0"
                      : "translate-y-1 rotate-[-2deg]"
              }`}
            >
              <Image
                src="/images/noa-normal.png"
                alt="Noa jugando videojuego"
                width={96}
                height={96}
                className="pixel-art drop-shadow-md"
              />
            </div>

            {/* Game ball animation */}
            <div
              className={`absolute transition-all duration-150 ${
                frame % 4 === 0
                  ? "top-0 left-4 scale-100"
                  : frame % 4 === 1
                    ? "top-2 left-6 scale-110"
                    : frame % 4 === 2
                      ? "top-4 left-2 scale-90"
                      : "top-2 left-0 scale-100"
              }`}
            >
              <Image src="/images/game-ball.png" alt="Game ball" width={32} height={32} className="pixel-art" />
            </div>

            {/* Game controller animation */}
            <div
              className={`absolute bottom-2 right-2 transition-all duration-150 ${
                frame % 2 === 0 ? "rotate-2" : "rotate-[-2deg]"
              }`}
            >
              <Image
                src="/images/game-controller.png"
                alt="Game controller"
                width={28}
                height={28}
                className="pixel-art"
              />
            </div>

            {/* Game particles */}
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 ${frame === i ? "animate-ping-out" : "opacity-0"}`}
                style={{
                  backgroundColor:
                    i % 4 === 0 ? "#ef4444" : i % 4 === 1 ? "#f59e0b" : i % 4 === 2 ? "#10b981" : "#3b82f6",
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                  borderRadius: "50%",
                }}
              ></div>
            ))}

            {/* Game score indicator */}
            {frame % 4 === 2 && <div className="absolute -top-4 -right-4 text-amber-500 text-xs font-pixel">+10</div>}
          </div>
        )
      default:
        return renderNoaSprite()
    }
  }

  return <div className="pixel-art">{renderNoaSprite()}</div>
}

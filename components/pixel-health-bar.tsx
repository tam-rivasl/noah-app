"use client"

import { useState, useEffect } from "react"

interface PixelHealthBarProps {
  value: number
  maxValue: number
  segments?: number
  type: "hunger" | "happiness" | "energy"
  showHeart?: boolean
}

export default function PixelHealthBar({ value, maxValue, segments = 5, type, showHeart = true }: PixelHealthBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [prevValue, setPrevValue] = useState(value)

  // Trigger animation when value changes
  useEffect(() => {
    if (Math.abs(value - prevValue) > 5) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setPrevValue(value)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setPrevValue(value)
    }
  }, [value, prevValue])

  // Calculate the number of segments to fill
  const filledSegments = Math.ceil((value / maxValue) * segments)

  // Get colors based on type
  const getBarColor = () => {
    if (value < 20) return "bg-red-500"
    if (value < 50) return "bg-yellow-400"
    return type === "hunger" ? "bg-red-500" : type === "happiness" ? "bg-yellow-400" : "bg-green-500"
  }

  const getHeartColor = () => {
    if (value < 20) return "text-gray-400"
    return "text-red-600"
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      {showHeart && (
        <div className="flex items-center justify-center w-6">
          <span className={`text-sm ${getHeartColor()} pixel-art`}>❤️</span>
        </div>
      )}
      <div
        className={`relative h-5 w-full border-2 border-black bg-white rounded-sm overflow-hidden pixel-art ${
          isAnimating ? "animate-pulse" : ""
        }`}
      >
        {/* Segments */}
        <div className="flex h-full w-full">
          {Array.from({ length: segments }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-full ${
                index < filledSegments ? getBarColor() : "bg-transparent"
              } ${index === segments - 1 ? "" : "border-r border-black/30"}`}
            ></div>
          ))}
        </div>

        {/* Black outline for pixel art effect */}
        <div className="absolute inset-0 border border-black pointer-events-none"></div>
      </div>
    </div>
  )
}

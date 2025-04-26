"use client"

import { useState, useEffect } from "react"

interface PixelStatusBarProps {
  value: number
  maxValue: number
  type: "hunger" | "happiness" | "energy"
  label: string
}

export default function PixelStatusBar({ value, maxValue, type, label }: PixelStatusBarProps) {
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
  const totalSegments = 5
  const filledSegments = Math.ceil((value / maxValue) * totalSegments)

  // Get colors based on type
  const getColors = () => {
    switch (type) {
      case "hunger":
        return {
          bg: "bg-red-100",
          fill: "bg-red-500",
          heart: "text-red-500",
          border: "border-red-900",
        }
      case "happiness":
        return {
          bg: "bg-yellow-100",
          fill: "bg-yellow-400",
          heart: "text-yellow-500",
          border: "border-yellow-900",
        }
      case "energy":
        return {
          bg: "bg-green-100",
          fill: "bg-green-500",
          heart: "text-green-500",
          border: "border-green-900",
        }
      default:
        return {
          bg: "bg-gray-100",
          fill: "bg-gray-500",
          heart: "text-gray-500",
          border: "border-gray-900",
        }
    }
  }

  const colors = getColors()

  // Get icon based on type and value
  const getIcon = () => {
    if (value <= maxValue * 0.2) {
      return "♡" // Empty heart for low values
    }
    return "❤️" // Filled heart for normal values
  }

  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="flex flex-col items-center justify-center w-6">
        <span className={`text-sm ${colors.heart} pixel-art`}>{getIcon()}</span>
      </div>
      <span className="text-sm font-medium w-20 text-gray-700">{label}:</span>
      <div
        className={`relative h-6 w-full border-2 ${colors.border} ${
          colors.bg
        } rounded-sm overflow-hidden pixel-art ${isAnimating ? "animate-pulse" : ""}`}
      >
        {/* Segments */}
        <div className="flex h-full w-full">
          {Array.from({ length: totalSegments }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-full border-r ${
                index < filledSegments ? colors.fill : "bg-transparent"
              } ${index === totalSegments - 1 ? "border-r-0" : "border-r border-black/20"}`}
            ></div>
          ))}
        </div>

        {/* Value text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]">
            {Math.round(value)}%
          </span>
        </div>
      </div>
    </div>
  )
}

"use client";

import { useState, useEffect } from "react";

interface PixelStatusBarProps {
  value: number;
  maxValue: number;
  type: "hunger" | "happiness" | "energy";
}

export default function PixelStatusBar({ value, maxValue, type }: PixelStatusBarProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (Math.abs(value - prevValue) > 5) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setPrevValue(value);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setPrevValue(value);
    }
  }, [value, prevValue]);

  const totalSegments = 5;
  const filledSegments = Math.ceil((value / maxValue) * totalSegments);

  const critical = value <= maxValue * 0.2;

  const getColors = () => {
    switch (type) {
      case "hunger":
        return { bg: "bg-red-700", fill: "bg-red-400", border: "border-red-900", glow: "shadow-red-400" };
      case "happiness":
        return { bg: "bg-yellow-600", fill: "bg-yellow-300", border: "border-yellow-900", glow: "shadow-yellow-300" };
      case "energy":
        return { bg: "bg-blue-700", fill: "bg-blue-400", border: "border-blue-900", glow: "shadow-blue-400" };
      default:
        return { bg: "bg-gray-400", fill: "bg-gray-200", border: "border-gray-900", glow: "shadow-gray-300" };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    if (type === "hunger") return critical ? "🥄" : "🍴";
    if (type === "happiness") return critical ? "♡" : "❤️";
    if (type === "energy") return critical ? "💤" : "⚡";
    return "❔";
  };

  return (
<div className="flex items-center w-full gap-2 min-h-[24px]">
{/* Ícono */}
      <div className="w-5 text-center drop-shadow-md">
        <span className={`text-sm pixel-font ${colors.glow} ${critical ? "animate-blink" : ""}`}>
          {getIcon()}
        </span>
      </div>

      {/* Barra de bloques */}
      <div
        className={`relative flex-1 h-4 border-2 ${colors.border} ${colors.bg} rounded-sm overflow-hidden 
          ${isAnimating ? "animate-pixel-fill" : ""} 
          ${colors.glow}`}
      >
        <div className="flex h-full">
          {Array.from({ length: totalSegments }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-full ${
                index < filledSegments ? colors.fill : "bg-white"
              } ${index !== totalSegments - 1 ? "border-r border-black/20" : ""}`}
            />
          ))}
        </div>

        {/* % encima */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[8px] font-bold text-black pixel-font drop-shadow-md">
            {Math.round(value)}%
          </span>
        </div>
      </div>
    </div>
  );
}

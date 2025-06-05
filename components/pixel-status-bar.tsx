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
        return { bg: "bg-[#FDEBD2]", fill: "bg-[#F36C75]", border: "border-[#F9D7A0]", glow: "shadow-[#F5C490]" };
      case "happiness":
        return { bg: "bg-[#FFF3C7]", fill: "bg-[#FFD95C]", border: "border-[#F9D7A0]", glow: "shadow-[#FFE177]" };
      case "energy":
        return { bg: "bg-[#DFF5D1]", fill: "bg-[#A8E6A1]", border: "border-[#F9D7A0]", glow: "shadow-[#A8E6A1]" };
      default:
        return { bg: "bg-gray-400", fill: "bg-gray-200", border: "border-gray-900", glow: "shadow-gray-300" };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    const base = "/images/icons";
    switch (type) {
      case "hunger":
        return critical ? `${base}/sad-food.png` : `${base}/food.png`;
      case "happiness":
        return critical ? `${base}/sad.png` : `${base}/happy.png`;
      case "energy":
        return critical ? `${base}/sad-battery.png` : `${base}/energy.png`;
      default:
        return "❔";
    }
  };

  return (
    <div className="flex  w-full min-h-[1px] ">
      <div className="w-6 h-6 text-center drop-shadow-md">
        <img src={getIcon()} alt={type} className={`w-[20px] h-[20px] ${critical ? "animate-blink" : ""}`} />
      </div>

      <div
        className={`relative flex-1 h-5 border-2 ${colors.border} ${colors.bg} rounded-sm overflow-hidden 
          ${isAnimating ? "animate-pixel-fill" : ""} 
          ${colors.glow}`}
      >
        <div className="flex h-full">
          {Array.from({ length: totalSegments }).map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-full ${
                index < filledSegments ? colors.fill : "bg-white"
              } ${index !== totalSegments - 1 ? "border-r border-black/10" : ""}`}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-black pixel-font drop-shadow-md">
            {Math.round(value)}%
          </span>
        </div>
      </div>
    </div>
  );
}

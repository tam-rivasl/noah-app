"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function NoaWalking() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [positionX, setPositionX] = useState(100);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [emote, setEmote] = useState<string | null>(null);

  const frames = [
    "/images/spreeds/walking/noa-caminando-1.png",
    "/images/spreeds/walking/noa-caminando-2.png",
    "/images/spreeds/walking/noa-caminando-3.png",
    "/images/spreeds/walking/noa-caminando-4.png",
    "/images/spreeds/walking/noa-caminando-5.png",
    "/images/spreeds/walking/noa-caminando-6.png",
  ];

  // Animar frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Movimiento automático
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPositionX((prev) => {
        if (direction === "right") {
          if (prev >= 190) {
            setDirection("left");
            return prev - 5;
          }
          return prev + 5;
        } else {
          if (prev <= 10) {
            setDirection("right");
            return prev + 5;
          }
          return prev - 5;
        }
      });

      // De vez en cuando suelta un corazón ❤️
      if (Math.random() < 0.2) { // 20% de probabilidad
        spawnEmote();
      }
    }, 200); // Velocidad de movimiento
    return () => clearInterval(moveInterval);
  }, [direction]);

  const spawnEmote = () => {
    setEmote("❤️");
    setTimeout(() => setEmote(null), 1000); // El corazón desaparece
  };

  return (
    <div className="absolute bottom-4 w-16 h-16" style={{ left: positionX }}>
      {/* Emote flotante */}
      {emote && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg animate-float-up">
          {emote}
        </div>
      )}

      {/* Noa caminando */}
      <div className="w-full h-full relative">
        <Image
          src={frames[frameIndex]}
          alt="Noa caminando"
          width={80}
          height={80}
          style={{ width: "80px", height: "80px" }}
          className={`object-contain pixel-art ${direction === "left" ? "scale-x-[-1]" : ""}`}
        />
      </div>
    </div>
  );
}

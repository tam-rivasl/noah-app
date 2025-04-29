"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const walkingFrames = [
  "/images/catch/noa-agachado-1.png",
  "/images/catch/noa-comienza-a-jugar.png",
  "/images/catch/noa-comienza-a-jugar2.png",
  "/images/catch/noa-corriendo-full.png",
];

const jumpingFrames = [
  "/images/catch/noa-saltando-1.png",
  "/images/catch/noa-saltando-feliz-2.png",
  "/images/catch/noa-saltando-moviendo-la-cola.png",
];

export default function NoaCatchSprite({ isJumping, direction }: { isJumping: boolean, direction: "left" | "right" }) {
  const [frameIndex, setFrameIndex] = useState(0);

  const frames = isJumping ? jumpingFrames : walkingFrames;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, isJumping ? 150 : 200); // Más rápido saltando
    return () => clearInterval(interval);
  }, [frames, isJumping]);

  return (
    <div className="relative w-[80px] h-[80px]">
      <Image
        src={frames[frameIndex]}
        alt="Noa"
        width={80}
        height={80}
        className={`transition-transform ${direction === "left" ? "scale-x-[-1]" : ""}`}
      />
    </div>
  );
}

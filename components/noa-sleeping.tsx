"use client";

import React, { useEffect, useState } from "react";

const SPRITE_SIZE = 45;

export default function NoaSleeping() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [emotes, setEmotes] = useState<{ id: number; left: number }[]>([]);

  const frames = [
    "/images/spreeds/sleeping/noa-bostezando.png",   // Frame 0
    "/images/spreeds/sleeping/noa-durmiendo-2.png",
    "/images/spreeds/sleeping/noa-durmiendo-3.png",
  ];

  useEffect(() => {

    // Cambia de frame cada segundo
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEmotes((prev) => [
        ...prev,
        { id: Date.now(), left: Math.random() * 30 - 15 },
      ]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleAnimationEnd = (id: number) => {
    setEmotes((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="relative w-[45px] h-[45px] flex justify-center items-end">
      {emotes.map((emote) => (
        <div
          key={emote.id}
          className="absolute bottom-10 animate-float-up z-20 text-lg"
          style={{ left: `calc(50% + ${emote.left}px)` }}
          onAnimationEnd={() => handleAnimationEnd(emote.id)}
        >
          💤
        </div>
      ))}

      <img
        src={frames[frameIndex]}
        alt="Noa durmiendo"
        width={SPRITE_SIZE}
        height={SPRITE_SIZE}
        className="pixel-art z-10 object-contain"
        onError={() => console.error("No se pudo cargar:", frames[frameIndex])}
        style={{ width: `${SPRITE_SIZE}px`, height: `${SPRITE_SIZE}px` }}
      />
    </div>
  );
}

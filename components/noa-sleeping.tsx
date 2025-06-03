"use client";

import React, { useEffect, useState } from "react";

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
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center items-end">
      <div className="relative w-[96px] h-[96px] flex justify-center items-end">
        {/* Emotes 💤 flotando */}
        {emotes.map((emote) => (
          <div
            key={emote.id}
            className="absolute bottom-20 animate-float-up z-20 text-2xl"
            style={{ left: `calc(50% + ${emote.left}px)` }}
            onAnimationEnd={() => handleAnimationEnd(emote.id)}
          >
            💤
          </div>
        ))}

        {/* Noa durmiendo: bucle de 3 imágenes */}
        <img
          src={frames[frameIndex]}
          alt="Noa durmiendo"
          width={80}
          height={80}
          className="pixel-art z-10"
          onError={() => console.error("No se pudo cargar:", frames[frameIndex])}
        />
      </div>
    </div>
  );
}

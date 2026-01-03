"use client";

import React, { useEffect, useState } from "react";

interface Emote {
  id: number;
  left: number;
  type: "heart" | "bubble";
}

const SPRITE_SIZE = 45;
const DOG_SPRITES = [
  "/images/spreeds/peting/noa-feliz-1.png",
  "/images/spreeds/peting/noa-feliz-2.png",
];

const BRUSH_SPRITE = "/images/spreeds/peting/cepillo-de-limpieza.png";

export function NoaPetting() {
  const [dogFrame, setDogFrame] = useState(0);
  const [emotes, setEmotes] = useState<Emote[]>([]);

  useEffect(() => {
    const spriteInterval = setInterval(() => {
      setDogFrame((idx) => (idx + 1) % DOG_SPRITES.length);
    }, 400);
    return () => clearInterval(spriteInterval);
  }, []);

  useEffect(() => {
    const emoteInterval = setInterval(() => {
      const nextType: "heart" | "bubble" = Math.random() < 0.5 ? "heart" : "bubble";
      setEmotes((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 30 - 15,
          type: nextType,
        },
      ]);
    }, 700);
    return () => clearInterval(emoteInterval);
  }, []);

  const handleEmoteAnimationEnd = (id: number) => {
    setEmotes((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="relative w-[45px] h-[45px] flex justify-center items-end">
      <img
          src={DOG_SPRITES[dogFrame]}
          alt="Noa feliz moviendo la cola"
          width={SPRITE_SIZE}
          height={SPRITE_SIZE}
          className="pixel-art z-0 object-contain"
          style={{ width: `${SPRITE_SIZE}px`, height: `${SPRITE_SIZE}px` }}
      />

      <img
          src={BRUSH_SPRITE}
          alt="Cepillo"
          width={26}
          height={26}
          className="absolute z-10 pixel-art animate-brush"
          style={{
            bottom: "46px",
            left: "12px",
          }}
      />

      {emotes.map((emote) => (
          <div
              key={emote.id}
              className={`absolute text-lg z-20 ${
                  emote.type === "heart" ? "text-red-500" : "text-blue-200"
              } animate-pet-emote`}
              style={{
                left: `calc(50% + ${emote.left}px)`,
                bottom: "48px",
              }}
              onAnimationEnd={() => handleEmoteAnimationEnd(emote.id)}
          >
            {emote.type === "heart" ? "❤️" : "🫧"}
          </div>
      ))}
    </div>
  );
}

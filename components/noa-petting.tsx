"use client";

import React, { useEffect, useState } from "react";

interface Emote {
  id: number;
  left: number;
  type: "heart" | "bubble";
}

// Dos frames distintos para Noa feliz (por ejemplo, movimiento de cola)
const DOG_SPRITES = [
  "/images/spreeds/peting/noa-feliz-1.png",
  "/images/spreeds/peting/noa-feliz-2.png",
];

const BRUSH_SPRITE = "/images/spreeds/peting/cepillo-de-limpieza.png";

export function NoaPetting() {
  // Índice de frame para animar a Noa moviendo la cola
  const [dogFrame, setDogFrame] = useState(0);
  // Lista de emotes (❤️ o 💧) que flotan
  const [emotes, setEmotes] = useState<Emote[]>([]);

  // 1) Animar el sprite de Noa (dos frames alternos cada 400ms)
  useEffect(() => {
    const spriteInterval = setInterval(() => {
      setDogFrame((idx) => (idx + 1) % DOG_SPRITES.length);
    }, 400); // alterna cada 0.4s
    return () => clearInterval(spriteInterval);
  }, []);

  // 2) Generar corazones y burbujas cada 700ms mientras se cepilla
  useEffect(() => {
    const emoteInterval = setInterval(() => {
      const nextType: "heart" | "bubble" = Math.random() < 0.5 ? "heart" : "bubble";
      setEmotes((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          left: Math.random() * 40 - 20, // desplazamiento horizontal aleatorio
          type: nextType,
        },
      ]);
    }, 700);
    return () => clearInterval(emoteInterval);
  }, []);

  // Remover emotes cuando termine su animación
  const handleEmoteAnimationEnd = (id: number) => {
    setEmotes((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="relative w-[90px] h-[90px] flex justify-center items-end">
      {/* 1) Sprite base de Noa moviendo la cola (dos frames) */}
      <img
        src={DOG_SPRITES[dogFrame]}
        alt="Noa feliz moviendo la cola"
        width={80}
        height={80}
        className="pixel-art z-0"
      />

      {/* 2) Sprite del cepillo, animado sobre Noa */}
      <img
        src={BRUSH_SPRITE}
        alt="Cepillo"
        width={40}
        height={40}
        className="absolute z-10 pixel-art animate-brush"
        style={{
          bottom: "80px", // Ajusta según dónde quieras ubicar el cepillo
          left: "25px",   // Centrar horizontalmente sobre Noa
        }}
      />

      {/* 3) Emotes: corazones y burbujas que flotan hacia arriba */}
      {emotes.map((emote) => (
        <div
          key={emote.id}
          className={`absolute text-2xl z-20 ${
            emote.type === "heart" ? "text-red-500" : "text-blue-200"
          } animate-pet-emote`}
          style={{
            left: `calc(50% + ${emote.left}px)`,
            bottom: "80px", // salen por encima de la cabeza de Noa
          }}
          onAnimationEnd={() => handleEmoteAnimationEnd(emote.id)}
        >
          {emote.type === "heart" ? "❤️" : "💧"}
        </div>
      ))}
    </div>
  );
}

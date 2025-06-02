"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function NoaEating() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [emote, setEmote] = useState<string | null>(null);

  const frames = [
    "/images/spreeds/eating/noa-comiendo-1.png",
    "/images/spreeds/eating/noa-comiendo-2.png",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      spawnEmote();
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const spawnEmote = () => {
    setEmote(Math.random() > 0.5 ? "🍖" : "🍗");
    setTimeout(() => setEmote(null), 1000);
  };

  return (
    <div className="relative w-[80px] h-[80px] flex justify-center items-center overflow-visible">
      {/* Emote flotante */}
      {emote && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-2xl animate-float-up">
          {emote}
        </div>
      )}

      {/* Noa comiendo */}
      <div className="w-[80px] h-[80px] relative">
        <Image
          src={frames[frameIndex]}
          alt="Noa comiendo"
          width={70}
          height={70}
          className="pixel-art"
        />
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const EATING_FRAMES = [
  "/images/spreeds/eating/noa-comiendo-1.png",
  "/images/spreeds/eating/noa-comiendo-2.png",
];

const SPRITE_SIZE = 45;

export default function NoaEating() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
        () => setFrameIndex((idx) => (idx + 1) % EATING_FRAMES.length),
        250,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-[45px] h-[45px] flex items-end justify-center relative">
      <Image
        src={EATING_FRAMES[frameIndex]}
        alt="Noa comiendo"
        width={SPRITE_SIZE}
        height={SPRITE_SIZE}
        className="pixel-art object-contain"
        style={{ width: `${SPRITE_SIZE}px`, height: `${SPRITE_SIZE}px` }}
      />
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[6px] bg-[#c68c53] rounded-sm shadow-inner" />
    </div>
  );
}

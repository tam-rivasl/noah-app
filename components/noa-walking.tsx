"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

const SPRITE_SIZE = 45;
const STEP = 5;

export default function NoaWalking() {
  const [frameIndex, setFrameIndex] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  const [emote, setEmote] = useState<string | null>(null);
  const [walkAreaWidth, setWalkAreaWidth] = useState(300);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const frames = [
    "/images/spreeds/walking/noa-caminando-1.png",
    "/images/spreeds/walking/noa-caminando-2.png",
    "/images/spreeds/walking/noa-caminando-3.png",
    "/images/spreeds/walking/noa-caminando-4.png",
    "/images/spreeds/walking/noa-caminando-5.png",
    "/images/spreeds/walking/noa-caminando-6.png",
  ];

  // Avance de frames
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 150);
    return () => clearInterval(interval);
  }, [frames.length]);

  // Medir el ancho disponible para caminar
  const measureWidth = useCallback(() => {
    const parentWidth =
      containerRef.current?.parentElement?.getBoundingClientRect().width ??
      window.innerWidth ??
      300;
    setWalkAreaWidth(parentWidth);
    const maxX = Math.max(0, parentWidth - SPRITE_SIZE);
    setPositionX((prev) => Math.min(prev, maxX));
  }, []);

  useEffect(() => {
    measureWidth();
    const onResize = () => measureWidth();
    window.addEventListener("resize", onResize);
    const parent = containerRef.current?.parentElement;
    if (parent && "ResizeObserver" in window) {
      resizeObserverRef.current = new ResizeObserver(() => measureWidth());
      resizeObserverRef.current.observe(parent);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserverRef.current?.disconnect();
    };
  }, [measureWidth]);

  // Movimiento automatico
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPositionX((prev) => {
        const maxX = Math.max(0, walkAreaWidth - SPRITE_SIZE);
        if (direction === "right") {
          if (prev >= maxX) {
            setDirection("left");
            return Math.max(maxX - STEP, 0);
          }
          return Math.min(prev + STEP, maxX);
        }
        if (prev <= 0) {
          setDirection("right");
          return Math.min(STEP, maxX);
        }
        return Math.max(prev - STEP, 0);
      });

      if (Math.random() < 0.2) {
        spawnEmote();
      }
    }, 200);
    return () => clearInterval(moveInterval);
  }, [direction, walkAreaWidth]);

  const spawnEmote = () => {
    setEmote("❤️");
    setTimeout(() => setEmote(null), 1000);
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-4"
      style={{ left: positionX, width: SPRITE_SIZE, height: 35 }}
    >
      {emote && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg animate-float-up">
          {emote}
        </div>
      )}
      <div className="w-full h-full relative">
        <Image
          src={frames[frameIndex]}
          alt="Noa caminando"
          width={SPRITE_SIZE}
          height={SPRITE_SIZE}
          style={{ width: `${SPRITE_SIZE}px`, height: `${SPRITE_SIZE}px` }}
          className={`object-contain pixel-art ${
            direction === "left" ? "scale-x-[-1]" : ""
          }`}
        />
      </div>
    </div>
  );
}

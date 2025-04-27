"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import noaSprites from "./noa-sprites.json";

export type Action = "eating" | "playing" | "petting" | null;
export type EmotionalState =
  | "normal"
  | "bored"
  | "excited"
  | "sad"
  | "worried"
  | "sleeping"
  | "tired"
  | "hungry"
  | "hungry-tired";

interface NoaSpriteProps {
  emotionalState: EmotionalState;
  currentAction: Action;
  hungerLevel: number;
  happinessLevel: number;
  energyLevel: number;
}

export default function NoaSprite({
  emotionalState,
  currentAction,
}: NoaSpriteProps) {
  const [frame, setFrame] = useState(0);
  const [prevAction, setPrevAction] = useState<Action>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [speed, setSpeed] = useState(500);

  // 1) Iniciar transición al cambiar de acción
  useEffect(() => {
    if (currentAction !== prevAction) {
      setIsTransitioning(true);
      const t = setTimeout(() => {
        setIsTransitioning(false);
        setPrevAction(currentAction);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentAction, prevAction]);

  // 2) Ajustar velocidad según acción/estado
  useEffect(() => {
    if (currentAction === "playing")        setSpeed(300);
    else if (currentAction === "petting")   setSpeed(400);
    else if (currentAction === "eating")    setSpeed(500);
    else if (emotionalState === "excited")  setSpeed(300);
    else if (["sleeping", "tired"].includes(emotionalState)) setSpeed(800);
    else if (emotionalState === "hungry-tired") setSpeed(1000);
    else                                    setSpeed(500);
  }, [currentAction, emotionalState]);

  // 3) Seleccionar secuencia: transición > acción > estado
  const frames: string[] = useMemo(() => {
    if (isTransitioning) {
      const from = prevAction ?? "normal";
      const to   = currentAction ?? "normal";
      const key  = `${from}_to_${to}` as keyof typeof noaSprites.transitions;
      return noaSprites.transitions[key] ?? [];
    }
    if (currentAction) {
      return noaSprites[currentAction] ?? [];
    }
    return noaSprites[emotionalState] ?? [];
  }, [currentAction, emotionalState, isTransitioning, prevAction]);

  // 4) Reproducir frames
  useEffect(() => {
    if (!frames.length) return;
    const iv = setInterval(() => {
      setFrame(f => (f + 1) % frames.length);
    }, speed);
    return () => clearInterval(iv);
  }, [frames, speed]);

  const src = frames[frame] ?? frames[0] ?? "";
  const fadeClass = isTransitioning ? "animate-fade-cross" : "";

    if(!src){
        return null
    }
  // 5) Render según acción o estado
  if (currentAction === "playing" && !isTransitioning) {
    return (
      <div className="relative w-32 h-32">
        <Image
          key={src}
          src={src}
          alt="Noa jugando"
          width={96}
          height={96}
          className={`pixel-art drop-shadow-md ${fadeClass}`}
        />
        <div className="noa-ball" />
      </div>
    );
  }

  if (currentAction === "petting" && !isTransitioning) {
    return (
      <div className="relative w-32 h-32">
        <Image
          key={src}
          src={src}
          alt="Noa siendo acariciada"
          width={96}
          height={96}
          className={`pixel-art drop-shadow-md ${fadeClass}`}
        />
        <div className="noa-hand" />
      </div>
    );
  }

  if (currentAction === "eating" && !isTransitioning) {
    return (
      <div className="relative w-32 h-32">
        <Image
          key={src}
          src={src}
          alt="Noa comiendo"
          width={96}
          height={96}
          className={`pixel-art drop-shadow-md ${fadeClass}`}
        />
        <div className="noa-food" />
      </div>
    );
  }

  // Estado emocional o transiciones
  return (
    <Image
      key={src}
      src={src}
      alt={`Noa ${currentAction ?? emotionalState}`}
      width={96}
      height={96}
      className={`pixel-art drop-shadow-md ${fadeClass}`}
    />
  );
}

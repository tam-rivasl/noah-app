"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ScoreBoard from "./score-board";
import { supabase } from "@/lib/supabase";

interface MiniGameCatchProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
  startCommand: boolean;
  onGameEnd?: (score: number, newRecord: boolean) => void;
}

interface Obstacle {
  id: number;
  type: "ball" | "bone";
  x: number;
  size: number;
}

const CANVAS_WIDTH = 300;
const GROUND_OFFSET = 10;
const NOA_BASE = 64;
const OBSTACLE_BASE = 32;
const JUMP_HEIGHT = 80;
const GAME_INTERVAL = 50;
const LANDING_GRACE_TIME = 90;
const HORIZONTAL_SHRINK = 0.20;

const GROUND_SPRITES = [
  "/images/spreeds/jumping/noa-agachado-1.png",
  "/images/spreeds/jumping/noa-comienza-a-jugar.png",
  "/images/spreeds/jumping/noa-comienza-a-jugar2.png",
];

const JUMP_SPRITES = [
  "/images/spreeds/jumping/noa-saltando-1.png",
  "/images/spreeds/jumping/noa-saltando-feliz-2.png",
  "/images/spreeds/jumping/noa-saltando-moviendo-la-cola.png",
];

const instructions = [
  "– Usa el D-Pad para mover a Noa a la izquierda o derecha.",
  "– Presiona ▲ para saltar sobre las pelotas.",
  "– Recoge huesos para obtener un buff aleatorio.",
  "– Evita las pelotas hasta que termine el juego.",
  "– ¡Buena suerte!",
];

export default function MiniGameCatch({ onExit, moveCommand, startCommand, onGameEnd }: MiniGameCatchProps) {
  const [started, setStarted] = useState(false);
  const [noaX, setNoaX] = useState(50);
  const [noaY, setNoaY] = useState(GROUND_OFFSET);
  const [noaSize, setNoaSize] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [buffActive, setBuffActive] = useState(false);
  const [landingGrace, setLandingGrace] = useState(false);
  const [groundFrameIndex, setGroundFrameIndex] = useState(0);
  const [jumpFrameIndex, setJumpFrameIndex] = useState(0);
  const [viewingRecords, setViewingRecords] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const lastTimeRef = useRef<number>(Date.now());
  const spawnBallTimerRef = useRef<number>(0);
  const spawnBoneTimerRef = useRef<number>(0);
  const bonesCollectedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const triggerBuff = useCallback(() => {
    if (buffActive) return;
    setBuffActive(true);
    const newSize = Math.random() < 0.5 ? 1.3 : 0.7;
    setNoaSize(newSize);
    const duration = 3000 + Math.random() * 2000;
    setTimeout(() => {
      setNoaSize(1);
      setBuffActive(false);
    }, duration);
  }, [buffActive]);

  const jump = useCallback(() => {
    if (gameOver || noaY > GROUND_OFFSET) return;
    setNoaY(GROUND_OFFSET + JUMP_HEIGHT);
    setLandingGrace(true);
    clearInterval(animRef.current!);
    setJumpFrameIndex(0);
    setTimeout(() => {
      setNoaY(GROUND_OFFSET);
      setTimeout(() => {
        setLandingGrace(false);
      }, LANDING_GRACE_TIME);
    }, 500);
  }, [gameOver, noaY]);

  useEffect(() => {
    if (!started || gameOver) return;
    clearInterval(animRef.current!);
    if (noaY > GROUND_OFFSET) {
      animRef.current = setInterval(() => {
        setJumpFrameIndex((idx) => (idx + 1) % JUMP_SPRITES.length);
      }, 150);
    } else if (noaY === GROUND_OFFSET && !landingGrace) {
      animRef.current = setInterval(() => {
        setGroundFrameIndex((idx) => (idx + 1) % GROUND_SPRITES.length);
      }, 200);
    }
    return () => clearInterval(animRef.current!);
  }, [noaY, started, gameOver, landingGrace]);

  useEffect(() => {
    if (!started && startCommand) {
      setCurrentLine(instructions.length);
      setStarted(true);
    }
  }, [startCommand, started]);

  useEffect(() => {
    if (!moveCommand) return;
    if (started && !gameOver) {
      if (moveCommand === "left") {
        setNoaX((x) => Math.max(x - 15, 0));
      } else if (moveCommand === "right") {
        const maxX = CANVAS_WIDTH - NOA_BASE * noaSize;
        setNoaX((x) => Math.min(x + 15, maxX));
      } else if (moveCommand === "up") {
        jump();
      }
      window.dispatchEvent(new Event("resetMove"));
    }
  }, [moveCommand, started, gameOver, noaSize, jump]);

  useEffect(() => {
    if (!started || gameOver) return;
    startTimeRef.current = Date.now();
    lastTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      if (gameOver) return;
      const elapsed = now - startTimeRef.current;

      const baseSpeed = 0.15 + 0.025 * Math.floor(elapsed / 10000);
      const speed = Math.min(baseSpeed, 0.4);
      const dx = speed * delta;

      spawnBallTimerRef.current += delta;
      const ballInterval = Math.max(1500 - 50 * Math.floor(elapsed / 10000), 1000);
      if (spawnBallTimerRef.current >= ballInterval) {
        spawnBallTimerRef.current -= ballInterval;
        const sizeFactor = [0.8, 1, 1.2][Math.floor(Math.random() * 3)];
        setObstacles((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), type: "ball", x: CANVAS_WIDTH, size: sizeFactor },
        ]);
      }

      spawnBoneTimerRef.current += delta;
      if (spawnBoneTimerRef.current >= 4000) {
        spawnBoneTimerRef.current = 0;
        setObstacles((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), type: "bone", x: CANVAS_WIDTH, size: 1 },
        ]);
      }

      let collided = false;
      setObstacles((prev) => {
        const next: Obstacle[] = [];
        for (const o of prev) {
          const newX = o.x - dx;
          if (newX <= -OBSTACLE_BASE) continue;

          const noaW = NOA_BASE * noaSize;
          const noaH = NOA_BASE * noaSize;
          const shrinkXNoa = noaW * HORIZONTAL_SHRINK * 0.5;
          const noaLeft = noaX + shrinkXNoa;
          const noaRight = noaX + noaW - shrinkXNoa;
          const noaBottom = noaY;
          const noaTop = noaY + noaH;

          const obsW = OBSTACLE_BASE * o.size;
          const obsH = OBSTACLE_BASE * o.size;
          const shrinkXObs = obsW * HORIZONTAL_SHRINK * 0.5;
          const obsLeft = newX + shrinkXObs;
          const obsRight = newX + obsW - shrinkXObs;
          const obsBottom = GROUND_OFFSET;
          const obsTop = GROUND_OFFSET + obsH;

          const overlapX = noaLeft < obsRight && noaRight > obsLeft;
          const overlapY = noaBottom < obsTop && noaTop > obsBottom;

          if (o.type === "ball") {
            if (noaY === GROUND_OFFSET && !landingGrace && overlapX && overlapY) {
              collided = true;
              continue;
            }
            next.push({ ...o, x: newX });
          } else {
            if (overlapX && overlapY) {
              bonesCollectedRef.current += 1;
              triggerBuff();
              continue;
            }
            next.push({ ...o, x: newX });
          }
        }
        if (collided) setGameOver(true);
        return next;
      });

      const timePoints = Math.floor(elapsed / 1000);
      setScore(timePoints + bonesCollectedRef.current * 20);
    }, GAME_INTERVAL);

    return () => clearInterval(intervalRef.current!);
  }, [started, gameOver, noaX, noaY, noaSize, landingGrace, triggerBuff]);

  useEffect(() => {
    if (!gameOver) return;
    const saveRecord = async () => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const m = Math.floor(elapsedMs / 60000);
      const s = Math.floor((elapsedMs % 60000) / 1000);
      const duration = `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

      await supabase.from("game_scores").insert([
        {
          score,
          game_type: "catch",
          date: new Date().toISOString().slice(0, 10),
          time: duration,
        },
      ]);

      const { data } = await supabase
        .from("game_scores")
        .select("score")
        .eq("game_type", "catch")
        .order("score", { ascending: false })
        .limit(1);

      const prevBest = data?.[0]?.score ?? 0;
      const isNew = score > prevBest;
      onGameEnd?.(score, isNew);
    };

    saveRecord();
  }, [gameOver]);

  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [revealedLines, setRevealedLines] = useState<string[]>([""]);

  useEffect(() => {
    if (started || currentLine >= instructions.length) return;
    const lineText = instructions[currentLine];
    if (currentChar < lineText.length) {
      const timer = setTimeout(() => {
        const nextPortion = lineText.slice(0, currentChar + 1);
        setRevealedLines((prev) => {
          const copy = [...prev];
          copy[currentLine] = nextPortion;
          return copy;
        });
        setCurrentChar((c) => c + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        setRevealedLines((prev) => [...prev, ""]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, instructions, started]);

  if (!started) {
    return (
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4" style={{ backdropFilter: "blur(2px)" }}>
        <h2 className="text-sm font-normal mb-2">Instrucciones</h2>
        <div className="space-y-1 text-[10px]">
          {revealedLines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        {currentLine >= instructions.length && (
          <p className="text-[8px] mt-3">Presiona START para comenzar</p>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-[300px] h-[220px] bg-cover bg-center overflow-hidden mx-auto" style={{ backgroundImage: "url(/images/back-grounds/game-jump.png)" }}>
      <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md pixel-font">Puntaje: {score}</p>

      {obstacles.map((o) => {
        const src = o.type === "ball" ? "/images/obstacles/ball.png" : "/images/obstacles/bone.png";
        const sizePx = `${OBSTACLE_BASE * o.size}px`;
        return (
          <img key={o.id} src={src} alt={o.type} className="absolute" style={{ width: sizePx, height: sizePx, bottom: `${GROUND_OFFSET}px`, left: `${o.x}px` }} />
        );
      })}

      {!gameOver && (
        <img
          src={noaY > GROUND_OFFSET ? JUMP_SPRITES[jumpFrameIndex] : GROUND_SPRITES[groundFrameIndex]}
          alt="Noa"
          className="absolute transition-all"
          style={{
            width: `${NOA_BASE * noaSize}px`,
            height: `${NOA_BASE * noaSize}px`,
            bottom: `${noaY}px`,
            left: `${noaX}px`,
          }}
        />
      )}

      {gameOver && (
        viewingRecords ? (
          <ScoreBoard gameType="catch" onClose={onExit} embedded />
        ) : (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font">
            <img src="/images/noa-llorando.png" alt="Noa triste" className="w-[62px] h-[62px] mb-1" />
            <p className="text-sm font-normal mb-1">¡Game Over!</p>
            <p className="text-[10px] mb-2">Puntuación final: {score}</p>
            <button
              onClick={() => setViewingRecords(true)}
              className="bg-gray-700 hover:bg-gray-600 transition-transform duration-200 active:scale-95 text-[10px] px-2 py-1 rounded mb-2"
            >
              Ver historial
            </button>
            <p className="text-[8px]">Presiona B para volver</p>
          </div>
        )
      )}
    </div>
  );
}

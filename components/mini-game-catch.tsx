"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface MiniGameCatchProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
}

interface Obstacle {
  id: number;
  type: "ball" | "bone";
  x: number;
  size: number; // escala (0.8, 1, 1.2)
}

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 220;
const GROUND_OFFSET = 10;      // píxeles arriba del borde inferior
const NOA_BASE = 64;           // tamaño base de Noa en px
const OBSTACLE_BASE = 32;      // tamaño base de obstáculo en px
const JUMP_HEIGHT = 80;        // píxeles de salto sobre groundOffset
const GAME_INTERVAL = 50;      // ms (~20 FPS)
const LANDING_GRACE_TIME = 70; // ms de gracia tras aterrizar
const HORIZONTAL_SHRINK = 0.20; // 20% de reducción en la hitbox horizontal

// Sprites para Noa en suelo
const GROUND_SPRITES = [
  "/images/spreeds/jumping/noa-agachado-1.png",
  "/images/spreeds/jumping/noa-comienza-a-jugar.png",
  "/images/spreeds/jumping/noa-comienza-a-jugar2.png",
];

// Sprites para Noa en salto
const JUMP_SPRITES = [
  "/images/spreeds/jumping/noa-saltando-1.png",
  "/images/spreeds/jumping/noa-saltando-feliz-2.png",
  "/images/spreeds/jumping/noa-saltando-moviendo-la-cola.png",
];

export default function MiniGameCatch({ onExit, moveCommand }: MiniGameCatchProps) {
  // Estados principales
  const [started, setStarted] = useState(false);
  const [noaX, setNoaX] = useState(50);
  const [noaY, setNoaY] = useState(GROUND_OFFSET);
  const [noaSize, setNoaSize] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [buffActive, setBuffActive] = useState(false);
  const [landingGrace, setLandingGrace] = useState(false);

  // Índices de animación
  const [groundFrameIndex, setGroundFrameIndex] = useState(0);
  const [jumpFrameIndex, setJumpFrameIndex] = useState(0);

  // Refs para temporización y contadores
  const startTimeRef = useRef<number>(Date.now());
  const lastTimeRef = useRef<number>(Date.now());
  const spawnBallTimerRef = useRef<number>(0);
  const spawnBoneTimerRef = useRef<number>(0);
  const bonesCollectedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // Buff de tamaño al recoger un hueso
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

  // Salto simplificado con landingGrace
  const jump = useCallback(() => {
    if (gameOver || noaY > GROUND_OFFSET) return;
    setNoaY(GROUND_OFFSET + JUMP_HEIGHT);
    setLandingGrace(true);

    clearInterval(animRef.current!); // detener cualquier animación previa
    setJumpFrameIndex(0);

    setTimeout(() => {
      setNoaY(GROUND_OFFSET);
      setTimeout(() => {
        setLandingGrace(false);
      }, LANDING_GRACE_TIME);
    }, 500);
  }, [gameOver, noaY]);

  // Animación de sprites
  useEffect(() => {
    if (!started || gameOver) return;

    clearInterval(animRef.current!);

    if (noaY > GROUND_OFFSET) {
      // Mientras Noa esté en aire, ciclar JUMP_SPRITES
      animRef.current = setInterval(() => {
        setJumpFrameIndex((idx) => (idx + 1) % JUMP_SPRITES.length);
      }, 150);
    } else if (noaY === GROUND_OFFSET && !landingGrace) {
      // Mientras Noa esté en suelo (sin gracia), ciclar GROUND_SPRITES
      animRef.current = setInterval(() => {
        setGroundFrameIndex((idx) => (idx + 1) % GROUND_SPRITES.length);
      }, 200);
    }

    return () => {
      clearInterval(animRef.current!);
    };
  }, [noaY, started, gameOver, landingGrace]);

  // Manejo D-Pad
  useEffect(() => {
    if (!moveCommand) return;

    if (!started && moveCommand === "up") {
      // Al pulsar UP en la pantalla de instrucciones, iniciamos el juego
      setStarted(true);
      window.dispatchEvent(new Event("resetMove"));
      return;
    }

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

  // Bucle principal
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

      // 1) Velocidad en px/ms
      const baseSpeed = 0.15 + 0.025 * Math.floor(elapsed / 10000);
      const speed = Math.min(baseSpeed, 0.4);
      const dx = speed * delta;

      // 2) Generar pelotas
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

      // 3) Generar huesos cada 4000ms
      spawnBoneTimerRef.current += delta;
      if (spawnBoneTimerRef.current >= 4000) {
        spawnBoneTimerRef.current = 0;
        setObstacles((prev) => [
          ...prev,
          { id: Date.now() + Math.random(), type: "bone", x: CANVAS_WIDTH, size: 1 },
        ]);
      }

      // 4) Mover obstáculos y detectar colisiones
      let collided = false;
      setObstacles((prev) => {
        const next: Obstacle[] = [];

        for (const o of prev) {
          const newX = o.x - dx;
          if (newX <= -OBSTACLE_BASE) continue; // fuera de pantalla

          // Dimensiones y pos de Noa
          const noaW = NOA_BASE * noaSize;
          const noaH = NOA_BASE * noaSize;
          // Aplicamos SHRINK horizontal
          const shrinkX = noaW * HORIZONTAL_SHRINK * 0.5;
          const noaLeft = noaX + shrinkX;
          const noaRight = noaX + noaW - shrinkX;
          const noaBottom = noaY;
          const noaTop = noaY + noaH;

          // Dimensiones y pos del obstáculo
          const obsW = OBSTACLE_BASE * o.size;
          const obsH = OBSTACLE_BASE * o.size;
          const obsLeft = newX;
          const obsRight = newX + obsW;
          const obsBottom = GROUND_OFFSET;
          const obsTop = GROUND_OFFSET + obsH;

          if (o.type === "ball") {
            // sólo colisiona si Noa está en suelo y no en gracia
            if (noaY === GROUND_OFFSET && !landingGrace) {
              const overlapX = noaLeft < obsRight && noaRight > obsLeft;
              const overlapY = noaBottom < obsTop && noaTop > obsBottom;
              if (overlapX && overlapY) {
                collided = true;
                continue; // quitamos la pelota
              }
            }
            next.push({ ...o, x: newX });
          } else {
            // hueso: recolección en aire o suelo
            const overlapX = noaLeft < obsRight && noaRight > obsLeft;
            const overlapY = noaBottom < obsTop && noaTop > obsBottom;
            if (overlapX && overlapY) {
              bonesCollectedRef.current += 1;
              triggerBuff();
              continue; // quitamos el hueso
            }
            next.push({ ...o, x: newX });
          }
        }

        if (collided) setGameOver(true);
        return next;
      });

      // 5) Actualizar puntaje
      const timePoints = Math.floor(elapsed / 1000);
      setScore(timePoints + bonesCollectedRef.current * 20);
    }, GAME_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, gameOver, noaX, noaY, noaSize, landingGrace, triggerBuff]);

  if (!started) {
    // Pantalla de instrucciones con mismo diseño que Game Over
    return (
      <div
        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <h2 className="text-sm font-normal mb-1">Instrucciones</h2>
        <p className="text-[10px] mb-1">– Usa el D-Pad para mover a Noah a la izquierda o derecha.</p>
        <p className="text-[10px] mb-1">– Presiona ▲ para saltar sobre las pelotas.</p>
        <p className="text-[10px] mb-1">– Recoge huesos para obtener un buff aleatorio.</p>
        <p className="text-[10px] mb-3">– Evita las pelotas hasta que termine el juego.</p>
        <p className="text-[8px]">Presiona ▲ para comenzar</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-[300px] h-[220px] bg-cover bg-center overflow-hidden mx-auto"
      style={{ backgroundImage: "url(/images/back-grounds/game-jump.png)" }}
    >
      {/* Puntaje */}
      <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md pixel-font">
        Puntaje: {score}
      </p>

      {/* Obstáculos */}
      {obstacles.map((o) => {
        const src = o.type === "ball" ? "/images/obstacles/ball.png" : "/images/obstacles/bone.png";
        const sizePx = `${OBSTACLE_BASE * o.size}px`;
        return (
          <img
            key={o.id}
            src={src}
            alt={o.type}
            className="absolute"
            style={{
              width: sizePx,
              height: sizePx,
              bottom: `${GROUND_OFFSET}px`,
              left: `${o.x}px`,
            }}
          />
        );
      })}

      {/* Noa: sprite en suelo o animación de salto */}
      {!gameOver && (
        <img
          src={
            noaY > GROUND_OFFSET
              ? JUMP_SPRITES[jumpFrameIndex]
              : GROUND_SPRITES[groundFrameIndex]
          }
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

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font">
          <img
            src="/images/noa-llorando.png"
            alt="Noa triste"
            className="w-[62px] h-[62px] mb-1"
          />
          <p className="text-sm font-normal mb-1">¡Game Over!</p>
          <p className="text-[10px] mb-2">Puntuación final: {score}</p>
          <p className="text-[8px]">Presiona B para volver</p>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";

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

export default function MiniGameCatch({ onExit, moveCommand }: MiniGameCatchProps) {
  // Dimensiones del canvas
  const canvasWidth = 300;
  // Elevación del “suelo” dentro del contenedor
  const groundOffset = 10;

  // --- Estados principales ---
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [noaX, setNoaX] = useState(50);           // posición horizontal de Noa
  const [noaY, setNoaY] = useState(groundOffset); // altura inferior de Noa
  const [noaSize, setNoaSize] = useState(1);      // escala de Noa (1 = normal)
  const [buffActive, setBuffActive] = useState(false);

  // Refs para tiempos y contadores
  const startTime = useRef<number>(Date.now());
  const lastTime = useRef<number>(Date.now());
  const spawnBallTimer = useRef<number>(0);
  const spawnBoneTimer = useRef<number>(0);
  const bonesCollected = useRef<number>(0);

  // Parámetros del salto
  const jumpHeight = 80; // px adicionales sobre groundOffset

  // Bucle principal de juego (~20 FPS)
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // Función para activar el buff de tamaño al recoger un hueso
  const triggerBuff = () => {
    if (buffActive) return;
    setBuffActive(true);

    // 50% posibilidades de agrandar o achicar
    const newSize = Math.random() < 0.5 ? 1.3 : 0.7;
    setNoaSize(newSize);

    // Buff dura entre 3000 y 5000 ms
    const duration = 3000 + Math.random() * 2000;
    setTimeout(() => {
      setNoaSize(1);
      setBuffActive(false);
    }, duration);
  };

  // Bucle de actualización de todo el juego
  const gameLoop = () => {
    const now = Date.now();
    const delta = now - lastTime.current;
    lastTime.current = now;

    if (gameOver) return;

    const elapsed = now - startTime.current;

    // 1) calcular velocidad en px/ms (150 px/s + 25 px/s cada 10s, máximo 400 px/s)
    const baseSpeed = 0.15 + 0.025 * Math.floor(elapsed / 10000);
    const speed = Math.min(baseSpeed, 0.4);
    const dx = speed * delta; // px a desplazar en esta iteración

    // 2) generar pelotas (cada 1.0–1.5 s, disminuye 50 ms cada 10s, mínimo 1000 ms)
    spawnBallTimer.current += delta;
    const ballInterval = Math.max(1500 - 50 * Math.floor(elapsed / 10000), 1000);
    if (spawnBallTimer.current >= ballInterval) {
      spawnBallTimer.current -= ballInterval;
      const sizeFactor = [0.8, 1, 1.2][Math.floor(Math.random() * 3)];
      setObstacles((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), type: "ball", x: canvasWidth, size: sizeFactor },
      ]);
    }

    // 3) generar huesos (cada 4000 ms)
    spawnBoneTimer.current += delta;
    if (spawnBoneTimer.current >= 4000) {
      spawnBoneTimer.current = 0;
      setObstacles((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), type: "bone", x: canvasWidth, size: 1 },
      ]);
    }

    // 4) mover obstáculos y filtrar los que salen por la izquierda
    setObstacles((prev) =>
      prev
        .map((o) => ({ ...o, x: o.x - dx }))
        .filter((o) => o.x > -32)
    );

    // 5) detección de colisiones usando hitboxes reducidas (~60% del sprite)
    let collided = false;
    const noaSpriteW = 20 * noaSize;
    const noaSpriteH = 20 * noaSize;
    const noaW_eff = noaSpriteW * 0.6;
    const noaH_eff = noaSpriteH * 0.6;
    const noaCenterX = noaX + noaSpriteW / 2;
    const noaCenterY = noaY + noaSpriteH / 2;

    setObstacles((prev) => {
      const filtered = prev.filter((o) => {
        const oSpriteW = 32 * o.size;
        const oSpriteH = 32 * o.size;
        const oW_eff = oSpriteW * 0.6;
        const oH_eff = oSpriteH * 0.6;
        const oCenterX = o.x + oSpriteW / 2;
        const oCenterY = groundOffset + oSpriteH / 2;

        // Distancia horizontal y vertical entre centros
        const distX = Math.abs(noaCenterX - oCenterX);
        const distY = Math.abs(noaCenterY - oCenterY);

        // Suma de mitades de hitboxes efectivas
        const sumHalfW = noaW_eff / 2 + oW_eff / 2;
        const sumHalfH = noaH_eff / 2 + oH_eff / 2;

        if (distX < sumHalfW && distY < sumHalfH) {
          if (o.type === "ball") {
            // Colisión pelota solo si Noa está en suelo
            if (noaY === groundOffset) {
              collided = true;
              return false;
            }
            collided= false
            return true;
          } else {
            // Recoge hueso
            bonesCollected.current += 1;
            triggerBuff();
            return false;
          }
        }
        return true;
      });

      if (collided) {
        setGameOver(true);
      }
      return filtered;
    });

    // 6) actualizar puntuación (1 punto/seg sobrevivido + 20 por cada hueso)
    const timePoints = Math.floor(elapsed / 1000);
    const totalScore = timePoints + bonesCollected.current * 20;
    setScore(totalScore);
  };

  // Iniciar/limpiar bucle de juego con setInterval
  useEffect(() => {
    startTime.current = Date.now();
    lastTime.current = Date.now();
    gameInterval.current = setInterval(gameLoop, 50); // ~20 FPS
    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, [gameOver]);

  // --- FUNCION SALTO SIMPLIFICADO ---
  const jump = () => {
    if (gameOver) return;
    // Si Noa ya está por encima de groundOffset, no saltar de nuevo
    if (noaY > groundOffset) return;

    // Subir: llevamos a Noa hasta groundOffset + jumpHeight
    setNoaY(groundOffset + jumpHeight);

    // Después de 500 ms, regresar al suelo (groundOffset)
    setTimeout(() => {
      setNoaY(groundOffset);
    }, 500);
  };

  // --- D-Pad: mover a Noa y saltar ---
  useEffect(() => {
    if (!moveCommand || gameOver) return;

    if (moveCommand === "left") {
      setNoaX((x) => Math.max(x - 15, 0));
    }
    if (moveCommand === "right") {
      setNoaX((x) => Math.min(x + 15, canvasWidth - 64 * noaSize));
    }
    if (moveCommand === "up") {
      jump();
    }

    // Resetear el comando para que no persista
    const event = new Event("resetMove");
    window.dispatchEvent(event);
  }, [moveCommand, gameOver, noaSize]);

  return (
    <div
      className="relative w-[300px] h-[220px] bg-cover bg-center overflow-hidden mx-auto"
      style={{ backgroundImage: "url(/images/back-grounds/game-jump.png)" }}
    >
      {/* Puntaje */}
      <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md">
        Puntaje: {score}
      </p>

      {/* Obstáculos (pelotas y huesos) */}
      {obstacles.map((o) => {
        const sprite =
          o.type === "ball"
            ? "/images/obstacles/ball.png"
            : "/images/obstacles/bone.png";
        return (
          <img
            key={o.id}
            src={sprite}
            alt={o.type}
            className="absolute"
            style={{
              width: `${32 * o.size}px`,
              height: `${32 * o.size}px`,
              bottom: `${groundOffset}px`,
              left: `${o.x}px`,
            }}
          />
        );
      })}

      {/* Noa */}
      {!gameOver && (
        <img
          src={
            noaY > groundOffset
              ? "/images/spreeds/jumping/noa-saltando-1.png"
              : "/images/spreeds/jumping/noa-comienza-a-jugar.png"
          }
          alt="Noa"
          className="absolute transition-all"
          style={{
            width: `${64 * noaSize}px`,
            height: `${64 * noaSize}px`,
            bottom: `${noaY}px`,
            left: `${noaX}px`,
          }}
        />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white">
          <img
            src="/images/spreeds/jumping/noa-agachado-1.png"
            alt="Noa triste"
            className="w-[48px] h-[48px] mb-2"
          />
          <p className="text-lg font-bold mb-1">¡Game Over!</p>
          <p className="text-sm mb-2">Puntuación final: {score}</p>
          <p className="text-[10px]">Presiona B para volver</p>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";

interface MiniGameJumpProps {
  onExit: () => void;
}

interface Obstacle {
  id: number;
  type: "ball" | "bone";
  x: number;
  size: number; // escala (p. ej. 0.8, 1, 1.2)
}

export default function MiniGameJump({ onExit }: MiniGameJumpProps) {
  // Dimensiones del canvas
  const canvasWidth = 300;
  const canvasHeight = 250;

  // Estados principales
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [noaY, setNoaY] = useState(0);         // altura actual de Noa (0 = suelo)
  const [isJumping, setIsJumping] = useState(false);
  const [jumpElapsed, setJumpElapsed] = useState(0); // tiempo transcurrido desde que empezó el salto
  const [noaSize, setNoaSize] = useState(1);   // escala de Noa (1 = normal)
  const [buffActive, setBuffActive] = useState(false);

  // Refs para tiempos y temporizadores
  const startTime = useRef<number>(Date.now());
  const lastTime = useRef<number>(Date.now());
  const jumpStartTime = useRef<number | null>(null);

  const spawnBallTimer = useRef<number>(0);
  const spawnBoneTimer = useRef<number>(0);

  const bonesCollected = useRef<number>(0);

  // Parámetros del salto
  const upDuration = 200;    // ms de subida
  const downDuration = 400;  // ms de bajada
  const jumpHeight = 80;     // px máximo

  // Intervalo principal de juego (~20 FPS)
  const gameInterval = useRef<NodeJS.Timeout | null>(null);

  // Función para iniciar el buff de tamaño tras recoger un hueso
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

  // Bucle de actualización de juego
  const gameLoop = () => {
    const now = Date.now();
    const delta = now - lastTime.current;
    lastTime.current = now;

    if (gameOver) {
      return;
    }

    // Tiempo transcurrido desde el inicio
    const elapsed = now - startTime.current;

    // --- 1. Calcular velocidad en px/ms ---
    // velocidad base: 0.15 px/ms (150 px/s). Cada 10s +0.025 px/ms.
    const baseSpeed = 0.15 + 0.025 * Math.floor(elapsed / 10000);
    const speed = Math.min(baseSpeed, 0.4); // máximo 0.4 px/ms (400 px/s)
    const dx = speed * delta; // px a desplazar en este tick

    // --- 2. Generar pelotas ---
    spawnBallTimer.current += delta;
    // intervalo de balón: inicia en 1500 ms y cada 10s se reduce 50 ms, mínimo 1000 ms
    const ballInterval = Math.max(1500 - 50 * Math.floor(elapsed / 10000), 1000);
    if (spawnBallTimer.current >= ballInterval) {
      spawnBallTimer.current -= ballInterval;
      const sizeFactor = [0.8, 1, 1.2][Math.floor(Math.random() * 3)];
      setObstacles((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), type: "ball", x: canvasWidth, size: sizeFactor },
      ]);
    }

    // --- 3. Generar huesos ---
    spawnBoneTimer.current += delta;
    // intervalo hueso: entre 4000 y 6000 ms
    if (spawnBoneTimer.current >= 4000) {
      spawnBoneTimer.current = 0;
      setObstacles((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), type: "bone", x: canvasWidth, size: 1 },
      ]);
    }

    // --- 4. Actualizar posición de obstáculos y filtrar fuera de pantalla ---
    setObstacles((prev) =>
      prev
        .map((o) => ({ ...o, x: o.x - dx }))
        .filter((o) => o.x > -32) // si sale por la izquierda, se elimina
    );

    // --- 5. Actualizar salto de Noa ---
    if (isJumping && jumpStartTime.current !== null) {
      const jElapsed = now - jumpStartTime.current;
      setJumpElapsed(jElapsed);

      if (jElapsed < upDuration) {
        // Fase de subida
        const newY = (jElapsed / upDuration) * jumpHeight;
        setNoaY(newY);
      } else if (jElapsed < upDuration + downDuration) {
        // Fase de bajada
        const t = (jElapsed - upDuration) / downDuration;
        const newY = (1 - t) * jumpHeight;
        setNoaY(newY);
      } else {
        // Fin de salto
        setNoaY(0);
        setIsJumping(false);
        jumpStartTime.current = null;
        setJumpElapsed(0);
      }
    }

    // --- 6. Detección de colisiones y recolección de huesos ---
    let collided = false;
    const noaX = 50; // posición X fija de Noa
    const noaW = 32 * noaSize;
    const noaH = 32 * noaSize;
    const noaYcurrent = noaY;

    setObstacles((prev) => {
      const filtered = prev.filter((o) => {
        const oW = 32 * o.size;
        const oH = 32 * o.size;
        const oX = o.x;
        const oY = 0;

        const overlapX = !(oX + oW < noaX || oX > noaX + noaW);
        const overlapY = !(oY + oH < noaYcurrent || oY > noaYcurrent + noaH);

        if (overlapX && overlapY) {
          if (o.type === "ball") {
            // Colisiona con pelota → Game Over
            collided = true;
            return false;
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

    // --- 7. Actualizar puntuación ---
    // 1 punto por segundo sobrevivido + 20 por cada hueso
    const timePoints = Math.floor(elapsed / 1000);
    const totalScore = timePoints + bonesCollected.current * 20;
    setScore(totalScore);
  };

  // Arrancar bucle de juego con setInterval
  useEffect(() => {
    startTime.current = Date.now();
    lastTime.current = Date.now();
    gameInterval.current = setInterval(gameLoop, 50); // ~20 FPS
    return () => {
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, [gameOver]); // si cambia gameOver, resetea el efecto (detiene el bucle)

  // Manejar teclas (salto y salir al Game Over)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!gameOver) {
        if (e.code === "ArrowUp" || e.code === "Space") {
          // Iniciar salto si está en suelo
          if (!isJumping) {
            setIsJumping(true);
            jumpStartTime.current = Date.now();
          }
        }
      } else {
        // Si Game Over y presiona B, sale
        if (e.code === "KeyB") {
          onExit();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gameOver, isJumping]);

  return (
    <div
      className="relative w-[300px] h-[250px] bg-cover bg-center overflow-hidden border-2 border-black mx-auto"
      style={{ backgroundImage: "url(/images/back-grounds/game-jump.png)" }}
    >
      {/* Puntaje */}
      <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md">
        Puntaje: {score}
      </p>

      {/* Obstáculos (pelotas y huesos) */}
      {obstacles.map((o) => {
        const sprite = o.type === "ball" ? "/images/obstacles/ball.png" : "/images/obstacles/bone.png";
        return (
          <img
            key={o.id}
            src={sprite}
            alt={o.type}
            className="absolute"
            style={{
              width: `${32 * o.size}px`,
              height: `${32 * o.size}px`,
              bottom: 0,
              left: `${o.x}px`,
            }}
          />
        );
      })}

      {/* Noa */}
      {!gameOver && (
        <img
          src={
            isJumping
              ? jumpElapsed < upDuration
                ? "/images/spreeds/jumping/noa-saltando-1.png"
                : "/imagesspreeds/jumping/noa-saltando-moviendo-la-cola.png"
              : "/images/spreeds/jumping/noa-comienza-a-jugar.png"
          }
          alt="Noa"
          className="absolute transition-all"
          style={{
            width: `${32 * noaSize}px`,
            height: `${32 * noaSize}px`,
            bottom: `${noaY}px`,
            left: "50px",
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

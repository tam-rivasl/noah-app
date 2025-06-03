"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ScoreBoard, { RecordEntry } from "./score-board";

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
const GROUND_OFFSET = 10;      // píxeles arriba del borde inferior
const NOA_BASE = 64;           // tamaño base de Noa en px
const OBSTACLE_BASE = 32;      // tamaño base de obstáculo en px
const JUMP_HEIGHT = 80;        // píxeles de salto sobre groundOffset
const GAME_INTERVAL = 50;      // ms (~20 FPS)
const LANDING_GRACE_TIME = 90; // ms de gracia tras aterrizar

// Factor de reducción para la hitbox horizontal (tanto de Noa como de obstáculos)
const HORIZONTAL_SHRINK = 0.20; // 20%

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
  // -------------- Estados de lógica del juego --------------
  const [started, setStarted] = useState(false);
  const [noaX, setNoaX] = useState(50);
  const [noaY, setNoaY] = useState(GROUND_OFFSET);
  const [noaSize, setNoaSize] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [buffActive, setBuffActive] = useState(false);
  const [landingGrace, setLandingGrace] = useState(false);

  // -------------- Animaciones de Noa --------------
  const [groundFrameIndex, setGroundFrameIndex] = useState(0);
  const [jumpFrameIndex, setJumpFrameIndex] = useState(0);

  // -------------- Temporizadores y refs --------------
  const startTimeRef = useRef<number>(Date.now());
  const lastTimeRef = useRef<number>(Date.now());
  const spawnBallTimerRef = useRef<number>(0);
  const spawnBoneTimerRef = useRef<number>(0);
  const bonesCollectedRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  // -------------- Efecto “buff de tamaño” --------------
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

  // -------------- Función de salto --------------
  const jump = useCallback(() => {
    if (gameOver || noaY > GROUND_OFFSET) return;
    setNoaY(GROUND_OFFSET + JUMP_HEIGHT);
    setLandingGrace(true);

    clearInterval(animRef.current!);
    setJumpFrameIndex(0);

    // Al cabo de 500ms, Noa aterriza de golpe
    setTimeout(() => {
      setNoaY(GROUND_OFFSET);
      // Tras aterrizar, gracia de 90ms sin colisiones
      setTimeout(() => {
        setLandingGrace(false);
      }, LANDING_GRACE_TIME);
    }, 500);
  }, [gameOver, noaY]);

  // -------------- Ciclo de animación de sprites --------------
  useEffect(() => {
    if (!started || gameOver) return;
    clearInterval(animRef.current!);

    if (noaY > GROUND_OFFSET) {
      // En el aire → ciclar sprites de salto
      animRef.current = setInterval(() => {
        setJumpFrameIndex((idx) => (idx + 1) % JUMP_SPRITES.length);
      }, 150);
    } else if (noaY === GROUND_OFFSET && !landingGrace) {
      // En suelo (sin gracia) → ciclar sprites de suelo
      animRef.current = setInterval(() => {
        setGroundFrameIndex((idx) => (idx + 1) % GROUND_SPRITES.length);
      }, 200);
    }

    return () => {
      clearInterval(animRef.current!);
    };
  }, [noaY, started, gameOver, landingGrace]);

  // -------------- Manejo de D-Pad --------------
  useEffect(() => {
    if (!moveCommand) return;

    if (!started && moveCommand === "up") {
      // En pantalla de instrucciones, pulsar ▲ inicia el juego
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

  // -------------- Bucle principal de lógica --------------
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

      // 1) Velocidad
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

      // 3) Generar huesos cada 4000 ms
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
          if (newX <= -OBSTACLE_BASE) continue; // ya fuera de pantalla

          // Hitbox de Noa (con 20% de reducción horizontal)
          const noaW = NOA_BASE * noaSize;
          const noaH = NOA_BASE * noaSize;
          const shrinkXNoa = noaW * HORIZONTAL_SHRINK * 0.5;
          const noaLeft = noaX + shrinkXNoa;
          const noaRight = noaX + noaW - shrinkXNoa;
          const noaBottom = noaY;
          const noaTop = noaY + noaH;

          // Hitbox del obstáculo con “shrink” horizontal
          const obsW = OBSTACLE_BASE * o.size;
          const obsH = OBSTACLE_BASE * o.size;
          // Reducimos el ancho horizontal del obstáculo también un 20%
          const shrinkXObs = obsW * HORIZONTAL_SHRINK * 0.5;
          const obsLeft = newX + shrinkXObs;
          const obsRight = newX + obsW - shrinkXObs;
          const obsBottom = GROUND_OFFSET;
          const obsTop = GROUND_OFFSET + obsH;

          if (o.type === "ball") {
            // Solo colisiona si Noa en suelo y sin gracia
            if (noaY === GROUND_OFFSET && !landingGrace) {
              const overlapX = noaLeft < obsRight && noaRight > obsLeft;
              const overlapY = noaBottom < obsTop && noaTop > obsBottom;
              if (overlapX && overlapY) {
                collided = true;
                continue; // descartamos esta pelota
              }
            }
            next.push({ ...o, x: newX });
          } else {
            // Hueso: recolección en aire o suelo
            const overlapX = noaLeft < obsRight && noaRight > obsLeft;
            const overlapY = noaBottom < obsTop && noaTop > obsBottom;
            if (overlapX && overlapY) {
              bonesCollectedRef.current += 1;
              triggerBuff();
              continue; // descartamos este hueso
            }
            next.push({ ...o, x: newX });
          }
        }

        if (collided) setGameOver(true);
        return next;
      });

      // 5) Puntuación
      const timePoints = Math.floor(elapsed / 1000);
      setScore(timePoints + bonesCollectedRef.current * 20);
    }, GAME_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, gameOver, noaX, noaY, noaSize, landingGrace, triggerBuff]);
// —————————————— Nuevo estado: records y vista de records ——————————————
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [viewingRecords, setViewingRecords] = useState(false);

  // Al montar, cargamos de localStorage (sólo una vez):
  useEffect(() => {
    const raw = localStorage.getItem("catchRecords") || "[]";
    try {
      const parsed: RecordEntry[] = JSON.parse(raw);
      // Asegurarnos de que venga ordenado por score descendente
      parsed.sort((a, b) => b.score - a.score);
      setRecords(parsed.slice(0, 10));
    } catch {
      setRecords([]);
   }
  }, []);

  // Guardar record al terminar la partida
  useEffect(() => {
    if (!gameOver) return;
    const elapsedMs = Date.now() - startTimeRef.current;
    const m = Math.floor(elapsedMs / 60000);
    const s = Math.floor((elapsedMs % 60000) / 1000);
    const duration = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const newRecord: RecordEntry = {
      score,
      date: new Date().toLocaleDateString("es-ES"),
      time: duration,
    };
    const updated = [...records, newRecord].sort((a, b) => b.score - a.score).slice(0, 10);
    setRecords(updated);
    localStorage.setItem("catchRecords", JSON.stringify(updated));
  }, [gameOver]);
  // ----------------------------------------------------
  //  Efecto “typewriter” para las instrucciones:
  // ----------------------------------------------------
  const instructions = [
    "– Usa el D-Pad para mover a Noa a la izquierda o derecha.",
    "– Presiona ▲ para saltar sobre las pelotas.",
    "– Recoge huesos para obtener un buff aleatorio.",
    "– Evita las pelotas hasta que termine el juego.",
    "– ¡Buena suerte!",
  ];
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [revealedLines, setRevealedLines] = useState<string[]>([]);

  useEffect(() => {
    if (started) return;

    // Si ya mostramos todas las líneas, terminamos
    if (currentLine >= instructions.length) return;

    const lineText = instructions[currentLine];
    if (currentChar < lineText.length) {
      // Agregar siguiente carácter en la misma línea
      const timer = setTimeout(() => {
        const nextPortion = lineText.slice(0, currentChar + 1);
        setRevealedLines((prev) => {
          const copy = [...prev];
          copy[currentLine] = nextPortion;
          return copy;
        });
        setCurrentChar((c) => c + 1);
      }, 50); // 50 ms por carácter
      return () => clearTimeout(timer);
    } else {
      // Terminamos esta línea; pasamos a la siguiente
      const timer = setTimeout(() => {
        setCurrentLine((l) => l + 1);
        setCurrentChar(0);
        // Inicializar la siguiente línea vacía
        setRevealedLines((prev) => [...prev, ""]);
      }, 300); // Pausa breve al terminar la línea
      return () => clearTimeout(timer);
    }
  }, [currentLine, currentChar, instructions, started]);

  // ----------------------------------------------------
  //  Si no ha empezado → mostramos instrucción “typewriter”
  // ----------------------------------------------------
  if (!started) {
    return (
      <div
        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <h2 className="text-sm font-normal mb-2">Instrucciones</h2>
        <div className="space-y-1 text-[10px]">
          {revealedLines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
        {currentLine >= instructions.length && (
          <p className="text-[8px] mt-3">Presiona ▲ para comenzar</p>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  //  Render principal del juego
  // ----------------------------------------------------
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

      {/* Game Over / Records */}
      {gameOver && (
        viewingRecords ? (
          <ScoreBoard
            records={records}
            onClose={onExit}
            onReset={() => {
              setRecords([]);
              localStorage.removeItem("catchRecords");
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font">
            <img
              src="/images/noa-llorando.png"
              alt="Noa triste"
              className="w-[62px] h-[62px] mb-1"
            />
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

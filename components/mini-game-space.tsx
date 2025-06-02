"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";

interface MiniGameSpaceProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
}

interface Meteor {
  id: number;
  x: number;
  y: number;
  size: number;
}

// ——— Ahora el canvas mide 300×260 px ———
const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 220;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;

// Ajustes de dificultad iniciales
const INITIAL_SPAWN_INTERVAL = 800;       // ms
const MIN_SPAWN_INTERVAL = 300;          // ms
const INITIAL_SPEED = 4;                 // px por tick
const MAX_SPEED = 10;                    // px por tick
const SPEED_INCREASE_INTERVAL = 10000;   // cada 10 s
const SPAWN_DECREASE_AMOUNT = 150;       // cada 10 s se reduce 150 ms

export default function MiniGameSpace({ onExit, moveCommand }: MiniGameSpaceProps) {
  const [started, setStarted] = useState(false);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  // Iniciamos a Noa centrado horizontalmente
  const [playerX, setPlayerX] = useState((CANVAS_WIDTH - PLAYER_WIDTH) / 2);
  const [gameOver, setGameOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const startRef = useRef<number>(0);
  const speedRef = useRef(INITIAL_SPEED);
  const spawnIntervalRef = useRef(INITIAL_SPAWN_INTERVAL);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ——— Arranca el juego: reinicia tiempo y dificulta-dor ———
  const handleStart = useCallback(() => {
    setStarted(true);
    startRef.current = Date.now();
    speedRef.current = INITIAL_SPEED;
    spawnIntervalRef.current = INITIAL_SPAWN_INTERVAL;
  }, []);

  // ——— ESCUCHA teclado: UP = iniciar, B = salir en GameOver ———
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!started && e.key === "ArrowUp") {
        handleStart();
      }
      if (gameOver && e.key.toLowerCase() === "b") {
        onExit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, gameOver, handleStart, onExit]);

  // ——— D-Pad: arrancar con UP o mover izquierda/derecha ———
  useEffect(() => {
    if (!moveCommand) return;

    if (!started && moveCommand === "up") {
      handleStart();
      window.dispatchEvent(new Event("resetMove"));
      return;
    }
    if (started && !gameOver) {
      if (moveCommand === "left") {
        setPlayerX((x) => Math.max(x - 20, 0));
      } else if (moveCommand === "right") {
        setPlayerX((x) => Math.min(x + 20, CANVAS_WIDTH - PLAYER_WIDTH));
      }
      window.dispatchEvent(new Event("resetMove"));
    }
  }, [moveCommand, started, gameOver, handleStart]);

  // ——— Ajustar dificultad cada segundo ———
  useEffect(() => {
    if (!started) return;
    const diffInterval = setInterval(() => {
      const now = Date.now();
      const total = now - startRef.current;
      setElapsed(total);

      const factor = Math.floor(total / SPEED_INCREASE_INTERVAL);
      speedRef.current = Math.min(INITIAL_SPEED + factor * 1, MAX_SPEED);
      spawnIntervalRef.current = Math.max(
        INITIAL_SPAWN_INTERVAL - factor * SPAWN_DECREASE_AMOUNT,
        MIN_SPAWN_INTERVAL
      );
    }, 1000);

    return () => clearInterval(diffInterval);
  }, [started]);

  // ——— Programar aparición recursiva de meteoros ———
  const scheduleNextMeteor = useCallback(() => {
    if (gameOver) return;
    spawnTimerRef.current = setTimeout(() => {
      const size = 24;
      const xPos = Math.random() * (CANVAS_WIDTH - size);
      setMeteors((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), x: xPos, y: 0, size },
      ]);
      scheduleNextMeteor();
    }, spawnIntervalRef.current);
  }, [gameOver]);

  // ——— Bucle principal: mover meteoros y detectar colisiones ———
  useEffect(() => {
    if (!started) return;

    // Arrancamos la cadena de aparición de meteoros
    scheduleNextMeteor();

    const loop = setInterval(() => {
      setMeteors((prev) => {
        const next: Meteor[] = [];
        let collided = false;

        prev.forEach((m) => {
          const newY = m.y + speedRef.current;
          if (newY > CANVAS_HEIGHT) {
            // Meteorito fuera de pantalla; lo descartamos
            return;
          }

          // ——— Hitbox de Noa con 20 % de margen horizontal ———
          const SHRINK_FACTOR = 0.2;
          const playerLeft   = playerX + PLAYER_WIDTH * (SHRINK_FACTOR / 2);
          const playerRight  = playerX + PLAYER_WIDTH * (1 - SHRINK_FACTOR / 2);
          const playerTop    = CANVAS_HEIGHT - PLAYER_HEIGHT - 10;
          const playerBottom = playerTop + PLAYER_HEIGHT;

          // ——— Hitbox del meteorito ———
          const meteorLeft   = m.x;
          const meteorRight  = m.x + m.size;
          const meteorTop    = newY;
          const meteorBottom = meteorTop + m.size;

          const overlapX = playerLeft < meteorRight && playerRight > meteorLeft;
          const overlapY = playerTop < meteorBottom && playerBottom > meteorTop;

          if (overlapX && overlapY) {
            collided = true;
            return; // sale de este forEach
          }
          next.push({ ...m, y: newY });
        });

        if (collided) {
          setGameOver(true);
          return prev; // devolvemos el array anterior para “congelar” todos
        }
        return next;
      });
    }, 50);

    return () => {
      clearInterval(loop);
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
      }
    };
  }, [started, playerX, scheduleNextMeteor]);

  // ——— Pantalla de instrucciones previa al inicio ———
  if (!started) {
    return (
      <div
        className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4"
        style={{ backdropFilter: "blur(2px)" }}
      >
        <h2 className="text-sm font-bold mb-2">INSTRUCCIONES</h2>
        <p className="text-[10px] mb-1">– Usa ← / → para mover a Noa.</p>
        <p className="text-[10px] mb-1">– Presiona ▲ (UP) para iniciar.</p>
        <p className="text-[10px] mb-1">– Cada 10 s los meteoros serán más frecuentes y rápidos.</p>
        <p className="text-[10px] mb-3">– Sobrevive el mayor tiempo posible.</p>
        <p className="text-[8px]">Pulsa ▲ para comenzar</p>
      </div>
    );
  }

  // ——— Render principal del juego ———
  return (
    <div
      className="relative w-[300px] h-[260px] bg-cover bg-center overflow-hidden mx-auto"
      style={{
        backgroundImage: "url(/images/space-game/background-mini-game-space.jpg)",
      }}
    >
      {/* Puntaje */}
      <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md pixel-font">
        Puntaje: {Math.floor(elapsed / 1000)}
      </p>

      {/* Meteoros */}
      {meteors.map((m) => (
        <div
          key={m.id}
          className="absolute"
          style={{
            left: `${m.x}px`,
            top: `${m.y}px`,
            width: `${m.size}px`,
            height: `${m.size}px`,
          }}
        >
          <Image
            src="/images/space-game/meteorito.png"
            alt="Meteorito"
            width={m.size}
            height={m.size}
            className="pixel-art"
          />
        </div>
      ))}

      {/* Jugador */}
      {!gameOver && (
        <div
          className="absolute"
          style={{
            left: `${playerX}px`,
            top: `${CANVAS_HEIGHT - PLAYER_HEIGHT - 10}px`,
            width: `${PLAYER_WIDTH}px`,
            height: `${PLAYER_HEIGHT}px`,
          }}
        >
          <Image
            src="/images/space-game/cotito-pj.png"
            alt="Cotito"
            width={PLAYER_WIDTH}
            height={PLAYER_HEIGHT}
            className="pixel-art"
          />
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white pixel-font">
          <Image
            src="/images/space-game/explocion.png"
            alt="Boom"
            width={48}
            height={48}
            className="pixel-art mb-2"
          />
          <p className="text-[12px] font-bold mb-1">¡BOOM! Perdiste 🚀</p>
          <p className="text-[10px] mb-2">Presiona B para salir</p>
        </div>
      )}
    </div>
  );
}

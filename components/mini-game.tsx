"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface MiniGameRunnerProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
}

interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
  type: "bone" | "ball";
}

export default function MiniGameRunner({ onExit, moveCommand }: MiniGameRunnerProps) {
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [playerY, setPlayerY] = useState(0);
  const [groundY, setGroundY] = useState(0);
  const [score, setScore] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(5);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const playerWidth = 50;
  const playerHeight = 60;

  const framesWalking = [
    "/images/spreeds/walking/noa-caminando-1.png",
    "/images/spreeds/walking/noa-caminando-2.png",
    "/images/spreeds/walking/noa-caminando-3.png",
    "/images/spreeds/walking/noa-caminando-4.png",
    "/images/spreeds/walking/noa-caminando-5.png",
    "/images/spreeds/walking/noa-caminando-6.png",
  ];

  // Calcular groundY en base al contenedor (80% desde arriba)
  useEffect(() => {
    const updateGround = () => {
      if (gameAreaRef.current) {
        const { height } = gameAreaRef.current.getBoundingClientRect();
        const y = height * 0.8; // 80% down
        setGroundY(y);
        setPlayerY(y);
      }
    };
    updateGround();
    window.addEventListener("resize", updateGround);
    return () => window.removeEventListener("resize", updateGround);
  }, []);

  // Spawnear obstáculos
  useEffect(() => {
    const spawn = () => {
      if (!gameAreaRef.current) return;
      const { width } = gameAreaRef.current.getBoundingClientRect();
      const size = width * 0.1;
      const x = Math.random() * (width - size);
      const types: Array<"bone" | "ball"> = ["bone", "ball"];
      const type = types[Math.floor(Math.random() * types.length)];
      setObstacles((prev) => [...prev, { id: Date.now(), x, width: size, height: size, type }]);
    };
    const iv = setInterval(spawn, 2000);
    return () => clearInterval(iv);
  }, []);

  // Bucle principal: mover obstáculos, puntaje, colisión
  useEffect(() => {
    if (gameOver) return;
    const loop = setInterval(() => {
      if (gameAreaRef.current) {
        const { width } = gameAreaRef.current.getBoundingClientRect();
        setObstacles((prev) =>
          prev.map((o) => ({ ...o, x: o.x - speed }))
              .filter((o) => o.x + o.width > 0)
        );
      }
      setScore((v) => v + 1);
      if (score > 0 && score % 100 === 0) setSpeed((s) => Math.min(s + 1, 20));

      // Colisión
      const pEl = playerRef.current;
      if (pEl) {
        const pRect = pEl.getBoundingClientRect();
        document.querySelectorAll<HTMLDivElement>(".obstacle").forEach((el) => {
          const oRect = el.getBoundingClientRect();
          if (
            pRect.left < oRect.right &&
            pRect.right > oRect.left &&
            pRect.bottom > oRect.top &&
            pRect.top < oRect.bottom
          ) {
            setGameOver(true);
          }
        });
      }
    }, 50);
    return () => clearInterval(loop);
  }, [gameOver, speed, score]);

  // Animar frames de caminata
  useEffect(() => {
    const iv = setInterval(() => {
      setFrameIndex((i) => (i + 1) % framesWalking.length);
    }, 100);
    return () => clearInterval(iv);
  }, []);

  const jump = () => {
    if (gameOver) return;
    setPlayerY(groundY - playerHeight * 0.5); // salto medio playerHeight
    setTimeout(() => setPlayerY(groundY), 500);
  };

  // D-Pad
  useEffect(() => {
    if (moveCommand === "up") jump();
  }, [moveCommand]);

  // Salir con B
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key.toLowerCase() === "b" && onExit();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onExit]);

  const restart = () => {
    setObstacles([]);
    setScore(0);
    setSpeed(5);
    setGameOver(false);
    setPlayerY(groundY);
  };

  const getImg = (t: "bone" | "ball") =>
    t === "bone" ? "/images/obstacles/bone.png" : "/images/obstacles/ball.png";

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-full flex flex-col items-center justify-start bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: "url('/images/back-grounds/game-jump.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Score */}
      <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded">
        {gameOver ? "Game Over!" : `Score: ${score}`}
      </div>

      {/* Obstáculos */}
      {obstacles.map((o) => (
        <div
          key={o.id}
          className="absolute obstacle"
          style={{ left: o.x, top: groundY - o.height, width: o.width, height: o.height }}
        >
          <Image src={getImg(o.type)} alt={o.type} width={o.width} height={o.height} />
        </div>
      ))}

      {/* Jugador */}
      <div
        ref={playerRef}
        className="absolute"
        style={{ left: '20%', top: playerY - playerHeight, width: playerWidth, height: playerHeight, transition: 'top 0.3s' }}
      >
        <Image src={framesWalking[frameIndex]} alt="Noa" width={playerWidth} height={playerHeight} />
      </div>

      {/* Reiniciar */}
      {gameOver && (
        <button
          onClick={restart}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded"
        >
          Reintentar
        </button>
      )}

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-4 text-sm text-white bg-black/50 px-2 py-1 rounded">
        Usa el D-Pad para saltar 🎮
      </div>
    </div>
  );
}

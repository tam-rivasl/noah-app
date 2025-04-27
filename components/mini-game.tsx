"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface MiniGameCatchProps {
  onExit: () => void;
}

interface Ball {
  id: number;
  x: number;
  y: number;
  size: number;
}

export default function MiniGameCatch({ onExit }: MiniGameCatchProps) {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [score, setScore] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spawnBall = () => {
      if (!gameAreaRef.current) return;
      const { width, height } = gameAreaRef.current.getBoundingClientRect();
      const size = Math.floor(Math.random() * 20) + 30;
      const x = Math.floor(Math.random() * (width - size));
      const y = Math.floor(Math.random() * (height - size));
      setBalls(prev => [...prev, { id: Date.now(), x, y, size }]);
    };

    const interval = setInterval(spawnBall, 1500);
    spawnBall();
    return () => clearInterval(interval);
  }, []);

  const handleCatch = (id: number) => {
    setBalls(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 10);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "b") onExit();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-2 relative bg-blue-800">
      {/* Score */}
      <div className="text-white text-xs mb-2 bg-black/70 px-3 py-1 rounded-full">
        Score: {score}
      </div>

      {/* Area de juego */}
      <div ref={gameAreaRef} className="relative w-full h-[200px] bg-blue-900 rounded-md border-4 border-blue-950 overflow-hidden">
        {balls.map(ball => (
          <div
            key={ball.id}
            className="absolute cursor-pointer animate-pop-in"
            style={{ left: `${ball.x}px`, top: `${ball.y}px`, width: `${ball.size}px`, height: `${ball.size}px` }}
            onClick={() => handleCatch(ball.id)}
          >
            <Image src="/images/game-ball.png" alt="Pelota" width={ball.size} height={ball.size} className="pixel-art" />
          </div>
        ))}
      </div>

      {/* Instrucciones */}
      <div className="mt-2 text-white text-[10px] bg-black/50 px-2 py-1 rounded">
        ¡Haz clic o presiona A para atrapar!
      </div>

      {/* Botón salir */}
      <button
        onClick={onExit}
        className="mt-2 px-4 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded shadow-md text-sm"
      >
        Volver
      </button>
    </div>
  );
}

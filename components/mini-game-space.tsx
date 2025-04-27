"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

interface MiniGameSpaceProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
}

interface Meteor {
  id: number;
  x: number;
  y: number;
}

export default function MiniGameSpace({ onExit, moveCommand }: MiniGameSpaceProps) {
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [playerX, setPlayerX] = useState(115);
  const [gameOver, setGameOver] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Spawnear meteoritos
  useEffect(() => {
    const spawnMeteor = () => {
      if (!gameAreaRef.current) return;
      const { width } = gameAreaRef.current.getBoundingClientRect();
      const x = Math.floor(Math.random() * (width - 30));
      setMeteors((prev) => [...prev, { id: Date.now(), x, y: 0 }]);
    };
    const interval = setInterval(spawnMeteor, 1500);
    return () => clearInterval(interval);
  }, []);

  // Movimiento de meteoritos
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setMeteors((prev) =>
        prev.map((m) => ({ ...m, y: m.y + 5 })).filter((m) => m.y < 260)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [gameOver]);

  // Detección de colisiones
  useEffect(() => {
    meteors.forEach((meteor) => {
      if (meteor.y > 220 && meteor.x > playerX - 20 && meteor.x < playerX + 20) {
        setGameOver(true);
      }
    });
  }, [meteors, playerX]);

  // Movimiento solo por D-Pad
  useEffect(() => {
    if (!moveCommand || gameOver) return;

    if (moveCommand === "left") {
      setPlayerX((x) => Math.max(x - 15, 0));
    }
    if (moveCommand === "right") {
      setPlayerX((x) => Math.min(x + 15, 230));
    }

    // Reset moveCommand
    const event = new Event("resetMove");
    window.dispatchEvent(event);
  }, [moveCommand, gameOver]);

  return (
    <div
      ref={gameAreaRef}
      className="relative w-full h-full flex flex-col items-center justify-start bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: "url(/images/space-game/background-mini-game-space.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Meteoritos */}
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="absolute animate-fall"
          style={{
            left: meteor.x,
            top: meteor.y,
            width: 24,
            height: 24,
          }}
        >
          <Image src="/images/space-game/meteorito.png" alt="Meteor" width={24} height={24} className="pixel-art" />
        </div>
      ))}

      {/* Jugador */}
      {!gameOver && (
        <div className="absolute bottom-2" style={{ left: playerX }}>
          <Image src="/images/space-game/cotito-pj.png" alt="Player" width={32} height={32} className="pixel-art" />
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <Image src="/images/space-game/explocion.png" alt="Boom" width={48} height={48} className="pixel-art mb-2" />
          <p className="text-sm font-bold text-white">¡BOOM! Perdiste 🚀</p>
          <p className="text-[10px] text-white mt-2">Presiona B para salir</p>
        </div>
      )}
    </div>
  );
}

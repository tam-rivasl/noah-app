"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import ScoreBoard from "./score-board";
import { supabase } from "@/lib/supabase"; // Cambiado de Firebase a Supabase

interface MiniGameSpaceProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
  startCommand: boolean;
  onGameEnd?: (score: number, newRecord: boolean) => void;
}

interface Meteor {
  id: number;
  x: number;
  y: number;
  size: number;
}

const CANVAS_WIDTH = 200;
const CANVAS_HEIGHT = 200;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const INITIAL_SPAWN_INTERVAL = 800;
const MIN_SPAWN_INTERVAL = 300;
const INITIAL_SPEED = 4;
const MAX_SPEED = 10;
const SPEED_INCREASE_INTERVAL = 10000;
const SPAWN_DECREASE_AMOUNT = 150;

export default function MiniGameSpace({ onExit, moveCommand, startCommand, onGameEnd }: MiniGameSpaceProps) {
  const [started, setStarted] = useState(false);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [playerX, setPlayerX] = useState((CANVAS_WIDTH - PLAYER_WIDTH) / 2);
  const [gameOver, setGameOver] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [viewingRecords, setViewingRecords] = useState(false);

  const startRef = useRef<number>(0);
  const speedRef = useRef(INITIAL_SPEED);
  const spawnIntervalRef = useRef(INITIAL_SPAWN_INTERVAL);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  const saveSpaceGameScore = async (score: number) => {
    try {
      const { data, error } = await supabase.from("game_scores").insert([
        {
          score: score,
          game_type: "space",
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
  
    } catch (e) {
      console.error("Error saving space game score:", e);
    }
  };

  useEffect(() => {
    if (!gameOver) return;
    const elapsedMs = elapsed;
    const m = Math.floor(elapsedMs / 60000);
    const s = Math.floor((elapsedMs % 60000) / 1000);
    const duration = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    const score = Math.floor(elapsedMs / 1000);
    saveSpaceGameScore(score);
    onGameEnd?.(score, true);
  }, [gameOver, elapsed, onGameEnd]);

  const instructions = [
    "– Mueve a Noa con ← / →.",
    "– Presiona START para iniciar.",
    "– Cada 10 s: meteoros más frecuentes y rápidos.",
    "– Sobrevive el mayor tiempo posible.",
  ];
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

  const handleStart = useCallback(() => {
    setStarted(true);
    startRef.current = Date.now();
    speedRef.current = INITIAL_SPEED;
    spawnIntervalRef.current = INITIAL_SPAWN_INTERVAL;
  }, []);

  useEffect(() => {
    if (!started && startCommand) {
      setCurrentLine(instructions.length);
      handleStart();
    }
  }, [startCommand, started, handleStart, instructions.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver && e.key.toLowerCase() === "b") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver, onExit]);

  useEffect(() => {
    if (!moveCommand || !started || gameOver) return;
    if (moveCommand === "left") {
      setPlayerX((x) => Math.max(x - 20, 0));
    } else if (moveCommand === "right") {
      setPlayerX((x) => Math.min(x + 20, CANVAS_WIDTH - PLAYER_WIDTH));
    }
    window.dispatchEvent(new Event("resetMove"));
  }, [moveCommand, started, gameOver]);

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

  const scheduleNextMeteor = useCallback(() => {
    if (gameOver) return;
    spawnTimerRef.current = setTimeout(() => {
      const size = 24;
      const xPos = Math.random() * (CANVAS_WIDTH - size);
      setMeteors((prev) => [...prev, { id: Date.now() + Math.random(), x: xPos, y: 0, size }]);
      scheduleNextMeteor();
    }, spawnIntervalRef.current);
  }, [gameOver]);

  useEffect(() => {
    if (!started) return;
    scheduleNextMeteor();
    const loop = setInterval(() => {
      setMeteors((prev) => {
        const next: Meteor[] = [];
        let collided = false;
        prev.forEach((m) => {
          const newY = m.y + speedRef.current;
          if (newY > CANVAS_HEIGHT) return;
          const SHRINK = 0.2;
          const playerLeft = playerX + PLAYER_WIDTH * (SHRINK / 2);
          const playerRight = playerX + PLAYER_WIDTH * (1 - SHRINK / 2);
          const playerTop = CANVAS_HEIGHT - PLAYER_HEIGHT - 10;
          const playerBottom = playerTop + PLAYER_HEIGHT;
          const meteorLeft = m.x;
          const meteorRight = m.x + m.size;
          const meteorTop = newY;
          const meteorBottom = meteorTop + m.size;
          const overlapX = playerLeft < meteorRight && playerRight > meteorLeft;
          const overlapY = playerTop < meteorBottom && playerBottom > meteorTop;
          if (overlapX && overlapY) {
            collided = true;
            return;
          }
          next.push({ ...m, y: newY });
        });
        if (collided) {
          setGameOver(true);
          return prev;
        }
        return next;
      });
    }, 50);
    return () => {
      clearInterval(loop);
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [started, playerX, scheduleNextMeteor]);

  if (!started) {
    return (
      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4" style={{ backdropFilter: "blur(2px)" }}>
        <h2 className="text-sm font-bold mb-2">INSTRUCCIONES</h2>
        <div className="space-y-1 text-[10px]">
          {revealedLines.map((line, idx) => <p key={idx}>{line}</p>)}
        </div>
        {currentLine >= instructions.length && <p className="text-[8px] mt-3">Presiona START para comenzar</p>}
      </div>
    );
  }

  return (
    <div className="relative w-[300px] h-[220px] bg-cover bg-center overflow-hidden mx-auto" style={{ backgroundImage: "url(/images/space-game/background-mini-game-space.jpg)" }}>
      <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md pixel-font">Puntaje: {Math.floor(elapsed / 1000)}</p>
      {meteors.map((m) => (
        <div key={m.id} className="absolute" style={{ left: `${m.x}px`, top: `${m.y}px`, width: `${m.size}px`, height: `${m.size}px` }}>
          <Image src="/images/space-game/meteorito.png" alt="Meteorito" width={m.size} height={m.size} className="pixel-art" />
        </div>
      ))}
      {!gameOver && (
        <div className="absolute" style={{ left: `${playerX}px`, top: `${CANVAS_HEIGHT - PLAYER_HEIGHT - 10}px`, width: `${PLAYER_WIDTH}px`, height: `${PLAYER_HEIGHT}px` }}>
          <Image src="/images/space-game/cotito-pj.png" alt="Cotito" width={PLAYER_WIDTH} height={PLAYER_HEIGHT} className="pixel-art" />
        </div>
      )}
      {gameOver && (
        viewingRecords ? (
          <ScoreBoard onClose={onExit} />
        ) : (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white pixel-font">
            <Image src="/images/space-game/explocion.png" alt="Boom" width={48} height={48} className="pixel-art mb-2" />
            <p className="text-[12px] font-bold mb-1">¡BOOM! Perdiste 🚀</p>
            <button onClick={() => setViewingRecords(true)} className="bg-gray-700 hover:bg-gray-600 transition-transform duration-200 active:scale-95 text-[10px] px-2 py-1 rounded mb-2">
              Ver historial
            </button>
            <p className="text-[10px] mb-2">Presiona B para salir</p>
          </div>
        )
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import ScoreBoard from "./score-board";

interface MiniGameSpaceProps {
  onExit: () => void;
  moveCommand: "left" | "right" | "up" | "down" | null;
  startCommand: boolean;
  onGameEnd?: (score: number, newRecord: boolean) => void;
  sfxEnabled?: boolean;
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
const SCORE_STORAGE_KEY = "game_scores_space";
const MAX_SCORES_PER_GAME = 20;
const SESSION_SPACE_KEY = "last_space_run_id";

const loadScores = () => {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveScores = (records: any[]) => {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("No se pudo guardar el historial", err);
  }
};

export default function MiniGameSpace({
                                        onExit,
                                        moveCommand,
                                        startCommand,
                                        onGameEnd,
                                        sfxEnabled = true,
                                      }: MiniGameSpaceProps) {
  const [started, setStarted] = useState(false);
  const [meteors, setMeteors] = useState<Meteor[]>([]);
  const [playerX, setPlayerX] = useState((CANVAS_WIDTH - PLAYER_WIDTH) / 2);
  const [gameOver, setGameOver] = useState(false);
  const [viewingRecords, setViewingRecords] = useState(false);
  const savedRef = useRef(false);
  const gameOverSoundPlayedRef = useRef(false);

  const startRef = useRef<number>(0); // Referencia al inicio del juego
  const speedRef = useRef(INITIAL_SPEED);
  const spawnIntervalRef = useRef(INITIAL_SPAWN_INTERVAL);
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const runIdRef = useRef(`${Date.now()}-${Math.random()}`);

  // Guarda la puntuación local al finalizar el juego
  const saveRecord = (score: number) => {
    const elapsedMs = Date.now() - startRef.current;
    const m = Math.floor(elapsedMs / 60000);
    const s = Math.floor((elapsedMs % 60000) / 1000);
    const duration = `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

    const all = loadScores();
    const sameGame = all.filter((item: any) => item.gameType === "space");
    const bestBefore = sameGame.reduce(
        (max: number, item: any) => Math.max(max, item.score ?? 0),
        0,
    );
    const entry = {
      id: `${Date.now()}-${Math.random()}`,
      date: new Date().toISOString().split("T")[0],
      time: duration,
      score,
      gameType: "space",
    };
    const updatedSame = [...sameGame, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SCORES_PER_GAME);
    const updated = [
      ...all.filter((item: any) => item.gameType !== "space"),
      ...updatedSame,
    ];
    saveScores(updated);
    const isNew = score > bestBefore;
    onGameEnd?.(score, isNew);
  };

  // Ejecuta cuando termina el juego
  useEffect(() => {
    if (!gameOver || savedRef.current) return;
    const lastRunSaved = sessionStorage.getItem(SESSION_SPACE_KEY);
    if (lastRunSaved && lastRunSaved === runIdRef.current) return;
    savedRef.current = true;
    sessionStorage.setItem(SESSION_SPACE_KEY, runIdRef.current);

    const elapsedMs = Date.now() - startRef.current;
    const score = Math.floor(elapsedMs / 1000); // 1 punto por segundo

    saveRecord(score);
  }, [gameOver, saveRecord]);

  useEffect(() => {
    if (!gameOver) {
      savedRef.current = false;
      gameOverSoundPlayedRef.current = false;
    }
  }, [gameOver]);

  useEffect(() => {
    if (!gameOver || gameOverSoundPlayedRef.current || !sfxEnabled) return;
    const el = document.getElementById("gameover-sound") as HTMLAudioElement | null;
    if (el) {
      gameOverSoundPlayedRef.current = true;
      el.currentTime = 0;
      void el.play();
    }
  }, [gameOver, sfxEnabled]);

  // Instrucciones animadas
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
    startRef.current = Date.now(); // Marca el inicio del juego
    speedRef.current = INITIAL_SPEED;
    spawnIntervalRef.current = INITIAL_SPAWN_INTERVAL;
    savedRef.current = false;
    runIdRef.current = `${Date.now()}-${Math.random()}`;
    sessionStorage.removeItem(SESSION_SPACE_KEY);
  }, []);

  useEffect(() => {
    if (!started && startCommand) {
      setCurrentLine(instructions.length);
      handleStart();
    }
  }, [startCommand, started, handleStart]);

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

  // Aumenta dificultad cada 10s
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      const now = Date.now();
      const total = now - startRef.current;
      const factor = Math.floor(total / SPEED_INCREASE_INTERVAL);
      speedRef.current = Math.min(INITIAL_SPEED + factor, MAX_SPEED);
      spawnIntervalRef.current = Math.max(
          INITIAL_SPAWN_INTERVAL - factor * SPAWN_DECREASE_AMOUNT,
          MIN_SPAWN_INTERVAL
      );
    }, 1000);
    return () => clearInterval(id);
  }, [started]);

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

  // Loop principal del juego
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
        <p className="absolute top-1 left-2 text-xs font-bold text-white shadow-md pixel-font">
          Puntaje: {Math.floor((Date.now() - startRef.current) / 1000)}
        </p>

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
                <ScoreBoard
                    gameType="space"
                    onClose={onExit}
                    embedded
                    moveCommand={moveCommand}
                    startCommand={startCommand}
                />
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





"use client";

import MiniGameCatch from "./mini-game";
import MiniGameSpace from "./mini-game-space";
import { useState } from "react";

interface MiniGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniGamesModal({ isOpen, onClose }: MiniGamesModalProps) {
  const [selectedGame, setSelectedGame] = useState<"catch" | "space" | null>(null);

  const handleClose = () => {
    setSelectedGame(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
      {!selectedGame ? (
        <div className="bg-white p-4 rounded-lg flex flex-col items-center w-[220px] shadow-md">
          <h2 className="text-sm font-bold mb-2 text-center text-blue-800">🎲 ¡Elige un minijuego!</h2>
          <button
            onClick={() => setSelectedGame("catch")}
            className="w-full py-1 bg-amber-300 hover:bg-amber-400 text-black font-bold rounded my-1 text-xs"
          >
            🥎 Atrapa la pelota
          </button>
          <button
            onClick={() => setSelectedGame("space")}
            className="w-full py-1 bg-blue-300 hover:bg-blue-400 text-black font-bold rounded my-1 text-xs"
          >
            ☄️ Evita meteoritos
          </button>
          <button
            onClick={handleClose}
            className="w-full py-1 bg-gray-300 hover:bg-gray-400 text-black font-bold rounded mt-2 text-xs"
          >
            ❌ Cancelar
          </button>
        </div>
      ) : selectedGame === "catch" ? (
        <MiniGameCatch onExit={handleClose} />
      ) : (
        <MiniGameSpace onExit={handleClose} />
      )}
    </div>
  );
}

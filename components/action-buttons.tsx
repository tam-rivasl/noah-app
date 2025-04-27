// Primero el ActionButtons corregido

"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  onFeed: () => void;
  onPet: () => void;
  onSleep: () => void;
  onReset: () => void;
  onStart: () => void;
  onMove: (direction: "left" | "right" | "up" | "down") => void;
  onBack: () => void;
  onStartGame: () => void;
  isSleeping: boolean;
  isStarting: boolean;
  inMenu: boolean;
}

export default function ActionButtons({
  onFeed,
  onPet,
  onSleep,
  onReset,
  onStart,
  onMove,
  onBack,
  isSleeping,
  isStarting,
  inMenu,
  onStartGame,
}: ActionButtonsProps) {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleAction = (action: string, callback?: () => void) => {
    setActiveButton(action);
    if (callback) callback();
    setTimeout(() => setActiveButton(null), 200);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-2">
      {/* D-Pad */}
      <div className="flex w-full justify-around items-center mt-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-1">
          <div></div>
          <button
            onClick={() => handleAction("up", () => onMove("up"))}
            className="w-6 h-6 bg-gray-800 rounded-sm shadow-md"
          ></button>
          <div></div>

          <button
            onClick={() => handleAction("left", () => onMove("left"))}
            className="w-6 h-6 bg-gray-800 rounded-sm shadow-md"
          ></button>
          <div className="w-6 h-6"></div>
          <button
            onClick={() => handleAction("right", () => onMove("right"))}
            className="w-6 h-6 bg-gray-800 rounded-sm shadow-md"
          ></button>

          <div></div>
          <button
            onClick={() => handleAction("down", () => onMove("down"))}
            className="w-6 h-6 bg-gray-800 rounded-sm shadow-md"
          ></button>
          <div></div>
        </div>

        {/* Botones A y B */}
        <div className="flex flex-col items-center gap-4">
          <button
             onClick={() => handleAction("a", inMenu ? onStartGame : onFeed)}
            disabled={activeButton !== null || isSleeping || isStarting}
            className="w-10 h-10 bg-red-400 hover:bg-red-500 rounded-full shadow-md text-black font-bold"
          >
            A
          </button>
          <button
            onClick={() => handleAction("b", inMenu ? onBack : onPet)}
            disabled={activeButton !== null || isStarting}
            className="w-10 h-10 bg-blue-400 hover:bg-blue-500 rounded-full shadow-md text-black font-bold"
          >
            B
          </button>
        </div>
      </div>

      {/* Start y Reset */}
      <div className="flex gap-6 mt-3">
        <button
          onClick={() => handleAction("start", onStart)}
          className="px-5 py-1 bg-gray-400 hover:bg-gray-500 rounded text-black text-xs font-bold"
        >
          START
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs"
        >
          <RefreshCw className="w-4 h-4" />
          Reiniciar
        </button>
      </div>
    </div>
  );
}

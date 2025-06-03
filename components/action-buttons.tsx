"use client";

import { useState } from "react";
import { Moon } from "lucide-react";

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
          {/* Spacer */}
          <div></div>

          {/* Flecha Arriba */}
          <button
            onClick={() => handleAction("up", () => onMove("up"))}
            className="w-8 h-8 rounded-full bg-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0px_4px_0px_0px_rgba(0,0,0,0.8)] 
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] 
                       flex items-center justify-center"
          >
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px]
                            border-l-transparent border-r-transparent border-b-white" />
          </button>

          {/* Spacer */}
          <div></div>

          {/* Flecha Izquierda */}
          <button
            onClick={() => handleAction("left", () => onMove("left"))}
            className="w-8 h-8 rounded-full bg-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0px_4px_0px_0px_rgba(0,0,0,0.8)] 
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] 
                       flex items-center justify-center"
          >
            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[8px]
                            border-t-transparent border-b-transparent border-r-white" />
          </button>

          {/* Centro vacío */}
          <div className="w-8 h-8"></div>

          {/* Flecha Derecha */}
          <button
            onClick={() => handleAction("right", () => onMove("right"))}
            className="w-8 h-8 rounded-full bg-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0px_4px_0px_0px_rgba(0,0,0,0.8)] 
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] 
                       flex items-center justify-center"
          >
            <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[8px]
                            border-t-transparent border-b-transparent border-l-white" />
          </button>

          {/* Spacer */}
          <div></div>

          {/* Flecha Abajo */}
          <button
            onClick={() => handleAction("down", () => onMove("down"))}
            className="w-8 h-8 rounded-full bg-gray-700 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0px_4px_0px_0px_rgba(0,0,0,0.8)] 
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] 
                       flex items-center justify-center"
          >
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px]
                            border-l-transparent border-r-transparent border-t-white" />
          </button>

          {/* Spacer */}
          <div></div>
        </div>

        {/* Botones A y B */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => handleAction("a", inMenu ? onStartGame : onFeed)}
            disabled={activeButton !== null || isSleeping || isStarting}
            className="w-12 h-12 rounded-full bg-red-700 text-white font-bold pixel-font shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0px_4px_0px_0px_rgba(0,0,0,0.8)] 
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          >
            A
          </button>
          <button
            onClick={() => handleAction("b", inMenu ? onBack : onPet)}
            disabled={activeButton !== null || isStarting}
            className="w-12 h-12 rounded-full bg-red-700 text-white font-bold pixel-font shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0px_4px_0px_0px_rgba(0,0,0,0.8)] 
                       active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
          >
            B
          </button>
        </div>
      </div>

      {/* Nuevo botón Sleep */}
      <button
        onClick={() => handleAction("sleep", onSleep)}
        disabled={activeButton !== null}
        className="mt-2 px-5 py-2 rounded-lg bg-blue-700 text-white font-bold pixel-font text-xs
                   shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_0_rgba(0,0,0,0.5)] hover:brightness-110 flex items-center gap-2"
      >
        <Moon className="w-4 h-4" />
        SLEEP
      </button>

      {/* Start y Reset */}
      <div className="flex gap-6 mt-3">
        <button
          onClick={() => handleAction("start", onStart)}
          className="px-5 py-1 rounded-lg bg-gray-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_0px_rgba(0,0,0,0.5)] 
                     hover:brightness-110 text-black text-xs font-bold pixel-font"
        >
          START
        </button>

        <button
          onClick={onReset}
          className="px-5 py-1 rounded-lg bg-gray-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5),0_2px_0px_rgba(0,0,0,0.5)] 
                     hover:brightness-110 text-black text-xs font-bold pixel-font"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

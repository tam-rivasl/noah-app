"use client";

import React from "react";

export type GamesModalProps = {
  visible: boolean;
  selectedIndex: number;
};

const options = [
  { id: "catch", label: "🥎 Atrapa la pelota" },
  { id: "space", label: "☄️ Meteoritos" },
];

export default function GamesModal({
  visible,
  selectedIndex,
}: GamesModalProps) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-2">
      <div className="pixel-font bg-[#001] text-blue-200 border-4 border-blue-400 shadow-[6px_6px_0px_#000] p-4 w-[260px] rounded-xl flex flex-col">
        <h2 className="text-lg border-b border-blue-400 pb-1 text-center mb-2">
          🎮 Minijuegos
        </h2>
        <div className="flex flex-col gap-2 mb-2">
          {options.map((opt, idx) => (
            <div
              key={opt.id}
              className={`px-3 py-1 border border-blue-400 rounded bg-[#113] text-center ${
                selectedIndex === idx
                  ? "ring-2 ring-yellow-300 bg-blue-800 animate-pixel-fill"
                  : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
        <p className="text-xs text-center text-blue-200">
          A = Jugar, B = Volver
        </p>
      </div>
    </div>
  );
}

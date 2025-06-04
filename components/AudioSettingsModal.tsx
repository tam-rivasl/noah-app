"use client";

import React from "react";

type AudioSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  onMute: () => void;
  /** índice seleccionado para navegación con D‑Pad */
  selectedIndex: number;
};

export default function AudioSettingsModal({
  visible,
  onClose,
  volume,
  onVolumeChange,
  onMute,
  selectedIndex,
}: AudioSettingsModalProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/80 z-50 flex items-end justify-center pb-2">
      <div
        className="bg-[#111] border-4 border-white pixel-font text-white p-4 w-[280px]"
        style={{
          boxShadow: "4px 4px 0px #000",
        }}
      >
        <h2 className="text-lg mb-2 border-b border-white pb-1">🔊 Sonido</h2>

        <div className="mb-3 text-xs">
          <p>Volumen actual: {Math.round(volume * 100)}%</p>
          <div className="flex gap-2 mt-2 justify-center">
            <button
              onClick={() => onVolumeChange(Math.max(0, volume - 0.1))}
              className={`bg-blue-500 text-black px-2 py-1 border border-white hover:bg-blue-300 ${
                selectedIndex === 0 ? "ring-2 ring-white" : ""
              }`}
            >
              🔉 -
            </button>
            <button
              onClick={() => onVolumeChange(Math.min(1, volume + 0.1))}
              className={`bg-blue-500 text-black px-2 py-1 border border-white hover:bg-blue-300 ${
                selectedIndex === 1 ? "ring-2 ring-white" : ""
              }`}
            >
              🔊 +
            </button>
            <button
              onClick={onMute}
              className={`bg-yellow-400 text-black px-2 py-1 border border-white hover:bg-yellow-300 ${
                selectedIndex === 2 ? "ring-2 ring-white" : ""
              }`}
            >
              🔇 Mute
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className={`bg-red-600 px-4 py-1 text-xs border border-white hover:bg-red-400 ${
              selectedIndex === 3 ? "ring-2 ring-white" : ""
            }`}
          >
            ✖️ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

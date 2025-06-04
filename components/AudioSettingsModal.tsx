"use client";

import React from "react";

type AudioSettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  onMute: () => void;
};

export default function AudioSettingsModal({
  visible,
  onClose,
  volume,
  onVolumeChange,
  onMute,
}: AudioSettingsModalProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
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
              className="bg-blue-500 text-black px-2 py-1 border border-white hover:bg-blue-300"
            >
              🔉 -
            </button>
            <button
              onClick={() => onVolumeChange(Math.min(1, volume + 0.1))}
              className="bg-blue-500 text-black px-2 py-1 border border-white hover:bg-blue-300"
            >
              🔊 +
            </button>
            <button
              onClick={onMute}
              className="bg-yellow-400 text-black px-2 py-1 border border-white hover:bg-yellow-300"
            >
              🔇 Mute
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-red-600 px-4 py-1 text-xs border border-white hover:bg-red-400"
          >
            ✖️ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

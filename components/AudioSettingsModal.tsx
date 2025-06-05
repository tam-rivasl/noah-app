"use client";

import React from "react";

type AudioSettingsModalProps = {
  visible: boolean;
  volume: number;
  onVolumeChange: (newVolume: number) => void;
  onMute: () => void;
  bgmEnabled: boolean;
  onToggleBgm: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  /** índice seleccionado para navegación con D‑Pad */
  selectedIndex: number;
}; 

export default function AudioSettingsModal({
  visible,
  volume,
  onVolumeChange,
  onMute,
  bgmEnabled,
  onToggleBgm,
  sfxEnabled,
  onToggleSfx,
  selectedIndex,
}: AudioSettingsModalProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-2">
      <div
        className="pixel-font bg-[#001] text-blue-200 border-4 border-blue-400 shadow-[6px_6px_0px_#000] p-4 w-[280px]"
      >
        <h2 className="text-lg mb-2 border-b border-blue-400 pb-1 text-center">🔊 Sonido</h2>

        <div className="mb-3 text-xs">
          <p>Volumen actual: {Math.round(volume * 100)}%</p>
          <div className="flex gap-2 mt-2 justify-center">
            <button
              onClick={() => onVolumeChange(Math.max(0, volume - 0.1))}
              className={`bg-blue-500 text-black px-2 py-1 border border-blue-400 hover:bg-blue-300 ${
                selectedIndex === 0 ? "ring-2 ring-yellow-300 animate-pixel-fill" : ""
              }`}
            >
              🔉 -
            </button>
            <button
              onClick={() => onVolumeChange(Math.min(1, volume + 0.1))}
              className={`bg-blue-500 text-black px-2 py-1 border border-blue-400 hover:bg-blue-300 ${
                selectedIndex === 1 ? "ring-2 ring-yellow-300 animate-pixel-fill" : ""
              }`}
            >
              🔊 +
            </button>
            <button
              onClick={onMute}
              className={`bg-yellow-400 text-black px-2 py-1 border border-blue-400 hover:bg-yellow-300 ${
                selectedIndex === 2 ? "ring-2 ring-yellow-300 animate-pixel-fill" : ""
              }`}
            >
              🔇 Mute
            </button>
            <button
              onClick={onToggleBgm}
              className={`bg-purple-500 text-black px-2 py-1 border border-blue-400 hover:bg-purple-300 ${
                selectedIndex === 3 ? "ring-2 ring-yellow-300 animate-pixel-fill" : ""
              }`}
            >
              {bgmEnabled ? "🎵 ON" : "🎵 OFF"}
            </button>
            <button
              onClick={onToggleSfx}
              className={`bg-purple-500 text-black px-2 py-1 border border-blue-400 hover:bg-purple-300 ${
                selectedIndex === 4 ? "ring-2 ring-yellow-300 animate-pixel-fill" : ""
              }`}
            >
              {sfxEnabled ? "🎶 ON" : "🎶 OFF"}
            </button>
          </div>
        </div>
        <p className="text-xs text-center text-blue-200">B = Volver</p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useAudio } from "./audio-provider";

export default function VolumeMenu({ onClose }: { onClose: () => void }) {
  const {
    generalVolume,
    effectsVolume,
    musicVolume,
    setGeneralVolume,
    setEffectsVolume,
    setMusicVolume,
  } = useAudio();

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white pixel-font p-2 z-30">
      <h2 className="text-center text-sm mb-2">Volumen</h2>
      <div className="flex flex-col gap-2 text-xs">
        <label className="flex items-center gap-2">
          General
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={generalVolume}
            onChange={(e) => setGeneralVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
        </label>
        <label className="flex items-center gap-2">
          Efectos
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={effectsVolume}
            onChange={(e) => setEffectsVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
        </label>
        <label className="flex items-center gap-2">
          Música
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="flex-1"
          />
        </label>
        <button
          onClick={onClose}
          className="mt-2 bg-gray-700 rounded px-2 py-1 text-xs"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

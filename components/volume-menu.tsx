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
    <div className="w-full bg-black/80 text-white pixel-font p-2 mt-2 rounded">
      <h2 className="text-center text-sm mb-1">Volumen</h2>
      <div className="flex flex-col gap-1 text-xs">
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
        <div className="flex justify-center mt-1">
          <button
            onClick={onClose}
            className="bg-gray-700 rounded px-2 py-0.5 text-xs"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

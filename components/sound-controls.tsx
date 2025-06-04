"use client";
import { Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";

export default function SoundControls() {
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audios = Array.from(document.querySelectorAll<HTMLAudioElement>("audio"));
    audios.forEach((audio) => {
      audio.muted = muted;
      audio.volume = volume;
    });
  }, [muted, volume]);

  const volumeUp = () =>
    setVolume((v) => Math.min(1, parseFloat((v + 0.1).toFixed(2))));
  const volumeDown = () =>
    setVolume((v) => Math.max(0, parseFloat((v - 0.1).toFixed(2))));

  return (
    <div className="w-full flex justify-center mt-2">
      <div className="pixel-font bg-amber-100 border-4 border-black w-64 p-2 relative">
        <div className="absolute -top-4 left-0 right-0 bg-pink-600 text-white text-center py-1">
          SETTINGS
        </div>
        <div className="flex items-end justify-around mt-4 mb-3">
          <button
            aria-label="Mute"
            onClick={() => setMuted((m) => !m)}
            className="pixel-button bg-gray-700 text-white rounded px-2 py-1 flex flex-col items-center"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span className="text-[8px] mt-1">MUTE</span>
          </button>
          <button
            aria-label="Volumen -"
            onClick={volumeDown}
            className="pixel-button bg-gray-700 text-white rounded px-2 py-1 flex flex-col items-center"
          >
            <Minus className="w-4 h-4" />
            <span className="text-[8px] mt-1">VOL -</span>
          </button>
          <button
            aria-label="Volumen +"
            onClick={volumeUp}
            className="pixel-button bg-gray-700 text-white rounded px-2 py-1 flex flex-col items-center"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[8px] mt-1">VOL +</span>
          </button>
        </div>
        <button className="pixel-button bg-green-600 text-black w-full py-1 text-xs rounded">
          OK
        </button>
      </div>
    </div>
  );
}

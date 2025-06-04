"use client";
import { Volume1, Volume2, VolumeX } from "lucide-react";
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

  const volumeUp = () => setVolume((v) => Math.min(1, parseFloat((v + 0.1).toFixed(2))));
  const volumeDown = () => setVolume((v) => Math.max(0, parseFloat((v - 0.1).toFixed(2))));

  return (
    <div className="w-full flex justify-center">
      <div className="flex items-center gap-2 bg-black/70 border border-white rounded px-2 py-1 text-white text-xs pixel-font">
        <button
          aria-label="Mute"
          onClick={() => setMuted((m) => !m)}
          className="pixel-button bg-gray-700 text-white rounded px-2 py-1"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          aria-label="Volumen -"
          onClick={volumeDown}
          className="pixel-button bg-gray-700 text-white rounded px-2 py-1"
        >
          <Volume1 className="w-4 h-4" />
        </button>
        <button
          aria-label="Volumen +"
          onClick={volumeUp}
          className="pixel-button bg-gray-700 text-white rounded px-2 py-1"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

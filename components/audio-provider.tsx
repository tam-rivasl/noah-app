"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

interface AudioContextValue {
  generalVolume: number;
  effectsVolume: number;
  musicVolume: number;
  setGeneralVolume: (v: number) => void;
  setEffectsVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  playEffect: (url: string) => void;
  playMusic: (url: string) => void;
  stopMusic: () => void;
}

const AudioCtx = createContext<AudioContextValue | undefined>(undefined);

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be inside AudioProvider");
  return ctx;
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [generalVolume, setGeneralVolume] = useState(1);
  const [effectsVolume, setEffectsVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(1);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const playEffect = (url: string) => {
    if (!url) return;
    const audio = new Audio(url);
    audio.volume = generalVolume * effectsVolume;
    audio.play();
  };

  const playMusic = (url: string) => {
    if (!url) return;
    if (musicRef.current) {
      musicRef.current.pause();
    }
    musicRef.current = new Audio(url);
    musicRef.current.loop = true;
    musicRef.current.volume = generalVolume * musicVolume;
    musicRef.current.play();
  };

  const stopMusic = () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current = null;
    }
  };

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = generalVolume * musicVolume;
    }
  }, [generalVolume, musicVolume]);

  const value: AudioContextValue = {
    generalVolume,
    effectsVolume,
    musicVolume,
    setGeneralVolume,
    setEffectsVolume,
    setMusicVolume,
    playEffect,
    playMusic,
    stopMusic,
  };

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}

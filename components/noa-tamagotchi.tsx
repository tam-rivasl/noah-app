"use client";
import React, { useState, useEffect, useCallback } from "react";
import StatusBars from "./status-bars";
import ActionButtons from "./action-buttons";
import MiniGameJump from "./mini-game-catch";
import MiniGameSpace from "./mini-game-space";
import NoaWalking from "./noa-walking";
import NoaEating from "./noa-eating";
import NoaSleeping from "./noa-sleeping";

export type NoaState = {
  hunger: number;
  happiness: number;
  energy: number;
  lastUpdated: number;
};

const initialState: NoaState = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  lastUpdated: Date.now(),
};

type Screen = "start" | "main" | "menu" | "jump" | "space";

export default function NoaTamagotchi() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [noaState, setNoaState] = useState<NoaState>(initialState);
  const [currentAction, setCurrentAction] = useState<"eating" | "petting" | "sleeping" | "gaming"| null>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [screen, setScreen] = useState<Screen>("start");
  const [moveCommand, setMoveCommand] = useState<"left" | "right" | "up" | "down" | null>(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const menuOptions: ("jump" | "space")[] = ["jump", "space"];

  // Time & Background
  const [time, setTime] = useState(new Date());
  const [backgroundImage, setBackgroundImage] = useState<string>("/images/back-grounds/day.png");

  // Load/Save state
  useEffect(() => {
    const saved = localStorage.getItem("noaState");
    if (saved) {
      const parsed = JSON.parse(saved) as NoaState;
      const now = Date.now();
      const minutes = (now - parsed.lastUpdated) / 60000;
      const decay = Math.floor(minutes / 5);
      if (decay > 0) {
        parsed.hunger = Math.max(parsed.hunger - decay, 0);
        parsed.happiness = Math.max(parsed.happiness - decay, 0);
        parsed.energy = Math.max(parsed.energy - decay, 0);
      }
      setNoaState({ ...parsed, lastUpdated: now });
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("noaState", JSON.stringify({ ...noaState, lastUpdated: Date.now() }));
  }, [noaState]);

  // Stats decay
  useEffect(() => {
    const id = setInterval(() => {
      setNoaState(p => ({
        ...p,
        hunger: Math.max(p.hunger - 1, 0),
        happiness: Math.max(p.happiness - 1, 0),
        energy: Math.max(p.energy - 1, 0),
        lastUpdated: Date.now(),
      }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // Background by hour
  useEffect(() => {
    const hour = time.getHours();
    if (hour >= 6 && hour < 18) {
      setBackgroundImage("/images/back-grounds/day.png");
    } else if (hour < 20) {
      setBackgroundImage("/images/back-grounds/tarde.png");
    } else {
      setBackgroundImage("/images/back-grounds/night.png");
    }
  }, [time]);


  // Emotional state
  const getEmotional = useCallback(() => {
    const { hunger, happiness, energy } = noaState;
    if (isSleeping) return "sleeping";
    if (hunger < 20) return "hungry";
    if (energy < 20) return "tired";
    if (happiness < 20) return "sad";
    return "normal";
  }, [noaState, isSleeping]);

  // Sleeping refill
  useEffect(() => {
    let id: NodeJS.Timeout;
    if (isSleeping) {
      id = setInterval(() => {
        setNoaState(p => ({ ...p, energy: Math.min(p.energy + 5, 100) }));
      }, 10000);
    }
    return () => clearInterval(id);
  }, [isSleeping]);

  useEffect(() => {
    if (noaState.energy === 0 && !isSleeping) {
      toggleSleep();
    }
  }, [noaState.energy, isSleeping]);

  // Actions
  const feedNoa = () => {
    if (isSleeping) return;
    setCurrentAction("eating");
    setNoaState(p => ({ ...p, hunger: Math.min(p.hunger + 20, 100) }));
  };
  const petNoa = () => {
    if (isSleeping) return;
    setCurrentAction("petting");
    setNoaState(p => ({ ...p, happiness: Math.min(p.happiness + 10, 100) }));
  };
  const toggleSleep = () => {
    setIsSleeping(s => !s);
    setCurrentAction(s => s ? null : "sleeping");
  };

  const gaming = () => {
    if (isSleeping) return;
    if(menuOptions[selectedMenuIndex]){
      setCurrentAction("gaming");
      setNoaState(p => ({ ...p, happiness: Math.min(p.happiness + 10, 100), energy: Math.min(p.energy + 40, 100) }));
    }
  };
  
  useEffect(() => {
    if (currentAction) {
      const to = setTimeout(() => setCurrentAction(null), 2000);
      return () => clearTimeout(to);
    }
  }, [currentAction]);

  // Navigation
  const handleStart = () => setScreen(prev => prev === "start" ? "main" : "menu");
  const handleBack = () => setScreen(prev => prev === "menu" ? "main" : "menu");
  const startSelectedGame = () => {
    gaming(); // Aumenta felicidad y energía al comenzar
    setScreen(menuOptions[selectedMenuIndex]); // Cambia de pantalla al minijuego
  };
    const handleMove = (dir: "left" | "right" | "up" | "down") => {
    if (screen === "menu") {
      setSelectedMenuIndex(i =>
        dir === "left"
          ? (i - 1 + menuOptions.length) % menuOptions.length
          : (i + 1) % menuOptions.length
      );
    }
    setMoveCommand(dir);
    setTimeout(() => setMoveCommand(null), 100);
  };

  return (
    <div className="gameboy">
      <div className="gameboy-top relative">
        <img src="/images/logo/noa-console.png" alt="NOA Console" className="gameboy-logo mx-auto" />
      </div>

      <div className="gameboy-screen relative overflow-hidden">
        {screen === "start" && (
          <div className="gameboy-top2 flex flex-col items-center justify-end h-full">
            <p className="press-start-text animate-blink">Press Start</p>
          </div>
        )}

        {screen === "main" && (
          <>
            {/* Background */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />

            {/* Top HUD: Clock + StatusBars */}
            {mounted && (
              <div className="absolute top-1 left-1 right-1 flex flex-col items-end  z-20">
                {/* StatusBars */}
                <div className="w-full flex justify-center">
                  <StatusBars noaState={noaState} />
                </div>
                {/* Pixel Art Clock */}
                <div className="pixel-font text-xs text-white bg-black px-1 py-0.5 rounded border border-white shadow-[2px_2px_0_#444]">
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

              </div>
            )}

            {/* Main character/actions */}
            <div className="relative z-10 flex flex-col items-center justify-end w-full h-full p-2 pt-16">
              <div className="relative flex items-end justify-center w-full h-full">
                {currentAction === "eating" && (
                  <div className="w-[40px] h-[80px]">
                    <NoaEating />
                  </div>
                )}
                {currentAction === "sleeping" && (
                  <div className="w-[40px] h-[80px]">
                    <NoaSleeping />
                  </div>
                )}
                {!currentAction && !isSleeping && (
                  <div className="w-[40px] h-[80px]">
                    <NoaWalking />
                  </div>
                )}
              </div>
            </div>
          </>
        )}


        {screen === "menu" && (
          <div className="flex flex-col items-center justify-center text-white h-full">
            <h2 className="text-lg pixel-font mb-2">Selecciona un minijuego</h2>
            <div className="flex gap-4">
              {menuOptions.map((opt, idx) => (
                <button
                  key={opt}
                  onClick={() => setScreen(opt)}
                  className={`px-4 py-2 text-sm rounded ${selectedMenuIndex === idx ? 'bg-white text-black' : 'bg-black/30'}`}
                >
                  {opt === 'jump' ? 'Saltin rebotin' : '☄️ Meteoritos'}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "jump" && <MiniGameJump onExit={handleBack} moveCommand={moveCommand} />}
        {screen === "space" && <MiniGameSpace onExit={handleBack} moveCommand={moveCommand} />}
      </div>

      <div className="gameboy-controls">
        <ActionButtons
          onFeed={feedNoa}
          onPet={petNoa}
          onSleep={toggleSleep}
          onReset={() => { localStorage.removeItem('noaState'); setNoaState(initialState); }}
          onStartGame={startSelectedGame}
          onStart={handleStart}
          onMove={handleMove}
          onBack={handleBack}
          isSleeping={isSleeping}
          isStarting={screen === 'start'}
          inMenu={['menu', 'jump', 'space'].includes(screen)}
        />
      </div>
    </div>
  );
}

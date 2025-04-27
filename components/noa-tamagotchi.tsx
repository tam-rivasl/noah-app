"use client";

import { useState, useEffect, useCallback } from "react";
import NoaSprite, { Action, EmotionalState } from "./noa-sprite";
import StatusBars from "./status-bars";
import ActionButtons from "./action-buttons";
import MiniGameCatch from "./mini-game";
import MiniGameSpace from "./mini-game-space";

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

type Screen = "start" | "main" | "menu" | "catch" | "space";

export default function NoaTamagotchi() {
  const [noaState, setNoaState] = useState<NoaState>(initialState);
  const [currentAction, setCurrentAction] = useState<Action>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string>("/images/back-grounds/day-background.jpg");
  const [screen, setScreen] = useState<Screen>("start");
  const [message, setMessage] = useState<string>("");
  const [moveCommand, setMoveCommand] = useState<"left" | "right" | "up" | "down" | null>(null);
  const menuOptions: ("catch" | "space")[] = ["catch", "space"];
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);

  const startSelectedGame = () => {
    const selected = menuOptions[selectedMenuIndex];
    if (selected === "catch" || selected === "space") {
      setScreen(selected);
    }
  };

  // ---------- CARGA DE ESTADO ----------
  useEffect(() => {
    const saved = localStorage.getItem("noaState");
    if (saved) {
      const parsed = JSON.parse(saved) as NoaState;
      const now = Date.now();
      const minutesPassed = (now - parsed.lastUpdated) / 60000;
      const decay = Math.floor(minutesPassed / 5);
      if (decay > 0) {
        parsed.hunger = Math.max(parsed.hunger - decay, 0);
        parsed.happiness = Math.max(parsed.happiness - decay, 0);
        parsed.energy = Math.max(parsed.energy - decay, 0);
        parsed.lastUpdated = now;
      }
      setNoaState(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("noaState", JSON.stringify({ ...noaState, lastUpdated: Date.now() }));
  }, [noaState]);

  useEffect(() => {
    const id = setInterval(() => {
      setNoaState((prev) => ({
        ...prev,
        hunger: Math.max(prev.hunger - 1, 0),
        happiness: Math.max(prev.happiness - 1, 0),
        energy: Math.max(prev.energy - 1, 0),
        lastUpdated: Date.now(),
      }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // ---------- ESTADO EMOCIONAL ----------
  const getEmotionalState = useCallback((): EmotionalState => {
    const { hunger, happiness, energy } = noaState;
    if (isSleeping) return "sleeping";
    if (hunger < 30 && energy < 30) return "hungry-tired";
    if (energy < 20) return "tired";
    if (hunger < 20) return "hungry";
    if (happiness < 20) return "sad";
    if (happiness < 40) return "bored";
    if (hunger < 40 || energy < 40) return "worried";
    if (hunger > 80 && happiness > 80 && energy > 80) return "excited";
    return "normal";
  }, [noaState, isSleeping]);

  const emotionalState = getEmotionalState();

  // ---------- DORMIR ----------
  useEffect(() => {
    let id: NodeJS.Timeout;
    if (isSleeping) {
      setMessage("Noa está durmiendo... 💤");
      id = setInterval(() => {
        setNoaState((prev) => ({
          ...prev,
          energy: Math.min(prev.energy + 5, 100),
        }));
      }, 10000);
    } else {
      setMessage("Noa se ha despertado! 🌞");
    }
    return () => clearInterval(id);
  }, [isSleeping]);

  // ---------- CAMBIO DE FONDO ----------
  useEffect(() => {
    const { energy } = noaState;
    if (energy > 50) setBackgroundImage("/images/back-grounds/day-background.jpg");
    else if (energy > 10) setBackgroundImage("/images/back-grounds/atardecer-background.webp");
    else setBackgroundImage("/images/back-grounds/sleep-background.jpg");
  }, [noaState.energy, isSleeping]);

  // ---------- ACCIONES ----------
  const feedNoa = () => {
    if (isSleeping) {
      setMessage("Noa está durmiendo, no la molestes.");
      return;
    }
    setCurrentAction("eating");
    setTimeout(() => setCurrentAction(null), 2000);
    setNoaState((prev) => ({
      ...prev,
      hunger: Math.min(prev.hunger + 20, 100),
      energy: Math.min(prev.energy + 5, 100),
    }));
    setMessage("¡Noa está comiendo! 🍖");
  };

  const petNoa = () => {
    if (isSleeping) {
      setMessage("Noa está durmiendo, déjala descansar.");
      return;
    }
    setCurrentAction("petting");
    setTimeout(() => setCurrentAction(null), 2000);
    setNoaState((prev) => ({
      ...prev,
      happiness: Math.min(prev.happiness + 10, 100),
    }));
    setMessage("¡Noa se siente querida! 💖");
  };

  const toggleSleep = () => setIsSleeping((prev) => !prev);

  const handleStart = () => {
    if (screen === "start") {
      setScreen("main");
    } else if (screen === "main") {
      setScreen("menu");
    }
  };

  const handleBack = () => {
    if (screen === "menu") {
      setScreen("main");
    } else if (screen === "catch" || screen === "space") {
      setScreen("menu");
    }
  };

  const handleMove = (direction: "left" | "right" | "up" | "down") => {
    if (screen === "menu") {
      if (direction === "left") {
        setSelectedMenuIndex((prev) => (prev - 1 + menuOptions.length) % menuOptions.length);
      }
      if (direction === "right") {
        setSelectedMenuIndex((prev) => (prev + 1) % menuOptions.length);
      }
    }
    setMoveCommand(direction);
    setTimeout(() => setMoveCommand(null), 100);
  };

  return (
    <div className="gameboy">
      {/* --- Parte Superior --- */}
     {/* --- Parte Superior --- */}
     <div className="gameboy-top">
  <img
    src="/images/logo/noa-console.png"
    alt="NOA Console"
    className="gameboy-logo"
  />
</div>
      {/* --- Pantalla --- */}
      <div className="gameboy-screen">
        {/* Contenido dinámico */}
        {screen === "start" && (
          <div className="gameboy-top2 flex flex-col items-center justify-end">
  <p className="press-start-text animate-blink mt-2">Press Start</p>
</div>
        )}

        {screen === "main" && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            {backgroundImage.includes("sleep-background") && (
              <div className="absolute inset-0 animate-twinkle pointer-events-none" />
            )}
            <div className="relative z-10 flex flex-col items-center p-2">
              <StatusBars noaState={noaState} />
              <div className="text-[10px] text-white bg-black/60 px-2 py-1 rounded-full my-1">
                {backgroundImage.includes("day") ? "Día ☀️" : backgroundImage.includes("atardecer") ? "Tarde 🌇" : "Noche 🌙"}
              </div>
              <h1 className="text-sm font-bold text-white">Noa {isSleeping ? "💤" : emotionalState === "hungry-tired" ? "😴🍽️" : "✨"}</h1>
              <NoaSprite
                emotionalState={emotionalState}
                currentAction={currentAction}
                hungerLevel={noaState.hunger}
                happinessLevel={noaState.happiness}
                energyLevel={noaState.energy}
              />
            </div>
          </>
        )}

        {screen === "menu" && (
          <div className="flex flex-col items-center justify-center text-white text-center">
            <h2 className="text-lg pixel-font mb-4">Selecciona un minijuego</h2>
            <div className="flex gap-4">
              {menuOptions.map((option, idx) => (
                <button
                  key={option}
                  onClick={() => setScreen(option)}
                  className={`px-4 py-2 text-sm rounded ${selectedMenuIndex === idx ? "bg-white text-black" : "bg-black/30"}`}
                >
                  {option === "catch" ? "🥎 Atrapa" : "☄️ Meteoritos"}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "catch" && <MiniGameCatch onExit={handleBack} moveCommand={moveCommand} />}
        {screen === "space" && <MiniGameSpace onExit={handleBack} moveCommand={moveCommand} />}
      </div>

      {/* --- Controles --- */}
      <div className="gameboy-controls">
        <ActionButtons
          onFeed={feedNoa}
          onPet={petNoa}
          onSleep={toggleSleep}
          onReset={() => {
            localStorage.removeItem("noaState");
            setNoaState(initialState);
          }}
          onStartGame={startSelectedGame}
          onStart={handleStart}
          onMove={handleMove}
          onBack={handleBack}
          isSleeping={isSleeping}
          isStarting={screen === "start"}
          inMenu={screen === "menu" || screen === "catch" || screen === "space"}
        />
      </div>
    </div>
  );
}

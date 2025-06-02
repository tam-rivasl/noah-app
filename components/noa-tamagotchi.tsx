"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatusBars from "./status-bars";
import ActionButtons from "./action-buttons";
import NoaWalking from "./noa-walking";
import NoaEating from "./noa-eating";
import NoaSleeping from "./noa-sleeping";
import { NoaPetting } from "./noa-petting";

// Importa tus minijuegos:
import MiniGameCatch from "./mini-game-catch";
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

export default function NoaTamagotchi() {
  const [noaState, setNoaState] = useState<NoaState>(initialState);
  const [currentAction, setCurrentAction] = useState<
    "eating" | "petting" | "gaming" | null
  >(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [screen, setScreen] = useState<
    "start" | "main" | "menu" | "catch" | "space"
  >("start");
  const [moveCommand, setMoveCommand] = useState<
    "left" | "right" | "up" | "down" | null
  >(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const menuOptions: ("catch" | "space")[] = ["catch", "space"];
  const [time, setTime] = useState(new Date());
  const [backgroundImage, setBackgroundImage] = useState<string>(
    "/images/back-grounds/day.png"
  );
  // Indica si estamos jugando un mini‐juego
  // —————————————————————————————————————————————————
  // 1) Cargar/recuperar estado guardado de Noa
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

  // 2) Guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem(
      "noaState",
      JSON.stringify({ ...noaState, lastUpdated: Date.now() })
    );
  }, [noaState]);

  // 3) Decaimiento de stats cada minuto
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

  // 4) Reloj
  useEffect(() => {
    const tick = () => setTime(new Date());
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  // 5) Lógica de fondo (día/tarde/noche) y forzar noche si Noa duerme
  useEffect(() => {
    if (isSleeping) {
      setBackgroundImage("/images/back-grounds/night.png");
      return;
    }
    const hour = time.getHours();
    if (hour >= 6 && hour < 18) {
      setBackgroundImage("/images/back-grounds/day.png");
    } else if (hour < 20) {
      setBackgroundImage("/images/back-grounds/tarde.png");
    } else {
      setBackgroundImage("/images/back-grounds/night.png");
    }
  }, [time, isSleeping]);

  // 6) Recargar energía mientras duerme
  useEffect(() => {
    let id: NodeJS.Timeout;
    if (isSleeping) {
      id = setInterval(() => {
        setNoaState((prev) => {
          const newEnergy = Math.min(prev.energy + 5, 100);
          return { ...prev, energy: newEnergy };
        });
      }, 10000);
    }
    return () => clearInterval(id);
  }, [isSleeping]);

  // 7) Despertar solo cuando llegue a 100 de energía
  useEffect(() => {
    if (isSleeping && noaState.energy >= 100) {
      setIsSleeping(false);
      setCurrentAction(null);
    }
  }, [noaState.energy, isSleeping]);

  // 8) Si energía llega a 0 y Noa no está durmiendo, forzar a dormir
  useEffect(() => {
    if (noaState.energy === 0 && !isSleeping) {
      setIsSleeping(true);
      setCurrentAction(null);
    }
  }, [noaState.energy, isSleeping]);

  // —————————————————————————————————————————————————
  // Acciones básicas (alimentar, acariciar, etc.)
  const feedNoa = () => {
    if (isSleeping) return;
    setCurrentAction("eating");
    setNoaState((p) => ({ ...p, hunger: Math.min(p.hunger + 20, 100), energy: Math.min(p.energy + 10, 100), happiness: Math.min(p.happiness + 10, 100) }));
  };
  const petNoa = () => {
    if (isSleeping) return;
    setCurrentAction("petting");
    setNoaState((p) => ({ ...p, happiness: Math.min(p.happiness + 10, 100), energy: Math.min(p.energy - 10, 100) }));
  };
  const gaming = () => {
    if (isSleeping) return;
    if(menuOptions[selectedMenuIndex]){
      setCurrentAction("gaming");
      setNoaState(p => ({ ...p, happiness: Math.min(p.happiness + 10, 100), energy: Math.min(p.energy - 10, 100), hunger: Math.min(p.hunger - 10, 100) }));
    }
  };

  // Limpiar acción después de 2 segundos (si no está durmiendo)
  useEffect(() => {
    if (currentAction && !isSleeping) {
      const timer = setTimeout(() => setCurrentAction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentAction, isSleeping]);

  // —————————————————————————————————————————————————
  // D-PAD: controla el valor de `moveCommand`
  // (luego lo pasaremos a los minijuegos)
  const handleMove = (dir: "left" | "right" | "up" | "down") => {
    setMoveCommand(dir);
    setTimeout(() => setMoveCommand(null), 100);
  };

  // —————————————————————————————————————————————————
  // Navegación entre pantallas
  const handleStart = () => {
    setScreen((prev) => (prev === "start" ? "main" : "menu"));
  };
  const handleBack = () => {
    // Si estás en “menu”, vuelves a “main”
    // Si estás en “catch” o “space” (un minijuego), vuelves a “menu”
    if (screen === "menu") {
      setScreen("main");
    } else if (screen === "catch" || screen === "space") {
      setScreen("menu");
    }
  };
  const startSelectedGame = () => {
    gaming(); // Aumenta felicidad y energía al comenzar
    setScreen(menuOptions[selectedMenuIndex]); // Cambia de pantalla al minijuego
  };

  // Avanza en el menú (cambia índice)
  const changeMenuSelection = (dir: "left" | "right") => {
    setSelectedMenuIndex((i) =>
      dir === "left"
        ? (i - 1 + menuOptions.length) % menuOptions.length
        : (i + 1) % menuOptions.length
    );
  };

  // Estado emocional (no se usa aquí, pero puedes expandirlo)
  const getEmotional = useCallback(() => {
    const { hunger, happiness, energy } = noaState;
    if (isSleeping) return "sleeping";
    if (hunger < 20) return "hungry";
    if (energy < 20) return "tired";
    if (happiness < 20) return "sad";
    return "normal";
  }, [noaState, isSleeping]);

  return (
    <div className="gameboy">
      {/* -------------------- HEADER -------------------- */}
      <div className="gameboy-top relative">
        <img
          src="/images/logo/noa-console.png"
          alt="NOA Console"
          className="gameboy-logo mx-auto"
        />
      </div>

      {/* -------------------- PANTALLA -------------------- */}
      <div
        className="gameboy-screen relative overflow-hidden"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* === Pantalla de “Press Start” === */}
        {screen === "start" && (
          <div className="gameboy-top2 flex flex-col items-center justify-end h-full">
            <p className="press-start-text animate-blink">Press Start</p>
          </div>
        )}

        {/* === Pantalla principal (Noa + HUD) === */}
        {screen === "main" && (
          <>
            {/* Top HUD: StatusBars + Reloj */}
            <div className="absolute top-1 left-1 right-1 flex flex-col items-end z-20">
              <div className="w-full flex justify-center">
                <StatusBars noaState={noaState} />
              </div>
              <div className="pixel-font text-xs text-white bg-black px-1 py-0.5 rounded border border-white shadow-[2px_2px_0_#444]">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Animación de Noa según estado */}
            <div className="relative z-10 flex flex-col items-center justify-end w-full h-full p-2 pt-16">
              <div className="relative flex items-end justify-center w-full h-full">
                {isSleeping ? (
                  <div className="w-[40px] h-[80px]">
                    <NoaSleeping />
                  </div>
                ) : currentAction === "eating" ? (
                  <div className="w-[40px] h-[80px]">
                    <NoaEating />
                  </div>
                ) : currentAction === "petting" ? (
                  <div className="w-[40px] h-[80px]">
                    <NoaPetting />
                  </div>
                ) : (
                  <div className="w-[40px] h-[80px]">
                    <NoaWalking />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* === Pantalla de menú de minijuegos === */}
        {screen === "menu" && (
          <div
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div className="flex flex-col items-center justify-center text-white h-full">
              <h2 className="text-lg pixel-font mb-2">Juega con noah!</h2>
              <div className="flex gap-4">
                {menuOptions.map((opt, idx) => (
                  <button
                    key={opt}
                    onClick={() => setScreen(opt)}
                    className={`px-4 py-2 text-sm rounded ${
                      selectedMenuIndex === idx
                        ? "bg-white text-black"
                        : "bg-black/30"
                    }`}
                  >
                    {opt === "catch" ? "Saltin rebotin" : "☄️ Meteoritos"}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs pixel-font text-gray-200">
                Usa ← → para cambiar y A para seleccionar
              </p>
            </div>
          </div>
        )}

        {/* === MiniGameCatch === */}
        {screen === "catch" && (
          <MiniGameCatch onExit={handleBack} moveCommand={moveCommand} />
        )}

        {/* === MiniGameSpace === */}
        {screen === "space" && (
          <MiniGameSpace onExit={handleBack} moveCommand={moveCommand} />
        )}
      </div>

      {/* -------------------- CONTROLES -------------------- */}
      <div className="gameboy-controls">
        <ActionButtons
          onFeed={feedNoa}
          onPet={petNoa}
          onSleep={() => {
            if (!isSleeping) setIsSleeping(true);
          }}
          onReset={() => {
            localStorage.removeItem("noaState");
            setNoaState(initialState);
            setScreen("start"); // Volver a “Press Start”
            setIsSleeping(false); // Asegurarse de que Noa no siga durmiendo
            setCurrentAction(null); // Limpiar cualquier acción en curso
            setSelectedMenuIndex(0); // Restablecer índice de menú
          }}
          onStartGame={startSelectedGame}
          onStart={handleStart}
          onMove={(dir) => {
            // Si estamos en menú de minijuegos, cambiar selección
            if (screen === "menu") {
              changeMenuSelection(dir === "left" ? "left" : "right");
            }
            handleMove(dir);
          }}
          onBack={handleBack}
          isSleeping={isSleeping}
          isStarting={screen === "start"}
          inMenu={["menu", "catch", "space"].includes(screen)}
        />
      </div>
    </div>
  );
}

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
import AudioSettingsModal from './AudioSettingsModal';

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
  const [startCommand, setStartCommand] = useState(false);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState(0);
  const menuOptions: ("catch" | "space")[] = ["catch", "space"];
  const [time, setTime] = useState(new Date());
  const [backgroundImage, setBackgroundImage] = useState<string>(
    "/images/back-grounds/day.png"
  );
  const [noaDead, setNoaDead] = useState(false);
  const [visible, setShowSoundModal] = useState(false);
  const [volume, setVolume] = useState(1); // de 0.0 a 1.0
  const [selectedIcon, setSelectedIcon] = useState<"none" | "settings">("none");

  // —————————————————————————————————————————————————
  // 1) Cargar estado guardado
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

  // 2) Guardar estado al cambiar
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

  // 5) Fondo día/tarde/noche y forzar noche si duerme
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

  // 7) Despertar cuando llegue a 100 de energía
  useEffect(() => {
    if (isSleeping && noaState.energy >= 100) {
      setIsSleeping(false);
      setCurrentAction(null);
    }
  }, [noaState.energy, isSleeping]);

  // 9) Morir si toda las stat llegan a  0
  useEffect(() => {
    if (
      noaState.hunger === 0 &&
      noaState.happiness === 0 &&
      noaState.energy === 0
    ) {
      setNoaDead(true);
      setCurrentAction(null);
      setIsSleeping(false);
      if (screen === "catch" || screen === "space") {
        setScreen("main");
      }
    }
  }, [noaState.hunger, noaState.happiness, noaState.energy, screen]);

  // —————————————————————————————————————————————————
  // Acciones básicas
  const feedNoa = () => {
    if (isSleeping || noaDead) return;
    setCurrentAction("eating");
    setNoaState((p) => ({
      ...p,
      hunger: Math.min(p.hunger + 20, 100),
      energy: Math.min(p.energy + 10, 100),
      happiness: Math.min(p.happiness + 10, 100),
    }));
  };

  const petNoa = () => {
    if (isSleeping || noaDead) return;
    setCurrentAction("petting");
    setNoaState((p) => ({
      ...p,
      happiness: Math.min(p.happiness + 10, 100),
      energy: Math.max(p.energy - 10, 0),
    }));
  };

  const gaming = () => {
    if (isSleeping || noaDead) return;
    if (menuOptions[selectedMenuIndex]) {
      setCurrentAction("gaming");
      setNoaState((p) => ({
        ...p,
        happiness: Math.min(p.happiness + 10, 100),
        energy: Math.max(p.energy - 10, 0),
        hunger: Math.max(p.hunger - 10, 0),
      }));
    }
  };

  // Limpiar acción después de 2s (si no duerme ni está muerto)
  useEffect(() => {
    if (currentAction && !isSleeping && !noaDead) {
      const timer = setTimeout(() => setCurrentAction(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentAction, isSleeping, noaDead]);

  // —————————————————————————————————————————————————
  // D-PAD
  const handleMove = (dir: "left" | "right" | "up" | "down"): void => {
    if (noaDead) return;
    setMoveCommand(dir);
    setTimeout(() => setMoveCommand(null), 100);
  };

  // —————————————————————————————————————————————————
  // Cambiar pantalla “start” ↔ “main” ↔ “menu”
  const handleStart = () => {
    if (noaDead) return;
    if (screen === "catch" || screen === "space") {
      setStartCommand(true);
      setTimeout(() => setStartCommand(false), 100);
      return;
    }
    // Si estamos en “start” → “main”, si en “main” → “menu”
    if (screen === "start") {
      setScreen("main");
    } else if (screen === "main") {
      setScreen("menu");
    }
  };

  const handleBack = () => {
    if (noaDead) return;
    if (screen === "menu") {
      setScreen("main");
    } else if (screen === "catch" || screen === "space") {
      setScreen("menu");
    }
  };

  // === iniciar el minijuego seleccionado
const startSelectedGame = () => {
  if (selectedIcon === "settings") {
    setShowSoundModal(true);
    return;
  }

  if (noaDead || isSleeping) return;
  gaming();
  setScreen(menuOptions[selectedMenuIndex]);
};


  const changeMenuSelection = (dir: "left" | "right") => {
    setSelectedMenuIndex((i) =>
      dir === "left"
        ? (i - 1 + menuOptions.length) % menuOptions.length
        : (i + 1) % menuOptions.length
    );
  };

  // Estado emocional (sirve para alertas en 8 bit)
  const getEmotional = useCallback(() => {
    const { hunger, happiness, energy } = noaState;
    if (hunger < 20) return "hungry";
    if (energy < 20) return "tired";
    if (happiness < 20) return "sad";
    return "normal";
  }, [noaState]);

  const emotion = getEmotional();

  // 10) Control de música de fondo
  useEffect(() => {
    const normalBgm = document.getElementById("normal-bgm") as HTMLAudioElement;
    const warningBgm = document.getElementById(
      "warning-bgm"
    ) as HTMLAudioElement;

    if (emotion === "normal") {
      normalBgm.play();
      warningBgm.pause();
    } else {
      normalBgm.pause();
      warningBgm.play();
    }

    return () => {
      normalBgm.pause();
      warningBgm.pause();
    };
  }, [emotion]);

  // 11) Control de sonido de advertencia
  useEffect(() => {
    const warningSound = document.getElementById(
      "warning-sound"
    ) as HTMLAudioElement;

    if (emotion !== "normal") {
      warningSound.play();
    } else {
      warningSound.pause();
    }
    return () => {
      warningSound.pause();
    };
  }, [emotion]);
  // Aplicar el volumen a todos los sonidos
  useEffect(() => {
    const allSounds = [
      document.getElementById("normal-bgm") as HTMLAudioElement,
      document.getElementById("warning-bgm") as HTMLAudioElement,
      document.getElementById("warning-sound") as HTMLAudioElement,
    ];
    allSounds.forEach((audio) => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  return (
    <div className="gameboy">
      {/* -------------------- HEADER -------------------- */}
      <div className="gameboy-top relative">
        <img
          src="/images/logo/noa-console.png"
          alt="NOA Console"
          className="gameboy-logo mx-auto"
        />
        <audio id="warning-sound" src="/sounds/warning.mp3" />
        <audio id="normal-bgm" src="/sounds/sound-1.mp3" loop />
        <audio id="warning-bgm" src="/sounds/warning-music.mp3" loop />
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
        {/* === Press Start === */}
        {screen === "start" && !noaDead && (
          <div className="gameboy-top2 flex flex-col items-center justify-end h-full">
            <p className="press-start-text animate-blink pixel-font">
              Press Start
            </p>
          </div>
        )}

        {/* === Pantalla principal === */}
        {screen === "main" && !noaDead && (
          <>
            {/* HUD superior */}
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

            {/* === Alerta 8 bit según emoción === */}
            {emotion !== "normal" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-30">
                <div
                  className="pixel-font text-red-400 text-[10px] px-2 py-1 border border-red-400 rounded animate-shake"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                >
                  {emotion === "hungry" && "¡Noah tiene HAMBRE! 🍖"}
                  {emotion === "tired" && "¡Noah está CANSADO! 💤"}
                  {emotion === "sad" && "¡Noah está TRISTE! 🤕"}
                </div>
              </div>
            )}
          </>
        )}

        {/* === Menú de minijuegos === */}
        {screen === "menu" && !noaDead && (
          <div
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4"
            style={{ backdropFilter: "blur(2px)" }}
          >
            {isSleeping ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-30">
                <div
                  className="pixel-font text-red-400 text-[10px] px-2 py-1 border border-red-400 rounded animate-shake"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                >
                  <p className="pixel-font text-[12px]">
                    {" "}
                    💤 Noah está durmiendo… vuelve luego 💤
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg pixel-font mb-2">Juega con Noa!</h2>
                <div className="flex gap-4 mb-2">
                  {menuOptions.map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => setScreen(opt)}
                      className={`px-4 py-2 text-sm rounded ${
                        selectedMenuIndex === idx
                          ? "bg-white text-black"
                          : "bg-black/30"
                      } pixel-font`}
                    >
                      {opt === "catch" ? "Saltin rebotin" : "☄️ Meteoritos"}
                    </button>
                  ))}
                </div>
                <p className="text-xs pixel-font text-gray-200">
                  Usa ← → para cambiar y A para seleccionar
                </p>
              </>
            )}
          </div>
        )}

        {/* === MiniGameCatch === */}
        {screen === "catch" && !noaDead && !isSleeping && (
          <MiniGameCatch
            onExit={handleBack}
            moveCommand={moveCommand}
            startCommand={startCommand}
          />
        )}

        {/* === MiniGameSpace === */}
        {screen === "space" && !noaDead && !isSleeping && (
          <MiniGameSpace
            onExit={handleBack}
            moveCommand={moveCommand}
            startCommand={startCommand}
          />
        )}

        {/* === Game Over (Tamagotchi) === */}
        {noaDead && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white pixel-font">
            <img
              src="/images/rip.png"
              alt="ripNoa"
              className="w-[200px] h-[150px] mb-2 pixel-art"
            />
            <h1 className="text-sm font-bold mb-1 pixel-font">GAME OVER</h1>
            <p className="text-xs mb-2 pixel-font">
              Pulsa “RESET” para reiniciar
            </p>
          </div>
        )}
          {/* Icono de configuración en la parte inferior */}
      <div className="absolute bottom-2 right-2 z-20">
        <div
          className={`w-8 h-8 pixel-art cursor-pointer ${
            selectedIcon === "settings" ? "ring-2 ring-white" : ""
          }`}
          onClick={() => setShowSoundModal(true)}
        >
          <img
            src="/images/ajustes.png"
            alt="Config"
            className="w-full h-full"
          />
        </div>
      </div>
      </div>
      {/* -------------------- CONTROLES -------------------- */}
      <div className="gameboy-controls">
        <ActionButtons
          onFeed={feedNoa}
          onPet={petNoa}
          onSleep={() => {
            if (!isSleeping && !noaDead) setIsSleeping(true);
          }}
          onReset={() => {
            localStorage.removeItem("noaState");
            setNoaState(initialState);
            setScreen("start");
            setIsSleeping(false);
            setCurrentAction(null);
            setSelectedMenuIndex(0);
            setNoaDead(false);
          }}
          onStart={handleStart}
          onStartGame={startSelectedGame}
          onMove={(dir) => {
            if (screen === "menu") {
              changeMenuSelection(dir === "left" ? "left" : "right");
            } else if (screen === "main") {
              // Permitir selección del icono de config
              if (dir === "right" || dir === "down") {
                setSelectedIcon("settings");
              } else {
                setSelectedIcon("none");
              }
            }
            handleMove(dir);
          }}
          onBack={handleBack}
          isSleeping={isSleeping || noaDead}
          isStarting={screen === "start"}
          inMenu={["menu", "catch", "space"].includes(screen)}
        />
      </div>
    </div>
  );
}

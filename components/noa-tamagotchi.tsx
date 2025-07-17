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
import AudioSettingsModal from "./AudioSettingsModal";
import ShopModal, { shopItems } from "./shopModal";
import TamagoShopModal, { tamagoShopItems } from "./tamago-shop-modal";
import GamesModal from "./games-modal";

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
  const [screen, setScreen] = useState<"start" | "main" | "catch" | "space">(
    "start",
  );
  const [moveCommand, setMoveCommand] = useState<
    "left" | "right" | "up" | "down" | null
  >(null);
  const [startCommand, setStartCommand] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const menuOptions: ("catch" | "space")[] = ["catch", "space"];
  const [time, setTime] = useState(new Date());
  const [backgroundImage, setBackgroundImage] = useState<string>(
    "/images/back-grounds/day.png",
  );
  const [noaDead, setNoaDead] = useState(false);
  const [visible, setShowSoundModal] = useState(false);
  const [shopVisible, setShopVisible] = useState(false);
  const [tamagoShopVisible, setTamagoShopVisible] = useState(false);
  const [volume, setVolume] = useState(1); // de 0.0 a 1.0
  const [selectedIcon, setSelectedIcon] = useState<
    "none" | "settings" | "shop" | "games"
  >("none");
  const [gamesVisible, setGamesVisible] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const [shopIndex, setShopIndex] = useState(0);
  const [tamagoShopIndex, setTamagoShopIndex] = useState(0);
  const [coinsSpent, setCoinsSpent] = useState(0);
  const [shopConfirm, setShopConfirm] = useState<string | null>(null);
  const [tamagoShopConfirm, setTamagoShopConfirm] = useState<string | null>(
    null,
  );
  const [shopError, setShopError] = useState<string | null>(null);
  const [tamagoShopError, setTamagoShopError] = useState<string | null>(null);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [actionSoundEnabled, setActionSoundEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("coinsSpent");
    if (stored) setCoinsSpent(parseInt(stored, 10));
  }, []);

  const getTotalScore = useCallback(() => {
    try {
      const catchRecords = JSON.parse(
        localStorage.getItem("catchRecords") || "[]",
      );
      const spaceRecords = JSON.parse(
        localStorage.getItem("spaceRecords") || "[]",
      );
      const all = [...catchRecords, ...spaceRecords];
      return all.reduce((sum: number, r: any) => sum + (r.score || 0), 0);
    } catch {
      return 0;
    }
  }, []);

  const money = getTotalScore() - coinsSpent;

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
      JSON.stringify({ ...noaState, lastUpdated: Date.now() }),
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
    if (menuOptions[selectedGameIndex]) {
      setCurrentAction("gaming");
      setNoaState((p) => ({
        ...p,
        happiness: Math.min(p.happiness + 10, 100),
        energy: Math.max(p.energy - 10, 0),
        hunger: Math.max(p.hunger - 10, 0),
      }));
    }
  };

  const handleBuy = (id: string) => {
    const item = shopItems.find((i) => i.id === id);
    if (!item) return;
    if (money < item.price) {
      setShopError("❌ No tienes suficientes monedas");
      setShopConfirm(null);
      return;
    }
    const spent = coinsSpent + item.price;
    setCoinsSpent(spent);
    localStorage.setItem("coinsSpent", String(spent));
    setShopError(null);
    setShopConfirm(null);
  };

  const handleTamagoBuy = (id: string) => {
    const item = tamagoShopItems.find((i) => i.id === id);
    if (!item) return;
    if (money < item.price) {
      setTamagoShopError("❌ No tienes suficientes monedas");
      setTamagoShopConfirm(null);
      return;
    }
    const spent = coinsSpent + item.price;
    setCoinsSpent(spent);
    localStorage.setItem("coinsSpent", String(spent));
    setTamagoShopError(null);
    setTamagoShopConfirm(null);
  };

  const playActionSound = () => {
    if (!actionSoundEnabled) return;
    const el = document.getElementById(
      "action-sound",
    ) as HTMLAudioElement | null;
    if (el) {
      el.currentTime = 0;
      void el.play();
    }
  };

  const handleAButton = () => {
    if (visible) {
      playActionSound();
      if (audioIndex === 0) setVolume(Math.max(0, volume - 0.1));
      else if (audioIndex === 1) setVolume(Math.min(1, volume + 0.1));
      else if (audioIndex === 2) setVolume(0);
      else if (audioIndex === 3) setBgmEnabled((b) => !b);
      else if (audioIndex === 4) setActionSoundEnabled((b) => !b);
      return;
    }

    if (shopVisible) {
      playActionSound();
      if (shopConfirm) {
        handleBuy(shopConfirm);
      } else if (shopIndex === shopItems.length) {
        setShopVisible(false);
        setShopIndex(0);
        setShopError(null);
        setScreen("main");
      } else {
        setShopConfirm(shopItems[shopIndex].id);
      }
      return;
    }

    if (tamagoShopVisible) {
      playActionSound();
      if (tamagoShopConfirm) {
        handleTamagoBuy(tamagoShopConfirm);
      } else if (tamagoShopIndex === tamagoShopItems.length) {
        setTamagoShopVisible(false);
        setTamagoShopIndex(0);
        setTamagoShopError(null);
        setScreen("main");
      } else {
        setTamagoShopConfirm(tamagoShopItems[tamagoShopIndex].id);
      }
      return;
    }

    if (gamesVisible) {
      playActionSound();
      startSelectedGame();
      return;
    }

    if (selectedIcon === "settings") {
      setShowSoundModal(true);
      setAudioIndex(0);
      return;
    }

    if (selectedIcon === "shop") {
      setTamagoShopVisible(true);
      setTamagoShopIndex(0);
      return;
    }
    if (selectedIcon === "games") {
      setGamesVisible(true);
      setSelectedGameIndex(0);
      return;
    }
    playActionSound();
    feedNoa();
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
    playActionSound();
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
    // Si estamos en “start” → “main”
    if (screen === "start") {
      setScreen("main");
    }
  };

  const handleBack = () => {
    if (noaDead) return;
    playActionSound();
    if (shopVisible) {
      if (shopConfirm) {
        setShopConfirm(null);
      } else {
        setShopVisible(false);
        setShopIndex(0);
        setShopError(null);
        setScreen("main");
      }
    } else if (tamagoShopVisible) {
      if (tamagoShopConfirm) {
        setTamagoShopConfirm(null);
      } else {
        setTamagoShopVisible(false);
        setTamagoShopIndex(0);
        setTamagoShopError(null);
        setScreen("main");
      }
    } else if (visible) {
      setShowSoundModal(false);
      setAudioIndex(0);
    } else if (gamesVisible) {
      setGamesVisible(false);
    } else if (screen === "catch" || screen === "space") {
      setScreen("main");
      setGamesVisible(true);
    }
  };

  // === iniciar el minijuego seleccionado
  const startSelectedGame = () => {
    if (noaDead || isSleeping) return;
    gaming();
    setGamesVisible(false);
    setScreen(menuOptions[selectedGameIndex]);
  };

  const changeMenuSelection = (dir: "left" | "right") => {
    setSelectedGameIndex((i) =>
      dir === "left"
        ? (i - 1 + menuOptions.length) % menuOptions.length
        : (i + 1) % menuOptions.length,
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
      "warning-bgm",
    ) as HTMLAudioElement;

    if (!bgmEnabled) {
      normalBgm.pause();
      warningBgm.pause();
    } else if (emotion === "normal") {
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
  }, [emotion, bgmEnabled]);

  // 11) Control de sonido de advertencia
  useEffect(() => {
    const warningSound = document.getElementById(
      "warning-sound",
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
      document.getElementById("action-sound") as HTMLAudioElement,
    ];
    allSounds.forEach((audio) => {
      if (audio) {
        audio.volume = volume;
      }
    });
  }, [volume]);

  useEffect(() => {
    if (!actionSoundEnabled) {
      const a = document.getElementById(
        "action-sound",
      ) as HTMLAudioElement | null;
      if (a) a.pause();
    }
  }, [actionSoundEnabled]);

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
        <audio id="action-sound" src="/sounds/seleccionar.mp3" />
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
              <div className="pixel-font text-xs text-white  ">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Animación de Noa según estado */}
            <div className="relative z-10 flex flex-col items-center justify-end w-full p-2 pt-6">
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

        {/* Iconos inferiores */}
        {screen === "main" && (
          <div className="absolute bottom-2 left-2 right-2 z-20 flex flex-col items-center">
            {/* Display label when an icon is highlighted */}
            {selectedIcon !== "none" && (
              <span className="pixel-font text-xs text-white mb-1">
                {selectedIcon === "shop"
                  ? "Tienda"
                  : selectedIcon === "games"
                  ? "Games"
                  : "Settings"}
              </span>
            )}
            <div className="flex justify-between w-full">
              <div
                className={`w-[25px] h-[25px] pixel-art cursor-pointer flex items-center justify-center ${
                  selectedIcon === "shop"
                    ? "animate-pulse ring-2 ring-yellow-300 animate-pixel-fill"
                    : ""
                }`}
                onClick={() => {
                  setTamagoShopIndex(0);
                  setTamagoShopVisible(true);
                }}
              >
                <img
                  src="/images/icons/tienda.png"
                  alt="Shop"
                  className="w-full h-full"
                />
              </div>
              <div
                className={`w-[25px] h-[25px] pixel-art cursor-pointer flex items-center justify-center ${
                  selectedIcon === "games"
                    ? "animate-pulse ring-2 ring-yellow-300 animate-pixel-fill"
                    : ""
                }`}
                onClick={() => {
                  setGamesVisible(true);
                  setSelectedGameIndex(0);
                }}
              >
                <img
                  src="/images/icons/games.png"
                  alt="Games"
                  className="w-full h-full"
                />
              </div>
              <div
                className={`w-[25px] h-[25px] pixel-art cursor-pointer flex items-center justify-center ${
                  selectedIcon === "settings"
                    ? "animate-pulse ring-2 ring-yellow-300 animate-pixel-fill"
                    : ""
                }`}
                onClick={() => {
                  setAudioIndex(0);
                  setShowSoundModal(true);
                }}
              >
                <img
                  src="/images/icons/ajustes.png"
                  alt="Config"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        <AudioSettingsModal
          visible={visible}
          volume={volume}
          onVolumeChange={setVolume}
          onMute={() => setVolume(0)}
          bgmEnabled={bgmEnabled}
          onToggleBgm={() => setBgmEnabled((b) => !b)}
          sfxEnabled={actionSoundEnabled}
          onToggleSfx={() => setActionSoundEnabled((b) => !b)}
          selectedIndex={audioIndex}
        />
        <ShopModal
          visible={shopVisible}
          selectedIndex={shopIndex}
          money={money}
          confirming={shopConfirm}
          error={shopError}
        />
        <TamagoShopModal
          visible={tamagoShopVisible}
          selectedIndex={tamagoShopIndex}
          money={money}
          confirming={tamagoShopConfirm}
          error={tamagoShopError}
        />
        <GamesModal visible={gamesVisible} selectedIndex={selectedGameIndex} />
      </div>
      {/* -------------------- CONTROLES -------------------- */}
      <div className="gameboy-controls">
        <ActionButtons
          onFeed={handleAButton}
          onPet={
            shopVisible || tamagoShopVisible || visible ? handleBack : petNoa
          }
          onSleep={() => {
            if (!isSleeping && !noaDead) setIsSleeping(true);
          }}
          onReset={() => {
            localStorage.removeItem("noaState");
            setNoaState(initialState);
            setScreen("start");
            setIsSleeping(false);
            setCurrentAction(null);
            setSelectedGameIndex(0);
            setNoaDead(false);
          }}
          onStart={handleStart}
          onStartGame={startSelectedGame}
          onMove={(dir) => {
            if (visible) {
              const max = 4;
              if (dir === "left")
                setAudioIndex((i) => (i - 1 + max + 1) % (max + 1));
              else if (dir === "right")
                setAudioIndex((i) => (i + 1) % (max + 1));
            } else if (shopVisible) {
              const max = shopItems.length;
              if (dir === "up")
                setShopIndex((i) => Math.max(0, i - 1));
              else if (dir === "down")
                setShopIndex((i) => Math.min(max, i + 1));
            } else if (tamagoShopVisible) {
              const max = tamagoShopItems.length;
              if (dir === "up")
                setTamagoShopIndex((i) => Math.max(0, i - 1));
              else if (dir === "down")
                setTamagoShopIndex((i) => Math.min(max, i + 1));
            } else if (gamesVisible) {
              changeMenuSelection(dir === "left" ? "left" : "right");
            } else if (screen === "main") {
              const icons = ["shop", "games", "settings"] as const;
              if (dir === "left" || dir === "right") {
                const currentIndex = icons.indexOf(selectedIcon as any);
                const step = dir === "left" ? -1 : 1;
                const nextIndex =
                  currentIndex === -1
                    ? dir === "left"
                      ? icons.length - 1
                      : 0
                    : (currentIndex + step + icons.length) % icons.length;
                setSelectedIcon(icons[nextIndex]);
              } else if (dir === "up") {
                setSelectedIcon("none");
              } else if (dir === "down" && selectedIcon === "none") {
                setSelectedIcon("shop");
              }
            }
            handleMove(dir);
          }}
          onBack={handleBack}
          isSleeping={isSleeping || noaDead}
          isStarting={screen === "start"}
          inMenu={gamesVisible || ["catch", "space"].includes(screen)}
        />
      </div>
    </div>
  );
}

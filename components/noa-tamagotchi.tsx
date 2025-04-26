"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import NoaSprite, { Action, EmotionalState } from "./noa-sprite";
import StatusBars from "./status-bars";
import ActionButtons from "./action-buttons";
import MiniGame from "./mini-game";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { ToastProvider, ToastViewport } from "@/components/ui/toast";  // ← Importa el proveedor y el viewport

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
  const [currentAction, setCurrentAction] = useState<Action>(null);
  const [isSleeping, setIsSleeping] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useMobile();

  // 📥 Carga inicial y decaimiento
  useEffect(() => {
    const saved = localStorage.getItem("noaState");
    if (!saved) return;
    const parsed = JSON.parse(saved) as NoaState;
    const now = Date.now();
    const minutesPassed = (now - parsed.lastUpdated) / 60000;
    const decay = Math.floor(minutesPassed / 5);
    if (decay > 0) {
      parsed.hunger     = Math.max(parsed.hunger     - decay, 0);
      parsed.happiness  = Math.max(parsed.happiness  - decay, 0);
      parsed.energy     = Math.max(parsed.energy     - decay, 0);
      parsed.lastUpdated = now;
    }
    setNoaState(parsed);
  }, []);

  // 💾 Guardado
  useEffect(() => {
    localStorage.setItem(
      "noaState",
      JSON.stringify({ ...noaState, lastUpdated: Date.now() })
    );
  }, [noaState]);

  // ⏳ Decaimiento natural cada minuto
  useEffect(() => {
    const id = setInterval(() => {
      setNoaState((p) => ({
        ...p,
        hunger:     Math.max(p.hunger     - 1, 0),
        happiness:  Math.max(p.happiness  - 1, 0),
        energy:     Math.max(p.energy     - 1, 0),
        lastUpdated: Date.now(),
      }));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // 🧠 Estado emocional
  const getEmotionalState = useCallback<() => EmotionalState>(() => {
    const { hunger, happiness, energy } = noaState;
    if (isSleeping)                   return "sleeping";
    if (hunger < 30 && energy < 30)   return "hungry-tired";
    if (energy < 20)                  return "tired";
    if (hunger < 20)                  return "hungry";
    if (happiness < 20)               return "sad";
    if (happiness < 40)               return "bored";
    if (hunger < 40 || energy < 40)   return "worried";
    if (hunger > 80 && happiness > 80 && energy > 80) return "excited";
    return "normal";
  }, [noaState, isSleeping]);

  const emotionalState = getEmotionalState();

  // 😴 Dormir / despertar
  useEffect(() => {
    let id: NodeJS.Timeout;
    if (isSleeping) {
      toast({ title: "Noa se está durmiendo", description: "Dulces sueños" });
      id = setInterval(() => {
        setNoaState((p) => ({
          ...p,
          energy: Math.min(p.energy + 5, 100),
        }));
      }, 10000);
    } else {
      toast({ title: "Noa se ha despertado", description: "¡Buenos días!" });
    }
    return () => clearInterval(id);
  }, [isSleeping, toast]);

  // —–––––––––––––––––––––––––––––––––––––
  // Acciones
  // —–––––––––––––––––––––––––––––––––––––
  const feedNoa = () => {
    if (isSleeping) {
      toast({ title: "Noa está durmiendo", description: "No la molestes" });
      return;
    }
    setCurrentAction("eating");
    setTimeout(() => setCurrentAction(null), 2000);
    setNoaState((p) => ({
      ...p,
      hunger: Math.min(p.hunger + 20, 100),
      energy: Math.min(p.energy + 5, 100),
    }));
    toast({ title: "¡Noa está comiendo!", description: "Le encanta su comida" });
  };

  const playWithNoa = () => {
    if (isSleeping) {
      toast({ title: "Noa está durmiendo", description: "No la despiertes" });
      return;
    }
    if (noaState.energy < 20) {
      toast({ title: "Muy cansada", description: "Descansa antes de jugar" });
      return;
    }
    setCurrentAction("playing");
    setTimeout(() => setCurrentAction(null), 2000);
    setNoaState((p) => ({
      ...p,
      happiness: Math.min(p.happiness + 20, 100),
      energy:    Math.max(p.energy    - 15,  0),
      hunger:    Math.max(p.hunger    - 10,  0),
    }));
    toast({ title: "¡Noa está jugando!", description: "Le encanta su hueso" });
  };

  const petNoa = () => {
    if (isSleeping) {
      toast({ title: "Noa está durmiendo", description: "Deja que descanse" });
      return;
    }
    setCurrentAction("petting");
    setTimeout(() => setCurrentAction(null), 2000);
    setNoaState((p) => ({ ...p, happiness: Math.min(p.happiness + 10, 100) }));
    toast({ title: "Noa se siente querida", description: "¡Qué linda caricia!" });
  };

  const playGameWithNoa = () => {
    if (isSleeping) {
      toast({ title: "Noa está durmiendo", description: "Mejor no la despiertes" });
      return;
    }
    if (noaState.energy < 30) {
      toast({ title: "Muy cansada", description: "Necesita recargar energía" });
      return;
    }
    setTimeout(() => setIsGameOpen(true), 1500);
    toast({ title: "¡Minijuego!", description: "Atrapa las pelotas" });
  };

  const handleGameWin = () => {
    setIsGameOpen(false);
    setNoaState((p) => ({
      ...p,
      happiness: Math.min(p.happiness + 30, 100),
      energy:    Math.max(p.energy    - 20,  0),
      hunger:    Math.max(p.hunger    - 15,  0),
    }));
    toast({ title: "¡Genial!", description: "Noa disfrutó mucho" });
  };

  const toggleSleep = () => setIsSleeping((s) => !s);

  const resetNoa = () => {
    if (confirm("¿Reiniciar progreso?")) {
      setNoaState(initialState);
      setCurrentAction(null);
      setIsSleeping(false);
      localStorage.removeItem("noaState");
      toast({ title: "Reiniciada", description: "Nueva aventura" });
    }
  };

  return (
    <ToastProvider>
      <Card
        className={`w-full max-w-md p-6 ${
          isSleeping ? "bg-indigo-100" : "bg-pink-50"
        } border-2 border-pink-200 shadow-lg transition-colors duration-1000`}
      >
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-2xl font-bold text-pink-600">
            Noa{" "}
            {isSleeping
              ? "💤"
              : emotionalState === "hungry-tired"
              ? "😴🍽️"
              : "✨"}
          </h1>

          <NoaSprite
            emotionalState={emotionalState}
            currentAction={currentAction}
            hungerLevel={noaState.hunger}
            happinessLevel={noaState.happiness}
            energyLevel={noaState.energy}
          />

          <StatusBars noaState={noaState} />

          <ActionButtons
            onFeed={feedNoa}
            onPlay={playWithNoa}
            onPet={petNoa}
            onSleep={toggleSleep}
            onReset={resetNoa}
            onPlayGame={playGameWithNoa}
            isSleeping={isSleeping}
          />
        </div>
      </Card>

      <MiniGame
        isOpen={isGameOpen}
        onClose={() => setIsGameOpen(false)}
        onWin={handleGameWin}
      />

      {/* Aquí se renderizan los toasts */}
      <ToastViewport />
    </ToastProvider>
  );
}

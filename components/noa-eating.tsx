/* Archivo corregido: NoaTamagotchi con Supabase */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

import StatusBars from "./status-bars";
import ActionButtons from "./action-buttons";
import NoaWalking from "./noa-walking";
import NoaEating from "./noa-eating";
import NoaSleeping from "./noa-sleeping";
import { NoaPetting } from "./noa-petting";
import MiniGameCatch from "./mini-game-catch";
import MiniGameSpace from "./mini-game-space";
import AudioSettingsModal from "./AudioSettingsModal";
import ShopScreen from "./shop-screen";
import GamesModal from "./games-modal";

export type NoaState = {
  hunger: number;
  happiness: number;
  energy: number;
  lastUpdated: number;
};

export default function NoaTamagotchi() {
  const [noaState, setNoaState] = useState<NoaState>({
    hunger: 80,
    happiness: 80,
    energy: 80,
    lastUpdated: Date.now()
  });

  const [coinsEarned, setCoinsEarned] = useState(0);
  const [coinsSpent, setCoinsSpent] = useState(0);

  // Cargar estado desde Supabase al iniciar
  useEffect(() => {
    const loadStats = async () => {
      try {
        console.log('[noa-eating.loadStats]');
        const { data, error } = await supabase
          .from("noa_stats")
          .select("*")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latest = data[0];
          setNoaState({
            hunger: latest.hunger,
            happiness: latest.happiness,
            energy: latest.energy,
            lastUpdated: Date.now(),
          });
          setCoinsEarned(latest.coins_earned ?? 0);
          setCoinsSpent(latest.coins_spent ?? 0);
        }
        console.log('[noa-eating.loadStats] done');
      } catch (e) {
        console.error('Error loading noa stats', e);
      }
    };

    void loadStats();
  }, []);

  // Guardar estado en Supabase cada vez que cambia
  useEffect(() => {
    const saveStats = async () => {
      try {
        console.log('[noa-eating.saveStats] saving');
        await supabase.from("noa_stats").insert([
          {
            hunger: noaState.hunger,
            happiness: noaState.happiness,
            energy: noaState.energy,
            coins_earned: coinsEarned,
            coins_spent: coinsSpent,
          },
        ]);
        console.log('[noa-eating.saveStats] done');
      } catch (e) {
        console.error('Error saving noa stats', e);
      }
    };

    void saveStats();
  }, [noaState, coinsEarned, coinsSpent]);
  return (
    <div>
<StatusBars noaState={noaState} />
<ActionButtons
        onFeed={() => { }}
        onPet={() => { }}
        onSleep={() => { }}
        onReset={() => { }}
        onStart={() => { }}
        onMove={(dir) => { }}
        onBack={() => { }}
        isSleeping={false}
        isStarting={false}
        inMenu={false}
        onStartGame={() => { }}
      />

    </div>
  );
}

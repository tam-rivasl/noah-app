"use client";

import React from "react";
import { NoaState } from "./noa-tamagotchi";

interface Item {
  id: string;
  name: string;
  price: number;
  apply: (s: NoaState) => NoaState;
}

const items: Item[] = [
  {
    id: "food",
    name: "🍖 Comida",
    price: 50,
    apply: (s) => ({ ...s, hunger: Math.min(s.hunger + 20, 100) }),
  },
  {
    id: "toy",
    name: "🎁 Juguete",
    price: 50,
    apply: (s) => ({ ...s, happiness: Math.min(s.happiness + 20, 100) }),
  },
  {
    id: "pillow",
    name: "💤 Almohada",
    price: 50,
    apply: (s) => ({ ...s, energy: Math.min(s.energy + 20, 100) }),
  },
];

export default function StoreModal({
  points,
  onClose,
  onPurchase,
}: {
  points: number;
  onClose: () => void;
  onPurchase: (cost: number, apply: (s: NoaState) => NoaState) => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white pixel-font p-4" style={{ backdropFilter: "blur(2px)" }}>
      <h2 className="text-lg mb-2">Tienda</h2>
      <p className="text-xs mb-2">Puntos: {points}</p>
      <div className="flex flex-col gap-2 mb-2 w-40">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onPurchase(it.price, it.apply)}
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-xs rounded"
          >
            {it.name} - {it.price}
          </button>
        ))}
      </div>
      <button onClick={onClose} className="bg-gray-700 px-3 py-1 text-xs rounded">
        Cerrar
      </button>
    </div>
  );
}

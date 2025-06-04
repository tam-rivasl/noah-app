"use client";

import React from "react";

type ShopModalProps = {
  visible: boolean;
  onClose: () => void;
  onBuy: (itemId: string) => void;
  /** índice seleccionado por D‑Pad */
  selectedIndex: number;
  /** dinero actual del jugador */
  money: number;
};

const items = [
  { id: "food", name: "🍗 Comida", price: 10 },
  { id: "toy", name: "🧸 Juguete", price: 15 },
  { id: "bed", name: "🛏️ Cama nueva", price: 30 },
];

export default function ShopModal({
  visible,
  onClose,
  onBuy,
  selectedIndex,
  money,
}: ShopModalProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/80 z-50 flex items-end justify-center pb-2">
      <div
        className="bg-[#222] border-4 border-white pixel-font text-white p-4 w-[300px]"
        style={{
          boxShadow: "4px 4px 0px #000",
        }}
      >
        <h2 className="text-lg mb-2 border-b border-white pb-1">🛒 Tienda Pixel</h2>
        <p className="text-xs mb-2">Dinero disponible: {money} 🪙</p>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex justify-between items-center px-2 py-1 bg-black border border-white ${
                selectedIndex === idx ? "ring-2 ring-white" : ""
              }`}
            >
              <span>{item.name}</span>
              <button
                onClick={() => onBuy(item.id)}
                className="bg-green-500 text-black px-2 py-0.5 text-xs border border-white hover:bg-green-300"
              >
                Comprar ({item.price} 🪙)
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className={`mt-2 bg-red-600 px-4 py-1 text-xs border border-white hover:bg-red-400 ${
              selectedIndex === items.length ? "ring-2 ring-white" : ""
            }`}
          >
            ✖️ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";

export type ShopModalProps = {
  visible: boolean;
  onClose: () => void;
  onBuy: (itemId: string) => void;
  selectedIndex: number;
  money: number;
};

const items = [
  { id: "food", name: "🍗 Comida deliciosa", price: 10 },
  { id: "toy", name: "🧸 Juguete suave", price: 15 },
  { id: "bed", name: "🛏️ Cama nueva cómoda", price: 30 },
  { id: "hat", name: "🎩 Sombrero estiloso", price: 20 },
  { id: "snack", name: "🍪 Galleta mágica", price: 5 },
];

export default function ShopModal({
  visible,
  onClose,
  onBuy,
  selectedIndex,
  money,
}: ShopModalProps) {
  const [confirming, setConfirming] = useState<null | string>(null);
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  const visibleItems = [...items, { id: "exit", name: "✖️ Salir de la tienda", price: 0 }];
  const selectedItem = visibleItems[selectedIndex];

  const handleBuyConfirm = () => {
    if (!confirming) return;
    const item = items.find((i) => i.id === confirming);
    if (!item) return;

    if (money >= item.price) {
      onBuy(item.id);
      setConfirming(null);
      setError(null);
    } else {
      setError("❌ No tienes suficientes monedas");
    }
  };

  const start = Math.max(0, selectedIndex - 1);
  const end = start + 3;
  const visibleWindow = visibleItems.slice(start, end);

  return (
    <div className="absolute inset-0 bg-black/80 z-50  items-center justify-center p-2 overflow-y-auto">
      <div
        className="pixel-font bg-[#301020] text-yellow-200 border-4 border-pink-300 shadow-[6px_6px_0px_#000] p-4 w-full max-w-xs rounded-xl flex flex-col justify-between"
      >
        <div className="flex flex-col gap-2 overflow-hidden h-full">
          <div className="flex-shrink-0">
            <h2 className="text-lg border-b-2 border-pink-300 pb-1 text-pink-200 text-center">
              🛍️ Tienda Pixel
            </h2>
            <div className="text-center text-xs bg-pink-900 py-1 px-2 rounded mb-1">
              💰 Dinero disponible: <strong>{money}</strong> 🪙
            </div>
          </div>

          <div className="flex-grow overflow-hidden flex flex-col justify-between">
            {confirming ? (
              <div className="text-center space-y-2">
                <p>
                  ¿Comprar <strong>{items.find((i) => i.id === confirming)?.name}</strong> por {items.find((i) => i.id === confirming)?.price} 🪙?
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handleBuyConfirm}
                    className="bg-green-600 hover:bg-green-400 px-3 py-1 text-xs border border-white rounded shadow"
                  >
                    ✅ Sí
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    className="bg-red-600 hover:bg-red-400 px-3 py-1 text-xs border border-white rounded shadow"
                  >
                    ❌ No
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-60">
                {visibleWindow.map((item, idx) => {
                  const actualIndex = start + idx;
                  return (
                    <div
                      key={item.id}
                      className={`flex justify-between items-center px-3 py-2 bg-[#502030] border border-pink-300 rounded transition-all duration-150 ${
                        selectedIndex === actualIndex ? "ring-2 ring-pink-200 bg-pink-800" : ""
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.id !== "exit" && (
                        <span className="text-xs">{item.price} 🪙</span>
                      )}
                    </div>
                  );
                })}
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </div>
            )}

            <div className="mt-4 text-center flex-shrink-0">
              {selectedItem.id === "exit" ? (
                <button
                  onClick={onClose}
                  className="bg-red-600 px-4 py-1 text-xs border border-white hover:bg-red-400 rounded"
                >
                  ✖️ Cerrar
                </button>
              ) : (
                <button
                  onClick={() => setConfirming(selectedItem.id)}
                  className="bg-green-500 text-black px-4 py-1 text-xs border border-white hover:bg-green-300 rounded"
                >
                  A = Comprar
                </button>
              )}
              <p className="text-xs text-pink-300 mt-1">B = Volver</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

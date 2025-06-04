"use client";

import React from "react";

export type ShopModalProps = {
  visible: boolean;
  selectedIndex: number;
  money: number;
  /** id del ítem en proceso de confirmación */
  confirming: string | null;
  /** mensaje de error por falta de saldo */
  error: string | null;
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
  selectedIndex,
  money,
  confirming,
  error,
}: ShopModalProps) {

  if (!visible) return null;

  const visibleItems = [...items, { id: "exit", name: "✖️ Salir de la tienda", price: 0 }];
  const selectedItem = visibleItems[selectedIndex];


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
                <p className="text-xs text-pink-300">A = Sí, B = No</p>
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

            <div className="mt-4 text-center flex-shrink-0 space-y-1">
              {confirming ? null : (
                <p className="text-xs text-pink-300">
                  {selectedItem.id === "exit" ? "A = Salir" : "A = Comprar"}
                </p>
              )}
              <p className="text-xs text-pink-300">B = Volver</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

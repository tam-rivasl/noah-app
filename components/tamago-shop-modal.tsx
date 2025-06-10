"use client";

import React, { useEffect, useRef } from "react";

export type TamagoShopModalProps = {
  visible: boolean;
  selectedIndex: number;
  money: number;
  confirming: string | null;
  error: string | null;
};

export const tamagoShopItems = [
  { id: "snack", name: "🍖 Snack de proteína", price: 20 },
  { id: "ball", name: "⚽ Pelota divertida", price: 25 },
  { id: "mask", name: "😴 Antifaz para dormir", price: 35 },
];

export default function TamagoShopModal({
  visible,
  selectedIndex,
  money,
  confirming,
  error,
}: TamagoShopModalProps) {
  if (!visible) return null;

  const visibleItems = [
    ...tamagoShopItems,
    { id: "exit", name: "✖️ Salir de la tienda", price: 0 },
  ];
  // elemento seleccionado para resaltar
  const selectedItem = visibleItems[selectedIndex];

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const itemEl = listRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    // Centrar el ítem seleccionado sin ocultar la cabecera
    if (itemEl)
      itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-2 overflow-hidden">
      <div className="pixel-font bg-[#020] text-green-200 border-2 border-green-600 shadow-pixel p-3 w-full max-w-xs rounded flex flex-col justify-between">
        <div className="flex flex-col gap-2 h-full">
          <div className="flex-shrink-0">
            <h2 className="text-lg border-b border-green-600 pb-1 text-center">
              🛒 Tamago Shop
            </h2>
            <div className="text-center text-xs bg-green-900 py-1 px-2 rounded mb-1">
              💰 Dinero disponible: <strong>{money}</strong> 🪙
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-between">
            {confirming ? (
              <div className="text-center space-y-2">
                <p>
                  ¿Comprar{" "}
                  <strong>
                    {tamagoShopItems.find((i) => i.id === confirming)?.name}
                  </strong>{" "}
                  por {tamagoShopItems.find((i) => i.id === confirming)?.price}{" "}
                  🪙?
                </p>
                <p className="text-xs">A = Sí, B = No</p>
              </div>
            ) : (
              <div
                ref={listRef}
                className="overflow-y-auto flex flex-col gap-2 pb-2"
              >
                {visibleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`w-full flex-shrink-0 flex flex-col items-center px-2 py-2 bg-[#031] border border-green-600 rounded transition-all duration-150 text-center ${selectedIndex === idx ? "ring-2 ring-yellow-300 bg-green-800 animate-pixel-fill" : ""}`}
                  >
                    <span className="text-xs mb-1">{item.name}</span>
                    {item.id !== "exit" && (
                      <span className="text-[10px]">{item.price} 🪙</span>
                    )}
                  </div>
                ))}
                {error && <p className="text-red-400 text-xs ml-2">{error}</p>}
              </div>
              <div className="mt-2 text-center flex-shrink-0">
                <p className="text-xs">↑/↓ Navegar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

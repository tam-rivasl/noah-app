"use client";

import React, { useEffect, useRef } from "react";

export type ShopModalProps = {
  visible: boolean;
  selectedIndex: number;
  money: number;
  /** id del ítem en proceso de confirmación */
  confirming: string | null;
  /** mensaje de error por falta de saldo */
  error: string | null;
};

export const shopItems = [
  { id: "food", name: "🍗 Comida deliciosa", price: 10 },
  { id: "plant", name: "🌱 Planta decorativa", price: 15 },
  { id: "teddy", name: "🧸 Peluche suave", price: 20 },
  { id: "bed", name: "🛏️ Cama nueva cómoda", price: 30 },
];

export default function ShopModal({
  visible,
  selectedIndex,
  money,
  confirming,
  error,
}: ShopModalProps) {
  if (!visible) return null;

  const visibleItems = [
    ...shopItems,
    { id: "exit", name: "✖️ Salir de la tienda", price: 0 },
  ];
  const selectedItem = visibleItems[selectedIndex];

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const itemEl = listRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    if (itemEl) {
      itemEl.scrollIntoView({ inline: "center", behavior: "smooth" });
    }
  }, [selectedIndex]);

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-2 overflow-y-auto">
      <div className="pixel-font bg-[#001] text-blue-200 border-4 border-blue-400 shadow-[6px_6px_0px_#000] p-4 w-full max-w-xs rounded-xl flex flex-col justify-between">
        <div className="flex flex-col gap-2 overflow-hidden h-full">
          <div className="flex-shrink-0">
            <h2 className="text-lg border-b-2 border-blue-400 pb-1 text-blue-200 text-center">
              🛍️ Tienda Pixel
            </h2>
            <div className="text-center text-xs bg-blue-900 py-1 px-2 rounded mb-1">
              💰 Dinero disponible: <strong>{money}</strong> 🪙
            </div>
          </div>

          <div className="flex-grow overflow-hidden flex flex-col justify-between">
            {confirming ? (
              <div className="text-center space-y-2">
                <p>
                  ¿Comprar{" "}
                  <strong>
                    {shopItems.find((i) => i.id === confirming)?.name}
                  </strong>{" "}
                  por {shopItems.find((i) => i.id === confirming)?.price} 🪙?
                </p>
                <p className="text-xs text-blue-200">A = Sí, B = No</p>
              </div>
            ) : (
              <div ref={listRef} className="overflow-x-auto flex gap-2 pb-2">
                {visibleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`min-w-[90px] flex-shrink-0 flex flex-col items-center px-2 py-2 bg-[#113] border border-blue-400 rounded transition-all duration-150 text-center ${
                      selectedIndex === idx
                        ? "ring-2 ring-yellow-300 bg-blue-800 animate-pixel-fill"
                        : ""
                    }`}
                  >
                    <span className="text-xs mb-1">{item.name}</span>
                    {item.id !== "exit" && (
                      <span className="text-[10px]">{item.price} 🪙</span>
                    )}
                  </div>
                ))}
                {error && <p className="text-red-400 text-xs ml-2">{error}</p>}
              </div>
            )}

            <div className="mt-4 text-center flex-shrink-0 space-y-1">
              {confirming ? null : (
                <p className="text-xs text-blue-200">
                  {selectedItem.id === "exit" ? "A = Salir" : "A = Comprar"}
                </p>
              )}
              <p className="text-xs text-blue-200">B = Volver</p>
          </div>
        </div>
      </div>
        </div>
    </div>
  );
}

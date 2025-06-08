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
  { id: "toy", name: "🧸 Juguete suave", price: 15 },
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
      itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-2 overflow-y-auto">
      <div className="pixel-font bg-[#001] text-blue-200 border-4 border-blue-400 shadow-[6px_6px_0px_#000] p-4 w-full max-w-xs rounded-xl flex flex-col">
        <h2 className="text-lg border-b border-blue-400 pb-1 text-center mb-2">🛍️ Tienda Tamagotchi</h2>
        <div className="text-xs text-center bg-blue-900 py-1 px-2 rounded mb-2">💰 Dinero disponible: <strong>{money}</strong> 🪙</div>
        <div className="flex-grow overflow-hidden">
          {confirming ? (
            <div className="text-center space-y-2">
              <p>
                ¿Comprar{' '}
                <strong>{shopItems.find((i) => i.id === confirming)?.name}</strong>{' '}
                por {shopItems.find((i) => i.id === confirming)?.price} 🪙?
              </p>
              <p className="text-xs">A = Sí, B = No</p>
            </div>
          ) : (
            <div ref={listRef} className="overflow-y-auto flex flex-col gap-2 pb-2">
              {visibleItems.map((item, idx) => (
                <div
                  key={item.id}
                  className={`px-2 py-1 border border-blue-400 rounded bg-[#113] text-center transition-all ${
                    selectedIndex === idx ? 'ring-2 ring-yellow-300 bg-blue-800 animate-pixel-fill' : ''
                  }`}
                >
                  <span className="text-sm">{item.name}</span>
                  {item.id !== 'exit' && (
                    <span className="block text-[10px]">{item.price} 🪙</span>
                  )}
                </div>
              ))}
              {error && <p className="text-red-400 text-xs ml-2">{error}</p>}
            </div>
          )}

          <div className="mt-2 text-center space-y-1">
            {confirming ? null : (
              <p className="text-xs">{selectedItem.id === 'exit' ? 'A = Salir' : 'A = Comprar'}</p>
            )}
            <p className="text-xs">B = Volver</p>
          </div>
        </div>
      </div>
    </div>
  );
}

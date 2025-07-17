"use client";

import React, { useEffect, useRef } from "react";
/** Props para la pantalla de la tienda */
export type ShopScreenProps = {
  visible: boolean;
  selectedIndex: number;
  money: number;
  /** Categoría actualmente elegida. Null muestra lista de categorías */
  category: "food" | "toys" | "themes" | null;
  /** id del ítem en proceso de confirmación */
  confirming: string | null;
  /** mensaje de error por falta de saldo */
  error: string | null;
};

export const shopItems = [
  {
    id: "food",
    name: "Comida deliciosa",
    price: 5,
    image: "/images/shop/food.png",
    category: "food",
  },
  {
    id: "plant",
    name: "Planta decorativa",
    price: 15,
    image: "/images/shop/plant.png",
    category: "toys",
  },
  {
    id: "teddy",
    name: "Peluche suave",
    price: 20,
    image: "/images/shop/teddy.png",
    category: "toys",
  },
  {
    id: "bed",
    name: "Cama nueva cómoda",
    price: 40,
    image: "/images/shop/bed.png",
    category: "themes",
  },
] as const;

/**
 * Pantalla completa de la tienda.
 * Se muestra en lugar de la pantalla principal y no como modal.
 */
export default function ShopScreen({
  visible,
  selectedIndex,
  money,
  category,
  confirming,
  error,
}: ShopScreenProps) {
  if (!visible) return null;

  const categories = [
    { id: "food", name: "Food" },
    { id: "toys", name: "Toys" },
    { id: "themes", name: "Themes" },
  ] as const;

  const visibleItems = category
    ? [
        ...shopItems.filter((i) => i.category === category),
        { id: "back", name: "← Volver", price: 0, category: "back" },
      ]
    : [
        ...categories.map((c) => ({
          id: c.id,
          name: c.name,
          price: 0,
          category: "category",
        })),
        { id: "exit", name: "✖️ Salir de la tienda", price: 0, category: "exit" },
      ];

  const selectedItem = visibleItems[selectedIndex];

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const itemEl = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`,
    ) as HTMLElement | null;
    if (itemEl) {
      itemEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  return (
    <div className="absolute inset-0 z-40 pixel-font bg-[#001] text-blue-200 border-4 border-blue-400 shadow-[6px_6px_0px_#000] p-4 flex flex-col overflow-hidden">
      <div className="flex flex-col gap-2 overflow-hidden flex-1">
        <div className="flex-shrink-0">
          <h2 className="text-lg border-b-2 border-blue-400 pb-1 text-center">
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
                ¿Comprar {" "}
                <strong>
                  {shopItems.find((i) => i.id === confirming)?.name}
                </strong>{" "}
                por {shopItems.find((i) => i.id === confirming)?.price} 🪙?
              </p>
              <p className="text-xs">A = Sí, B = No</p>
            </div>
          ) : (
            <div ref={listRef} className="overflow-y-auto flex flex-col gap-2 pb-2">
              {visibleItems.map((item, idx) => (
                <div
                  key={item.id}
                  data-index={idx}
                  className={`min-w-[90px] flex-shrink-0 flex flex-col items-center px-2 py-2 bg-[#113] border border-blue-400 rounded transition-all duration-150 text-center ${
                    selectedIndex === idx
                      ? "ring-2 ring-yellow-300 bg-blue-800 animate-pixel-fill"
                      : ""
                  }`}
                >
                  {"image" in item && item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 mb-1 pixel-art"
                    />
                  )}
                  <span className="text-xs mb-1">{item.name}</span>
                  {item.price > 0 && item.category !== "category" && (
                    <span className="text-[10px]">{item.price} 🪙</span>
                  )}
                </div>
              ))}
              {error && <p className="text-red-400 text-xs ml-2">{error}</p>}
            </div>
          )}

          <div className="mt-4 text-center flex-shrink-0 space-y-1">
            {confirming ? null : (
              <p className="text-xs">
                {selectedItem.id === "exit"
                  ? "A = Salir"
                  : selectedItem.id === "back"
                  ? "A = Volver"
                  : category
                  ? "A = Comprar"
                  : "A = Seleccionar"}
              </p>
            )}
            <p className="text-xs">B = Volver</p>
          </div>
        </div>
      </div>
    </div>
  );
}

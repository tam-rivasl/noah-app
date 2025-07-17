"use client";

import React, { useEffect, useRef } from "react";

export type ShopItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
};

export type ShopModalProps = {
  visible: boolean;
  selectedIndex: number;
  money: number;
  /** id del ítem en proceso de confirmación */
  confirming: string | null;
  /** mensaje de error por falta de saldo */
  error: string | null;
};

export const shopItems: ShopItem[] = [
  { id: "food", name: "🍗 Comida deliciosa", price: 10, category: "food" },
  { id: "plant", name: "🌱 Planta decorativa", price: 15, category: "toys" },
  { id: "teddy", name: "🧸 Peluche suave", price: 20, category: "toys" },
  { id: "bed", name: "🛏️ Cama nueva cómoda", price: 30, category: "themes" },
  { id: "theme-asd", name: "Tema Asd", price: 25, category: "themes", image: "/images/back-grounds/asd.png" },
  {
    id: "theme-azul-con-patitas",
    name: "Azul con patitas",
    price: 25,
    category: "themes",
    image: "/images/back-grounds/azul-con-patitas.png",
  },
  {
    id: "theme-azul-patitas",
    name: "Azul patitas",
    price: 25,
    category: "themes",
    image: "/images/back-grounds/azul-patitas.png",
  },
  { id: "theme-day", name: "Tema Día", price: 25, category: "themes", image: "/images/back-grounds/day.png" },
  { id: "theme-game-boy", name: "Game Boy", price: 25, category: "themes", image: "/images/back-grounds/game-boy.png" },
  { id: "theme-game-jump", name: "Game Jump", price: 25, category: "themes", image: "/images/back-grounds/game-jump.png" },
  { id: "theme-night", name: "Tema Noche", price: 25, category: "themes", image: "/images/back-grounds/night.png" },
  { id: "theme-tarde", name: "Tema Tarde", price: 25, category: "themes", image: "/images/back-grounds/tarde.png" },
  { id: "theme-texture4", name: "Texture", price: 25, category: "themes", image: "/images/back-grounds/texture4.png" },
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
    { id: "exit", name: "✖️ Salir de la tienda", price: 0, category: "exit" },
  ];
  const categoryLabels: Record<string, string> = {
    food: "Food",
    toys: "Toys",
    themes: "Themes",
  };
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
              <>
                <div ref={listRef} className="overflow-y-auto flex flex-col gap-2 pb-2">
                  {(() => {
                    let currentCategory: string | null = null;
                    let index = -1;
                    const elements: React.ReactNode[] = [];
                  for (const item of visibleItems) {
                    index += 1;
                    if (item.category !== currentCategory && item.category !== "exit") {
                      currentCategory = item.category;
                      elements.push(
                        <h3
                          key={"header-" + currentCategory}
                          className="text-left text-sm font-bold mt-1 mb-1 uppercase"
                        >
                          {categoryLabels[currentCategory] || currentCategory}
                        </h3>,
                      );
                    }
                    elements.push(
                      <div
                        key={item.id}
                        data-index={index}
                        className={`min-w-[90px] flex-shrink-0 flex flex-col items-center px-2 py-2 bg-[#113] border border-blue-400 rounded transition-all duration-150 text-center ${
                          selectedIndex === index
                            ? "ring-2 ring-yellow-300 bg-blue-800 animate-pixel-fill"
                            : ""
                        }`}
                      >
                        <span className="text-xs mb-1">{item.name}</span>
                        {item.id !== "exit" && (
                          <span className="text-[10px]">{item.price} 🪙</span>
                        )}
                      </div>,
                    );
                  }
                  if (error) {
                    elements.push(
                      <p key="error" className="text-red-400 text-xs ml-2">
                        {error}
                      </p>,
                    );
                  }
                  return elements;
                })()}
                </div>
                {selectedItem.category === "themes" && selectedItem.image && (
                  <div className="flex justify-center mt-2">
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-20 h-20 object-cover border border-blue-400"
                    />
                  </div>
                )}
              </>
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

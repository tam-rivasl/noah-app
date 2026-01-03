"use client";

import React, { useEffect, useMemo, useRef } from "react";

export type ShopCategory = "food" | "toys" | "theme" | "decoration";
export type ShopMenuOption = ShopCategory | "inventory";

export type ShopItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ShopCategory;
  image_url: string;
};

export type ShopScreenProps = {
  onBuy: (itemId: string) => void;
  visible: boolean;
  selectedIndex: number;
  money: number;
  category: ShopMenuOption | null;
  confirming: string | null;
  error: string | null;
  items: ShopItem[];
  inventoryItems: ShopItem[];
  activeItemIds: string[];
  maxActiveItems: number;
};

const categoryThumbs: Record<ShopMenuOption, string> = {
  food: "/images/shop-items/food/orange-juice.png",
  toys: "/images/shop-items/toys/dragoncito.png",
  theme: "/images/shop-items/theme/game-boy.png",
  decoration: "/images/shop-items/decoration/plantita.png",
  inventory: "/images/icons/shop.png",
};

type DisplayItem =
  | ShopItem
  | {
      id: "back" | "exit";
      name: string;
      price: 0;
      category: "navigation" | "exit";
      image_url?: string;
    }
  | {
      id: ShopMenuOption;
      name: string;
      price: 0;
      category: "category";
      image_url: string;
    };

export default function ShopScreen({
  visible,
  selectedIndex,
  money,
  category,
  confirming,
  error,
  items,
  inventoryItems,
  activeItemIds,
  maxActiveItems,
  onBuy,
}: ShopScreenProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedIndex]);

  const categoryOptions: DisplayItem[] = useMemo(
      () => [
        {
          id: "inventory",
          name: "Inventario",
          price: 0,
          category: "category",
          image_url: categoryThumbs.inventory,
        },
        {
          id: "food",
          name: " Comida",
          price: 0,
          category: "category",
          image_url: categoryThumbs.food,
        },
        {
          id: "toys",
          name: "Juguetes",
          price: 0,
          category: "category",
          image_url: categoryThumbs.toys,
        },
        {
          id: "theme",
          name: "Temas",
          price: 0,
          category: "category",
          image_url: categoryThumbs.theme,
        },
        {
          id: "decoration",
          name: "Decoracion",
          price: 0,
          category: "category",
          image_url: categoryThumbs.decoration,
        },
        {
          id: "exit",
          name: "Salir",
          price: 0,
          category: "exit",
          image_url: "/images/icons/tienda.png",
        },
      ],
      [],
  );

  const isInventoryView = category === "inventory";

  const filteredItems: ShopItem[] = useMemo(() => {
    if (!category) return [];
    if (category === "inventory") return inventoryItems;
    return items.filter((i) => i.category === category);
  }, [items, category, inventoryItems]);

  const displayList: DisplayItem[] = category
      ? [
        ...filteredItems,
        {
          id: "back",
          name: "Volver",
          price: 0,
          category: "navigation",
          image_url: "/images/icons/tienda.png",
        },
      ]
      : categoryOptions;

  const title = isInventoryView ? "Inventario" : "Tienda Pixel";

  if (!visible) return null;

  if (confirming) {
    const item = items.find((i) => i.id === confirming);
    return (
      <div className="absolute inset-0 bg-[#113] z-30 text-blue-200 pixel-font p-3 flex flex-col items-center justify-center border-2 border-blue-400">
        <h2 className="text-center mb-2 text-sm">Confirmar compra</h2>
        <p className="text-center text-xs mb-2">
          Comprar <strong>{item?.name ?? "este item"}</strong> por{" "}
          <strong>{item?.price ?? 0} 🪙</strong>?
        </p>
        <p className="text-[10px]">A = Sí &nbsp; B = No</p>
        <button
          onClick={() => confirming && onBuy(confirming)}
          className="hidden"
          id="confirm-buy-trigger"
        ></button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#113] z-20 text-blue-200 pixel-font p-2 border-2 border-blue-400 flex flex-col overflow-hidden">
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30 pointer-events-none">
          <div
            className="pixel-font text-red-400 text-[10px] px-2 py-1 border border-red-400 rounded animate-shake text-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          >
            {error}
          </div>
        </div>
      )}
      <h2 className="text-center text-sm mb-1">{title}</h2>

      <div className="text-center text-[10px] mb-2">
        {isInventoryView ? (
            <>
              En pantalla: <strong>{activeItemIds.length}</strong>/{maxActiveItems}
            </>
        ) : (
            <>
            Dinero: <strong>{money}</strong>  💰 
            </>
        )}
      </div>

      <div
        ref={listRef}
        className="flex-grow overflow-y-auto flex flex-col gap-2 pb-2"
      >
        {displayList.length === 0 && (
          <p className="text-center text-xs text-blue-300">
            No hay items disponibles.
          </p>
        )}
        {displayList.map((item, idx) => (
          <div
            key={item.id}
            data-index={idx}
            className={`flex items-center px-2 py-1 rounded transition-all duration-100 ${
              selectedIndex === idx
                ? "bg-blue-800 ring-2 ring-yellow-300 animate-pixel-fill"
                : "hover:bg-blue-700"
            }`}
          >
            {"image_url" in item && item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="w-8 h-8 mr-2 pixel-art"
              />
            ) : (
              <div className="w-8 h-8 mr-2" />
            )}
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div>{item.name}</div>
                {isInventoryView &&
                    item.id !== "back" &&
                    "id" in item &&
                    activeItemIds.includes(item.id) && (
                        <span className="text-[10px] text-green-300">
                          En pantalla
                        </span>
                    )}
                {isInventoryView &&
                    item.id !== "back" &&
                    "id" in item &&
                    !activeItemIds.includes(item.id) && (
                        <span className="text-[10px] text-blue-300">
                          Guardado
                        </span>
                    )}
              </div>
              {isInventoryView && item.id !== "back" && "price" in item ? (
                  <div className="text-[10px] text-blue-300 capitalize">
                    {item.category}
                  </div>
              ) : (
                  "price" in item &&
                  item.price > 0 && (
                      <div className="text-[10px] text-blue-300">
                        {item.price}  🪙
                      </div>
                  )
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-red-500 text-[10px] px-2">{error}</p>}
      </div>

      <p className="text-center text-[10px] mt-1">
        {isInventoryView
            ? "A = Mostrar/Ocultar en pantalla - B = Volver"
            :     "Usa D-Pad para moverte • A = Seleccionar • B = Volver"}
      </p>
    </div>
  );
}

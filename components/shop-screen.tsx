"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ajusta si usas otra ruta

export type ShopScreenProps = {
    onBuy: (itemId: string) => void;
    visible: boolean;
    selectedIndex: number;
    money: number;
    category: "food" | "toys" | "theme" | "decoration" | null;
    confirming: string | null;
    error: string | null;

};

// Interfaz para los ítems cargados desde la base de datos
interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image_url: string;
}

export default function ShopScreen({
                                       visible,
                                       selectedIndex,
                                       money,
                                       category,
                                       confirming,
                                       error,
                                       onBuy,
                                   }: ShopScreenProps) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // 🔁 Cargar items desde Supabase cuando se muestra la tienda
    useEffect(() => {
        if (!visible) return;

        const fetchItems = async () => {
            try {
                const { data, error } = await supabase
                    .from("noa_shop_items")
                    .select("*")
                   // .order("name");
                console.log("data: ", data);
                if (error) {
                    console.error("Error al cargar la tienda:", error);
                    setLoadError("No se pudo cargar la tienda.");
                } else {
                    setItems(data || []);
                    setLoadError(null);
                }
            } catch (err) {
                console.error("Error inesperado en tienda:", err);
                setLoadError("Error desconocido al cargar tienda.");
            }
        };

        fetchItems();
    }, [visible]);

    // 🌀 Asegura que el ítem seleccionado esté centrado visualmente
    useEffect(() => {
        const el = listRef.current?.querySelector<HTMLElement>(
            `[data-index="${selectedIndex}"]`
        );
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, [selectedIndex]);

    if (!visible) return null;

    // ✅ Si se está confirmando la compra
    if (confirming) {
        const item = items.find((i) => i.id === confirming);
        return (
            <div className="absolute inset-0 bg-[#113] z-30 text-blue-200 pixel-font p-3 flex flex-col items-center justify-center border-2 border-blue-400">
                <h2 className="text-center mb-2 text-sm">Confirmar compra</h2>
                <p className="text-center text-xs mb-2">
                    ¿Comprar <strong>{item?.name}</strong> por{" "}
                    <strong>{item?.price} 🪙</strong>?
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

    // 🧭 Construir lista visible de ítems o categorías
    const filteredItems = items?.filter((i) => i.category === category) ?? [];

    const displayList = category
        ? [
            ...filteredItems,
            {
                id: "back",
                name: "← Volver",
                description: "",
                price: 0,
                category: "navigation",
                image_url: "",
            },
        ]

        : [
            { id: "food", name: "🍔 Comida", description: "", price: 0, category: "category", image_url: "" },
            { id: "toys", name: "🧸 Juguetes", description: "", price: 0, category: "category", image_url: "" },
            { id: "theme", name: "🎮 Temas", description: "", price: 0, category: "category", image_url: "" },
            { id: "decoration", name: "🏠 Decoración", description: "", price: 0, category: "category", image_url: "" },
            { id: "exit", name: "✖️ Salir", description: "", price: 0, category: "exit", image_url: "" },
        ];

    return (
        <div className="absolute inset-0 bg-[#113] z-20 text-blue-200 pixel-font p-2 border-2 border-blue-400 flex flex-col overflow-hidden">
            <h2 className="text-center text-sm mb-1">🛍️ Tienda Pixel</h2>

            <div className="text-center text-[10px] mb-2">
                💰 Dinero: <strong>{money}</strong>
            </div>

            {/* 🧾 Lista desplazable de ítems */}
            <div
                ref={listRef}
                className="flex-grow overflow-y-auto flex flex-col gap-2 pb-2"
            >
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
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-8 h-8 mr-2 pixel-art"
                            />
                        )}
                        <div className="flex-1 text-xs">
                            <div>{item.name}</div>
                            {item.price > 0 && (
                                <div className="text-[10px] text-blue-300">
                                    {item.price} 🪙
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {error && <p className="text-red-500 text-[10px] px-2">{error}</p>}
                {loadError && <p className="text-red-400 text-[10px] px-2">{loadError}</p>}
            </div>

            <p className="text-center text-[10px] mt-1">
                Usa D-Pad para moverte • A = Seleccionar • B = Volver
            </p>
        </div>
    );
}

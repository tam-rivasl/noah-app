"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface ScoreBoardProps {
  gameType: string;
  onClose: () => void;
  embedded?: boolean;
  moveCommand?: "up" | "down" | "left" | "right" | null;
  startCommand?: boolean;
}

interface RecordEntry {
  id: string;
  date: string;
  time: string;
  score: number;
  gameType: string;
}

export default function ScoreBoard({
                                     gameType,
                                     onClose,
                                     embedded = false,
                                     moveCommand,
                                     startCommand,
                                   }: ScoreBoardProps) {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchScores = async () => {
      const { data, error } = await supabase
          .from("game_scores")
          .select("*")
          .eq("game_type", gameType)
          .order("score", { ascending: false })
          .limit(10);

      if (error) return console.error("Error al cargar scores:", error.message);

      const formatted = data.map((item) => ({
        id: item.id,
        date: item.date ?? new Date(item.created_at).toLocaleDateString("es-ES"),
        time: item.time ?? new Date(item.created_at).toLocaleTimeString("es-ES"),
        score: item.score,
        gameType: item.game_type,
      }));
      setRecords(formatted);
    };

    fetchScores();
  }, [gameType]);

  // 🎮 Navegación con D-Pad y botón A para eliminar
  useEffect(() => {
    if (!moveCommand) return;

    if (moveCommand === "down") {
      setSelectedIndex((i) => Math.min(i + 1, records.length - 1));
    } else if (moveCommand === "up") {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (moveCommand === "right") {
      // A = Borrar historial
      if (!confirmDelete) {
        setConfirmDelete(true);
      } else {
        handleDelete();
      }
    } else if (moveCommand === "left") {
      // B = Cancelar / cerrar
      if (confirmDelete) {
        setConfirmDelete(false);
      } else {
        onClose();
      }
    }
  }, [moveCommand]);

  // 🔃 Scroll automático al ítem seleccionado
  useEffect(() => {
    const itemEl = listRef.current?.querySelector(
        `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null;

    if (itemEl) {
      itemEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedIndex]);

  // 🗑️ Eliminar puntajes
  const handleDelete = async () => {
    const { error } = await supabase
        .from("game_scores")
        .delete()
        .eq("game_type", gameType);

    if (error) {
      console.error("❌ Error al eliminar:", error.message);
    } else {
      setRecords([]);
      setSelectedIndex(0);
      setConfirmDelete(false);
      console.log("✅ Scores eliminados");
    }
  };

  return (
      <div
          className={`${
              embedded ? "absolute" : "fixed"
          } inset-0 bg-black/80 flex items-center justify-center z-50`}
      >
        <div className="bg-[#111] border-4 border-blue-600 rounded w-[260px] h-[220px] text-white px-2 py-2 flex flex-col pixel-font text-[10px]">
          <h2 className="text-center text-[11px] font-bold mb-1">
            Historial: {gameType}
          </h2>

          <div
              ref={listRef}
              className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
          >
            {records.length === 0 ? (
                <p className="text-center text-gray-400 mt-4">
                  No hay registros aún.
                </p>
            ) : (
                <div className="w-full space-y-[2px]">
                  <div className="grid grid-cols-4 gap-x-1 border-b border-gray-700 pb-1 font-semibold">
                    <span>#</span>
                    <span>Fecha</span>
                    <span>Hora</span>
                    <span>Pts</span>
                  </div>
                  {records.map((r, idx) => (
                      <div
                          key={r.id}
                          data-index={idx}
                          className={`grid grid-cols-4 gap-x-1 items-center border-b border-gray-800 py-[2px]
                  ${selectedIndex === idx ? "bg-blue-800 text-yellow-200" : ""}`}
                      >
                  <span className="flex items-center gap-[2px]">
                    {idx + 1}
                    {idx === 0 && "👑"}
                    {idx === 1 && "🥈"}
                    {idx === 2 && "🥉"}
                  </span>
                        <span>{r.date}</span>
                        <span>{r.time}</span>
                        <span>{r.score}</span>
                      </div>
                  ))}
                </div>
            )}
          </div>

          <div className="text-center text-[8px] mt-1 text-gray-400">
            ▲▼ Navegar | ▶ {confirmDelete ? "Confirmar borrado" : "Borrar"} | B: {confirmDelete ? "Cancelar" : "Volver"}
          </div>
        </div>
      </div>
  );
}

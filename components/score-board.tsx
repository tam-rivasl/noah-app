"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface RecordEntry {
  id: string;
  date: string;
  time: string;
  score: number;
  gameType: string;
}

interface ScoreBoardProps {
  onClose: () => void;
  gameType?: string; // ← filtro opcional por tipo de juego
  onReset?: () => void; // callback opcional para reset externo
}

export default function ScoreBoard({ onClose, gameType, onReset }: ScoreBoardProps) {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const fetchScores = async () => {
      let query = supabase.from("game_scores").select("*");

      if (gameType) {
        query = query.eq("game_type", gameType);
      }

      const { data, error } = await query.order("time", { ascending: false }).limit(10);

      if (error) {
        console.error("Error fetching scores:", error.message);
        return;
      }

      const formatted: RecordEntry[] = data.map((item) => ({
        id: item.id,
        date: item.date ?? new Date(item.created_at).toLocaleDateString("es-ES"),
        time: item.time ?? new Date(item.created_at).toLocaleTimeString("es-ES"),
        score: item.score,
        gameType: item.game_type,
      }));

      setRecords(formatted);
    };

    fetchScores();

    const channel = supabase
      .channel("scores")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_scores" },
        fetchScores,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameType]);

  const handleReset = async () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }

    const query = gameType
      ? supabase.from("game_scores").delete().eq("game_type", gameType)
      : supabase.from("game_scores").delete().neq("id", "");

    const { error } = await query;

    if (error) {
      console.error("Error deleting scores:", error.message);
    } else {
      setRecords([]);
      setConfirm(false);
      console.log("Puntuaciones eliminadas.");
      onReset?.(); // callback opcional
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-2">
          {gameType ? `Historial de "${gameType}"` : "Historial de puntuaciones"}
        </h2>

        {records.length === 0 ? (
          <p className="text-sm text-center text-gray-300">No hay puntuaciones registradas.</p>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2 text-sm font-semibold mb-1 border-b border-gray-600 pb-1">
              <span>Pos.</span>
              <span>Juego</span>
              <span>Fecha</span>
              <span>Hora</span>
              <span>Puntos</span>
            </div>
            {records.map((r, idx) => (
              <div key={r.id} className="grid grid-cols-5 gap-2 text-sm items-center">
                <span className="flex items-center">
                  {idx + 1}°
                  {idx === 0 && <span className="ml-1">👑</span>}
                  {idx === 1 && <span className="ml-1">🥈</span>}
                  {idx === 2 && <span className="ml-1">🥉</span>}
                </span>
                <span className="capitalize">{r.gameType}</span>
                <span>{r.date}</span>
                <span>{r.time}</span>
                <span>{r.score}</span>
              </div>
            ))}
          </>
        )}

        <div className="flex justify-between items-center mt-4 gap-2">
          <button
            onClick={handleReset}
            className="flex-1 bg-red-700 hover:bg-red-600 transition-transform duration-200 active:scale-95 px-2 py-1 rounded text-sm"
          >
            {confirm ? "Confirmar borrado" : "Borrar historial"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 transition-transform duration-200 active:scale-95 px-2 py-1 rounded text-sm"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}

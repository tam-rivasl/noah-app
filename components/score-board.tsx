"use client";

import { useState } from "react";

export interface RecordEntry {
  date: string;
  time: string;
  score: number;
}

interface ScoreBoardProps {
  records: RecordEntry[];
  onClose: () => void;
  onReset: () => void;
}

export default function ScoreBoard({ records, onClose, onReset }: ScoreBoardProps) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20 text-white pixel-font p-3">
      <div className="relative bg-black/70 border border-white p-2 rounded w-60 text-[10px]">
        <h2 className="text-center text-sm mb-2 font-bold">Top 10 Score</h2>
        {/* Headers */}
        <div className="grid grid-cols-[1.4rem_auto_auto_auto] gap-x-2 bg-white/20 px-2 py-1 rounded font-semibold mb-1">
          <span className="text-center">#</span>
          <span>Fecha</span>
          <span>Tiempo</span>
          <span>Puntos</span>
        </div>
        <div className="max-h-32 overflow-y-auto">
          {records.map((r, idx) => (
            <div
              key={idx}
              data-testid="score-row"
              className="grid grid-cols-[1.4rem_auto_auto_auto] gap-x-2 items-center border-t border-white/30 px-2 py-1"
            >
              <span className="flex items-center whitespace-nowrap">
                {idx + 1}°
                {idx === 0 && <span className="ml-1">👑</span>}
                {(idx === 1 || idx === 2) && idx !== 0 && (
                  <span className="ml-1">⭐</span>
                )}
              </span>
              <span className="whitespace-nowrap">{r.date}</span>
              <span className="whitespace-nowrap">{r.time}</span>
              <span className="whitespace-nowrap">{r.score}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <button
            onClick={() => setConfirm(true)}
            className="bg-red-700 hover:bg-red-600 transition-transform duration-200 active:scale-95 px-1 py-0.5 rounded"
          >
            Borrar historial
          </button>
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 transition-transform duration-200 active:scale-95 px-3 py-0.5 rounded"
          >
            Volver
          </button>
        </div>
        {confirm && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded">
            <p className="mb-2 text-center">¿Seguro que deseas eliminar todos los registros?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onReset();
                  setConfirm(false);
                }}
                className="bg-red-700 hover:bg-red-600 transition-transform duration-200 active:scale-95 px-2 py-0.5 rounded"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="bg-gray-700 hover:bg-gray-600 transition-transform duration-200 active:scale-95 px-2 py-0.5 rounded"
              >
                No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

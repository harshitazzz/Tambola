import React from "react";
import type { GameState } from "../../domain/entities/Game";

interface ControlsPanelProps {
  gameState: GameState;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ gameState }) => {
  const pointsByType = gameState.claims
    .filter((claim) => claim.isValid)
    .reduce<Record<string, number>>((acc, claim) => {
      acc[claim.type] = (acc[claim.type] ?? 0) + 1;
      return acc;
    }, {});

  const settings = [
    { label: "Status", value: gameState.status },
    { label: "Total Players", value: String(gameState.players.length) },
    { label: "Numbers Called", value: String(gameState.calledNumbers.length) },
    { label: "Numbers Remaining", value: String(90 - gameState.calledNumbers.length) },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <section className="bg-green-950 border border-green-800/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-emerald-300/80 mb-3 uppercase tracking-wider">
          Basic Game Settings
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {settings.map((setting) => (
            <div key={setting.label} className="bg-green-900/40 rounded-lg p-3 border border-green-800/40">
              <p className="text-green-300/70">{setting.label}</p>
              <p className="font-semibold text-green-50">{setting.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-green-950 border border-green-800/50 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-emerald-300/80 mb-3 uppercase tracking-wider">
          Points Board
        </h4>
        <div className="space-y-2 text-sm">
          {["Early5", "TopLine", "MiddleLine", "BottomLine", "FullHouse"].map((type) => (
            <div key={type} className="flex justify-between bg-green-900/40 rounded-lg px-3 py-2 border border-green-800/40">
              <span className="text-green-200">{type}</span>
              <span className="font-bold text-emerald-300">{pointsByType[type] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

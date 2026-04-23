import React, { useEffect, useRef, useState } from 'react';
import type { GameState } from '../../domain/entities/Game';
import { ControlsPanel } from './ControlsPanel';

interface HostPanelProps {
  gameState: GameState;
  onCallNumber: () => void;
  onStartGame: () => void;
}

export const HostPanel: React.FC<HostPanelProps> = ({ gameState, onCallNumber, onStartGame }) => {
  const [autoCallEnabled, setAutoCallEnabled] = useState(false);
  const [autoCallSeconds, setAutoCallSeconds] = useState(5);
  const callNumberRef = useRef(onCallNumber);
  const latestNumber = gameState.calledNumbers.length > 0
    ? gameState.calledNumbers[gameState.calledNumbers.length - 1]
    : null;
  const canCall = gameState.status === "Playing";

  useEffect(() => {
    callNumberRef.current = onCallNumber;
  }, [onCallNumber]);

  useEffect(() => {
    if (!autoCallEnabled || !canCall) return;

    const intervalId = window.setInterval(() => {
      callNumberRef.current();
    }, autoCallSeconds * 1000);

    return () => window.clearInterval(intervalId);
  }, [autoCallEnabled, autoCallSeconds, canCall]);

  useEffect(() => {
    if (gameState.status === "Finished") {
      setAutoCallEnabled(false);
    }
  }, [gameState.status]);

  return (
    <div className="bg-[#0f2e1a] border border-green-800 p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-lg mx-auto w-full">
      <h2 className="text-2xl font-bold text-green-50 mb-6">Host Dashboard</h2>

      <div className="flex flex-col items-center justify-center bg-green-900/50 rounded-full w-48 h-48 mb-8 border-4 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
        {latestNumber ? (
          <span className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-green-300 to-emerald-500 animate-pop-in">
            {latestNumber}
          </span>
        ) : (
          <span className="text-lg text-emerald-300/70 uppercase tracking-widest text-center px-4">
            Waiting for next number
          </span>
        )}
      </div>

      <div className="flex gap-4 w-full">
        <button
          onClick={onStartGame}
          disabled={gameState.status === "Playing"}
          className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors"
        >
          {gameState.status === "Waiting" ? "Start Game" : "Game In Progress"}
        </button>

        <button
          onClick={onCallNumber}
          disabled={!canCall}
          className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-white transition-colors"
        >
          Call Next Number
        </button>
      </div>

      <div className="mt-4 w-full rounded-lg border border-green-800/60 bg-green-950/60 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-col gap-2 text-sm font-semibold text-emerald-200">
            Auto call interval
            <select
              value={autoCallSeconds}
              onChange={(event) => setAutoCallSeconds(Number(event.target.value))}
              className="rounded-md border border-green-700 bg-green-900 px-3 py-2 text-green-50 outline-none focus:border-emerald-400"
            >
              <option value={3}>Every 3 seconds</option>
              <option value={5}>Every 5 seconds</option>
              <option value={8}>Every 8 seconds</option>
              <option value={10}>Every 10 seconds</option>
              <option value={15}>Every 15 seconds</option>
            </select>
          </label>

          <button
            onClick={() => setAutoCallEnabled((enabled) => !enabled)}
            disabled={!canCall}
            className={`rounded-lg px-4 py-3 font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              autoCallEnabled
                ? 'bg-rose-700 hover:bg-rose-600'
                : 'bg-emerald-700 hover:bg-emerald-600'
            }`}
          >
            {autoCallEnabled ? 'Stop Auto Call' : 'Start Auto Call'}
          </button>
        </div>
      </div>

      {gameState.calledNumbers.length > 0 && (
        <div className="mt-8 w-full">
          <h4 className="text-sm font-semibold text-emerald-300/80 mb-2 uppercase tracking-wider">Previous Numbers</h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-green-950 rounded-lg border border-green-800/50">
            {gameState.calledNumbers.slice(0, -1).reverse().map((num, idx) => (
              <div key={idx} className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-sm font-bold text-green-100">
                {num}
              </div>
            ))}
          </div>
        </div>
      )}

      <ControlsPanel gameState={gameState} />
    </div>
  );
};

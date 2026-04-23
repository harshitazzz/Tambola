import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Home, Users, X } from 'lucide-react';
import { useGameState } from '../presentation/hooks/useGameState';
import { GameManager } from '../infrastructure/GameManager';
import { TicketGrid } from '../presentation/components/TicketGrid';
import { PlayerPanel } from '../presentation/components/PlayerPanel';
import type { ClaimType } from '../domain/entities/Game';

interface RoomRule {
  id?: string;
  name: string;
  points: number;
}

interface RoomSettings {
  callingMethod: 'auto' | 'manual';
  autoInterval?: 3 | 5 | 7 | null;
  rules: RoomRule[];
}

const DEFAULT_CLAIM_POINTS: Record<ClaimType, number> = {
  Early5: 50,
  TopLine: 100,
  MiddleLine: 100,
  BottomLine: 100,
  FullHouse: 500,
};

const CLAIM_RULE_KEYS: Record<ClaimType, string[]> = {
  Early5: ['early5', 'early 5'],
  TopLine: ['first_row', '1st row', 'top line'],
  MiddleLine: ['second_row', '2nd row', 'middle line'],
  BottomLine: ['third_row', '3rd row', 'bottom line'],
  FullHouse: ['housefull', 'full house', 'fullhouse'],
};

const ALL_NUMBERS = Array.from({ length: 90 }, (_, index) => index + 1);

const GamePage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  
  const roomId = code || 'Local-Test';
  const gameState = useGameState(roomId);
  const manager = GameManager.getInstance();
  const [roomSettings, setRoomSettings] = useState<RoomSettings | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [isAutoCallStopped, setIsAutoCallStopped] = useState(false);
  const latestCalledCountRef = useRef(gameState.calledNumbers.length);

  const savedPlayerId = localStorage.getItem('currentPlayerId');
  const localPlayer = gameState.players.find(p => p.id === savedPlayerId) || gameState.players[0];
  const localTicket = gameState.tickets.find(t => t.playerId === localPlayer?.id);
  const isHost = localPlayer?.id.startsWith('host');
  const latestNumber = gameState.calledNumbers.at(-1) ?? null;

  useEffect(() => {
    if (!code) return;

    fetch(`/api/rooms/get/${code}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success && result.data.settings) {
          setRoomSettings(result.data.settings);
        }
      })
      .catch((error) => {
        console.error('Failed to load room settings:', error);
      });
  }, [code]);

  useEffect(() => {
    latestCalledCountRef.current = gameState.calledNumbers.length;
  }, [gameState.calledNumbers.length]);

  useEffect(() => {
    if (!isHost || gameState.status !== 'Playing' || roomSettings?.callingMethod !== 'auto' || isAutoCallStopped) return;

    const intervalMs = (roomSettings.autoInterval ?? 5) * 1000;
    const intervalId = window.setInterval(() => {
      if (latestCalledCountRef.current < 90) {
        manager.callNextNumber();
      }
    }, intervalMs);

    return () => window.clearInterval(intervalId);
  }, [gameState.status, isAutoCallStopped, isHost, manager, roomSettings]);

  const claimPoints = useMemo(() => {
    const points = { ...DEFAULT_CLAIM_POINTS };

    roomSettings?.rules?.forEach((rule) => {
      const ruleKey = `${rule.id ?? ''} ${rule.name}`.toLowerCase();
      (Object.keys(CLAIM_RULE_KEYS) as ClaimType[]).forEach((claimType) => {
        if (CLAIM_RULE_KEYS[claimType].some((key) => ruleKey.includes(key))) {
          points[claimType] = rule.points;
        }
      });
    });

    return points;
  }, [roomSettings]);

  const localPlayerPoints = useMemo(() => {
    if (!localPlayer) return 0;

    return gameState.claims
      .filter((claim) => claim.playerId === localPlayer.id && claim.isValid)
      .reduce((total, claim) => total + claimPoints[claim.type], 0);
  }, [claimPoints, gameState.claims, localPlayer]);

  const playerScores = useMemo(() => {
    return gameState.players.map((player) => {
      const points = gameState.claims
        .filter((claim) => claim.playerId === player.id && claim.isValid)
        .reduce((total, claim) => total + claimPoints[claim.type], 0);

      return { ...player, points };
    });
  }, [claimPoints, gameState.claims, gameState.players]);

  const previousNumbers = gameState.calledNumbers.slice(-5, -1).reverse();

  const calledValues = new Set(gameState.calledNumbers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f3ea] via-[#eef8ef] to-[#dff2e4] text-slate-900 font-sans p-4 sm:p-5">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-extrabold italic text-[#1a7631] drop-shadow-sm">
              Tambola <span className="not-italic text-[#114c20]">🎱</span>
            </h1>
            <div className="mt-2 text-sm font-bold text-[#114c20] bg-white/70 inline-block px-3 py-1 rounded-full border border-green-200 shadow-sm">
              Room: {code || 'Local-Test'}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button 
              className="flex items-center gap-2 bg-white/80 hover:bg-rose-50 hover:text-rose-700 transition-colors px-4 py-2 rounded-full font-bold border border-green-200 hover:border-rose-200 shadow-sm" 
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              Leave Game
            </button>

            <button
              onClick={() => setShowPlayers((visible) => !visible)}
              className="flex items-center gap-2 rounded-full border border-green-200 bg-white/85 px-4 py-2 text-sm font-black text-[#114c20] shadow-sm transition hover:bg-green-50"
            >
              <Users size={16} />
              Players ({gameState.players.length})
            </button>

            {gameState.status === 'Playing' && (
              <button
                onClick={() => setShowHistory((visible) => !visible)}
                className="flex items-center gap-2 rounded-full border border-green-200 bg-white/85 px-4 py-2 text-sm font-black text-[#114c20] shadow-sm transition hover:bg-green-50"
              >
                <History size={16} />
                History
              </button>
            )}

            {isHost && gameState.status === 'Playing' && roomSettings?.callingMethod === 'auto' && (
              <button
                onClick={() => setIsAutoCallStopped((stopped) => !stopped)}
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-700/20 transition hover:bg-rose-700"
              >
                {isAutoCallStopped ? 'Resume Auto Call' : 'Stop Auto Call'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-3">
          {isHost && gameState.status === 'Waiting' && (
            <button
              onClick={() => {
                setIsAutoCallStopped(false);
                manager.startGame();
              }}
              className="rounded-full bg-[#1a7631] px-8 py-3 text-xl font-black text-white shadow-xl shadow-green-700/20 transition hover:bg-[#114c20]"
            >
              Start
            </button>
          )}

          {!isHost && gameState.status === 'Waiting' && (
            <div className="rounded-[28px] border border-green-200 bg-white/80 px-8 py-6 text-center shadow-xl shadow-green-900/10">
              <p className="text-xl font-black text-[#114c20]">Host is going to start the game</p>
            </div>
          )}

          {gameState.status === 'Playing' && (
            <section className="w-full max-w-6xl">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full border-8 border-[#1a7631]/25 bg-white shadow-2xl shadow-green-900/15 sm:h-36 sm:w-36">
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#1a7631]">
                    Current
                  </p>
                  <span className="text-5xl font-black leading-none text-[#1a7631] sm:text-7xl">
                    {latestNumber ?? '--'}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-500">
                  {gameState.calledNumbers.length}/90 called
                </p>

                {previousNumbers.length > 0 && (
                  <div className="flex items-center gap-2 rounded-full border border-green-200 bg-white/80 px-3 py-1.5 shadow-sm">
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-[#114c20]">
                      Previous
                    </span>
                    {previousNumbers.map((num) => (
                      <span
                        key={num}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1a7631]/25 bg-[#e6f4ea] text-sm font-black text-[#114c20]"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                )}

                {isHost && roomSettings?.callingMethod !== 'auto' && (
                  <button
                    onClick={() => manager.callNextNumber()}
                    className="rounded-full bg-[#1a7631] px-6 py-3 text-base font-bold text-white shadow-lg shadow-green-700/20 transition hover:bg-[#114c20]"
                  >
                    Call Next Number
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Player Area */}
          <div className="w-full max-w-6xl">
            {localTicket && localPlayer ? (
              <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <TicketGrid 
                  ticket={localTicket}
                  playerName={localPlayer.name}
                  totalPoints={localPlayerPoints}
                  onMark={(cellId) => manager.markNumber(localTicket.id, cellId)}
                />
                <PlayerPanel 
                  gameState={gameState}
                  playerId={localPlayer.id}
                  claimPoints={claimPoints}
                  compact={gameState.status === 'Playing'}
                  onClaim={(type) => manager.claim(localPlayer.id, type)}
                />
              </div>
            ) : (
                <div className="bg-white/80 border border-green-200 p-8 rounded-[28px] flex flex-col items-center justify-center min-h-[300px] w-full shadow-xl shadow-green-900/10">
                   <span className="animate-spin text-4xl mb-4">🎲</span>
                   <p className="text-[#1a7631] font-semibold">Generating your ticket...</p>
                </div>
            )}
          </div>
        </div>
      </motion.div>

      {showHistory && (
        <aside className="fixed right-4 top-32 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-[28px] border border-green-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/20 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#114c20]">History</h2>
              <p className="text-xs font-semibold text-slate-500">
                Called numbers are highlighted.
              </p>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[#114c20] transition hover:bg-green-100"
              aria-label="Close history"
            >
              <X size={17} />
            </button>
          </div>

          <div className="grid grid-cols-10 gap-1">
            {ALL_NUMBERS.map((num) => {
              const isCalled = calledValues.has(num);
              return (
                <div
                  key={num}
                  className={`flex aspect-square items-center justify-center rounded-full border text-[11px] font-black ${
                    isCalled
                      ? 'border-[#6bbf7a] bg-[#bfe8c7] text-[#0b3d19]'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {showPlayers && (
        <aside className="fixed right-4 top-32 z-50 w-[min(20rem,calc(100vw-2rem))] rounded-[28px] border border-green-200 bg-white/95 p-4 shadow-2xl shadow-slate-900/20 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#114c20]">Players</h2>
              <p className="text-xs font-semibold text-slate-500">Nickname and live points.</p>
            </div>
            <button
              onClick={() => setShowPlayers(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-[#114c20] transition hover:bg-green-100"
              aria-label="Close players"
            >
              <X size={17} />
            </button>
          </div>

          <div className="space-y-2">
            {playerScores.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50/70 px-3 py-2"
              >
                <span className="min-w-0 truncate pr-3 font-black text-[#114c20]">
                  {player.name}
                </span>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-[#1a7631]">
                  {player.points} pts
                </span>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default GamePage;

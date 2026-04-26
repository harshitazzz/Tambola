import React, { useMemo } from 'react';
import type { GameState, ClaimType } from '../../domain/entities/Game';
import { SoundService } from '../../infrastructure/SoundService';

export interface Rule {
  id: string;
  name: string;
  count: number;
  points: number;
  enabled?: boolean;
}

interface PlayerPanelProps {
  gameState: GameState;
  playerId: string;
  rules: Rule[];
  compact?: boolean;
  isFinished?: boolean;
  onClaim: (type: ClaimType) => void;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ gameState, playerId, rules, compact = false, isFinished = false, onClaim }) => {
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(SoundService.isSoundEnabled());
  const playerNamesById = React.useMemo(() => {
    return gameState.players.reduce<Record<string, string>>((names, player) => {
      names[player.id] = player.name;
      return names;
    }, {});
  }, [gameState.players]);

  const claimTypes = useMemo(() => {
    if (!rules || rules.length === 0) return [];
    
    return rules.flatMap(rule => 
      Array.from({ length: rule.count }).map((_, i) => ({
        label: rule.count > 1 ? `${rule.name} ${i + 1}` : rule.name,
        type: rule.count > 1 ? `${rule.id}_${i + 1}` : rule.id,
        points: rule.points
      }))
    );
  }, [rules]);

  return (
    <div className={`bg-white/85 border border-green-200 rounded-[28px] shadow-xl shadow-green-900/10 w-full ${compact ? 'p-4' : 'p-5 sm:p-6'}`}>
      <div className={`flex justify-between items-center ${compact ? 'mb-3' : 'mb-6'}`}>
        <h2 className="text-xl font-black text-[#114c20]">Claims</h2>
        <button 
          onClick={() => {
            setIsSoundEnabled(SoundService.toggleSound());
          }}
          className="text-sm bg-[#e6f4ea] hover:bg-green-100 px-3 py-1 rounded-full text-[#114c20] font-bold border border-green-200"
        >
          Sound: {isSoundEnabled ? "On" : "Off"}
        </button>
      </div>

      {!isFinished ? (
        <div className="grid grid-cols-2 gap-3">
          {claimTypes.map((claim) => {
            // Check if this user successfully claimed it
            const userClaimed = gameState.claims.find(c => c.type === claim.type && c.playerId === playerId && c.isValid);
            // Check if anyone claimed it successfully
            const anyoneClaimed = gameState.claims.find(c => c.type === claim.type && c.isValid);
            // Check if this user failed it
            const userFailed = gameState.claims.find(c => c.type === claim.type && c.playerId === playerId && !c.isValid);

            return (
              <button
                key={claim.type}
                onClick={() => onClaim(claim.type)}
                disabled={anyoneClaimed !== undefined || gameState.status !== "Playing"}
                className={`
                  min-h-16 rounded-2xl px-3 py-3 text-sm transition-all
                  ${userClaimed ? 'bg-[#1a7631] text-white border-2 border-[#114c20]' 
                    : anyoneClaimed ? 'bg-slate-100 text-slate-400 line-through border border-slate-200' 
                    : userFailed ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    : 'bg-[#e6f4ea] text-[#114c20] hover:bg-green-100 border border-green-200'}
                `}
              >
                <span className="block font-black">{claim.label}</span>
                <span className="mt-1 block text-xs font-bold opacity-75">{claim.points} pts</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <h3 className="text-[#1a7631] font-black text-lg mb-1">You Finished!</h3>
          <p className="text-[#114c20] text-sm font-bold">Watch the remaining numbers</p>
        </div>
      )}
      
      <div className={`${compact ? 'mt-3 p-3' : 'mt-6 p-4'} bg-white border border-green-100 rounded-2xl`}>
        <h4 className="text-sm font-bold text-[#1a7631] mb-2 uppercase tracking-[0.16em]">Messages</h4>
        <div className="text-sm text-slate-700 space-y-1">
          {gameState.claims.slice(-3).reverse().map((c, i) => (
            <div key={i} className={c.isValid ? 'text-[#1a7631]' : 'text-rose-700'}>
              {c.isValid ? 'Won' : 'Invalid'} · {playerNamesById[c.playerId] ?? 'Player'} · {claimTypes.find(ct => ct.type === c.type)?.label ?? c.type}
            </div>
          ))}
          {gameState.claims.length === 0 && <span className="text-slate-500">No claims yet.</span>}
        </div>
      </div>
    </div>
  );
};


import React from 'react';
import type { Ticket } from '../../domain/entities/Ticket';
import { CellComponent } from './CellComponent';

interface TicketGridProps {
  ticket: Ticket;
  playerName: string;
  totalPoints: number;
  onMark: (cellId: string) => void;
}

export const TicketGrid: React.FC<TicketGridProps> = ({ ticket, playerName, totalPoints, onMark }) => {
  return (
    <div className="bg-white/85 p-4 rounded-[28px] shadow-xl shadow-green-900/10 border border-green-200 w-full h-full flex flex-col">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-black text-[#114c20]">{playerName}</h3>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Ticket ID: {ticket.id.slice(-6)}
          </p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-[#e6f4ea] px-4 py-2 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1a7631]">Total Points</p>
          <p className="text-2xl font-black text-[#114c20]">{totalPoints}</p>
        </div>
      </div>
      
      <div className="grid grid-rows-3 gap-2">
        {ticket.cells.map((row, rIndex) => (
          <div key={`row-${rIndex}`} className="grid grid-cols-9 gap-2">
            {row.map((cell) => (
              <CellComponent
                key={cell.id}
                cell={cell}
                onMark={onMark}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

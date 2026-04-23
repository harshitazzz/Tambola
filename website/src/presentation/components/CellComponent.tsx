import React from 'react';
import type { Cell } from '../../domain/entities/Cell';

interface CellProps {
  cell: Cell;
  onMark: (id: string) => void;
}

export const CellComponent: React.FC<CellProps> = ({ cell, onMark }) => {
  const isBlank = cell.value === null;

  return (
    <div
      onClick={() => {
        if (!isBlank) onMark(cell.id);
      }}
      className={`
        relative w-full h-12 flex items-center justify-center border-2 rounded-xl font-black text-lg select-none transition-all duration-200
        ${isBlank ? 'bg-slate-50 border-slate-100' : 'bg-[#e6f4ea] border-green-200 hover:bg-green-100 text-[#114c20] cursor-pointer'}
        ${cell.isMarked ? 'bg-[#2f8f46] border-[#1a7631] text-white shadow-[inset_0_0_12px_rgba(255,255,255,0.18)]' : ''}
      `}
    >
      {!isBlank && (
        <>
          <span>{cell.value}</span>
          {cell.isMarked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-white/80 opacity-80 scale-110"></div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

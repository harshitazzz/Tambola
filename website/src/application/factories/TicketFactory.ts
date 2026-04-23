import type { Ticket } from "../../domain/entities/Ticket";
import type { Cell } from "../../domain/entities/Cell";

export class TicketFactory {
  static createTicket(playerId: string, ticketId: string): Ticket {
    const pattern = this.getValidTicketPattern();
    
    const grid: number[][] = [
      Array(9).fill(0),
      Array(9).fill(0),
      Array(9).fill(0)
    ];

    for (let c = 0; c < 9; c++) {
      const activeRows: number[] = [];
      for (let r = 0; r < 3; r++) {
        if (pattern[r][c]) activeRows.push(r);
      }
      
      const nums: number[] = [];
      const min = c === 0 ? 1 : c * 10;
      const max = c === 8 ? 90 : (c * 10) + 9;
      
      while (nums.length < activeRows.length) {
        const n = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!nums.includes(n)) nums.push(n);
      }
      nums.sort((a, b) => a - b);
      
      for (let i = 0; i < activeRows.length; i++) {
        grid[activeRows[i]][c] = nums[i];
      }
    }

    // Map to Cell Entities
    const cells: Cell[][] = grid.map((rowArr, rowIndex) => {
      return rowArr.map((val, colIndex) => {
        return {
          id: `${ticketId}-r${rowIndex}-c${colIndex}`,
          value: val === 0 ? null : val,
          isMarked: false
        };
      });
    });

    return {
      id: ticketId,
      playerId,
      cells
    };
  }

  private static getValidTicketPattern(): boolean[][] {
    const pattern = [
      Array(9).fill(false),
      Array(9).fill(false),
      Array(9).fill(false)
    ];

    function backtrack(col: number, rowSums: number[]): boolean {
      if (col === 9) {
        return rowSums[0] === 5 && rowSums[1] === 5 && rowSums[2] === 5;
      }
      
      const rowCombs = [
        [0], [1], [2], // 1 cell
        [0,1], [0,2], [1,2], // 2 cells
        [0,1,2] // 3 cells
      ];
      // Randomize the order of combinations
      rowCombs.sort(() => Math.random() - 0.5);

      for (const comb of rowCombs) {
        let valid = true;
        for (const r of comb) {
          if (rowSums[r] >= 5) valid = false;
        }
        
        if (valid) {
          comb.forEach(r => { pattern[r][col] = true; rowSums[r]++; });
          if (backtrack(col + 1, rowSums)) return true;
          comb.forEach(r => { pattern[r][col] = false; rowSums[r]--; });
        }
      }
      return false;
    }

    backtrack(0, [0, 0, 0]);
    return pattern;
  }
}


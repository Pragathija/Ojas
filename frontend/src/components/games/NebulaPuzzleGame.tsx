import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { gamificationService } from '../../services';

export const NebulaPuzzleGame: React.FC = () => {
  // Goal: [1, 2, 3, 4, 5, 6, 7, 8, 0]
  const [board, setBoard] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [moves, setMoves] = useState(0);
  const [level, setLevel] = useState<'Cadet' | 'Specialist'>('Cadet');
  const [isWon, setIsWon] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Check if solved
  const checkWin = (current: number[]) => {
    for (let i = 0; i < 8; i++) {
      if (current[i] !== i + 1) return false;
    }
    return current[8] === 0;
  };

  const shuffleBoard = (difficulty: 'Cadet' | 'Specialist') => {
    let current = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const steps = difficulty === 'Cadet' ? 8 : 16;
    let emptyIdx = 8;

    for (let s = 0; s < steps; s++) {
      const validMoves: number[] = [];
      const row = Math.floor(emptyIdx / 3);
      const col = emptyIdx % 3;

      if (row > 0) validMoves.push(emptyIdx - 3); // Up
      if (row < 2) validMoves.push(emptyIdx + 3); // Down
      if (col > 0) validMoves.push(emptyIdx - 1); // Left
      if (col < 2) validMoves.push(emptyIdx + 1); // Right

      const chosen = validMoves[Math.floor(Math.random() * validMoves.length)];
      current[emptyIdx] = current[chosen];
      current[chosen] = 0;
      emptyIdx = chosen;
    }

    setBoard([...current]);
    setMoves(0);
    setIsWon(false);
    setIsPlaying(true);
    setHint(null);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || isWon) return;

    const emptyIdx = board.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;

    // Check if adjacent
    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    if (!isAdjacent) return;

    const newBoard = [...board];
    newBoard[emptyIdx] = newBoard[index];
    newBoard[index] = 0;
    setBoard(newBoard);
    setMoves((m) => m + 1);
    setHint(null);

    if (checkWin(newBoard)) {
      setIsWon(true);
      setIsPlaying(false);
      gamificationService.claimQuest('nebula-puzzle-solve', 'Nebula Telemetry Tile Puzzle', 50)
        .then(() => setXpClaimed(true))
        .catch(() => setXpClaimed(true));
    }
  };

  const provideHint = () => {
    const emptyIdx = board.indexOf(0);
    const emptyRow = Math.floor(emptyIdx / 3);
    const emptyCol = emptyIdx % 3;
    const candidates: number[] = [];

    if (emptyRow > 0) candidates.push(emptyIdx - 3);
    if (emptyRow < 2) candidates.push(emptyIdx + 3);
    if (emptyCol > 0) candidates.push(emptyIdx - 1);
    if (emptyCol < 2) candidates.push(emptyIdx + 1);

    // Find any tile that is out of position
    const candidate = candidates.find((idx) => board[idx] !== idx + 1) || candidates[0];
    setHint(`Slide tile #${board[candidate]} into the open slot`);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              GAME 4 • PROBLEM-SOLVING PRACTICE
            </span>
            <Badge variant="purple" size="sm">{level.toUpperCase()} LEVEL</Badge>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#252039] mt-1">
            Nebula Puzzle — Telemetry Matrix Alignment
          </h2>
          <p className="text-xs text-[#716B83] mt-0.5 font-sans">
            Slide the displaced power grid telemetry tiles into numeric order [1 through 8] to restore circuit flow.
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2] text-[#252039]">
              Moves: <span className="font-bold text-primary">{moves}</span>
            </div>
            <Button size="sm" variant="secondary" onClick={provideHint} className="gap-1.5 text-xs rounded-xl">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              <span>Hint</span>
            </Button>
          </div>
        )}
      </div>

      {/* Arena */}
      {!isPlaying && !isWon && (
        <div className="text-center py-10 space-y-5 bg-gradient-to-b from-[#FAF9FF] to-white rounded-2xl border border-[#E9E4F2] p-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-pastel-lavender flex items-center justify-center text-primary shadow-soft">
            <Gamepad2 className="h-10 w-10 text-primary" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#252039]">Align the Habitation Telemetry Grid</h3>
            <p className="text-xs text-[#716B83] leading-relaxed">
              Exercise spatial problem-solving by sliding tiles into sequence. Choose starting challenge level:
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button size="md" onClick={() => shuffleBoard('Cadet')} className="gap-2 font-heading font-bold text-xs rounded-xl shadow-soft">
              <Play className="h-4 w-4" />
              <span>Cadet Level (Gentle)</span>
            </Button>
            <Button size="md" variant="secondary" onClick={() => shuffleBoard('Specialist')} className="gap-2 font-heading font-bold text-xs rounded-xl border border-primary/30">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Specialist Level</span>
            </Button>
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="space-y-4">
          {hint && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center font-mono font-bold animate-in fade-in">
              💡 {hint}
            </div>
          )}

          <div className="w-[300px] h-[300px] mx-auto grid grid-cols-3 gap-2.5 p-3 rounded-3xl bg-[#FAF9FF] border-2 border-[#E9E4F2] shadow-soft">
            {board.map((tile, idx) => (
              <motion.button
                key={idx}
                type="button"
                whileTap={tile !== 0 ? { scale: 0.95 } : {}}
                onClick={() => handleTileClick(idx)}
                className={`rounded-2xl font-heading font-black text-2xl flex items-center justify-center transition-all cursor-pointer select-none ${
                  tile === 0
                    ? 'bg-transparent border-2 border-dashed border-[#E9E4F2] pointer-events-none'
                    : tile === idx + 1
                    ? 'bg-gradient-to-tr from-[#7656D9] to-[#8B78C6] text-white shadow-soft'
                    : 'bg-white border border-[#E9E4F2] text-[#252039] shadow-soft hover:border-[#7656D9]/50'
                }`}
              >
                {tile !== 0 ? tile : ''}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Victory */}
      {isWon && (
        <div className="text-center py-10 space-y-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-soft">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-[#252039]">Matrix Restored!</h3>
            <p className="text-xs text-[#716B83] max-w-md mx-auto mt-1">
              You aligned all 8 telemetry tiles in {moves} moves. Circuit telemetry flow is 100% nominal.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>+50 Exploration XP Awarded</span>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Button size="md" onClick={() => shuffleBoard('Cadet')} className="gap-2 font-heading font-bold text-xs rounded-xl">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Play Again</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

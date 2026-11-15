import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, Play, RotateCcw, Trophy, Sparkles, ShieldCheck } from 'lucide-react';
import { gamificationService } from '../../services';

interface TargetPosition {
  x: number; // percentage
  y: number; // percentage
}

export const FocusNebulaGame: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const maxRounds = 8;
  const [targetPos, setTargetPos] = useState<TargetPosition | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const spawnTimeRef = useRef<number>(0);
  const timeoutRef = useRef<any>(null);

  const spawnNextTarget = () => {
    setTargetPos(null);
    const delay = Math.floor(Math.random() * 1200) + 600; // 600ms - 1800ms random delay

    timeoutRef.current = setTimeout(() => {
      // Avoid edge clipping: between 15% and 85%
      const x = Math.floor(Math.random() * 70) + 15;
      const y = Math.floor(Math.random() * 70) + 15;
      setTargetPos({ x, y });
      spawnTimeRef.current = Date.now();
    }, delay);
  };

  const handleStartGame = () => {
    setIsPlaying(true);
    setRound(1);
    setReactionTimes([]);
    setStreak(0);
    setIsCompleted(false);
    setXpClaimed(false);
    spawnNextTarget();
  };

  const handleTargetClick = () => {
    if (!targetPos) return;
    const reaction = Date.now() - spawnTimeRef.current;
    const updated = [...reactionTimes, reaction];
    setReactionTimes(updated);
    setStreak((s) => s + 1);

    if (round >= maxRounds) {
      // Completed
      setIsPlaying(false);
      setIsCompleted(true);
      setTargetPos(null);
      gamificationService.claimQuest('focus-nebula-complete', 'Focus Nebula Reflex Challenge', 50)
        .then(() => setXpClaimed(true))
        .catch(() => setXpClaimed(true));
    } else {
      setRound((r) => r + 1);
      spawnNextTarget();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const avgReaction =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shadow-xs">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">Focus Nebula</h3>
            <p className="text-xs text-[#716B83] font-sans">
              Test attention and visual orientation by clicking orbital telemetry targets as they appear.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2]">
            <span className="text-[#716B83]">Round: </span>
            <strong className="text-[#252039] font-bold">{isPlaying ? round : 0}/{maxRounds}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2]">
            <span className="text-[#716B83]">Avg Reaction: </span>
            <strong className="text-[#7656D9] font-bold">{avgReaction > 0 ? `${avgReaction}ms` : '--'}</strong>
          </div>
        </div>
      </div>

      {/* Play Area / Cosmic Field */}
      <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-[#252039] to-[#1E192E] overflow-hidden border border-[#5535A5]/30 flex items-center justify-center">
        {/* Background Stars */}
        <div className="absolute top-10 left-12 w-1.5 h-1.5 rounded-full bg-white/40" />
        <div className="absolute top-24 right-20 w-1 h-1 rounded-full bg-purple-300/50" />
        <div className="absolute bottom-16 left-1/4 w-1.5 h-1.5 rounded-full bg-mint/50" />
        <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-white/30" />

        {!isPlaying && !isCompleted && (
          <div className="text-center space-y-4 z-10">
            <p className="text-sm font-heading font-bold text-white max-w-sm">
              Targets will appear at random coordinates on the celestial grid. Tap them swiftly to measure focus speed.
            </p>
            <button
              onClick={handleStartGame}
              className="px-7 py-3 rounded-xl bg-[#7656D9] text-white font-heading font-bold text-sm shadow-soft flex items-center gap-2 mx-auto hover:bg-[#6444C9] cursor-pointer"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Launch Focus Session</span>
            </button>
          </div>
        )}

        {isPlaying && targetPos && (
          <button
            onClick={handleTargetClick}
            className="absolute p-3 rounded-full bg-[#7656D9] text-white shadow-planet-glow hover:scale-110 active:scale-95 transition-transform cursor-pointer animate-pulse"
            style={{ top: `${targetPos.y}%`, left: `${targetPos.x}%` }}
          >
            <Zap className="h-6 w-6 text-yellow-300 fill-yellow-300" />
          </button>
        )}

        {isPlaying && !targetPos && (
          <span className="text-xs font-mono text-purple-200/60 uppercase tracking-widest animate-pulse">
            Scanning for celestial target...
          </span>
        )}

        {isCompleted && (
          <div className="text-center space-y-3 z-10 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-[#E9E4F2] max-w-md mx-4 shadow-soft">
            <Trophy className="h-8 w-8 text-[#7656D9] mx-auto" />
            <h4 className="font-heading font-extrabold text-lg text-[#252039]">Focus Session Complete!</h4>
            <p className="text-xs text-[#716B83]">
              Average Reaction Time: <strong className="text-[#7656D9]">{avgReaction} ms</strong> across {maxRounds} rounds.
            </p>
            {xpClaimed && (
              <span className="inline-block px-3 py-1 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold">
                +50 XP Claimed
              </span>
            )}
            <div className="pt-2">
              <button
                onClick={handleStartGame}
                className="px-6 py-2.5 rounded-xl bg-[#7656D9] text-white font-heading font-bold text-xs shadow-soft hover:bg-[#6444C9] cursor-pointer"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Non-clinical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-2.5 text-[11px] text-[#716B83]">
        <ShieldCheck className="h-4 w-4 text-[#7656D9] shrink-0" />
        <span>
          Reflex challenges are non-clinical and designed for recreational mental stimulation. Exit without penalties at any time.
        </span>
      </div>
    </div>
  );
};

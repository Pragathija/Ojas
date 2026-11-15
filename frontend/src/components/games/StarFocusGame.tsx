import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Sparkles,
  Play,
  RotateCcw,
  Trophy,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { gamificationService } from '../../services';

interface StarNode {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number;
  isTarget: boolean;
  color: string;
}

export const StarFocusGame: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const maxRounds = 8;
  const [difficulty, setDifficulty] = useState<'gentle' | 'normal' | 'swift'>('normal');
  const [stars, setStars] = useState<StarNode[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const spawnTimeRef = useRef<number>(0);
  const timeoutRef = useRef<any>(null);

  const getDelayRange = () => {
    if (difficulty === 'gentle') return { min: 900, max: 1600, starCount: 12 };
    if (difficulty === 'swift') return { min: 400, max: 800, starCount: 22 };
    return { min: 600, max: 1200, starCount: 16 };
  };

  const spawnStarField = () => {
    setStars([]);
    const config = getDelayRange();
    const delay = Math.floor(Math.random() * (config.max - config.min)) + config.min;

    timeoutRef.current = setTimeout(() => {
      const targetIndex = Math.floor(Math.random() * config.starCount);
      const generated: StarNode[] = [];

      for (let i = 0; i < config.starCount; i++) {
        generated.push({
          id: i,
          x: Math.floor(Math.random() * 80) + 10,
          y: Math.floor(Math.random() * 75) + 12,
          size: i === targetIndex ? 26 : Math.floor(Math.random() * 10) + 6,
          isTarget: i === targetIndex,
          color: i === targetIndex ? '#7656D9' : '#C4B9E5',
        });
      }

      setStars(generated);
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
    spawnStarField();
  };

  const handleStarClick = (star: StarNode) => {
    if (!star.isTarget) return;

    const reaction = Date.now() - spawnTimeRef.current;
    const updated = [...reactionTimes, reaction];
    setReactionTimes(updated);
    setStreak((s) => s + 1);

    if (round >= maxRounds) {
      // Completed session
      setIsPlaying(false);
      setIsCompleted(true);
      setStars([]);

      // Save cognitive stats for Section 8
      try {
        const stats = JSON.parse(localStorage.getItem('ojas_cognitive_stats') || '{"memory":[],"reaction":[]}');
        const avg = Math.round(updated.reduce((a, b) => a + b, 0) / updated.length);
        stats.reaction.push({
          date: new Date().toISOString(),
          difficulty,
          averageReactionMs: avg,
          accuracyPercent: 100,
        });
        localStorage.setItem('ojas_cognitive_stats', JSON.stringify(stats));
      } catch {}

      gamificationService.claimQuest('star-focus-reflex', 'Star Focus Attention Practice', 50)
        .then(() => setXpClaimed(true))
        .catch(() => setXpClaimed(true));
    } else {
      setRound((r) => r + 1);
      spawnStarField();
    }
  };

  const avgReaction = reactionTimes.length
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              GAME 3 • VISUAL ATTENTION PRACTICE
            </span>
            <Badge variant="purple" size="sm">ROUND {round} OF {maxRounds}</Badge>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#252039] mt-1">
            Star Focus — Target Pattern Search
          </h2>
          <p className="text-xs text-[#716B83] mt-0.5 font-sans">
            Scan the star field and acquire the pulsing purple Navigation Beacon as quickly as detected.
          </p>
        </div>

        {!isPlaying && !isCompleted && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#716B83]">Pacing:</span>
            {(['gentle', 'normal', 'swift'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading capitalize font-bold cursor-pointer transition-all ${
                  difficulty === d
                    ? 'bg-[#7656D9] text-white shadow-soft'
                    : 'bg-[#FAF9FF] text-[#716B83] border border-[#E9E4F2] hover:bg-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Arena */}
      {!isPlaying && !isCompleted && (
        <div className="text-center py-12 space-y-5 bg-gradient-to-b from-[#FAF9FF] to-white rounded-2xl border border-[#E9E4F2] p-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-pastel-lavender flex items-center justify-center text-primary shadow-soft">
            <Target className="h-10 w-10 text-primary" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#252039]">Acquire Deep Space Targets</h3>
            <p className="text-xs text-[#716B83] leading-relaxed">
              8 target presentations. Tap the distinct purple beacon cluster each time it illuminates.
            </p>
          </div>
          <Button size="lg" onClick={handleStartGame} className="gap-2 font-heading font-bold text-sm px-8 py-3 rounded-xl shadow-soft">
            <Play className="h-4 w-4" />
            <span>Engage Star Field</span>
          </Button>
        </div>
      )}

      {isPlaying && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#716B83] px-2">
            <span>Target: <strong className="text-primary">Purple Stellar Beacon</strong></span>
            <span>Current Streak: <strong className="text-emerald-600">{streak}</strong></span>
          </div>

          <div className="relative w-full h-[360px] rounded-3xl bg-gradient-to-b from-[#1E1935] via-[#2A2349] to-[#393161] border border-[#E9E4F2] overflow-hidden select-none shadow-soft">
            {/* Background delicate nebula */}
            <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-pastel-lavender/10 blur-2xl pointer-events-none" />

            {/* Stars rendering */}
            {stars.map((star) => (
              <motion.button
                key={star.id}
                type="button"
                whileHover={star.isTarget ? { scale: 1.25 } : {}}
                whileTap={star.isTarget ? { scale: 0.9 } : {}}
                onClick={() => handleStarClick(star)}
                style={{
                  position: 'absolute',
                  top: `${star.y}%`,
                  left: `${star.x}%`,
                  width: star.size,
                  height: star.size,
                }}
                className={`rounded-full transition-transform cursor-pointer ${
                  star.isTarget
                    ? 'bg-gradient-to-tr from-[#7656D9] via-[#9BDCC3] to-white shadow-[0_0_16px_rgba(118,86,217,0.9)] ring-2 ring-white animate-pulse'
                    : 'bg-white/40 pointer-events-none'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completion */}
      {isCompleted && (
        <div className="text-center py-10 space-y-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-soft">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-[#252039]">Attention Session Complete!</h3>
            <p className="text-xs text-[#716B83] max-w-md mx-auto mt-1">
              8 target beacons acquired. Mean reaction velocity: <strong className="text-emerald-700">{avgReaction} ms</strong>.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
            <CheckCircle2 className="h-4 w-4" />
            <span>+50 Exploration XP Awarded</span>
          </div>
          <div className="pt-2">
            <Button size="md" onClick={handleStartGame} className="gap-2 font-heading font-bold text-xs rounded-xl shadow-soft">
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Practice Again</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

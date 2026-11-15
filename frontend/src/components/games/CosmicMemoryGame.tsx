import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { gamificationService } from '../../services';

interface PlanetSymbol {
  id: string;
  name: string;
  color: string;
  borderColor: string;
}

const CELESTIAL_OBJECTS: PlanetSymbol[] = [
  { id: 'mars', name: 'Mars', color: '#E06D3B', borderColor: '#FED7AA' },
  { id: 'jupiter', name: 'Jupiter', color: '#D99A1E', borderColor: '#FDE9B6' },
  { id: 'neptune', name: 'Neptune', color: '#2F7BE5', borderColor: '#BFDBFE' },
  { id: 'saturn', name: 'Saturn', color: '#8B78C6', borderColor: '#DDD3F9' },
  { id: 'earth', name: 'Earth', color: '#19A974', borderColor: '#C2EAD6' },
  { id: 'luna', name: 'Moon', color: '#7656D9', borderColor: '#E8E0FF' },
];

export const CosmicMemoryGame: React.FC = () => {
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'recalling' | 'victory' | 'failed'>('idle');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  const [reactionStartTime, setReactionStartTime] = useState<number>(0);
  const [averageReactionMs, setAverageReactionMs] = useState<number>(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [xpClaimed, setXpClaimed] = useState(false);

  // Generate sequence for current level
  const startLevel = (lvl: number) => {
    setUserSequence([]);
    setGameState('showing');
    const seqLength = lvl + 2; // Level 1 = 3 planets, Level 2 = 4, Level 3 = 5
    const newSeq: string[] = [];
    for (let i = 0; i < seqLength; i++) {
      const randIdx = Math.floor(Math.random() * CELESTIAL_OBJECTS.length);
      newSeq.push(CELESTIAL_OBJECTS[randIdx].id);
    }
    setSequence(newSeq);

    // Playback sequence
    let step = 0;
    const interval = setInterval(() => {
      if (step < newSeq.length) {
        setActiveHighlight(newSeq[step]);
        setTimeout(() => setActiveHighlight(null), 550);
        step++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setGameState('recalling');
          setReactionStartTime(Date.now());
        }, 500);
      }
    }, 850);
  };

  const handleStartGame = () => {
    setLevel(1);
    setCorrectRounds(0);
    setAverageReactionMs(0);
    setXpClaimed(false);
    startLevel(1);
  };

  const handlePlanetClick = (id: string) => {
    if (gameState !== 'recalling') return;

    const responseMs = Date.now() - reactionStartTime;
    const nextUserSeq = [...userSequence, id];
    setUserSequence(nextUserSeq);

    // Check correctness of this step
    const currentIndex = userSequence.length;
    if (sequence[currentIndex] !== id) {
      // Sequence mismatch
      setGameState('failed');
      return;
    }

    // Sequence completed correctly!
    if (nextUserSeq.length === sequence.length) {
      const updatedAvg = averageReactionMs === 0 ? responseMs : Math.round((averageReactionMs + responseMs) / 2);
      setAverageReactionMs(updatedAvg);
      setCorrectRounds((prev) => prev + 1);

      // Save cognitive metrics to localStorage for Mind & Focus Insights
      try {
        const stats = JSON.parse(localStorage.getItem('ojas_cognitive_stats') || '{"memory":[],"reaction":[]}');
        stats.memory.push({
          date: new Date().toISOString(),
          level,
          sequenceLength: sequence.length,
          responseMs,
          success: true,
        });
        localStorage.setItem('ojas_cognitive_stats', JSON.stringify(stats));
      } catch {}

      if (level < 3) {
        // Advance to next level
        setTimeout(() => {
          setLevel((l) => l + 1);
          startLevel(level + 1);
        }, 800);
      } else {
        // Complete Victory!
        setGameState('victory');
        gamificationService.claimQuest('cosmic-memory-complete', 'Cosmic Memory Sequence Master', 50)
          .then(() => setXpClaimed(true))
          .catch(() => setXpClaimed(true));
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              GAME 2 • COGNITIVE MEMORY PRACTICE
            </span>
            <Badge variant="purple" size="sm">LEVEL {level} OF 3</Badge>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#252039] mt-1">
            Cosmic Memory — Sequence Recall
          </h2>
          <p className="text-xs text-[#716B83] mt-0.5 font-sans">
            Observe the celestial illumination sequence, hold it in working memory, then reproduce the trajectory in order.
          </p>
        </div>

        {gameState !== 'idle' && (
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2] text-[#252039]">
              Sequence: <span className="font-bold text-primary">{userSequence.length} / {sequence.length}</span>
            </div>
            {averageReactionMs > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2] text-[#252039]">
                Pace: <span className="font-bold text-emerald-600">{averageReactionMs} ms</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Play Arena */}
      {gameState === 'idle' && (
        <div className="text-center py-12 space-y-5 bg-gradient-to-b from-[#FAF9FF] to-white rounded-2xl border border-[#E9E4F2] p-8">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-pastel-lavender flex items-center justify-center text-primary shadow-soft">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading font-bold text-xl text-[#252039]">Ready for Sequence Recall?</h3>
            <p className="text-xs text-[#716B83] leading-relaxed">
              3 progressive difficulty rounds. Each round introduces longer celestial trajectories to reinforce non-stress memory agility.
            </p>
          </div>
          <Button size="lg" onClick={handleStartGame} className="gap-2 font-heading font-bold text-sm px-8 py-3 rounded-xl shadow-soft">
            <Play className="h-4 w-4" />
            <span>Initiate Sequence</span>
          </Button>
        </div>
      )}

      {(gameState === 'showing' || gameState === 'recalling') && (
        <div className="space-y-6">
          {/* Status banner */}
          <div className="text-center py-2">
            {gameState === 'showing' ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold animate-pulse">
                <Sparkles className="h-4 w-4" />
                OBSERVE THE ILLUMINATED SEQUENCE...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                <Clock className="h-4 w-4" />
                NOW REPRODUCE THE ORDER: TAP THE PLANETS IN SEQUENCE
              </span>
            )}
          </div>

          {/* Planet Grid */}
          <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-6 gap-4">
            {CELESTIAL_OBJECTS.map((planet) => {
              const isLit = activeHighlight === planet.id;
              const isSelected = userSequence.includes(planet.id);
              return (
                <motion.button
                  key={planet.id}
                  type="button"
                  whileHover={gameState === 'recalling' ? { scale: 1.05 } : {}}
                  whileTap={gameState === 'recalling' ? { scale: 0.95 } : {}}
                  onClick={() => handlePlanetClick(planet.id)}
                  disabled={gameState !== 'recalling'}
                  className={`p-5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 relative overflow-hidden ${
                    isLit
                      ? 'ring-4 ring-[#7656D9] shadow-purple-glow bg-white scale-105'
                      : 'bg-white border-[#E9E4F2] shadow-soft hover:border-[#7656D9]/40'
                  }`}
                  style={{
                    backgroundColor: isLit ? '#F2EDFF' : '#FFFFFF',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-soft font-heading font-black text-lg transition-transform"
                    style={{
                      backgroundColor: planet.color,
                      transform: isLit ? 'scale(1.15)' : 'scale(1)',
                    }}
                  >
                    {planet.name[0]}
                  </div>
                  <span className="font-heading font-bold text-sm text-[#252039]">{planet.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Victory State */}
      {gameState === 'victory' && (
        <div className="text-center py-10 space-y-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-soft">
            <Trophy className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-2xl text-[#252039]">
              Cosmic Trajectory Mastered!
            </h3>
            <p className="text-xs text-[#716B83] max-w-md mx-auto mt-1">
              You accurately reproduced 3 consecutive planetary sequences. Average reaction time: {averageReactionMs} ms.
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

      {/* Failure State */}
      {gameState === 'failed' && (
        <div className="text-center py-10 space-y-4 bg-rose-50/70 border border-rose-200 rounded-2xl p-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xl text-[#252039]">Sequence Interrupted</h3>
            <p className="text-xs text-[#716B83] max-w-md mx-auto mt-1">
              Working memory adapts to orbital drift naturally. Take a slow breath and try again whenever ready.
            </p>
          </div>
          <Button size="md" onClick={handleStartGame} className="gap-2 font-heading font-bold text-xs rounded-xl">
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}
    </div>
  );
};

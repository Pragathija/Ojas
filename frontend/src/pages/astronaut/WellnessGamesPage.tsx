import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2,
  Wind,
  Brain,
  Target,
  Sparkles,
  Trophy,
  Globe,
  Clock,
  Eye,
  ArrowLeft,
  Play,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Compass,
  Award,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  BreathingSpaceGame,
  CosmicMemoryGame,
  StarFocusGame,
  NebulaPuzzleGame,
  OrbitExplorerGame,
  QuietOrbitGame,
  MindFocusInsights,
} from '../../components/games';
import { pageVariants, cardVariants, staggerContainer } from '../../lib/animations';

interface GameCardMeta {
  id: string;
  title: string;
  category: 'Guided Relaxation' | 'Working Memory' | 'Visual Attention' | 'Problem Solving' | 'Mindfulness' | 'Space Exploration';
  description: string;
  duration: string;
  difficulty: 'Relaxed' | 'Adaptive' | 'Normal' | 'Cadet/Specialist';
  artworkBg: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  xpReward: number;
  completed?: boolean;
}

const ARCADE_GAMES: GameCardMeta[] = [
  {
    id: 'breathing',
    title: 'Breathing Orbit',
    category: 'Guided Relaxation',
    description: 'Animated expanding circle with 4-4-4-4 box breathing pacing, 528 Hz acoustic chimes, and autonomic tension release.',
    duration: '2–5 Min',
    difficulty: 'Relaxed',
    artworkBg: 'from-[#E8E0FF] via-[#F2EDFF] to-[#FAF9FF]',
    icon: Wind,
    accentColor: '#7656D9',
    xpReward: 50,
  },
  {
    id: 'memory',
    title: 'Cosmic Memory',
    category: 'Working Memory',
    description: 'Observe illuminated celestial sequences across planetary orbits, hold them in working memory, and reproduce the trajectory in order.',
    duration: '3–5 Min',
    difficulty: 'Adaptive',
    artworkBg: 'from-[#FAF9FF] via-[#F8F6FF] to-[#EAF3FF]',
    icon: Brain,
    accentColor: '#2F7BE5',
    xpReward: 50,
  },
  {
    id: 'focus',
    title: 'Star Focus',
    category: 'Visual Attention',
    description: 'Scan deep-space star fields to identify navigation beacon clusters among controlled visual shifts with reaction velocity tracking.',
    duration: '2–4 Min',
    difficulty: 'Normal',
    artworkBg: 'from-[#F8F6FF] via-[#FAF9FF] to-[#E9F7F0]',
    icon: Target,
    accentColor: '#19A974',
    xpReward: 50,
  },
  {
    id: 'puzzle',
    title: 'Nebula Puzzle',
    category: 'Problem Solving',
    description: 'Slide displaced telemetry matrix power nodes into numeric sequence to restore circuit flow in the habitation module.',
    duration: '3–6 Min',
    difficulty: 'Cadet/Specialist',
    artworkBg: 'from-[#FAF9FF] via-[#F2EDFF] to-[#FFF1E8]',
    icon: Gamepad2,
    accentColor: '#E06D3B',
    xpReward: 50,
  },
  {
    id: 'galaxy',
    title: 'Quiet Galaxy',
    category: 'Mindfulness',
    description: 'Contemplate deep space horizons inspired by the Overview Effect with 432 Hz ambient cosmic drone audio. Completely zero pressure.',
    duration: 'Self-Paced',
    difficulty: 'Relaxed',
    artworkBg: 'from-[#F8F6FF] via-[#E8E0FF]/40 to-[#FAF9FF]',
    icon: Eye,
    accentColor: '#8B78C6',
    xpReward: 50,
  },
  {
    id: 'explorer',
    title: 'Orbit Explorer',
    category: 'Space Exploration',
    description: 'Explore authentic NASA research outposts, discover empirical Inspiration4 and bed-rest findings, and unlock exploration badges.',
    duration: '4–8 Min',
    difficulty: 'Adaptive',
    artworkBg: 'from-[#EAF3FF] via-[#F8F6FF] to-[#FAF9FF]',
    icon: Globe,
    accentColor: '#5535A5',
    xpReward: 75,
  },
];

export const WellnessGamesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'arcade' | 'insights'>('arcade');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(searchParams.get('game'));

  const handleOpenGame = (gameId: string) => {
    setSelectedGameId(gameId);
    setSearchParams({ game: gameId });
  };

  const handleCloseGame = () => {
    setSelectedGameId(null);
    setSearchParams({});
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* If a game is active, render its arena */}
      {selectedGameId ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCloseGame}
              className="gap-2 font-heading font-bold text-xs rounded-xl border border-primary/25"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Space Arcade</span>
            </Button>

            <span className="font-mono text-xs font-bold text-primary">
              Session Live • Non-Clinical
            </span>
          </div>

          <div className="animate-in fade-in duration-300">
            {selectedGameId === 'breathing' && <BreathingSpaceGame />}
            {selectedGameId === 'memory' && <CosmicMemoryGame />}
            {selectedGameId === 'focus' && <StarFocusGame />}
            {selectedGameId === 'puzzle' && <NebulaPuzzleGame />}
            {selectedGameId === 'galaxy' && <QuietOrbitGame />}
            {selectedGameId === 'explorer' && <OrbitExplorerGame />}
          </div>
        </div>
      ) : (
        <>
          {/* Top Hero Banner */}
          <div className="relative rounded-3xl bg-white border border-[#E9E4F2] shadow-soft p-6 tablet:p-10 overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-bl from-[#E8E0FF]/50 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col tablet:flex-row tablet:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold uppercase tracking-wider">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span>ASTRONAUT GAMING &amp; WELLNESS ARCADE</span>
                </div>
                <h1 className="font-heading font-extrabold text-3xl tablet:text-5xl text-[#252039] tracking-tight">
                  Space Arcade — Play, Relax and Explore
                </h1>
                <p className="text-sm tablet:text-base text-[#716B83] font-sans leading-relaxed">
                  Interactive cognitive challenges and guided relaxation rituals designed specifically for long-duration interplanetary spaceflight.
                </p>
              </div>

              {/* Quick Status Pill */}
              <div className="flex flex-col items-start tablet:items-end gap-2 shrink-0">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2]">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs font-bold text-[#252039]">1,450 Total XP</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  ✓ 6 of 6 Subsystems Operational
                </span>
              </div>
            </div>

            {/* View Mode Toggle: Arcade Games vs Mind & Focus Insights */}
            <div className="pt-4 border-t border-[#E9E4F2] flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('arcade')}
                className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs tablet:text-sm cursor-pointer transition-all ${
                  activeTab === 'arcade'
                    ? 'bg-[#7656D9] text-white shadow-soft'
                    : 'bg-[#FAF9FF] text-[#716B83] hover:text-[#252039] hover:bg-white border border-[#E9E4F2]'
                }`}
              >
                Space Arcade Games (6)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('insights')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs tablet:text-sm cursor-pointer transition-all ${
                  activeTab === 'insights'
                    ? 'bg-[#7656D9] text-white shadow-soft'
                    : 'bg-[#FAF9FF] text-[#716B83] hover:text-[#252039] hover:bg-white border border-[#E9E4F2]'
                }`}
              >
                <Brain className="h-4 w-4" />
                <span>Mind &amp; Focus Insights</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Space Arcade Games Grid */}
          {activeTab === 'arcade' && (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6"
            >
              {ARCADE_GAMES.map((game) => {
                const Icon = game.icon;
                return (
                  <motion.div
                    key={game.id}
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft overflow-hidden flex flex-col justify-between hover:border-[#7656D9]/40 transition-colors group"
                  >
                    {/* Visual Card Artwork Header */}
                    <div className={`p-6 bg-gradient-to-br ${game.artworkBg} border-b border-[#E9E4F2] relative space-y-4`}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase font-bold text-primary tracking-wider bg-white/90 px-3 py-1 rounded-full border border-primary/20 shadow-xs">
                          {game.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                          +{game.xpReward} XP
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                          style={{ color: game.accentColor }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-heading font-extrabold text-xl text-[#252039] leading-tight">
                            {game.title}
                          </h3>
                          <span className="font-mono text-[11px] text-[#716B83]">
                            Pacing: {game.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content & Action */}
                    <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-[#716B83] font-sans leading-relaxed">
                        {game.description}
                      </p>

                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between text-xs font-mono text-[#716B83] border-t border-[#E9E4F2] pt-3">
                          <span>Difficulty: <strong className="text-[#252039]">{game.difficulty}</strong></span>
                          <span className="text-emerald-600 font-bold">Available Now</span>
                        </div>

                        <Button
                          size="md"
                          onClick={() => handleOpenGame(game.id)}
                          className="w-full gap-2 font-heading font-bold text-xs rounded-xl shadow-soft py-2.5 group-hover:shadow-soft-md"
                        >
                          <Play className="h-3.5 w-3.5" />
                          <span>Launch {game.title}</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Tab 2: Cognitive Performance Analytics */}
          {activeTab === 'insights' && (
            <motion.div variants={cardVariants} initial="initial" animate="animate">
              <MindFocusInsights />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Rocket,
  Globe,
  Gamepad2,
  Activity,
  Brain,
  Telescope,
  Trophy,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Wind,
  Moon,
  Zap,
  Target,
  HeartPulse,
} from 'lucide-react';
import { gamificationService, GamificationState } from '../../services';

const PLANETS_SUMMARY = [
  { id: 'serenity_station', name: 'Serenity Station', role: 'Breathing & Mindfulness', icon: Wind, link: '/astronaut/games?tab=breathing' },
  { id: 'sleep_garden', name: 'Sleep Garden', role: 'Circadian Rest & Recovery', icon: Moon, link: '/astronaut/mind-garden' },
  { id: 'focus_nebula', name: 'Focus Nebula', role: 'Attention & Reaction Challenges', icon: Target, link: '/astronaut/games?tab=focus' },
  { id: 'recovery_moon', name: 'Recovery Moon', role: 'Memory Orbit Alignment', icon: Gamepad2, link: '/astronaut/games?tab=memory' },
  { id: 'science_observatory', name: 'Science Observatory', role: 'NASA OSDR & Bedrest Research', icon: Telescope, link: '/astronaut/science' },
  { id: 'exploration_galaxy', name: 'Exploration Galaxy', role: 'Space Exploration Quizzes', icon: Globe, link: '/astronaut/games?tab=puzzles' },
];

export const AstronautUniversePage: React.FC = () => {
  const [gameState, setGameState] = useState<GamificationState | null>(null);
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);

  useEffect(() => {
    gamificationService.getStatus().then((res) => {
      setGameState(res);
      setClaimedQuests(res.claimed_quests.map((q) => q.quest_id));
    });
  }, []);

  const handleQuickClaim = async (questId: string, title: string) => {
    try {
      const res = await gamificationService.claimQuest(questId, title, 50);
      setClaimedQuests((prev) => [...prev, questId]);
      if (gameState) {
        setGameState({
          ...gameState,
          total_xp: res.new_total_xp,
          level: res.level,
        });
      }
    } catch {}
  };

  const isQuestClaimed = (qid: string) => claimedQuests.includes(qid);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Personalized Welcome & Mission Trajectory Header */}
      <section className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
        <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold uppercase tracking-wider">
              <Rocket className="h-3.5 w-3.5" />
              <span>ARTEMIS-V TRANSIT • LUNAR GATEWAY BOUND</span>
            </div>
            <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
              Welcome Back, Commander Sarah Connor.
            </h1>
            <p className="text-sm text-[#716B83] font-sans max-w-2xl">
              All personal biometric corridors are nominal. Microgravity conditioning index: 94%. Your wellness habits today reinforce continuous flight readiness.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
              <span className="text-[#716B83] block">MISSION DAY</span>
              <strong className="text-base text-[#252039] font-heading font-black block">42 / 180</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
              <span className="text-[#716B83] block">MISSION LEVEL</span>
              <strong className="text-base text-[#7656D9] font-heading font-black block">
                LVL {gameState?.level || 4}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
              <span className="text-[#716B83] block">ROUTINE STREAK</span>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                <strong className="text-base text-[#252039] font-heading font-black">
                  {gameState?.current_streak_days || 7} Days
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Mission Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-[#E9E4F2]">
          <div className="flex justify-between text-xs font-mono text-[#716B83]">
            <span>Deep Space Transit Progress</span>
            <span className="font-bold text-[#7656D9]">23.3% to Lunar Orbital Insertion</span>
          </div>
          <div className="w-full bg-[#F8F6FF] rounded-full h-2.5 overflow-hidden border border-[#E9E4F2]">
            <div className="bg-gradient-to-r from-[#7656D9] to-[#5535A5] h-2.5 rounded-full" style={{ width: '23.3%' }} />
          </div>
        </div>
      </section>

      {/* 2. Today's Personal Wellbeing Overview Cards */}
      <section className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#716B83] font-bold uppercase">PHYSICAL CORRIDOR</span>
            <HeartPulse className="h-4 w-4 text-[#7656D9]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-3xl text-[#252039]">64</span>
            <span className="font-mono text-xs text-[#716B83]">bpm resting</span>
          </div>
          <p className="text-xs text-emerald-700 font-sans">
            SpO2 98.2% • Within 7-day median baseline (60-68 bpm).
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#716B83] font-bold uppercase">CIRCADIAN REST</span>
            <Moon className="h-4 w-4 text-[#5535A5]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-3xl text-[#252039]">7.4</span>
            <span className="font-mono text-xs text-[#716B83]">hours sleep</span>
          </div>
          <p className="text-xs text-emerald-700 font-sans">
            91% efficiency • Aligned with orbital phototherapy schedule.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#716B83] font-bold uppercase">INNER EQUILIBRIUM</span>
            <Brain className="h-4 w-4 text-[#7656D9]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-black text-3xl text-[#252039]">Calm</span>
            <span className="font-mono text-xs text-[#716B83]">self-reported</span>
          </div>
          <p className="text-xs text-[#716B83] font-sans">
            Sensor Stress Index: 22% (Low) • Mind Garden available.
          </p>
        </div>
      </section>

      {/* 3. Explorable Celestial Worlds Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#7656D9]" />
              <h2 className="font-heading text-xl font-bold text-[#252039]">Explore Your Planetary Worlds</h2>
            </div>
            <p className="text-xs text-[#716B83]">
              Each planetary station is dedicated to a distinct aspect of astronaut mental and physical wellbeing.
            </p>
          </div>
          <Link
            to="/astronaut/planets"
            className="text-xs font-heading font-bold text-[#7656D9] hover:underline flex items-center gap-1"
          >
            <span>Open Full Interactive Space Map</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-5">
          {PLANETS_SUMMARY.map((planet) => {
            const Icon = planet.icon;
            return (
              <Link
                key={planet.id}
                to={planet.link}
                className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft hover:border-[#7656D9]/50 hover:shadow-soft-md transition-all group space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-[#252039] group-hover:text-[#7656D9] transition-colors">
                    {planet.name}
                  </h3>
                  <p className="text-xs text-[#716B83] mt-1 font-sans">{planet.role}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#7656D9]">
                  <span>Launch Station</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Today's Recommended Optional Quests */}
      <section className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="h-5 w-5 text-[#7656D9]" />
            <div>
              <h3 className="font-heading font-bold text-base text-[#252039]">Today's Habit &amp; Wellness Routines</h3>
              <p className="text-xs text-[#716B83]">Voluntary activities to reinforce healthy mission routines.</p>
            </div>
          </div>
          <span className="font-mono text-xs text-[#716B83]">All Quests Voluntary</span>
        </div>

        <div className="space-y-3">
          {[
            { id: 'quest-morning-sync', title: 'Morning Telemetry Baseline Verification', xp: 50 },
            { id: 'quest-box-breath', title: '2-Minute Parasympathetic Box Breathing', xp: 50 },
            { id: 'quest-mind-reflect', title: 'Private Encrypted Cupola Reflection', xp: 50 },
            { id: 'quest-osdr-audit', title: 'Inspiration4 Multi-Omic Research Review', xp: 50 },
          ].map((q) => {
            const claimed = isQuestClaimed(q.id);
            return (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {claimed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#D8D0EB]" />
                  )}
                  <span className={`text-xs tablet:text-sm font-sans font-medium ${claimed ? 'line-through text-[#716B83]' : 'text-[#252039]'}`}>
                    {q.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#7656D9]">+{q.xp} XP</span>
                  <button
                    onClick={() => handleQuickClaim(q.id, q.title)}
                    disabled={claimed}
                    className={`px-3.5 py-1.5 rounded-xl font-heading font-bold text-xs transition-colors cursor-pointer ${
                      claimed
                        ? 'bg-emerald-100 text-emerald-800 opacity-60 cursor-default'
                        : 'bg-[#7656D9] text-white hover:bg-[#6444C9]'
                    }`}
                  >
                    {claimed ? 'Claimed' : 'Complete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

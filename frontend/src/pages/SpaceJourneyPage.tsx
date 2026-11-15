import React, { useState, useEffect } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Flame,
  Award,
  Play,
  ArrowRight,
  ShieldAlert,
  Wind,
  Moon,
  Eye,
  Activity,
  BookOpen,
  Rocket,
  Sprout,
  Telescope,
} from 'lucide-react';

interface Planet {
  id: string;
  name: string;
  tagline: string;
  description: string;
  unlockXp: number;
  color: string;
  bgGlow: string;
  orbitRadius: number;
  orbitAngle: number;
  activityTitle: string;
  activityType: 'breathing' | 'circadian' | 'mindfulness' | 'hydration' | 'science' | 'contemplation';
  activityDescription: string;
  xpReward: number;
  icon: React.ComponentType<{ className?: string }>;
}

const PLANETS: Planet[] = [
  {
    id: 'serenity-station',
    name: 'Serenity Station',
    tagline: 'Orbital Autonomic Sanctuary',
    description: 'A tranquil low-Earth habitat compartment designed for autonomous nervous system balance and paced respiratory rhythms.',
    unlockXp: 0,
    color: '#9BDCC3',
    bgGlow: 'rgba(155, 220, 195, 0.3)',
    orbitRadius: 110,
    orbitAngle: 30,
    activityTitle: 'Serenity Breathing Flow',
    activityType: 'breathing',
    activityDescription: 'Engage in a 2-minute paced box breathing cycle to calm autonomic tension.',
    xpReward: 50,
    icon: Sprout,
  },
  {
    id: 'sleep-garden',
    name: 'Sleep Garden',
    tagline: 'Circadian Lunar Oasis',
    description: 'A bioluminescent habitat zone shielded from harsh solar glare, optimizing melatonin cycles and consolidated sleep latency.',
    unlockXp: 150,
    color: '#8B78C6',
    bgGlow: 'rgba(139, 120, 198, 0.3)',
    orbitRadius: 180,
    orbitAngle: 95,
    activityTitle: 'Circadian Dimming Protocol',
    activityType: 'circadian',
    activityDescription: 'Review sleep efficiency logs and shift habitat illumination to restful amber.',
    xpReward: 75,
    icon: Moon,
  },
  {
    id: 'focus-nebula',
    name: 'Focus Nebula',
    tagline: 'Cognitive Centering Cloud',
    description: 'An observation station nestled within deep quiet horizons, providing uninterrupted mental space for scientific reflection.',
    unlockXp: 300,
    color: '#7656D9',
    bgGlow: 'rgba(118, 86, 217, 0.3)',
    orbitRadius: 250,
    orbitAngle: 170,
    activityTitle: 'Quiet Orbit Perspective',
    activityType: 'mindfulness',
    activityDescription: 'Spend 90 seconds observing the silent curvature of the horizon without tasks.',
    xpReward: 100,
    icon: Eye,
  },
  {
    id: 'recovery-moon',
    name: 'Recovery Moon',
    tagline: 'Active Physical Regeneration Base',
    description: 'A low-gravity countermeasure station providing resistance protocols and musculoskeletal decompression.',
    unlockXp: 500,
    color: '#FFC98B',
    bgGlow: 'rgba(255, 201, 139, 0.3)',
    orbitRadius: 320,
    orbitAngle: 235,
    activityTitle: 'Countermeasure Habit Verification',
    activityType: 'hydration',
    activityDescription: 'Confirm daily fluid intake schedule and ARED resistive countermeasure completion.',
    xpReward: 100,
    icon: Activity,
  },
  {
    id: 'science-observatory',
    name: 'Science Observatory',
    tagline: 'NASA OSDR Empirical Lab Outpost',
    description: 'A deep-space research hub hosting authentic NASA Open Science Data Repository studies (OSD-575 & OSD-569).',
    unlockXp: 800,
    color: '#5535A5',
    bgGlow: 'rgba(85, 53, 165, 0.3)',
    orbitRadius: 390,
    orbitAngle: 305,
    activityTitle: 'NASA Spaceflight Study Exploration',
    activityType: 'science',
    activityDescription: 'Review Inspiration4 immune cytokine and hematology longitudinal epochs.',
    xpReward: 125,
    icon: Telescope,
  },
  {
    id: 'exploration-galaxy',
    name: 'Exploration Galaxy',
    tagline: 'Interstellar Deep Space Horizon',
    description: 'The pinnacle of autonomous space exploration, uniting body, mind, and empirical science into permanent vitality.',
    unlockXp: 1200,
    color: '#D9536F',
    bgGlow: 'rgba(217, 83, 111, 0.3)',
    orbitRadius: 460,
    orbitAngle: 350,
    activityTitle: 'Cosmic Overview Journal Reflection',
    activityType: 'contemplation',
    activityDescription: 'Write an open reflection on your journey across the cosmos for future crew logs.',
    xpReward: 150,
    icon: Sparkles,
  },
];

export const SpaceJourneyPage: React.FC = () => {
  // Current XP and completed activities state
  const [userXp, setUserXp] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('ojas_user_xp');
      return stored ? Number(stored) : 1450;
    } catch {
      return 1450;
    }
  });

  const [completedActivities, setCompletedActivities] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('ojas_completed_planet_activities');
      return stored ? JSON.parse(stored) : ['serenity-station', 'sleep-garden'];
    } catch {
      return ['serenity-station', 'sleep-garden'];
    }
  });

  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleLaunchActivity = (planet: Planet) => {
    if (completedActivities.includes(planet.id)) {
      setActionSuccessMessage(`You have already completed the exploration mission for ${planet.name}!`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      return;
    }

    // Award XP
    const newXp = userXp + planet.xpReward;
    const newCompleted = [...completedActivities, planet.id];

    setUserXp(newXp);
    setCompletedActivities(newCompleted);

    try {
      localStorage.setItem('ojas_user_xp', String(newXp));
      localStorage.setItem('ojas_completed_planet_activities', JSON.stringify(newCompleted));
    } catch (err) {
      console.warn('Storage write failed:', err);
    }

    setActionSuccessMessage(`Mission accomplished! Awarded +${planet.xpReward} XP for exploring ${planet.name}.`);
    setTimeout(() => setActionSuccessMessage(null), 5000);
  };

  const unlockedCount = PLANETS.filter((p) => userXp >= p.unlockXp).length;

  return (
    <PageContainer>
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E9E4F2] bg-white p-6 tablet:p-8 shadow-soft space-y-4">
        <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-primary" />
                <span>INTERACTIVE PLANETARY EXPEDITION</span>
              </span>
              <span className="text-[#E9E4F2]">•</span>
              <Badge variant="purple" size="sm">NON-CLINICAL GAMEPLAY</Badge>
            </div>

            <h1 className="font-heading text-3xl tablet:text-5xl font-extrabold tracking-tight text-[#252039]">
              The Space Journey
            </h1>

            <p className="text-sm text-[#716B83] max-w-2xl leading-relaxed font-sans">
              Navigate the Ojas planetary cosmos. Unlock serene stations, engage in restorative non-clinical wellness quests, and celebrate your journey across human spaceflight.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-3 shadow-xs">
              <Flame className="h-6 w-6 text-amber-500 fill-amber-500 shrink-0" />
              <div className="text-left font-mono">
                <span className="block text-xs font-bold text-primary">7-Day Habit Streak</span>
                <span className="block text-sm font-extrabold text-[#252039]">{userXp} Total XP</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-3 shadow-xs">
              <Award className="h-6 w-6 text-primary shrink-0" />
              <div className="text-left font-mono">
                <span className="block text-xs font-bold text-primary">Planets Explored</span>
                <span className="block text-sm font-extrabold text-[#252039]">{unlockedCount} / {PLANETS.length} Unlocked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl bg-pastel-mint border border-[#C2EAD6] text-xs font-sans text-[#252039] flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* 2D Illustrated Planetary Universe Map */}
      <Card className="p-6 tablet:p-8 space-y-6 border-[#E9E4F2] bg-gradient-to-b from-[#1C1832] via-[#2A234B] to-[#3B3264] text-white rounded-3xl shadow-soft-lg relative overflow-hidden">
        {/* Starry Background */}
        <div className="absolute top-8 left-16 w-1.5 h-1.5 rounded-full bg-white animate-star" />
        <div className="absolute top-24 right-20 w-1 h-1 rounded-full bg-[#9BDCC3] animate-star delay-300" />
        <div className="absolute top-44 left-1/3 w-2 h-2 rounded-full bg-[#FFC98B] animate-star delay-500" />
        <div className="absolute bottom-20 right-32 w-1.5 h-1.5 rounded-full bg-white animate-star delay-700" />
        <div className="absolute bottom-12 left-1/4 w-1 h-1 rounded-full bg-pastel-lavender animate-star" />

        {/* Orbit Rings Canvas Visualization */}
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div>
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <span>Orbital Exploration Chart</span>
              <span className="text-xs font-mono font-normal text-white/60">• Click any station to inspect &amp; explore</span>
            </h2>
          </div>
          <div className="font-mono text-xs text-white/70">
            Current Station: Artemis Gateway Transit
          </div>
        </div>

        {/* Planet Cards Array in Galaxy Orbit */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6 relative z-10 pt-2">
          {PLANETS.map((planet) => {
            const isUnlocked = userXp >= planet.unlockXp;
            const isCompleted = completedActivities.includes(planet.id);

            return (
              <div
                key={planet.id}
                onClick={() => setSelectedPlanet(planet)}
                className={`p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                  isUnlocked
                    ? 'bg-white/10 hover:bg-white/15 border-white/20 hover:border-white/40 shadow-soft hover:-translate-y-1'
                    : 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Status & XP requirements */}
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-white/10 text-white">
                      <planet.icon className="h-6 w-6" />
                    </div>
                    {isUnlocked ? (
                      isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Explored (+{planet.xpReward} XP)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7656D9]/40 text-[#E8E0FF] border border-[#7656D9]/50">
                          <Unlock className="h-3 w-3" />
                          <span>Unlocked (+{planet.xpReward} XP Available)</span>
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white/60 border border-white/10">
                        <Lock className="h-3 w-3" />
                        <span>Requires {planet.unlockXp} XP</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-white tracking-tight">
                      {planet.name}
                    </h3>
                    <span className="font-mono text-xs text-pastel-lavender block mt-0.5 font-semibold">
                      {planet.tagline}
                    </span>
                    <p className="text-xs text-white/70 leading-relaxed font-sans mt-2">
                      {planet.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Activity Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60 truncate max-w-[170px]">{planet.activityTitle}</span>
                  <span className="text-pastel-lavender font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ethical Space Gamification Charter Footer */}
        <div className="pt-4 border-t border-white/10 flex flex-col tablet:flex-row items-center justify-between gap-3 text-[11px] font-sans text-white/60 relative z-10">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-pastel-lavender shrink-0" />
            <span>
              <strong>Ethical Gamification:</strong> Exploration progress and XP are awarded exclusively for restorative wellness activities and educational milestones. Biological vital signs are never gamified.
            </span>
          </div>
          <span className="font-mono text-white/40 shrink-0">Ojas Cosmos v2.0</span>
        </div>
      </Card>

      {/* Planet Detail & Quest Modal */}
      {selectedPlanet && (
        <Modal
          isOpen={Boolean(selectedPlanet)}
          onClose={() => setSelectedPlanet(null)}
          title={selectedPlanet.name}
        >
          <div className="space-y-5 text-sm font-sans">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-primary uppercase">
                {selectedPlanet.tagline}
              </span>
              <div className="p-2 rounded-xl bg-pastel-lavender text-primary">
                <selectedPlanet.icon className="h-5 w-5" />
              </div>
            </div>

            <p className="text-[#252039] leading-relaxed">
              {selectedPlanet.description}
            </p>

            {/* Quest Box */}
            <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-xs text-[#252039] uppercase">
                  Station Quest: {selectedPlanet.activityTitle}
                </span>
                <span className="font-mono text-xs font-bold text-primary bg-white px-2 py-0.5 rounded-full border border-primary/20">
                  +{selectedPlanet.xpReward} XP
                </span>
              </div>
              <p className="text-xs text-[#716B83] leading-relaxed">
                {selectedPlanet.activityDescription}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E9E4F2] flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPlanet(null)}
              >
                Close
              </Button>

              {userXp >= selectedPlanet.unlockXp ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    handleLaunchActivity(selectedPlanet);
                    setSelectedPlanet(null);
                  }}
                  disabled={completedActivities.includes(selectedPlanet.id)}
                  className="font-heading font-bold text-xs shadow-soft"
                >
                  {completedActivities.includes(selectedPlanet.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Quest Completed</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      <span>Complete Exploration (+{selectedPlanet.xpReward} XP)</span>
                    </>
                  )}
                </Button>
              ) : (
                <span className="font-mono text-xs text-[#8C869E] flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Reach {selectedPlanet.unlockXp} XP to Unlock</span>
                </span>
              )}
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
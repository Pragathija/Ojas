import React, { useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Sparkles,
  Trophy,
  Zap,
  Target,
  ShieldCheck,
  BookOpen,
  Moon,
  HeartPulse,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  category: 'Engagement' | 'Circadian' | 'Scientific Literacy' | 'Operational Routine';
  description: string;
  xpReward: number;
  isUnlocked: boolean;
  progressPercent: number;
  unlockedDate?: string;
  icon: React.ReactNode;
}

interface DailyQuest {
  id: string;
  title: string;
  xp: number;
  completed: boolean;
  category: string;
}

export const AchievementsPage: React.FC = () => {
  const [totalXp, setTotalXp] = useState(1450);
  const [streakDays, setStreakDays] = useState(7);
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([
    {
      id: 'q-1',
      title: 'Morning Telemetry Sync — Transmit resting physiological state',
      xp: 50,
      completed: true,
      category: 'Biometric Habit',
    },
    {
      id: 'q-2',
      title: 'Circadian Rest Log — Confirm wake-up time & sleep duration',
      xp: 40,
      completed: true,
      category: 'Sleep Routine',
    },
    {
      id: 'q-3',
      title: 'NASA Research Audit — Inspect Inspiration4 OSD-575 metabolic panel',
      xp: 50,
      completed: false,
      category: 'Scientific Literacy',
    },
    {
      id: 'q-4',
      title: 'Review Flight Surgeon Briefing & Countermeasure Schedule',
      xp: 30,
      completed: false,
      category: 'Operational Adherence',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const achievements: Achievement[] = [
    {
      id: 'ach-1',
      title: 'Mission Initiated',
      category: 'Engagement',
      description: 'First successful end-to-end astronaut health telemetry check-in recorded on Artemis transit.',
      xpReward: 100,
      isUnlocked: true,
      progressPercent: 100,
      unlockedDate: 'Day 1 of Mission',
      icon: <Award className="h-6 w-6 text-primary" />,
    },
    {
      id: 'ach-2',
      title: 'Vital Watcher',
      category: 'Operational Routine',
      description: 'Maintained 7 consecutive days of scheduled non-invasive wearable biometrics transmission.',
      xpReward: 250,
      isUnlocked: true,
      progressPercent: 100,
      unlockedDate: 'Day 7 of Mission',
      icon: <HeartPulse className="h-6 w-6 text-emerald-600" />,
    },
    {
      id: 'ach-3',
      title: 'Sleep Guardian',
      category: 'Circadian',
      description: 'Logged 14 full-cycle sleep telemetry periods aligned with orbital phototherapy schedules.',
      xpReward: 300,
      isUnlocked: true,
      progressPercent: 100,
      unlockedDate: 'Day 21 of Mission',
      icon: <Moon className="h-6 w-6 text-indigo-600" />,
    },
    {
      id: 'ach-4',
      title: 'Data Explorer',
      category: 'Scientific Literacy',
      description: 'Reviewed authentic SpaceX Inspiration4 spaceflight datasets (OSD-575 & OSD-569).',
      xpReward: 200,
      isUnlocked: true,
      progressPercent: 100,
      unlockedDate: 'Day 35 of Mission',
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
    },
    {
      id: 'ach-5',
      title: 'Science Pioneer',
      category: 'Scientific Literacy',
      description: 'Audit NASA UTMB Bedrest Campaign 1 Actigraphy sleep trajectories against personal baselines.',
      xpReward: 350,
      isUnlocked: false,
      progressPercent: 75,
      icon: <Target className="h-6 w-6 text-purple-600" />,
    },
    {
      id: 'ach-6',
      title: 'Mission Ready',
      category: 'Operational Routine',
      description: 'Complete 30 consecutive days of operational wellness check-in routines and countermeasure logs.',
      xpReward: 500,
      isUnlocked: false,
      progressPercent: 68,
      icon: <ShieldCheck className="h-6 w-6 text-amber-600" />,
    },
  ];

  const handleCompleteQuest = (id: string, xp: number) => {
    setDailyQuests((prev) =>
      prev.map((q) => {
        if (q.id === id && !q.completed) {
          setTotalXp((curr) => curr + xp);
          setNotification(`Completed "${q.title.split('—')[0]}"! +${xp} Mission XP.`);
          setTimeout(() => setNotification(null), 3500);
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Mission Achievements & Wellness Gamification"
        tagline="AEROSPACE ENGAGEMENT & PROTOCOL COMPLIANCE"
        badge={
          <Badge variant="purple" size="sm">
            LEVEL 4 COMMANDER
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-content-secondary">Total Engagement:</span>
            <span className="font-heading font-black text-primary text-base">{totalXp.toLocaleString()} XP</span>
          </div>
        }
      />

      {/* Gamification Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-primary text-white text-xs font-medium flex items-center justify-between shadow-soft-md animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-80 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Hero Astronaut Progress Card */}
      <Card className="p-6 purple-subtle-gradient border border-primary/25 shadow-soft">
        <div className="flex flex-col laptop:flex-row items-start laptop:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl purple-gradient flex items-center justify-center font-heading font-black text-2xl text-white shadow-soft-md">
              4
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl text-content-main">
                  Commander Sarah Connor
                </h2>
                <Badge variant="normal" size="sm">
                  ACTIVE
                </Badge>
              </div>
              <p className="text-xs text-content-secondary mt-0.5">
                Current Level: <strong className="text-primary font-bold">Level 4 Mission Commander</strong> • 72% to Level 5
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full laptop:w-auto justify-between laptop:justify-end">
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-surface-border shadow-xs">
              <Flame className="h-6 w-6 text-amber-500 fill-amber-500" />
              <div>
                <span className="block font-heading font-black text-lg text-content-main leading-tight">
                  {streakDays} Days
                </span>
                <span className="block text-[10px] font-mono font-medium text-content-secondary uppercase">
                  Active Routine Streak
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-surface-border shadow-xs">
              <Trophy className="h-6 w-6 text-primary" />
              <div>
                <span className="block font-heading font-black text-lg text-primary leading-tight">
                  4 / 6
                </span>
                <span className="block text-[10px] font-mono font-medium text-content-secondary uppercase">
                  Badges Unlocked
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-primary/15">
          <div className="flex items-center justify-between text-xs font-mono font-medium mb-1.5">
            <span className="text-content-secondary">Mission Experience Level Progress</span>
            <span className="text-primary font-bold">{totalXp} / 2,000 XP</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-primary/20 shadow-inner">
            <div
              className="purple-gradient h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalXp / 2000) * 100)}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Ethical Spaceflight Gamification Principles Notice */}
      <div className="p-4 rounded-xl bg-white border border-surface-border text-xs text-content-secondary flex items-start gap-3 shadow-xs">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-content-main uppercase font-mono text-[11px] tracking-wide">
            Ethical Aerospace Gamification Principles
          </span>
          <p className="leading-relaxed">
            XP and badges are granted strictly for <strong>habitual engagement, routine telemetry check-ins, and scientific education</strong>. Ojas never ranks crew by vital readings, awards points for medical numbers, or gamifies clinical alerts. Clinical safety rules remain independent and authoritative.
          </p>
        </div>
      </div>

      {/* Daily Mission Habit Check-In Quests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-base text-content-main flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Today's Engagement Check-In Quests
          </h3>
          <span className="text-xs font-mono text-content-secondary">Refreshes every orbital UTC midnight</span>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3.5">
          {dailyQuests.map((quest) => (
            <Card
              key={quest.id}
              className={`p-4 flex items-center justify-between gap-3 border transition-all ${
                quest.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-surface-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 p-1 rounded-full ${
                    quest.completed ? 'text-emerald-600 bg-emerald-100' : 'text-slate-300 bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-content-main leading-snug">
                    {quest.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={quest.completed ? 'normal' : 'neutral'} size="sm">
                      {quest.category}
                    </Badge>
                    <span className="text-[11px] font-mono font-bold text-primary">+{quest.xp} XP</span>
                  </div>
                </div>
              </div>

              {!quest.completed && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCompleteQuest(quest.id, quest.xp)}
                  className="shrink-0 text-xs py-1"
                >
                  Check In
                </Button>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Achievement Badges Grid */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-base text-content-main flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          Mission Achievement Badges
        </h3>

        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <Card
              key={ach.id}
              className={`p-5 flex flex-col justify-between border transition-all ${
                ach.isUnlocked
                  ? 'bg-white border-surface-border shadow-soft'
                  : 'bg-slate-50/60 border-surface-border opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-xs ${
                      ach.isUnlocked ? 'bg-primary-light border border-primary/20' : 'bg-slate-200/70 border border-slate-300'
                    }`}
                  >
                    {ach.isUnlocked ? ach.icon : <Lock className="h-5 w-5 text-slate-500" />}
                  </div>
                  <Badge variant={ach.isUnlocked ? 'purple' : 'neutral'} size="sm">
                    {ach.category}
                  </Badge>
                </div>

                <h4 className="font-heading font-bold text-sm text-content-main flex items-center gap-2">
                  {ach.title}
                  {ach.isUnlocked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" />}
                </h4>
                <p className="text-xs text-content-secondary mt-1.5 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-surface-border flex items-center justify-between text-xs font-mono">
                {ach.isUnlocked ? (
                  <>
                    <span className="text-emerald-700 font-semibold">{ach.unlockedDate}</span>
                    <span className="text-primary font-bold">+{ach.xpReward} XP</span>
                  </>
                ) : (
                  <>
                    <div className="w-1/2 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${ach.progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-content-muted">{ach.progressPercent}%</span>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

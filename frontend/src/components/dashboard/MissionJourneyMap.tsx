import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';
import { Compass, Award, Flame, CheckCircle2, Rocket, Globe, Moon, Sparkles, ArrowRight } from 'lucide-react';

const MILESTONES = [
  { id: 'm1', name: 'Low Earth Orbit Departure', day: 'Day 1', status: 'completed', icon: Globe },
  { id: 'm2', name: 'Trans-Lunar Insertion & 0.38G Sim', day: 'Day 14', status: 'completed', icon: Rocket },
  { id: 'm3', name: 'Artemis Gateway Docking & Actigraphy Baseline', day: 'Day 42 (Today)', status: 'active', icon: Moon },
  { id: 'm4', name: 'Deep Space Autonomous Corridors', day: 'Day 90', status: 'upcoming', icon: Compass },
  { id: 'm5', name: 'Orbital Exploration Climax', day: 'Day 180', status: 'upcoming', icon: Sparkles },
];

export const MissionJourneyMap: React.FC = () => {
  return (
    <Card className="p-6 border-[#EAE6F2] bg-white shadow-soft space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-primary" />
              <span>SECTION D • EXPLORATION ROADMAP</span>
            </span>
            <Badge variant="purple" size="sm">EXPEDITION TRACKER</Badge>
          </div>
          <h3 className="font-heading text-lg font-bold text-content-main mt-0.5">
            Mission Journey Progress
          </h3>
          <p className="text-xs text-content-secondary">
            Tracking your adaptation milestones across the Artemis-V transit corridor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pastel-lavender border border-primary/20 text-xs font-mono font-bold text-primary">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>7-Day Streak</span>
          </div>
          <Link to="/space-journey">
            <Button size="sm" variant="primary" className="text-xs font-heading font-bold shadow-soft gap-1.5 rounded-xl">
              <Compass className="h-3.5 w-3.5" />
              <span>Explore Planets Game →</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Track Line with Waypoints */}
      <div className="py-2">
        <div className="relative">
          {/* Background Track Line */}
          <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-[#FAF9FF] -translate-y-1/2 rounded-full border border-[#EAE6F2]" />
          {/* Active Completed Progress */}
          <div className="absolute top-1/2 left-4 w-1/2 h-1.5 purple-gradient -translate-y-1/2 rounded-full" />

          {/* Milestone Nodes */}
          <div className="relative z-10 flex justify-between items-center px-1">
            {MILESTONES.map((m, idx) => {
              const isCompleted = m.status === 'completed';
              const isActive = m.status === 'active';
              const Icon = m.icon;

              return (
                <div key={m.id} className="flex flex-col items-center text-center max-w-[100px]">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary text-white ring-4 ring-primary/20 shadow-soft scale-110'
                        : isCompleted
                        ? 'bg-pastel-mint text-emerald-700 border border-[#C2EAD6]'
                        : 'bg-white border border-[#EAE6F2] text-content-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-content-main mt-2 block leading-tight">
                    {m.name}
                  </span>
                  <span
                    className={`font-mono text-[9px] mt-0.5 block ${
                      isActive ? 'text-primary font-bold' : 'text-content-muted'
                    }`}
                  >
                    {m.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lower Metrics Strip: Level Progress & Habit Check-ins */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 pt-2 border-t border-[#EAE6F2]">
        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] font-mono text-content-muted uppercase block">Rank Progression</span>
          <div className="font-heading text-sm font-bold text-content-main">
            Level 4 Commander (1,450 XP)
          </div>
          <div className="w-full bg-[#EEE8FF] h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-primary h-full w-[72%] rounded-full" />
          </div>
          <span className="text-[10px] font-mono text-content-secondary block">550 XP to Level 5 Captain</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] font-mono text-content-muted uppercase block">Daily Countermeasures</span>
          <div className="font-heading text-sm font-bold text-content-main">
            3 of 4 Completed (75%)
          </div>
          <span className="text-[11px] text-emerald-600 font-sans block">
            ARED resistance & hydration verified
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] font-mono text-content-muted uppercase block">NASA Knowledge Learned</span>
          <div className="font-heading text-sm font-bold text-content-main">
            5 Aerospace Modules
          </div>
          <span className="text-[11px] text-primary font-sans block">
            BRSMAct & OSDR OSD-575 read
          </span>
        </div>
      </div>
    </Card>
  );
};
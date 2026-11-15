import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Award, Flame, CheckCircle2, MapPin, Sparkles, ArrowRight, Compass, Rocket, TrendingUp, Moon } from 'lucide-react';

const DAILY_QUESTS = [
  { time: '07:30 UTC', task: 'Morning Hydration & Osmoregulation Check', xp: '+50 XP', status: 'Completed' },
  { time: '09:00 UTC', task: 'Bio-Harness Electrode Impedance Calibration', xp: '+50 XP', status: 'Completed' },
  { time: '13:00 UTC', task: '45-Min ARED Resistive Bone Countermeasure', xp: '+50 XP', status: 'In Progress' },
  { time: '21:00 UTC', task: 'Evening Circadian Illumination Shift & Mind Garden', xp: '+50 XP', status: 'Scheduled' },
];

export const DailySpaceJourney: React.FC = () => {
  return (
    <section id="daily-journey" className="py-24 border-b border-[#E9E4F2] bg-[#F8F6FF]">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <Compass className="h-4 w-4 text-primary" />
            <span>DAILY RHYTHMS &amp; PROGRESSION</span>
          </div>
          <h2 className="font-heading text-4xl tablet:text-5xl font-extrabold tracking-tight text-[#252039]">
            Your Daily Space Journey.
          </h2>
          <p className="text-[#716B83] text-base tablet:text-lg leading-relaxed font-sans">
            In microgravity, structure is vitality. Ojas transforms your mission protocols into an engaging daily exploration roadmap—reinforcing consistent habits without penalizing days when operational workload runs high.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-8 items-start">
          {/* Left Column: Mission Roadmap & Daily Activities */}
          <div className="laptop:col-span-7 space-y-6">
            <Card className="p-7 space-y-5 border-[#E9E4F2] shadow-soft rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
                <div className="flex items-center gap-2.5">
                  <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="font-heading font-bold text-base text-[#252039]">Today's Exploration Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="purple" size="sm">7-DAY STREAK</Badge>
                  <span className="font-mono text-xs font-bold text-primary">1,450 XP (LVL 4)</span>
                </div>
              </div>

              {/* Protocol timeline items */}
              <div className="space-y-3">
                {DAILY_QUESTS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] hover:bg-white transition-colors flex items-center justify-between gap-4 text-xs font-sans"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          item.status === 'Completed'
                            ? 'bg-pastel-mint text-emerald-700'
                            : item.status === 'In Progress'
                            ? 'bg-pastel-lavender text-primary'
                            : 'bg-white border border-[#E9E4F2] text-[#8C869E]'
                        }`}
                      >
                        {item.status === 'Completed' ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <span className="font-mono text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-mono text-[10px] text-[#8C869E] block">{item.time}</span>
                        <span className="font-heading font-bold text-[#252039] text-xs">{item.task}</span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-primary shrink-0 bg-white px-2.5 py-1 rounded-lg border border-primary/25 shadow-xs">
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Exploration Milestones & Badges */}
          <div className="laptop:col-span-5 space-y-6">
            <Card className="p-7 space-y-5 border-[#E9E4F2] shadow-soft bg-white rounded-2xl">
              <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-heading font-bold text-base text-[#252039]">Mission Milestones</span>
                </div>
                <Badge variant="normal" size="sm">3 OF 6 UNLOCKED</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-primary/20 text-center space-y-1.5 shadow-xs flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-pastel-lavender flex items-center justify-center text-primary">
                    <Rocket className="h-5 w-5" />
                  </div>
                  <span className="font-heading text-xs font-bold text-[#252039] block leading-tight">Mission Initiated</span>
                  <span className="font-mono text-[9px] text-emerald-700 block font-bold">Unlocked</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-primary/20 text-center space-y-1.5 shadow-xs flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center text-[#2F7BE5]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="font-heading text-xs font-bold text-[#252039] block leading-tight">Vital Watcher</span>
                  <span className="font-mono text-[9px] text-emerald-700 block font-bold">Unlocked</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF9FF] border border-primary/20 text-center space-y-1.5 shadow-xs flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-[#19A974]">
                    <Moon className="h-5 w-5" />
                  </div>
                  <span className="font-heading text-xs font-bold text-[#252039] block leading-tight">Sleep Guardian</span>
                  <span className="font-mono text-[9px] text-emerald-700 block font-bold">Unlocked</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-pastel-mint border border-[#C2EAD6] text-xs font-sans text-[#252039] space-y-1">
                <span className="font-bold block text-emerald-800">Ethical Gamification Standard:</span>
                <p className="text-[11px] text-[#716B83] leading-relaxed">
                  Points are awarded solely for check-in compliance, routine adherence, and restorative mindfulness. Vitals are never ranked between crew members.
                </p>
              </div>

              <Link to="/space-journey">
                <Button variant="outline" size="md" className="w-full gap-2 font-heading font-bold text-xs text-primary border-primary/30 rounded-xl">
                  <span>Enter Space Journey Universe</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
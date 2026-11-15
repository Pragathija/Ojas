import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Link } from 'react-router-dom';
import {
  Activity,
  Heart,
  Moon,
  Sparkles,
  Flower2,
  Dumbbell,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export interface WellbeingOverviewProps {
  isCheckedInToday?: boolean;
}

export const WellbeingOverview: React.FC<WellbeingOverviewProps> = ({
  isCheckedInToday = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
            SECTION A • HABITAT TELEMETRY SYNTHESIS
          </span>
          <Badge variant="purple" size="sm">TODAY'S OVERVIEW</Badge>
        </div>
        <span className="font-mono text-xs text-content-secondary">Day 42 • Circadian Cycle 06:00–22:00</span>
      </div>

      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-4">
        {/* 1. Physical Wellness Summary */}
        <Card className="p-5 border-[#EAE6F2] bg-white shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pastel-mint text-[#19A974] flex items-center justify-center font-bold">
                <Activity className="h-4 w-4" />
              </div>
              <span className="font-heading text-xs font-bold text-content-main">Physical Wellness</span>
            </div>
            <Badge variant="normal" size="sm">NOMINAL</Badge>
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-content-main">Corridor Stable</div>
            <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
              Autonomic, cardiovascular, and respiratory streams running within ±1.2σ personalized baseline limits.
            </p>
          </div>
          <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[10px] font-mono text-content-muted">
            <span>Bio-Harness 100 Hz Link</span>
            <span className="text-emerald-600 font-bold">99.4% Fidelity</span>
          </div>
        </Card>

        {/* 2. Mental Wellness Check-In Status */}
        <Card className="p-5 border-[#EAE6F2] bg-white shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pastel-lavender text-primary flex items-center justify-center font-bold">
                <Flower2 className="h-4 w-4" />
              </div>
              <span className="font-heading text-xs font-bold text-content-main">Mind Check-In</span>
            </div>
            <Badge variant={isCheckedInToday ? 'normal' : 'caution'} size="sm">
              {isCheckedInToday ? 'RECORDED' : 'PENDING'}
            </Badge>
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-content-main">
              {isCheckedInToday ? 'State: Calm' : 'Morning Check-In'}
            </div>
            <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
              {isCheckedInToday
                ? 'Voluntary reflection logged. Parasympathetic tone supported by morning breathing reset.'
                : 'Take 60 seconds to check in with how you feel in orbit. Fully private.'}
            </p>
          </div>
          <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[10px] font-mono">
            <Link to="/mind-garden" className="text-primary font-bold hover:underline flex items-center gap-1">
              <span>Open Mind Garden</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-content-muted">Encrypted</span>
          </div>
        </Card>

        {/* 3. Sleep Architecture Summary */}
        <Card className="p-5 border-[#EAE6F2] bg-white shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pastel-blue text-[#2F7BE5] flex items-center justify-center font-bold">
                <Moon className="h-4 w-4" />
              </div>
              <span className="font-heading text-xs font-bold text-content-main">Sleep Architecture</span>
            </div>
            <Badge variant="normal" size="sm">7.4h TST</Badge>
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-content-main">91% Efficiency</div>
            <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
              Consolidated sleep latency 14 min; 1.8h REM sleep. Nighttime habitat noise index stable at 44 dB.
            </p>
          </div>
          <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[10px] font-mono text-content-muted">
            <span>NASA Actigraphy Analog</span>
            <span className="text-[#2F7BE5] font-bold">Optimal Rest</span>
          </div>
        </Card>

        {/* 4. Activity & Recent AI Insight */}
        <Card className="p-5 border-[#EAE6F2] bg-white shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pastel-peach text-[#E06D3B] flex items-center justify-center font-bold">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="font-heading text-xs font-bold text-content-main">Activity & Countermeasure</span>
            </div>
            <Badge variant="purple" size="sm">ARED DONE</Badge>
          </div>
          <div>
            <div className="text-xl font-heading font-extrabold text-content-main">1,240 kcal Burned</div>
            <p className="text-[11px] text-content-secondary mt-1 leading-relaxed">
              45-min resistive bone-density protocol verified. Heart rate recovery curve nominal (T90 &lt; 180s).
            </p>
          </div>
          <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[10px] font-mono text-content-muted">
            <span className="flex items-center gap-1 text-primary font-bold">
              <Lightbulb className="h-3 w-3" />
              <span>Insight: Phase aligned</span>
            </span>
            <span className="text-emerald-600 font-bold">+50 XP</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
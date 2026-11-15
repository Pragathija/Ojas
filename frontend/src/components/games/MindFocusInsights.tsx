import React from 'react';
import {
  Brain,
  Target,
  Clock,
  Sparkles,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Activity,
  AlertTriangle,
  Smile,
  Heart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

const REACTION_TREND = [
  { day: 'Day 36', reactionMs: 385, accuracy: 92 },
  { day: 'Day 37', reactionMs: 362, accuracy: 95 },
  { day: 'Day 38', reactionMs: 370, accuracy: 90 },
  { day: 'Day 39', reactionMs: 348, accuracy: 96 },
  { day: 'Day 40', reactionMs: 355, accuracy: 94 },
  { day: 'Day 41', reactionMs: 338, accuracy: 98 },
  { day: 'Day 42', reactionMs: 342, accuracy: 97 },
];

export const MindFocusInsights: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner with Strict Ethical Mandate */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-4">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold uppercase mb-1">
              <Brain className="h-3.5 w-3.5" />
              <span>COGNITIVE PERFORMANCE &amp; WELLNESS ANALYTICS</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl tablet:text-3xl text-[#252039] tracking-tight">
              Mind &amp; Focus Insights
            </h2>
            <p className="text-xs tablet:text-sm text-[#716B83] mt-1 font-sans">
              Personal progress tracking for attention focus, working memory recall, and reaction velocity across Artemis-V transit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="purple" size="md">NON-CLINICAL</Badge>
            <Badge variant="normal" size="md">SELF-COMPARISON ONLY</Badge>
          </div>
        </div>

        {/* Mandatory Scientific Boundary Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-900 leading-relaxed font-sans">
            <span className="font-heading font-bold text-amber-950 uppercase block">
              Ethical Aerospace Human Factors Standard
            </span>
            <p>
              These activities measure performance on specific game tasks. They are not clinical mental-health assessments or validated intelligence tests. Ojas never diagnoses psychiatric conditions, calculates unvalidated mental scores, ranks crew members, or penalizes lower game scores. Game metrics are never used for mission fitness decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Task Performance Indicators Grid */}
      <div className="grid grid-cols-1 mobile:grid-cols-2 laptop:grid-cols-4 gap-5">
        <div className="p-5 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pastel-lavender flex items-center justify-center text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              +4% vs baseline
            </span>
          </div>
          <div>
            <span className="font-mono text-xs text-[#716B83] uppercase block">Sequence Recall Length</span>
            <span className="font-heading font-black text-2xl text-[#252039] mt-0.5 block">5.2 Planets</span>
            <span className="text-[11px] text-[#716B83]">Cosmic Memory accuracy: 94%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pastel-mint flex items-center justify-center text-emerald-700">
              <Target className="h-5 w-5" />
            </div>
            <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              Stable Focus
            </span>
          </div>
          <div>
            <span className="font-mono text-xs text-[#716B83] uppercase block">Mean Reaction Time</span>
            <span className="font-heading font-black text-2xl text-[#252039] mt-0.5 block">342 ms</span>
            <span className="text-[11px] text-[#716B83]">Star Focus detection: 97.4%</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pastel-blue flex items-center justify-center text-[#2F7BE5]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-mono text-[10px] text-primary font-bold bg-[#F2EDFF] px-2 py-0.5 rounded-full">
              100% Solved
            </span>
          </div>
          <div>
            <span className="font-mono text-xs text-[#716B83] uppercase block">Puzzle Completion</span>
            <span className="font-heading font-black text-2xl text-[#252039] mt-0.5 block">14 Matrices</span>
            <span className="text-[11px] text-[#716B83]">Average solution pace: 16 moves</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pastel-peach flex items-center justify-center text-[#E06D3B]">
              <Clock className="h-5 w-5" />
            </div>
            <span className="font-mono text-[10px] text-primary font-bold bg-[#F2EDFF] px-2 py-0.5 rounded-full">
              7-Day Total
            </span>
          </div>
          <div>
            <span className="font-mono text-xs text-[#716B83] uppercase block">Mindful Session Time</span>
            <span className="font-heading font-black text-2xl text-[#252039] mt-0.5 block">48 Minutes</span>
            <span className="text-[11px] text-[#716B83]">Quiet Orbit &amp; Breathing Space</span>
          </div>
        </div>
      </div>

      {/* Longitudinal Performance Trends Charts */}
      <div className="grid grid-cols-1 laptop:grid-cols-2 gap-6">
        {/* Chart A: Reaction Velocity (ms) */}
        <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-3">
            <div>
              <span className="font-heading font-bold text-base text-[#252039]">
                Visual Attention Reaction Velocity
              </span>
              <p className="text-xs text-[#716B83]">7-day longitudinal response latency (milliseconds)</p>
            </div>
            <span className="font-mono text-xs font-bold text-primary">Target &lt; 400 ms</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REACTION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reactionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7656D9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7656D9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECF8" />
                <XAxis dataKey="day" stroke="#8C869E" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis domain={[300, 420]} stroke="#8C869E" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E9E4F2',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Area type="monotone" dataKey="reactionMs" stroke="#7656D9" strokeWidth={2.5} fillOpacity={1} fill="url(#reactionGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Memory Recall Accuracy (%) */}
        <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-3">
            <div>
              <span className="font-heading font-bold text-base text-[#252039]">
                Sequence Recall Task Accuracy
              </span>
              <p className="text-xs text-[#716B83]">7-day working memory sequence reproduction percentage</p>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600">Mean 95.3%</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REACTION_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECF8" />
                <XAxis dataKey="day" stroke="#8C869E" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis domain={[80, 100]} stroke="#8C869E" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E9E4F2',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#19A974" strokeWidth={2.5} dot={{ fill: '#19A974', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Compass, Sparkles, Heart, ShieldCheck, Sun, Moon, ArrowRight, Sprout, Radio, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DiscoverOjas: React.FC = () => {
  return (
    <section id="journey" className="py-24 border-b border-[#E9E4F2] bg-white">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <Compass className="h-4 w-4 text-primary" />
            <span>DISCOVER OJAS • THE PHILOSOPHY</span>
          </div>
          <h2 className="font-heading text-4xl tablet:text-5xl font-extrabold tracking-tight text-[#252039]">
            An Explorer, Not a Patient.
          </h2>
          <p className="text-[#716B83] text-base tablet:text-lg leading-relaxed font-sans font-normal">
            In traditional aerospace medicine, astronauts can feel like clinical subjects in a high-stakes test. Ojas re-imagines mission health as an empowering journey of self-discovery, restorative rest, and proactive vitality.
          </p>
        </div>

        {/* 3 Core Experience Pillars */}
        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-8">
          <Card className="p-8 space-y-4 border-[#E9E4F2] hover:border-primary/40 transition-all bg-gradient-to-b from-white to-[#FAF9FF] shadow-soft rounded-2xl group">
            <div className="w-12 h-12 rounded-2xl bg-pastel-lavender flex items-center justify-center text-primary shadow-xs">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">
              Peaceful Mind Garden
            </h3>
            <p className="text-sm text-[#716B83] leading-relaxed font-sans">
              Decompress with gentle box breathing, cupola mindfulness, and private encrypted reflections. Safe, voluntary, and free from mission grading.
            </p>
            <div className="pt-2">
              <Link to="/mind-garden" className="font-mono text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                <span>Parasympathetic Recovery</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-8 space-y-4 border-[#E9E4F2] hover:border-primary/40 transition-all bg-gradient-to-b from-white to-[#FAF9FF] shadow-soft rounded-2xl group">
            <div className="w-12 h-12 rounded-2xl bg-pastel-blue flex items-center justify-center text-[#2F7BE5] shadow-xs">
              <Radio className="h-6 w-6 text-[#2F7BE5]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">
              Intelligent Baseline Corridors
            </h3>
            <p className="text-sm text-[#716B83] leading-relaxed font-sans">
              Every body adapts to microgravity uniquely. Ojas learns your personal baseline ranges rather than applying blunt Earth population averages.
            </p>
            <div className="pt-2">
              <Link to="/indicators" className="font-mono text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                <span>Isolation Forest v2 ML</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>

          <Card className="p-8 space-y-4 border-[#E9E4F2] hover:border-primary/40 transition-all bg-gradient-to-b from-white to-[#FAF9FF] shadow-soft rounded-2xl group">
            <div className="w-12 h-12 rounded-2xl bg-pastel-mint flex items-center justify-center text-[#19A974] shadow-xs">
              <Award className="h-6 w-6 text-[#19A974]" />
            </div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">
              Habit-Reinforcing Milestones
            </h3>
            <p className="text-sm text-[#716B83] leading-relaxed font-sans">
              Build sustainable circadian and exercise habits through gentle daily check-in streaks and mission badges—grounded in ethical wellness principles.
            </p>
            <div className="pt-2">
              <Link to="/space-journey" className="font-mono text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                <span>Space Journey Game</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
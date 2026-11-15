import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Flower2, Wind, Eye, BookOpen, Sparkles, ArrowRight, Lock } from 'lucide-react';

export const MindInSpace: React.FC = () => {
  return (
    <section id="mind" className="py-24 border-b border-[#E9E4F2] bg-gradient-to-b from-[#F8F6FF] to-white">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <Flower2 className="h-4 w-4 text-primary" />
            <span>BEHAVIORAL HEALTH &amp; INNER BALANCE</span>
          </div>
          <h2 className="font-heading text-4xl tablet:text-5xl font-extrabold tracking-tight text-[#252039]">
            Your Mind in Deep Space.
          </h2>
          <p className="text-[#716B83] text-base tablet:text-lg leading-relaxed font-sans">
            Multi-month confinement and isolation can strain the most resilient minds. Ojas provides optional, restorative activities designed to ground your thoughts, relieve stress, and reconnect you with peace.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Feature Highlights */}
          <div className="laptop:col-span-7 grid grid-cols-1 tablet:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-white border border-[#E9E4F2] shadow-soft space-y-3 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pastel-mint flex items-center justify-center text-[#19A974]">
                <Wind className="h-5 w-5" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#252039]">Breathing Space</h4>
              <p className="text-xs text-[#716B83] leading-relaxed font-sans">
                A 2-minute paced box breathing guide with expanding visuals and optional soft chimes to trigger natural parasympathetic rest.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E9E4F2] shadow-soft space-y-3 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pastel-blue flex items-center justify-center text-[#2F7BE5]">
                <Eye className="h-5 w-5" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#252039]">Quiet Orbit</h4>
              <p className="text-xs text-[#716B83] leading-relaxed font-sans">
                Contemplative orbital panoramas and deep-space perspectives inspired by the psychological Overview Effect reported by astronauts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E9E4F2] shadow-soft space-y-3 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pastel-lavender flex items-center justify-center text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#252039]">Voluntary Mood Tracking</h4>
              <p className="text-xs text-[#716B83] leading-relaxed font-sans">
                Check in on how you feel—calm, energized, or tired—without fear of flight disqualification or medical labeling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E9E4F2] shadow-soft space-y-3 hover:border-primary/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-pastel-peach flex items-center justify-center text-[#E06D3B]">
                <BookOpen className="h-5 w-5" />
              </div>
              <h4 className="font-heading text-lg font-bold text-[#252039]">Private Journal</h4>
              <p className="text-xs text-[#716B83] leading-relaxed font-sans">
                Write private logs that stay strictly on your device. Never transmitted over telemetry channels or viewed by flight surgeons.
              </p>
            </div>
          </div>

          {/* Right Column: Mind Sanctuary Preview Card */}
          <div className="laptop:col-span-5">
            <div className="rounded-3xl border border-[#E9E4F2] bg-gradient-to-tr from-[#FAF9FF] via-[#E8E0FF]/40 to-white p-7 shadow-soft space-y-6">
              <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
                <div className="flex items-center gap-2">
                  <Flower2 className="h-5 w-5 text-primary" />
                  <span className="font-heading font-bold text-sm text-[#252039]">Mind Garden Preview</span>
                </div>
                <Badge variant="purple" size="sm">VOLUNTARY</Badge>
              </div>

              {/* Sample Breathing Mini Bubble */}
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#E8E0FF] to-[#EAF3FF] border-2 border-primary/30 flex items-center justify-center shadow-soft">
                  <span className="font-heading text-xs font-bold text-primary">Inhale (4s)</span>
                </div>
                <p className="text-xs text-[#716B83] max-w-xs font-sans">
                  "Take a moment to release the mission timeline. Focus on the gentle expansion of your breath."
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-[#E9E4F2] flex items-center gap-2.5 text-xs text-[#716B83]">
                <Lock className="h-4 w-4 text-[#19A974] shrink-0" />
                <span className="text-[11px] font-sans">No clinical scores • No psychiatric evaluations • 100% private</span>
              </div>

              <Link to="/mind-garden">
                <Button variant="primary" size="md" className="w-full gap-2 font-heading font-bold text-xs shadow-soft rounded-xl py-2.5">
                  <span>Explore Mind Garden Sanctuary</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
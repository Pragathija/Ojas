import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Activity, ShieldCheck, Heart, Moon, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export const BodyInSpace: React.FC = () => {
  return (
    <section id="body" className="py-24 border-b border-[#E9E4F2] bg-white">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <Activity className="h-4 w-4 text-primary" />
            <span>AEROSPACE PHYSIOLOGY INTELLIGENCE</span>
          </div>
          <h2 className="font-heading text-4xl tablet:text-5xl font-extrabold tracking-tight text-[#252039]">
            Your Body in Space.
          </h2>
          <p className="text-[#716B83] text-base tablet:text-lg leading-relaxed font-sans">
            Continuous biosensors meet personalized AI. Ojas transforms high-frequency physiological telemetry into transparent, explainable corridors—empowering you to understand microgravity adaptations before they escalate.
          </p>
        </div>

        {/* 4 Feature Pillars Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-6">
          <Card className="p-6 space-y-3 border-[#E9E4F2] hover:border-primary/40 transition-all bg-[#FAF9FF] shadow-soft rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E4F2] flex items-center justify-center text-primary shadow-xs">
              <Heart className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-[#252039]">Personal Rolling Baselines</h4>
            <p className="text-xs text-[#716B83] leading-relaxed font-sans">
              Calculates robust 7-day median and interquartile ranges (IQR) per astronaut, adapting to individual spaceflight conditioning.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-[#E9E4F2] hover:border-primary/40 transition-all bg-[#FAF9FF] shadow-soft rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E4F2] flex items-center justify-center text-[#2F7BE5] shadow-xs">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-[#252039]">Isolation Forest v2 ML</h4>
            <p className="text-xs text-[#716B83] leading-relaxed font-sans">
              Detects multidimensional covariate anomalies without data leakage, subject-holdout verified across spaceflight datasets.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-[#E9E4F2] hover:border-primary/40 transition-all bg-[#FAF9FF] shadow-soft rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E4F2] flex items-center justify-center text-[#19A974] shadow-xs">
              <Moon className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-[#252039]">Circadian Sleep Analytics</h4>
            <p className="text-xs text-[#716B83] leading-relaxed font-sans">
              Tracks sleep architecture, REM proportions, and efficiency using actigraphy validated against NASA bedrest analogs.
            </p>
          </Card>

          <Card className="p-6 space-y-3 border-[#E9E4F2] hover:border-primary/40 transition-all bg-[#FAF9FF] shadow-soft rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E4F2] flex items-center justify-center text-[#D9536F] shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-heading text-base font-bold text-[#252039]">Clinical Safety Guarantee</h4>
            <p className="text-xs text-[#716B83] leading-relaxed font-sans">
              Critical and caution alerts follow deterministic rule boundaries and can never be overridden, suppressed, or gamified.
            </p>
          </Card>
        </div>

        {/* Live Indicator Strip Preview */}
        <div className="rounded-2xl border border-[#E9E4F2] bg-white p-6 shadow-soft space-y-4">
          <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#E9E4F2] pb-4">
            <span className="font-mono text-xs font-bold text-[#716B83] uppercase">
              SAMPLE HABITAT BIO-HARNESS TELEMETRY STREAM
            </span>
            <Link to="/indicators" className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1">
              <span>View All 12 Indicators</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 tablet:grid-cols-4 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2]">
              <span className="text-[10px] text-[#8C869E] block uppercase font-semibold">Heart Rate</span>
              <div className="font-heading text-2xl font-black text-[#252039] mt-1">68 <span className="text-xs font-normal text-[#716B83]">BPM</span></div>
              <span className="text-[11px] text-emerald-700 font-sans font-semibold">Nominal Baseline [55–85]</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2]">
              <span className="text-[10px] text-[#8C869E] block uppercase font-semibold">Pulse Oximetry</span>
              <div className="font-heading text-2xl font-black text-[#252039] mt-1">98.5 <span className="text-xs font-normal text-[#716B83]">%</span></div>
              <span className="text-[11px] text-emerald-700 font-sans font-semibold">Cabin O2 Equilibrium</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2]">
              <span className="text-[10px] text-[#8C869E] block uppercase font-semibold">Sleep Duration</span>
              <div className="font-heading text-2xl font-black text-[#252039] mt-1">7.4 <span className="text-xs font-normal text-[#716B83]">hrs</span></div>
              <span className="text-[11px] text-emerald-700 font-sans font-semibold">91% Sleep Efficiency</span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2]">
              <span className="text-[10px] text-[#8C869E] block uppercase font-semibold">Core Body Temp</span>
              <div className="font-heading text-2xl font-black text-[#252039] mt-1">37.1 <span className="text-xs font-normal text-[#716B83]">°C</span></div>
              <span className="text-[11px] text-emerald-700 font-sans font-semibold">Circadian Trough Active</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
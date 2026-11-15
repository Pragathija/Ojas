import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Activity, ShieldCheck, HeartPulse, ArrowRight, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <section id="product-preview" className="py-24 border-b border-[#E9E4F2] bg-white">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col laptop:flex-row laptop:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3.5">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
              <span>UNIFIED MISSION COCKPIT</span>
            </div>
            <h2 className="font-heading text-4xl tablet:text-5xl font-extrabold tracking-tight text-[#252039]">
              One Mission. Complete Physiological Clarity.
            </h2>
            <p className="text-[#716B83] text-base leading-relaxed font-sans">
              Experience the actual Ojas telemetry dashboard. Engineered for astronauts, flight surgeons, and mission control.
            </p>
          </div>
          <Link to="/dashboard">
            <Button size="lg" className="gap-2 font-heading font-bold text-xs shadow-soft rounded-xl py-3 px-6">
              <span>Open Mission Console</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Dashboard Window Shell */}
        <div className="rounded-2xl border border-[#E9E4F2] bg-[#F8F6FF] shadow-soft-lg overflow-hidden">
          {/* Dashboard Window Header Bar */}
          <div className="h-12 border-b border-[#E9E4F2] px-4 tablet:px-6 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>
              <span className="font-mono text-xs text-[#716B83] border-l border-[#E9E4F2] pl-3">
                OJAS FLIGHT TELEMETRY SYSTEM v2.0 • ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <Badge variant="normal" size="sm" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>DOWNLINK CONNECTED</span>
              </Badge>
            </div>
          </div>

          {/* Interactive Preview Content */}
          <div className="p-6 tablet:p-8 space-y-6">
            <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E9E4F2] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#716B83] font-mono">
                  <span>HEART RATE</span>
                  <Badge variant="normal" size="sm">NOMINAL</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-black text-3xl text-[#252039]">72</span>
                  <span className="text-xs text-[#716B83] font-mono">BPM</span>
                </div>
                <p className="text-[11px] text-[#8C869E] font-mono">Rolling Baseline: 70 BPM</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E9E4F2] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#716B83] font-mono">
                  <span>BLOOD OXYGEN</span>
                  <Badge variant="normal" size="sm">NOMINAL</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-black text-3xl text-[#252039]">98.2</span>
                  <span className="text-xs text-[#716B83] font-mono">%</span>
                </div>
                <p className="text-[11px] text-[#8C869E] font-mono">Corridor: 96.0–100.0%</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E9E4F2] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#716B83] font-mono">
                  <span>BLOOD PRESSURE</span>
                  <Badge variant="normal" size="sm">NOMINAL</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-black text-3xl text-[#252039]">118/78</span>
                  <span className="text-xs text-[#716B83] font-mono">mmHg</span>
                </div>
                <p className="text-[11px] text-[#8C869E] font-mono">MAP: 91.3 mmHg</p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E9E4F2] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-[#716B83] font-mono">
                  <span>CORE TEMP</span>
                  <Badge variant="normal" size="sm">NOMINAL</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading font-black text-3xl text-[#252039]">36.8</span>
                  <span className="text-xs text-[#716B83] font-mono">°C</span>
                </div>
                <p className="text-[11px] text-[#8C869E] font-mono">Diurnal rhythm intact</p>
              </div>
            </div>

            {/* Bottom Preview Banner */}
            <div className="p-5 rounded-2xl bg-[#F2EDFF] border border-primary/25 flex flex-col tablet:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl purple-gradient flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#252039]">
                    Dual-Layer Explainable AI &amp; Safety Rules Authoritative
                  </h4>
                  <p className="text-xs text-[#716B83] mt-0.5 font-sans">
                    Critical physiological non-suppression guarantees that medical emergencies are never muted by ML uncertainty.
                  </p>
                </div>
              </div>
              <Link to="/dashboard" className="shrink-0">
                <Button size="sm" className="font-heading font-bold text-xs shadow-soft rounded-xl py-2 px-4">
                  Launch Interactive Console
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
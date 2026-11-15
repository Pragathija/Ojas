import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Activity, Flower2, ShieldCheck, Compass, Rocket, UserCheck, Smile } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const HeroSplit: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#FAF9FF] via-[#FAF9FF] to-[#FAF9FF] border-b border-[#EAE6F2]">
      {/* Background Soft Pastel Glow Accents */}
      <div className="absolute top-10 right-10 w-[550px] h-[550px] bg-pastel-blue/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-pastel-lavender/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 tablet:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-12 laptop:gap-8 items-center">
          {/* Left Column: Vision & Action */}
          <div className="laptop:col-span-6 space-y-7">
            {/* Mission Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/25 bg-white text-primary font-mono text-xs font-semibold shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>ASTRONAUT WELLNESS JOURNEY • ARTEMIS-V TRANSIT</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <h1 className="font-heading text-4xl tablet:text-6xl laptop:text-7xl font-extrabold tracking-tight text-[#252039] leading-[1.08]">
                Your Universe. <br />
                <span className="text-[#7656D9]">
                  Your Wellbeing.
                </span>
              </h1>
            </div>

            {/* Supporting Description */}
            <p className="text-content-secondary text-base tablet:text-lg leading-relaxed max-w-xl font-normal">
              A peaceful space wellness adventure that helps astronauts understand their bodies, nurture their minds, and explore their progress across interplanetary transit.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col mobile:flex-row items-stretch mobile:items-center gap-3.5 pt-2">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2.5 font-heading font-bold text-sm w-full mobile:w-auto shadow-soft-md">
                  <span>Begin Your Journey</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/research">
                <Button variant="secondary" size="lg" className="font-heading font-bold text-sm w-full mobile:w-auto">
                  Explore NASA Science
                </Button>
              </Link>
            </div>

            {/* Three Pillar Guarantees */}
            <div className="pt-6 border-t border-[#EAE6F2] grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="block font-bold text-primary text-sm font-heading flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-primary" />
                  <span>Body</span>
                </span>
                <span className="text-content-secondary text-[11px] leading-tight block">
                  Sensor telemetry & personal baselines
                </span>
              </div>
              <div className="space-y-1">
                <span className="block font-bold text-primary text-sm font-heading flex items-center gap-1.5">
                  <Flower2 className="h-4 w-4 text-primary" />
                  <span>Mind</span>
                </span>
                <span className="text-content-secondary text-[11px] leading-tight block">
                  Breathing space & peaceful orbit reflections
                </span>
              </div>
              <div className="space-y-1">
                <span className="block font-bold text-primary text-sm font-heading flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Journey</span>
                </span>
                <span className="text-content-secondary text-[11px] leading-tight block">
                  Habitual milestones & gentle exploration
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Friendly Peaceful Space Explorer Illustration */}
          <div className="laptop:col-span-6 relative">
            <div className="relative rounded-3xl bg-white border border-[#EAE6F2] p-6 tablet:p-8 shadow-soft-lg space-y-6 overflow-hidden">
              {/* Header inside illustration preview */}
              <div className="flex items-center justify-between border-b border-[#EAE6F2] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-pastel-lavender flex items-center justify-center text-primary font-bold">
                    <Rocket className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-bold text-content-main">Explorer Habitat Deck</h3>
                    <span className="font-mono text-[10px] text-content-secondary">Day 42 • Tranquil Orbital Drift</span>
                  </div>
                </div>
                <Badge variant="normal" size="sm">TELEMETRY NOMINAL</Badge>
              </div>

              {/* The Space Illustration SVG */}
              <div className="relative rounded-2xl bg-gradient-to-b from-[#251E44] via-[#352B62] to-[#4F4189] p-6 text-white min-h-[280px] flex flex-col justify-between overflow-hidden shadow-soft">
                {/* Background stars */}
                <div className="absolute top-6 left-10 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <div className="absolute top-16 right-20 w-1 h-1 rounded-full bg-pastel-blue" />
                <div className="absolute top-32 left-1/4 w-1 h-1 rounded-full bg-pastel-lavender" />
                <div className="absolute top-12 left-1/2 w-2 h-2 rounded-full bg-amber-200/80" />
                <div className="absolute top-24 right-10 w-1.5 h-1.5 rounded-full bg-white/70" />

                {/* Peaceful Planet with Soft Rings */}
                <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-tr from-[#7656D9] via-[#9276E8] to-[#EAF3FF] opacity-90 shadow-soft" />
                <div className="absolute top-4 -right-20 w-60 h-16 rounded-[100%] border-t-2 border-b-2 border-white/30 rotate-[-25deg] pointer-events-none" />

                {/* Distant Tranquil Moon */}
                <div className="absolute bottom-20 left-8 w-12 h-12 rounded-full bg-pastel-blue/40 border border-white/20 filter blur-xs" />

                {/* Friendly Astronaut Explorer Avatar */}
                <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-sm">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shadow-soft">
                    <UserCheck className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] text-pastel-lavender uppercase tracking-wider block">
                      MISSION EXPLORER
                    </span>
                    <h4 className="font-heading text-sm font-bold text-white">Commander Sarah Connor</h4>
                    <p className="text-[11px] text-white/80">"Feeling calm and energized after morning quiet orbit."</p>
                  </div>
                </div>

                {/* Lower floating biometrics bar */}
                <div className="relative z-10 grid grid-cols-3 gap-2 pt-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                    <span className="block font-mono text-[9px] text-white/70 uppercase">Resting Pulse</span>
                    <span className="font-mono text-sm font-bold text-white">64 bpm</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                    <span className="block font-mono text-[9px] text-white/70 uppercase">Deep Sleep</span>
                    <span className="font-mono text-sm font-bold text-emerald-300">7.4 hrs</span>
                  </div>
                  <div className="bg-white/15 backdrop-blur-sm rounded-xl p-2.5 text-center border border-white/10">
                    <span className="block font-mono text-[9px] text-white/70 uppercase">Mind State</span>
                    <span className="font-mono text-sm font-bold text-pastel-lavender">Calm</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Status strip */}
              <div className="flex items-center justify-between text-xs font-mono text-content-secondary pt-1">
                <span>Personalized Corridor: ±1.2σ Nominal</span>
                <span className="text-primary font-bold">Artemis-V Habitation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
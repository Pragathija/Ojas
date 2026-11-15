import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Sparkles, Activity, Flower2, Heart, Award, ShieldCheck, Gamepad2 } from 'lucide-react';
import { Button } from '../common/Button';
import { SpaceUniverseBackground } from '../common/SpaceUniverseBackground';

export const HeroSpaceUniverse: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#F2EDFF] via-[#F8F6FF] to-[#FAF9FF] border-b border-[#E9E4F2]">
      {/* Background Animated Space Shuttle & Universe */}
      <SpaceUniverseBackground />
      {/* Subtle Floating Background Stars & Ambient Cosmic Glows */}
      <div className="absolute top-12 left-10 w-2 h-2 rounded-full bg-[#7656D9]/40 animate-star" />
      <div className="absolute top-28 left-1/3 w-1.5 h-1.5 rounded-full bg-[#9BDCC3] animate-star delay-300" />
      <div className="absolute top-16 right-1/4 w-2 h-2 rounded-full bg-[#FFC98B] animate-star delay-700" />
      <div className="absolute bottom-20 left-16 w-2.5 h-2.5 rounded-full bg-[#8B78C6]/50 animate-star delay-500" />
      <div className="absolute top-44 right-12 w-1.5 h-1.5 rounded-full bg-[#7656D9]/60 animate-star" />

      {/* Gentle Giant Orbital Rings in Background */}
      <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full border border-[#7656D9]/15 pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full border border-[#8B78C6]/20 pointer-events-none" />
      <div className="absolute -top-8 -right-8 w-[350px] h-[350px] rounded-full border border-[#9BDCC3]/25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 tablet:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-12 laptop:gap-8 items-center">
          {/* Left Column: Heading, Copy, and Actions (~55% width) */}
          <div className="laptop:col-span-7 space-y-7 text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-white text-primary font-mono text-xs font-bold shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="tracking-wider uppercase">NASA SPACE APPS • ASTRONAUT WELLNESS UNIVERSE</span>
            </div>

            {/* Hero Heading: High Contrast, Bold, Space Grotesk */}
            <div className="space-y-3">
              <h1 className="font-heading text-5xl tablet:text-6xl laptop:text-7xl font-extrabold tracking-tight text-[#252039] leading-[1.08]">
                Explore Space. <br />
                <span className="text-[#7656D9]">
                  Discover Yourself.
                </span>
              </h1>
            </div>

            {/* Supporting Copy */}
            <p className="text-[#716B83] text-base tablet:text-lg leading-relaxed max-w-xl font-normal font-sans">
              Your wellbeing journey beyond Earth begins here. Understand your body, nurture your mind, and explore the science of human spaceflight.
            </p>

            {/* CTAs */}
            <div className="flex flex-col mobile:flex-row items-stretch mobile:items-center gap-4 pt-2">
              <Link to="/astronaut">
                <Button size="lg" className="gap-2.5 font-heading font-bold text-sm w-full mobile:w-auto shadow-soft-md px-7 py-3 rounded-xl">
                  <span>Enter Astronaut Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/astronaut/games">
                <Button variant="secondary" size="lg" className="gap-2 font-heading font-bold text-sm w-full mobile:w-auto px-7 py-3 rounded-xl border border-primary/30">
                  <Gamepad2 className="h-4 w-4 text-primary" />
                  <span>Play Space Arcade</span>
                </Button>
              </Link>
            </div>

            {/* Key Pillars */}
            <div className="pt-8 border-t border-[#E9E4F2] grid grid-cols-3 gap-6 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-sm font-heading">
                  <Activity className="h-4 w-4 text-primary shrink-0" />
                  <span>Physical</span>
                </div>
                <span className="text-[#716B83] text-xs font-sans block leading-snug">
                  Personal baselines &amp; 100 Hz telemetry
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-sm font-heading">
                  <Flower2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Mind Garden</span>
                </div>
                <span className="text-[#716B83] text-xs font-sans block leading-snug">
                  Breathing space &amp; quiet orbit sanctuary
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-primary font-bold text-sm font-heading">
                  <Compass className="h-4 w-4 text-primary shrink-0" />
                  <span>Game Universe</span>
                </div>
                <span className="text-[#716B83] text-xs font-sans block leading-snug">
                  Planetary exploration &amp; habit milestones
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Original Illustrated Astronaut in Space Universe (~45% width) */}
          <div className="laptop:col-span-5 relative flex items-center justify-center">
            {/* Ambient Background Radial Glow */}
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-[#7656D9]/25 via-[#E8E0FF]/40 to-[#9BDCC3]/30 blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              {/* Slowly Orbiting Planet 1 (Mint Moon) */}
              <div className="absolute top-2 left-6 w-14 h-14 rounded-full bg-gradient-to-tr from-[#9BDCC3] to-[#C9F3E3] shadow-soft border border-white/60 animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-white/40 absolute top-3 left-3" />
              </div>

              {/* Orbiting Planet 2 (Peach Planet with ring) */}
              <div className="absolute bottom-6 right-4 w-20 h-20 rounded-full bg-gradient-to-tr from-[#FFC98B] to-[#FFE0BD] shadow-soft border border-white/60 animate-float" style={{ animationDelay: '2.5s' }}>
                <div className="w-28 h-6 rounded-[100%] border-t-2 border-b-2 border-white/50 absolute -left-4 top-7 rotate-[-25deg] pointer-events-none" />
              </div>

              {/* Main Floating Astronaut Illustration SVG */}
              <div className="relative z-10 w-72 tablet:w-84 laptop:w-92 animate-float">
                <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Subtle Background Orbital Disc */}
                  <circle cx="200" cy="200" r="160" fill="url(#discGradient)" opacity="0.85" />
                  <circle cx="200" cy="200" r="159" stroke="#E9E4F2" strokeWidth="2" strokeDasharray="6 6" />

                  {/* Gentle Floating Astronaut */}
                  <g transform="translate(110, 80)">
                    {/* Backpack / Life Support Unit */}
                    <rect x="35" y="60" width="110" height="130" rx="24" fill="#5535A5" />
                    <rect x="45" y="70" width="90" height="110" rx="16" fill="#7656D9" />
                    <circle cx="90" cy="95" r="16" fill="#9BDCC3" />
                    <circle cx="90" cy="95" r="8" fill="#FFFFFF" />

                    {/* Astronaut Body Suit */}
                    <rect x="55" y="95" width="70" height="95" rx="28" fill="#FFFFFF" stroke="#E9E4F2" strokeWidth="3" />
                    
                    {/* Suit Chest Panel */}
                    <rect x="68" y="115" width="44" height="34" rx="8" fill="#F8F6FF" stroke="#7656D9" strokeWidth="1.5" />
                    <rect x="74" y="123" width="12" height="6" rx="2" fill="#7656D9" />
                    <rect x="92" y="123" width="14" height="6" rx="2" fill="#9BDCC3" />
                    <circle cx="80" cy="138" r="3" fill="#D9536F" />
                    <circle cx="90" cy="138" r="3" fill="#FFC98B" />
                    <circle cx="100" cy="138" r="3" fill="#7656D9" />

                    {/* Astronaut Legs */}
                    <rect x="60" y="180" width="26" height="55" rx="13" fill="#FFFFFF" stroke="#E9E4F2" strokeWidth="3" />
                    <rect x="94" y="180" width="26" height="55" rx="13" fill="#FFFFFF" stroke="#E9E4F2" strokeWidth="3" />
                    {/* Boots */}
                    <rect x="54" y="225" width="34" height="18" rx="9" fill="#5535A5" />
                    <rect x="92" y="225" width="34" height="18" rx="9" fill="#5535A5" />

                    {/* Astronaut Arms */}
                    <rect x="28" y="105" width="28" height="65" rx="14" fill="#FFFFFF" stroke="#E9E4F2" strokeWidth="3" transform="rotate(15 28 105)" />
                    <rect x="124" y="105" width="28" height="65" rx="14" fill="#FFFFFF" stroke="#E9E4F2" strokeWidth="3" transform="rotate(-25 124 105)" />
                    {/* Gloves */}
                    <circle cx="34" cy="175" r="12" fill="#5535A5" />
                    <circle cx="158" cy="155" r="12" fill="#5535A5" />

                    {/* Helmet Base */}
                    <circle cx="90" cy="65" r="48" fill="#FFFFFF" stroke="#E9E4F2" strokeWidth="3" />
                    
                    {/* Golden/Purple Visor with Reflection */}
                    <ellipse cx="90" cy="65" rx="34" ry="26" fill="url(#visorGradient)" stroke="#7656D9" strokeWidth="2" />
                    <path d="M 68 56 Q 84 46 106 50" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.8" />
                    <circle cx="112" cy="58" r="3" fill="#FFFFFF" opacity="0.9" />

                    {/* Peaceful Floating Plant Leaf in Hand */}
                    <g transform="translate(150, 125)">
                      <path d="M 10 20 C 10 5, 25 0, 28 0 C 28 15, 20 25, 10 20 Z" fill="#9BDCC3" />
                      <line x1="10" y1="20" x2="22" y2="8" stroke="#19A974" strokeWidth="1.5" />
                    </g>
                  </g>

                  {/* Gradients */}
                  <defs>
                    <radialGradient id="discGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="70%" stopColor="#F2EDFF" />
                      <stop offset="100%" stopColor="#E8E0FF" stopOpacity="0.5" />
                    </radialGradient>
                    <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5535A5" />
                      <stop offset="45%" stopColor="#7656D9" />
                      <stop offset="100%" stopColor="#FFC98B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Floating Live Telemetry Cards */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E9E4F2] shadow-soft z-20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pastel-mint text-emerald-700 flex items-center justify-center font-bold">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-[#716B83] uppercase">Resting Pulse</span>
                  <span className="font-heading text-sm font-bold text-[#252039]">68 BPM • Baseline</span>
                </div>
              </div>

              <div className="absolute top-6 -right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#E9E4F2] shadow-soft z-20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pastel-lavender text-primary flex items-center justify-center font-bold">
                  <Flower2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-[#716B83] uppercase">Mind Garden</span>
                  <span className="font-heading text-sm font-bold text-[#252039]">Calm &amp; Rested</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
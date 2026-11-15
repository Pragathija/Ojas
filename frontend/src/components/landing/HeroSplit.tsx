import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Compass, Radio } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroSplit: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden border-b border-cosmos-border">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(240,120,50,0.08),rgba(8,9,11,0))] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 tablet:px-8 w-full">
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-12 laptop:gap-8 items-center">
          {/* Left Column: Human Storytelling & Precision Typography (48% on desktop) */}
          <div className="laptop:col-span-6 space-y-8 z-10">
            {/* Small Eyebrow with Pulse Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded border border-cosmos-accent/30 bg-cosmos-accent/10 text-cosmos-accent font-mono text-[11px] tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cosmos-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cosmos-accent"></span>
              </span>
              <span>HUMAN SPACEFLIGHT / HEALTH INTELLIGENCE</span>
            </div>

            {/* Main Editorial Headline */}
            <div className="space-y-2">
              <h1 className="font-heading text-5xl tablet:text-7xl font-bold tracking-tight text-cosmos-text leading-[1.05]">
                Beyond Earth. <br />
                <span className="text-cosmos-accent">Within.</span>
              </h1>
            </div>

            {/* Supporting Description */}
            <p className="text-cosmos-text-secondary text-base tablet:text-lg leading-relaxed max-w-xl font-normal">
              Understanding the human body in the most extraordinary environments. OJAS brings health observations,
              scientific research and meaningful insights into one unified spaceflight health experience.
            </p>

            {/* CTAs */}
            <div className="flex flex-col mobile:flex-row items-stretch mobile:items-center gap-4 pt-2">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2.5 font-mono text-xs w-full mobile:w-auto shadow-lg shadow-cosmos-accent/15">
                  <span>EXPLORE OJAS</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#scientific-foundation">
                <Button variant="outline" size="lg" className="font-mono text-xs w-full mobile:w-auto">
                  DISCOVER THE SCIENCE
                </Button>
              </a>
            </div>

            {/* Technical Metadata Footer */}
            <div className="pt-8 border-t border-cosmos-border/80 flex items-center gap-6 text-[11px] font-mono text-cosmos-muted">
              <div className="flex items-center gap-2">
                <Compass className="h-3.5 w-3.5 text-cosmos-accent" />
                <span>HUMAN</span>
              </div>
              <span className="text-cosmos-border">•</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-semantic-normal" />
                <span>SCIENCE</span>
              </div>
              <span className="text-cosmos-border">•</span>
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-semantic-info" />
                <span>EXPLORATION</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Impact Astronaut Imagery (52% on desktop) */}
          <div className="laptop:col-span-6 relative">
            <div className="relative mx-auto max-w-md laptop:max-w-none rounded-lg border border-cosmos-border bg-cosmos-card/40 overflow-hidden shadow-2xl group">
              {/* Image Frame */}
              <div className="relative aspect-4/5 w-full bg-cosmos-bg-secondary overflow-hidden">
                <img
                  src="/assets/astronaut-hero.jpg"
                  alt="NASA Astronaut Barry Wilmore on Extravehicular Activity outside the International Space Station"
                  className="w-full h-full object-cover object-center filter contrast-105 brightness-95 group-hover:scale-102 transition-transform duration-700 ease-out"
                  loading="eager"
                />

                {/* Subtle Cinematic Vignette & Edge Shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-cosmos-bg via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-cosmos-bg/30 via-transparent to-cosmos-bg/20 pointer-events-none" />

                {/* Live Mission Telemetry HUD Overlay in lower corner */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded bg-cosmos-bg/90 backdrop-blur-md border border-cosmos-border text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between border-b border-cosmos-border/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-semantic-normal animate-pulse"></span>
                      <span className="text-cosmos-text font-semibold">EVA SUIT ARRAY • EMU-3008</span>
                    </div>
                    <span className="text-cosmos-muted text-[10px]">ISS EXPEDITION 42</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-cosmos-muted block">HELMET VISOR</span>
                      <span className="text-cosmos-text font-bold">GOLD 24K COATING</span>
                    </div>
                    <div>
                      <span className="text-cosmos-muted block">SUIT PRESS</span>
                      <span className="text-semantic-normal font-bold">29.6 kPa NOMINAL</span>
                    </div>
                    <div>
                      <span className="text-cosmos-muted block">PRIMARY O2</span>
                      <span className="text-cosmos-accent font-bold">98.4% REMAIN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal corner brackets for aerospace HUD aesthetic */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cosmos-accent/70 pointer-events-none"></div>
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cosmos-accent/70 pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cosmos-accent/70 pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cosmos-accent/70 pointer-events-none"></div>
            </div>

            {/* Astronaut Metadata Label */}
            <p className="mt-3 text-right text-[11px] font-mono text-cosmos-muted">
              NASA Asset ID: iss042e283219 • Flight Engineer B. Wilmore (EVA-2)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { Button } from '../common/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section id="mission-start" className="py-24 relative overflow-hidden bg-white border-b border-[#E9E4F2] text-center">
      {/* Background Soft Purple Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(118,86,217,0.06),transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 tablet:px-8 space-y-7 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-pastel-lavender text-primary font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AUTONOMOUS EXPLORATION READY</span>
        </div>

        <h2 className="font-heading text-4xl tablet:text-6xl font-extrabold tracking-tight text-[#252039]">
          Your Mission. Your Health. Your Journey.
        </h2>

        <p className="text-[#716B83] text-base tablet:text-lg max-w-xl mx-auto leading-relaxed font-sans">
          Step into the mission control cockpit. Experience continuous biometric intelligence, empirical NASA spaceflight research, and a calming gamified wellness universe.
        </p>

        <div className="pt-4 flex flex-col mobile:flex-row justify-center items-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2.5 font-heading font-bold text-sm px-8 py-3 rounded-xl shadow-soft-md">
              <span>Enter Mission Control</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/space-journey">
            <Button variant="secondary" size="lg" className="gap-2 font-heading font-bold text-sm px-8 py-3 rounded-xl border border-primary/30">
              <Award className="h-4 w-4 text-primary" />
              <span>Explore Space Journey Game</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
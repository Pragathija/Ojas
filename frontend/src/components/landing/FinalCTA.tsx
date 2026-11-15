import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { Button } from '../common/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-28 relative overflow-hidden bg-cosmos-bg-secondary border-b border-cosmos-border text-center">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(240,120,50,0.1),transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 tablet:px-8 space-y-8 relative z-10">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-cosmos-accent tracking-widest uppercase">
          <Compass className="h-4 w-4" />
          <span>JOIN THE NEXT EXPEDITION</span>
        </div>

        <h2 className="font-heading text-4xl tablet:text-6xl font-bold tracking-tight text-cosmos-text">
          Your next mission starts within.
        </h2>

        <p className="text-cosmos-text-secondary text-base tablet:text-lg max-w-xl mx-auto leading-relaxed">
          Explore a new perspective on human health in space. Step into the mission control cockpit and examine the physiological frontier.
        </p>

        <div className="pt-4 flex flex-col mobile:flex-row justify-center items-center gap-4">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2.5 font-mono text-xs px-8 shadow-xl shadow-cosmos-accent/20">
              <span>ENTER OJAS</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/research">
            <Button variant="outline" size="lg" className="font-mono text-xs px-8">
              EXPLORE RESEARCH
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

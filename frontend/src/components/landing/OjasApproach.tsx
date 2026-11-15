import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Eye, LineChart, Sparkles } from 'lucide-react';

const pillars = [
  {
    number: '01',
    label: 'MONITOR',
    icon: Eye,
    title: 'Continuous Observation',
    subtitle: 'Multi-parameter bio-harness integration & vital telemetry stream',
    description:
      'Aggregates heart rate variability (RMSSD), continuous SpO2, core body temperature rhythm, and ambient environmental parameters into an integrated flight bio-telemetry picture.',
    features: ['High-fidelity sensor streaming', 'Nominal baseline validation', 'Automated drift alerts'],
  },
  {
    number: '02',
    label: 'UNDERSTAND',
    icon: LineChart,
    title: 'Contextual Analytics',
    subtitle: 'Historical longitudinal trends & NASA flight evidence cross-referencing',
    description:
      'Translates raw vital spikes into clinically meaningful context by mapping current telemetry against published spaceflight health literature, mission days, and countermeasure cycles.',
    features: ['Circadian phase tracking', 'Countermeasure load analysis', 'Longitudinal drift modeling'],
  },
  {
    number: '03',
    label: 'ACT',
    icon: Sparkles,
    title: 'Adaptive Countermeasures',
    subtitle: 'Targeted protocols for exercise, lighting, and rest recovery',
    description:
      'Generates actionable recommendations—such as adjusting ARED resistive load, timing narrow-spectrum phototherapy, or rescheduling high-demand EVA operations based on physical readiness.',
    features: ['Phototherapy scheduling', 'Exercise prescription tuning', 'Crew autonomy support'],
  },
];

export const OjasApproach: React.FC = () => {
  return (
    <section id="ojas-approach" className="py-24 border-b border-cosmos-border bg-cosmos-bg">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cosmos-accent tracking-wider uppercase">
            <span>METHODOLOGY & ARCHITECTURE</span>
          </div>
          <h2 className="font-heading text-3xl tablet:text-5xl font-bold tracking-tight text-cosmos-text">
            Understand. Monitor. Explore.
          </h2>
          <p className="text-cosmos-text-secondary text-base leading-relaxed">
            A three-pillar closed-loop system transforming telemetry into actionable countermeasures for deep space crews.
          </p>
        </div>

        {/* Connected Three-Pillar Visual Composition */}
        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-8 relative">
          {pillars.map((p, idx) => (
            <div key={idx} className="relative flex flex-col justify-between">
              <Card className="p-8 h-full space-y-6 flex flex-col justify-between bg-cosmos-card hover:border-cosmos-accent/50 transition-colors">
                <div className="space-y-5">
                  {/* Top Bar with Number and Icon */}
                  <div className="flex items-center justify-between border-b border-cosmos-border pb-4">
                    <span className="font-mono text-2xl font-bold text-cosmos-accent">{p.number}</span>
                    <Badge variant="accent" size="sm">{p.label}</Badge>
                  </div>

                  {/* Heading & Subtitle */}
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-cosmos-text">{p.title}</h3>
                    <p className="font-mono text-xs text-cosmos-muted mt-1">{p.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-cosmos-text-secondary leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="pt-6 border-t border-cosmos-border/70 space-y-2">
                  {p.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs font-mono text-cosmos-text-secondary">
                      <span className="h-1.5 w-1.5 rounded-full bg-cosmos-accent"></span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

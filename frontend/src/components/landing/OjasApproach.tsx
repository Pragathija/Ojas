import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Eye, LineChart, Sparkles, ShieldCheck, Trophy, Cpu } from 'lucide-react';

const pillars = [
  {
    number: '01',
    label: 'INGEST & VERIFY',
    icon: Eye,
    title: 'Multi-Modal Ingestion & Safety Rules',
    subtitle: 'Cryptographic device verification & deterministic non-suppression',
    description:
      'Continuous ingestion of cardiovascular, respiratory, thermal, and circadian streams. Layer 1 deterministic safety rules unconditionally override statistical ML models for critical physiological events.',
    features: ['Ed25519 device signatures', 'Persistent SQLite/Postgres idempotency', 'Critical alert non-suppression'],
  },
  {
    number: '02',
    label: 'ANALYZE & DETECT',
    icon: Cpu,
    title: 'Dual-Layer AI Anomaly Engine',
    subtitle: 'Isolation Forest v2 with robust median/IQR normalization',
    description:
      'Distinguishes natural astronaut circadian variations from true physiological deterioration. Features evidence sufficiency scoring, temporal trajectory tracking, and Out-of-Distribution (OOD) novelty filters.',
    features: ['Robust median/IQR scaling', 'Temporal deterioration engine', 'Explainable diagnostic factors'],
  },
  {
    number: '03',
    label: 'GROUND & GAMIFY',
    icon: Trophy,
    title: 'NASA Research & Habit Gamification',
    subtitle: 'Authentic OSDR Inspiration4 & UTMB Bedrest actigraphy',
    description:
      'Grounded in genuine spaceflight data from SpaceX Inspiration4 (OSD-575 / OSD-569) and UTMB Bedrest (BRSMAct). Features an ethical habit gamification system with XP and milestone badges for crew engagement.',
    features: ['Longitudinal NASA spaceflight data', 'Engagement XP & badges', 'Never gamifies medical numbers'],
  },
];

export const OjasApproach: React.FC = () => {
  return (
    <section id="ojas-approach" className="py-24 border-b border-surface-border bg-surface-ground">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <span>METHODOLOGY & ARCHITECTURE</span>
          </div>
          <h2 className="font-heading text-3xl tablet:text-5xl font-extrabold tracking-tight text-content-main">
            Observe. Explain. Safeguard.
          </h2>
          <p className="text-content-secondary text-base leading-relaxed">
            A three-tier architecture uniting high-frequency telemetry, clinical safety invariants, and empirical NASA spaceflight data.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <Card
              key={p.number}
              className="p-8 bg-white border-surface-border space-y-6 shadow-soft hover:shadow-soft-md hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-black text-primary/30">{p.number}</span>
                <Badge variant="purple" size="sm">
                  {p.label}
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-xl font-bold text-content-main">{p.title}</h3>
                <p className="text-xs font-mono font-medium text-primary">{p.subtitle}</p>
              </div>

              <p className="text-xs text-content-secondary leading-relaxed">{p.description}</p>

              <div className="pt-4 border-t border-surface-border space-y-2">
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-content-main">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

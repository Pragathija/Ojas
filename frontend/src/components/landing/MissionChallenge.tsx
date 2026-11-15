import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Activity, ShieldAlert, Moon, Heart, Brain } from 'lucide-react';

const challenges = [
  {
    icon: Activity,
    badge: 'MICROGRAVITY',
    title: 'Altered Gravity',
    description:
      'Long-duration microgravity causes fluid cephalad redistribution, bone mineral density loss (1-1.5% monthly in weight-bearing bones), and muscular deconditioning without targeted resistive load.',
  },
  {
    icon: ShieldAlert,
    badge: 'IONIZING PARTICLES',
    title: 'Deep Space Radiation',
    description:
      'Outside Earth’s magnetosphere, galactic cosmic radiation (GCR) and solar particle events (SPE) impart continuous low-dose HZE ions, creating cumulative oxidative stress and cellular mutation risks.',
  },
  {
    icon: Brain,
    badge: 'HABITAT CONFINEMENT',
    title: 'Isolation & Confinement',
    description:
      'Extreme confinement within pressurized modules demands close crew coordination, constant psychological monitoring, and early detection of cognitive fatigue across multi-year transit phases.',
  },
  {
    icon: Heart,
    badge: 'HEMODYNAMICS',
    title: 'Physiological Adaptation',
    description:
      'Cardiovascular remodeling decreases total blood volume and blunts baroreceptor sensitivity, creating post-landing orthostatic intolerance and exercise capacity degradation.',
  },
  {
    icon: Moon,
    badge: 'CIRCADIAN DE-SYNCHRONY',
    title: 'Circadian Disruption',
    description:
      'A 90-minute orbital cycle with 16 daily sunrises deprives astronauts of natural diurnal solar cues, necessitating artificial phototherapy and strict sleep hygiene protocols.',
  },
];

export const MissionChallenge: React.FC = () => {
  return (
    <section id="mission-challenge" className="py-24 border-b border-cosmos-border bg-cosmos-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cosmos-accent tracking-wider uppercase">
            <span>PHYSIOLOGICAL FRONTIERS</span>
          </div>
          <h2 className="font-heading text-3xl tablet:text-5xl font-bold tracking-tight text-cosmos-text">
            Space changes everything.
          </h2>
          <p className="text-cosmos-text-secondary text-base leading-relaxed">
            The spaceflight environment subjects the human organism to extreme stressors absent during terrestrial evolution.
            Safeguarding crew autonomy on multi-year exploration voyages requires integrated, evidence-grounded monitoring.
          </p>
        </div>

        {/* Editorial Challenge Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6">
          {challenges.map((c, idx) => (
            <Card
              key={idx}
              className="p-6 space-y-4 hover:border-cosmos-accent/40 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded bg-cosmos-elevated border border-cosmos-border flex items-center justify-center text-cosmos-accent">
                  <c.icon className="h-5 w-5" />
                </div>
                <Badge variant="neutral" size="sm">{c.badge}</Badge>
              </div>

              <h3 className="font-heading text-xl font-semibold text-cosmos-text">
                {c.title}
              </h3>

              <p className="text-sm text-cosmos-text-secondary leading-relaxed font-normal">
                {c.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

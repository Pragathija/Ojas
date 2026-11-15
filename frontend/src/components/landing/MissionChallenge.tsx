import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Activity, ShieldAlert, Moon, Heart, Brain } from 'lucide-react';

const challenges = [
  {
    icon: Activity,
    badge: 'MICROGRAVITY',
    title: 'Altered Gravity & Fluid Shifts',
    description:
      'Microgravity triggers cephalad fluid redistribution, bone mineral density loss (1-1.5% monthly in weight-bearing bones), and muscular deconditioning without targeted resistive load.',
  },
  {
    icon: ShieldAlert,
    badge: 'IONIZING PARTICLES',
    title: 'Deep Space Radiation Environment',
    description:
      'Beyond low-Earth orbit, galactic cosmic rays and solar particle events impart continuous low-dose HZE ions, creating cumulative oxidative stress and cellular mutation risks.',
  },
  {
    icon: Brain,
    badge: 'HABITAT CONFINEMENT',
    title: 'Isolation & Multi-Year Confinement',
    description:
      'Autonomous crew operations during Mars transit impose up to 24-minute communication latency, requiring edge AI decision-support rather than real-time Houston guidance.',
  },
  {
    icon: Heart,
    badge: 'HEMODYNAMICS',
    title: 'Cardiovascular Remodeling',
    description:
      'Reduced cardiac workload blunts baroreceptor sensitivity and reduces stroke volume, creating post-landing orthostatic intolerance and exercise capacity degradation.',
  },
  {
    icon: Moon,
    badge: 'CIRCADIAN DE-SYNCHRONY',
    title: 'Circadian Sleep Disruption',
    description:
      'Rapid orbital cycles and habitat noise disrupt natural sleep architecture, necessitating continuous circadian actigraphy monitoring and personalized phototherapy schedules.',
  },
];

export const MissionChallenge: React.FC = () => {
  return (
    <section id="mission-challenge" className="py-24 border-b border-surface-border bg-white">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <span>THE AEROSPACE MEDICINE CHALLENGE</span>
          </div>
          <h2 className="font-heading text-3xl tablet:text-5xl font-extrabold tracking-tight text-content-main">
            Human Biology at the Edge of Exploration.
          </h2>
          <p className="text-content-secondary text-base leading-relaxed">
            As missions push beyond the Van Allen belts to the Moon and Mars, astronauts must monitor their own health autonomously with mathematically rigorous, explainable intelligence.
          </p>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6">
          {challenges.map((c, idx) => (
            <Card
              key={idx}
              className="p-6 bg-surface-ground border-surface-border space-y-4 hover:border-primary/40 hover:shadow-soft-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="h-11 w-11 rounded-xl bg-primary-light flex items-center justify-center text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <Badge variant="purple" size="sm">
                  {c.badge}
                </Badge>
              </div>
              <h3 className="font-heading text-lg font-bold text-content-main">{c.title}</h3>
              <p className="text-xs text-content-secondary leading-relaxed">{c.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

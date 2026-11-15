import React, { useState } from 'react';
import { CountermeasureResearch, CountermeasureCategory } from '../../types/insights';
import { CountermeasureCard } from './CountermeasureCard';
import { Badge } from '../common/Badge';
import { ShieldAlert } from 'lucide-react';

export interface CountermeasureExplorerProps {
  countermeasures: CountermeasureResearch[];
  selectedCategory: CountermeasureCategory | 'All';
  onSelectCategory: (category: CountermeasureCategory | 'All') => void;
  onNavigateToResearch?: (paperId?: string) => void;
  highlightedCountermeasureId?: string;
}

const CATEGORIES: (CountermeasureCategory | 'All')[] = [
  'All',
  'Exercise & Musculoskeletal Health',
  'Sleep & Circadian Health',
  'Cardiovascular & Autonomic Health',
  'Radiation Research',
  'Monitoring & Telemetry Technology',
  'Environmental Protection & Engineering',
];

export const CountermeasureExplorer: React.FC<CountermeasureExplorerProps> = ({
  countermeasures,
  selectedCategory,
  onSelectCategory,
  onNavigateToResearch,
  highlightedCountermeasureId,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    highlightedCountermeasureId || null
  );

  const filtered =
    selectedCategory === 'All'
      ? countermeasures
      : countermeasures.filter((cm) => cm.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header and Disclaimers */}
      <div className="rounded border border-cosmos-border bg-cosmos-card p-6 space-y-4">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-cosmos-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-cosmos-accent tracking-widest uppercase">
                AEROSPACE PHYSIOLOGY COUNTERMEASURES
              </span>
              <span className="text-cosmos-muted">•</span>
              <span className="font-mono text-xs text-cosmos-muted">EVIDENCE REPOSITORY</span>
            </div>
            <h2 className="font-heading text-xl tablet:text-2xl font-bold text-cosmos-text">
              Countermeasure Research Repository
            </h2>
            <p className="text-xs text-cosmos-text-secondary max-w-2xl leading-relaxed">
              Explores verified operational protocols, research-supported interventions, experimental concepts, monitoring systems, and habitat engineering strategies. Countermeasures are organized as broad research topics, not clinical prescriptions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="normal" size="sm">
              {countermeasures.length} PROTOCOLS & TECHNOLOGIES
            </Badge>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-cosmos-muted mr-1 uppercase">RESEARCH DOMAIN:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count =
              cat === 'All'
                ? countermeasures.length
                : countermeasures.filter((cm) => cm.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-colors border ${
                  isSelected
                    ? 'bg-cosmos-accent text-cosmos-bg font-bold border-cosmos-accent'
                    : 'bg-cosmos-elevated text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text'
                }`}
              >
                <span>{cat.toUpperCase()}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Safety & Non-Prescription Notice */}
        <div className="p-3 rounded bg-cosmos-elevated border border-cosmos-border/70 flex items-start gap-2.5 text-xs">
          <ShieldAlert className="h-4 w-4 text-semantic-caution shrink-0 mt-0.5" />
          <p className="text-cosmos-text-secondary leading-relaxed font-sans">
            <strong>Classification Disclosure:</strong> Monitoring technologies (e.g. dosimeters, telemetry sensors) and environmental engineering solutions (e.g. storm shelters) are separated from physiological countermeasure protocols. No individual therapeutic effectiveness percentage or personal intervention suitability is claimed.
          </p>
        </div>
      </div>

      {/* Grid of Countermeasure Cards */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-6 items-stretch">
        {filtered.map((cm) => (
          <CountermeasureCard
            key={cm.id}
            countermeasure={cm}
            isSelected={selectedId === cm.id}
            onSelect={() => setSelectedId(selectedId === cm.id ? null : cm.id)}
            onNavigateToResearch={onNavigateToResearch}
          />
        ))}
      </div>
    </div>
  );
};

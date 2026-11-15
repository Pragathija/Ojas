import React from 'react';
import { Badge } from '../common/Badge';
import { InsightCategory } from '../../types/insights';

export interface InsightCategoryFilterProps {
  categories: (InsightCategory | 'All')[];
  selectedCategory: InsightCategory | 'All';
  onSelectCategory: (category: InsightCategory | 'All') => void;
  categoryCounts: Record<string, number>;
}

export const InsightCategoryFilter: React.FC<InsightCategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded bg-cosmos-card border border-cosmos-border">
      <span className="font-mono text-xs text-cosmos-muted mr-1 uppercase">FILTER TOPIC:</span>
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat] ?? 0;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors border ${
              isSelected
                ? 'bg-cosmos-accent text-cosmos-bg font-bold border-cosmos-accent'
                : 'bg-cosmos-elevated text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text hover:border-cosmos-border/80'
            }`}
          >
            <span>{cat.toUpperCase()}</span>
            <Badge
              variant={isSelected ? 'neutral' : 'neutral'}
              size="sm"
              className={isSelected ? 'bg-cosmos-bg/20 text-cosmos-bg border-none' : 'text-[10px]'}
            >
              {count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
};

import React from 'react';
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
    <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      <span className="font-mono text-xs font-bold text-content-muted mr-1 uppercase">FILTER TOPIC:</span>
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat] ?? 0;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              isSelected
                ? 'bg-primary text-white font-bold border-primary shadow-xs'
                : 'bg-[#FAF9FF] text-content-secondary border-[#EAE6F2] hover:bg-primary-light/40 hover:text-primary'
            }`}
          >
            <span>{cat.toUpperCase()}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-primary-light text-primary'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

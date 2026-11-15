import React from 'react';
import { Input } from '../common/Input';
import { Search } from 'lucide-react';

export interface ResearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  categories: string[];
}

export const ResearchFilterBar: React.FC<ResearchFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 p-4 rounded bg-cosmos-card border border-cosmos-border">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-cosmos-muted mr-1 uppercase">FOCUS:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-3 py-1 rounded text-xs font-mono transition-colors border ${
              selectedCategory === cat
                ? 'bg-cosmos-accent text-cosmos-bg font-bold border-cosmos-accent'
                : 'bg-cosmos-elevated text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text'
            }`}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="w-full laptop:w-72 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cosmos-muted">
          <Search className="h-3.5 w-3.5" />
        </div>
        <Input
          type="text"
          placeholder="Search literature & variables..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-8 text-xs font-mono bg-cosmos-elevated"
        />
      </div>
    </div>
  );
};

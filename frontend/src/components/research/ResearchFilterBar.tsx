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
    <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs font-bold text-content-muted mr-1 uppercase">FOCUS:</span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                isSelected
                  ? 'bg-primary text-white font-bold border-primary shadow-xs'
                  : 'bg-[#FAF9FF] text-content-secondary border-[#EAE6F2] hover:bg-primary-light/40 hover:text-primary'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="w-full laptop:w-72 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
          <Search className="h-3.5 w-3.5" />
        </div>
        <Input
          type="text"
          placeholder="Search literature & variables..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9 text-xs font-mono bg-[#FAF9FF] border-[#EAE6F2] rounded-xl text-content-main"
        />
      </div>
    </div>
  );
};

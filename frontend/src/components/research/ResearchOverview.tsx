import React from 'react';
import { Badge } from '../common/Badge';
import { BookOpen, Database, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { ResearchDatasetMeta } from '../../types/research';

export interface ResearchOverviewProps {
  datasets: ResearchDatasetMeta[];
  citationCount: number;
}

export const ResearchOverview: React.FC<ResearchOverviewProps> = ({
  datasets,
  citationCount,
}) => {
  return (
    <div className="rounded-2xl border border-[#EAE6F2] bg-white p-6 tablet:p-8 space-y-6 shadow-soft">
      {/* Editorial Header */}
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4 border-b border-[#EAE6F2] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">
              NASA RESEARCH LAB • SCIENTIFIC INTELLIGENCE
            </span>
            <span className="text-[#EAE6F2]">•</span>
            <span className="font-mono text-xs text-content-secondary">OSDR &amp; BEDREST EVIDENCE BASE</span>
          </div>
          <h1 className="font-heading text-2xl tablet:text-4xl font-extrabold tracking-tight text-content-main">
            Explore the Science Behind Ojas
          </h1>
          <p className="text-sm text-content-secondary max-w-3xl leading-relaxed">
            Investigate authentic NASA Open Science Data Repository (OSDR) spaceflight observations, explore bedrest analogs, and understand the rigorous empirical foundations of human spaceflight monitoring.
          </p>
        </div>

        {/* Global Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <Badge variant="purple" className="gap-1.5 py-1 px-3">
            <Database className="h-3.5 w-3.5" />
            <span>NASA_RESEARCH_DATA</span>
          </Badge>
          <Badge variant="normal" className="gap-1.5 py-1 px-3">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{citationCount} VERIFIED CITATIONS</span>
          </Badge>
        </div>
      </div>

      {/* Visible Provenance Distinction Banner */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>NASA OSDR OSD-575 &amp; OSD-569</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-tight">
            Inspiration4 mission civilian spaceflight cohort (CMP, cytokines, CBC across 7 longitudinal epochs).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            <span>NASA BRSMAct BEDREST ANALOG</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-tight">
            UTMB 70-day 6° head-down tilt bedrest actigraphy (sleep duration, efficiency, and latency).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 font-semibold">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>SCIENTIFIC DISCLOSURES</span>
          </div>
          <p className="text-[11px] text-content-secondary leading-tight">
            Bedrest is a microgravity analog; Inspiration4 is N=4. Reference-range excursions are not medical diagnoses.
          </p>
        </div>
      </div>
    </div>
  );
};
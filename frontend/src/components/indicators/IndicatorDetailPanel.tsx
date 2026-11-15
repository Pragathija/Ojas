import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { VitalSign } from '../../types/health';
import { ShieldAlert, BookOpen, AlertCircle, ExternalLink, X, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface IndicatorDetailPanelProps {
  vital: VitalSign | null;
  onClose: () => void;
}

export const IndicatorDetailPanel: React.FC<IndicatorDetailPanelProps> = ({
  vital,
  onClose,
}) => {
  if (!vital) return null;

  return (
    <Card className="p-6 space-y-6 border-cosmos-accent/50 bg-cosmos-bg-secondary shadow-2xl animate-in fade-in slide-in-from-top-2">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-cosmos-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="accent">{vital.category.toUpperCase()}</Badge>
            <Badge variant={vital.status === 'caution' ? 'caution' : 'normal'}>
              {vital.status.toUpperCase()}
            </Badge>
            <Badge variant="caution">SYNTHETIC DATA STREAM</Badge>
          </div>
          <h2 className="font-heading text-2xl font-bold text-cosmos-text mt-1">
            {vital.name} ({vital.symbol})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-cosmos-text-secondary hover:text-cosmos-text hover:bg-cosmos-elevated"
          aria-label="Close detail panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Observation Metric Row */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">LATEST SIMULATED OBSERVATION</span>
          <div className="text-3xl font-bold text-cosmos-text tabular-nums">
            {vital.currentValue} <span className="text-sm font-normal text-cosmos-text-secondary">{vital.unit}</span>
          </div>
          <span className="text-[10px] text-cosmos-muted">Logged: {vital.lastUpdated}</span>
        </div>

        <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">ILLUSTRATIVE REFERENCE BAND</span>
          <div className="text-xl font-bold text-semantic-normal">
            {vital.nominalRange[0]} – {vital.nominalRange[1]} {vital.unit}
          </div>
          <span className="text-[10px] text-cosmos-muted">Demonstration corridor (non-diagnostic)</span>
        </div>

        <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
          <span className="text-[10px] text-cosmos-muted uppercase block">DATA QUALITY & COMPLETENESS</span>
          <div className="text-xl font-bold text-cosmos-accent">
            {(100 - vital.missingDataPercent).toFixed(1)}% Completeness
          </div>
          <span className="text-[10px] text-cosmos-muted">Artifact Loss: {vital.missingDataPercent}%</span>
        </div>
      </div>

      {/* Physiological Relevance & Definition */}
      <div className="space-y-2">
        <h3 className="font-heading text-sm font-bold text-cosmos-text uppercase tracking-wider">
          Physiological Relevance in Spaceflight
        </h3>
        <p className="text-sm text-cosmos-text-secondary leading-relaxed font-sans">
          {vital.physiologicalRelevance}
        </p>
      </div>

      {/* Data Collection Context & Operational Setup */}
      <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-cosmos-text font-semibold uppercase">
          <AlertCircle className="h-4 w-4 text-cosmos-accent" />
          <span>Operational Sensor Context</span>
        </div>
        <p className="text-cosmos-text-secondary leading-relaxed font-sans">
          {vital.collectionContext}
        </p>
      </div>

      {/* Scientific Limitations & Non-Diagnostic Disclosure */}
      <div className="p-4 rounded bg-cosmos-elevated border border-cosmos-border/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-semantic-caution font-mono font-semibold uppercase">
          <ShieldAlert className="h-4 w-4" />
          <span>Scientific Scope & Limitations</span>
        </div>
        <p className="text-cosmos-text-secondary leading-relaxed font-sans">
          {vital.scientificLimitations} Illustrative reference bands ({vital.nominalRange[0]}–{vital.nominalRange[1]} {vital.unit}) represent synthetic demonstration corridors and are not individualized clinical thresholds or diagnostic criteria. No certified clinical diagnoses or emergency medical actions are implied.
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-cosmos-border">
        <Link to={`/trends?metric=${vital.id}`}>
          <Button size="sm" className="gap-2 font-mono text-xs">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>OPEN TREND ANALYSIS WORKSPACE</span>
          </Button>
        </Link>
        {vital.relatedLiteratureId ? (
          <Link to="/research">
            <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span>VIEW RELEVANT SCIENTIFIC CITATIONS</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-xs text-cosmos-muted">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Direct NASA clinical validation paper unavailable</span>
          </div>
        )}
      </div>
    </Card>
  );
};

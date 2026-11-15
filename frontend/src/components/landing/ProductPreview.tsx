import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Activity, ShieldCheck, HeartPulse, ArrowRight, ShieldAlert } from 'lucide-react';
import { MOCK_ASTRONAUT, MOCK_VITALS } from '../../data/mockData';
import { VitalSign } from '../../types/health';

export const ProductPreview: React.FC = () => {
  return (
    <section id="product-preview" className="py-24 border-b border-cosmos-border bg-cosmos-bg">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col laptop:flex-row laptop:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-cosmos-accent tracking-wider uppercase">
              <span>UNIFIED MISSION COCKPIT</span>
            </div>
            <h2 className="font-heading text-3xl tablet:text-5xl font-bold tracking-tight text-cosmos-text">
              One mission. A clearer picture.
            </h2>
            <p className="text-cosmos-text-secondary text-base leading-relaxed">
              Experience the actual OJAS telemetry dashboard. Built for flight surgeons, mission control specialists, and autonomous astronauts.
            </p>
          </div>
          <Link to="/dashboard">
            <Button size="md" className="gap-2 font-mono text-xs">
              <span>OPEN LIVE MISSION CONSOLE</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Realistic Dashboard Window Shell */}
        <div className="rounded-lg border border-cosmos-border bg-cosmos-bg-secondary shadow-2xl overflow-hidden">
          {/* Dashboard Header Bar */}
          <div className="h-12 border-b border-cosmos-border px-4 tablet:px-6 flex items-center justify-between bg-cosmos-card/80">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-semantic-priority/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-semantic-caution/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-semantic-normal/80"></span>
              </div>
              <span className="font-mono text-xs text-cosmos-text-secondary border-l border-cosmos-border pl-3">
                OJAS FLIGHT TELEMETRY SYSTEM v0.1 • ARMED
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-xs">
              <Badge variant="caution" size="sm" className="gap-1.5">
                <ShieldAlert className="h-3 w-3" />
                <span>SYNTHETIC DEMONSTRATION STREAM</span>
              </Badge>
              <span className="text-cosmos-muted hidden tablet:inline">MET: DAY 142 • 14:32:08 UTC</span>
            </div>
          </div>

          {/* Inner Dashboard View Content */}
          <div className="p-6 space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-4">
              <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
                <div className="flex justify-between text-xs font-mono text-cosmos-muted uppercase">
                  <span>Readiness Index</span>
                  <Activity className="h-4 w-4 text-cosmos-accent" />
                </div>
                <div className="font-heading text-2xl font-bold text-cosmos-text">{MOCK_ASTRONAUT.readinessScore}%</div>
                <p className="text-[10px] text-semantic-normal">Physical capacity nominal</p>
              </div>

              <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
                <div className="flex justify-between text-xs font-mono text-cosmos-muted uppercase">
                  <span>Exercise Compliance</span>
                  <ShieldCheck className="h-4 w-4 text-semantic-normal" />
                </div>
                <div className="font-heading text-2xl font-bold text-cosmos-text">96%</div>
                <p className="text-[10px] text-cosmos-text-secondary">ARED protocol satisfied</p>
              </div>

              <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
                <div className="flex justify-between text-xs font-mono text-cosmos-muted uppercase">
                  <span>Heart Rate</span>
                  <HeartPulse className="h-4 w-4 text-semantic-info" />
                </div>
                <div className="font-heading text-2xl font-bold text-cosmos-text">68 <span className="text-xs font-normal text-cosmos-muted font-mono">BPM</span></div>
                <p className="text-[10px] text-semantic-normal">Resting baseline</p>
              </div>

              <div className="p-4 rounded bg-cosmos-card border border-cosmos-border space-y-1">
                <div className="flex justify-between text-xs font-mono text-cosmos-muted uppercase">
                  <span>Radiation Dosage</span>
                  <span className="h-2 w-2 rounded-full bg-semantic-normal"></span>
                </div>
                <div className="font-heading text-2xl font-bold text-cosmos-text">0.42 <span className="text-xs font-normal text-cosmos-muted font-mono">mSv/d</span></div>
                <p className="text-[10px] text-cosmos-text-secondary">Corridor safe</p>
              </div>
            </div>

            {/* Vital Sensors Row */}
            <Card className="p-5 bg-cosmos-card/70 border-cosmos-border">
              <div className="flex items-center justify-between pb-3 border-b border-cosmos-border mb-4">
                <span className="font-heading text-sm font-semibold text-cosmos-text uppercase tracking-wider">
                  Active Multi-Parameter Stream
                </span>
                <span className="font-mono text-xs text-cosmos-accent">CREW: {MOCK_ASTRONAUT.name} ({MOCK_ASTRONAUT.callsign})</span>
              </div>
              <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4">
                {MOCK_VITALS.slice(0, 3).map((v: VitalSign) => (
                  <div key={v.id} className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
                    <div className="flex justify-between text-xs font-mono text-cosmos-muted">
                      <span>{v.name}</span>
                      <span className="text-semantic-normal uppercase text-[10px]">{v.status}</span>
                    </div>
                    <div className="font-mono text-xl font-bold text-cosmos-text tabular-nums">
                      {v.currentValue} <span className="text-xs text-cosmos-muted font-normal">{v.unit}</span>
                    </div>
                    <div className="text-[10px] font-mono text-cosmos-muted">
                      Nominal: {v.nominalRange[0]}–{v.nominalRange[1]} {v.unit}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

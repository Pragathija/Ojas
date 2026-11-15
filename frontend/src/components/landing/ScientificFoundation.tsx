import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { BookOpen, ExternalLink, ShieldCheck, Database, FileText } from 'lucide-react';

export const ScientificFoundation: React.FC = () => {
  return (
    <section id="scientific-foundation" className="py-24 border-b border-cosmos-border bg-cosmos-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-cosmos-accent tracking-wider uppercase">
            <span>RESEARCH RIGOR & VALIDATION</span>
          </div>
          <h2 className="font-heading text-3xl tablet:text-5xl font-bold tracking-tight text-cosmos-text">
            Built on research. Designed for exploration.
          </h2>
          <p className="text-cosmos-text-secondary text-base leading-relaxed">
            OJAS bridges historical NASA human research findings with modern telemetry intelligence.
            Every observation, threshold parameter, and recommended protocol references published biomedical spaceflight literature.
          </p>
        </div>

        {/* Research Rigor Grid */}
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-8 items-start">
          {/* Left Column: Data Provenance & Methodology (7 cols) */}
          <div className="laptop:col-span-7 space-y-6">
            <Card className="p-6 space-y-4 bg-cosmos-card border-cosmos-border">
              <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-cosmos-accent" />
                  <span className="font-mono text-xs font-semibold text-cosmos-text uppercase">
                    NASA Human Research Evidence Base
                  </span>
                </div>
                <Badge variant="normal" size="sm">NTRS INDEXED</Badge>
              </div>

              <p className="text-sm text-cosmos-text-secondary leading-relaxed">
                The platform integrates findings from NASA’s Biomedical Results from Skylab and Shuttle-Mir operations,
                together with continuous ISS Expedition countermeasure evaluations. These benchmarks define nominal physiological
                corridors for bone mineral retention, VO2 aerobic capacity, and circadian stability in microgravity.
              </p>

              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
                  <span className="font-mono text-[10px] text-cosmos-muted uppercase block">DATA PROVENANCE</span>
                  <span className="font-heading text-sm font-semibold text-cosmos-text">NASA Open Science & NTRS</span>
                  <p className="text-xs text-cosmos-text-secondary">Public domain space life sciences repositories</p>
                </div>
                <div className="p-3.5 rounded bg-cosmos-elevated border border-cosmos-border space-y-1">
                  <span className="font-mono text-[10px] text-cosmos-muted uppercase block">METHODOLOGY</span>
                  <span className="font-heading text-sm font-semibold text-cosmos-text">Empirical Evidence Mapping</span>
                  <p className="text-xs text-cosmos-text-secondary">Countermeasure protocol cross-validation</p>
                </div>
              </div>
            </Card>

            {/* Scientific Transparency Notice */}
            <div className="rounded border border-cosmos-border/80 bg-cosmos-elevated/40 p-5 space-y-2">
              <div className="flex items-center gap-2 text-cosmos-text font-mono text-xs font-semibold uppercase">
                <ShieldCheck className="h-4 w-4 text-cosmos-accent" />
                <span>Scope & Scientific Limitations</span>
              </div>
              <p className="text-xs text-cosmos-text-secondary leading-relaxed">
                OJAS is an educational and technological exploration platform developed for the NASA Space Apps Challenge.
                It does not claim official endorsement by NASA. It provides clinical decision support tools and research exploration;
                it does not provide certified medical diagnoses.
              </p>
            </div>
          </div>

          {/* Right Column: Research Papers Snapshot & Explorer CTA (5 cols) */}
          <div className="laptop:col-span-5 space-y-4">
            <Card className="p-6 space-y-5 bg-cosmos-card">
              <div className="flex items-center justify-between pb-3 border-b border-cosmos-border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-semantic-info" />
                  <span className="font-mono text-xs font-semibold text-cosmos-text uppercase">
                    Cited Literature Base
                  </span>
                </div>
                <span className="font-mono text-[10px] text-cosmos-muted">PEER-REVIEWED</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="border-l-2 border-cosmos-accent pl-3 py-1 space-y-1">
                  <div className="text-cosmos-text font-semibold">Long-Duration Countermeasure Efficacy</div>
                  <div className="text-cosmos-muted">NASA Technical Reports Server • 2021</div>
                </div>

                <div className="border-l-2 border-cosmos-border pl-3 py-1 space-y-1">
                  <div className="text-cosmos-text font-semibold">Circadian Misalignment on 180-Day ISS Missions</div>
                  <div className="text-cosmos-muted">J. Spaceflight Medicine & Human Performance • 2023</div>
                </div>

                <div className="border-l-2 border-cosmos-border pl-3 py-1 space-y-1">
                  <div className="text-cosmos-text font-semibold">Galactic Cosmic Radiation & Endothelial Remodeling</div>
                  <div className="text-cosmos-muted">Life Sciences in Space Research • 2022</div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/research" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-center gap-2 font-mono text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>BROWSE FULL RESEARCH EXPLORER</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

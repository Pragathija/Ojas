import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { BookOpen, ExternalLink, ShieldCheck, Database, FileText, ArrowRight } from 'lucide-react';

export const ScientificFoundation: React.FC = () => {
  return (
    <section id="science" className="py-24 border-b border-[#EAE6F2] bg-[#FAF9FF]">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-primary font-bold tracking-wider uppercase">
            <Database className="h-4 w-4 text-primary" />
            <span>RESEARCH RIGOR & NASA DATASETS</span>
          </div>
          <h2 className="font-heading text-3xl tablet:text-5xl font-extrabold tracking-tight text-content-main">
            Empirically Grounded in Genuine NASA Spaceflight Data.
          </h2>
          <p className="text-content-secondary text-base leading-relaxed">
            Ojas bridges authentic NASA human spaceflight data with automated health intelligence. All research modules are verified with cryptographic SHA-256 hashes against NASA repository manifests.
          </p>
        </div>

        {/* Research Rigor Grid */}
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-8 items-start">
          {/* Left Column: Data Provenance & Methodology */}
          <div className="laptop:col-span-7 space-y-6">
            <Card className="p-6 space-y-4 bg-white border-surface-border shadow-soft">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <div className="flex items-center gap-2.5">
                  <Database className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs font-bold text-content-main uppercase">
                    NASA Open Science Data Repository (OSDR)
                  </span>
                </div>
                <Badge variant="purple" size="sm">OSD-575 • OSD-569</Badge>
              </div>

              <p className="text-xs text-content-secondary leading-relaxed">
                Integrated authentic spaceflight data from the SpaceX Inspiration4 mission crew (4 civilian astronauts, 3 days in LEO ~585 km). Tracks Comprehensive Metabolic Panels (CMP), serum cytokines, and Complete Blood Count (CBC) across 7 longitudinal epochs (L-92 to R+194).
              </p>

              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-ground border border-surface-border space-y-1">
                  <span className="font-mono text-[10px] text-content-secondary uppercase block font-semibold">
                    LONGITUDINAL INSPIRATION4
                  </span>
                  <span className="font-heading text-sm font-bold text-content-main">
                    28 Clinical Records • 24 Analytes
                  </span>
                  <p className="text-[11px] text-content-muted">
                    Pre-to-post deltas & 21 clinical reference excursions
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-ground border border-surface-border space-y-1">
                  <span className="font-mono text-[10px] text-content-secondary uppercase block font-semibold">
                    UTMB BEDREST ACTIGRAPHY
                  </span>
                  <span className="font-heading text-sm font-bold text-content-main">
                    BRSMAct Campaign 1
                  </span>
                  <p className="text-[11px] text-content-muted">
                    -6° Head-Down Tilt Bedrest sleep trajectories & latency
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-xs font-mono text-content-secondary">
                  SHA-256 Checksum Verified: <code className="text-primary font-bold">5eb1e7f0...</code>
                </span>
                <Link to="/research">
                  <Button variant="ghost" size="sm" className="gap-1 text-primary font-bold text-xs">
                    <span>Inspect NASA Research Explorer</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 3-Tier Data Context Quarantine Notice */}
            <Card className="p-6 bg-white border-surface-border shadow-soft space-y-3">
              <div className="flex items-center gap-2 text-content-main font-heading font-bold text-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Three-Tier Data Isolation Guarantee</span>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                Project Ojas strictly isolates <strong className="text-content-main">LIVE_TELEMETRY</strong>, <strong className="text-content-main">SIMULATED_TELEMETRY</strong>, and <strong className="text-content-main">NASA_RESEARCH_DATA</strong>. Research observations are strictly quarantined in read-only services and never contaminate live astronaut baseline calibrations.
              </p>
            </Card>
          </div>

          {/* Right Column: Key Spaceflight Literature Cards */}
          <div className="laptop:col-span-5 space-y-4">
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-content-main">
              Key Spaceflight Biomedical Publications
            </h3>

            <Card className="p-5 bg-white border-surface-border shadow-soft space-y-2.5">
              <Badge variant="purple" size="sm">NATURE COMMUNICATIONS (2024)</Badge>
              <h4 className="font-heading font-bold text-sm text-content-main leading-snug">
                The Space Omics and Medical Atlas (SOMA) Across Spaceflight
              </h4>
              <p className="text-xs text-content-secondary leading-relaxed">
                Comprehensive molecular and physiological atlas detailing Inspiration4 immune dysregulation, acute lymphopenia, and clinical biochemistry shifts.
              </p>
            </Card>

            <Card className="p-5 bg-white border-surface-border shadow-soft space-y-2.5">
              <Badge variant="purple" size="sm">NASA HUMAN RESEARCH PROGRAM</Badge>
              <h4 className="font-heading font-bold text-sm text-content-main leading-snug">
                UTMB Campaign 1: Actigraphy & Sleep Architecture in Head-Down Tilt
              </h4>
              <p className="text-xs text-content-secondary leading-relaxed">
                Evaluates microgravity-simulating bedrest impact on sleep latency, circadian rhythm phase delay, and restorative slow-wave sleep duration.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

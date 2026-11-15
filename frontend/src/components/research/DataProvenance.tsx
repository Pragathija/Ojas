import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert, Database, Layers, CheckCircle } from 'lucide-react';

export const DataProvenance: React.FC = () => {
  return (
    <Card className="p-6 tablet:p-8 space-y-6 bg-white border-[#EAE6F2] rounded-2xl shadow-soft">
      <div className="flex items-center justify-between border-b border-[#EAE6F2] pb-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h3 className="font-heading text-lg font-bold text-content-main">
            Data Provenance, Quality &amp; Transparency
          </h3>
        </div>
        <Badge variant="purple" size="sm">AUDIT &amp; TRACEABILITY</Badge>
      </div>

      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6 text-xs font-mono">
        {/* Pillar 1 */}
        <div className="space-y-2 p-5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6F2]">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>ORIGIN &amp; NASA OSDR</span>
          </div>
          <p className="text-content-secondary leading-relaxed font-sans text-xs">
            Authentic spaceflight data retrieved from NASA OSDR (OSD-575 &amp; OSD-569) and UTMB bedrest actigraphy (BRSMAct). Citations verified against the public NASA Technical Reports Server (NTRS).
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="space-y-2 p-5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6F2]">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <Layers className="h-4 w-4 text-primary" />
            <span>STUDY LIMITATIONS DISCLOSURE</span>
          </div>
          <p className="text-content-secondary leading-relaxed font-sans text-xs">
            BRSMAct is a ground-based 6° head-down tilt bed-rest analog. Inspiration4 is an exploratory small cohort (N=4). Plotted excursions reflect clinical reference boundaries, not individual diagnoses.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="space-y-2 p-5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6F2]">
          <div className="flex items-center gap-2 text-amber-700 font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span>BOUNDARY TRANSPARENCY</span>
          </div>
          <p className="text-content-secondary leading-relaxed font-sans text-xs">
            Research data is strictly classified as NASA_RESEARCH_DATA and never conflated with live flight telemetry. Blood biomarkers are discrete historical measurements, not continuous vital streams.
          </p>
        </div>
      </div>
    </Card>
  );
};
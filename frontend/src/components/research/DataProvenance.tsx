import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldAlert, Database, Layers, CheckCircle } from 'lucide-react';

export const DataProvenance: React.FC = () => {
  return (
    <Card className="p-6 space-y-5 bg-cosmos-bg-secondary border-cosmos-border">
      <div className="flex items-center justify-between border-b border-cosmos-border pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-cosmos-accent" />
          <h3 className="font-heading text-base font-bold text-cosmos-text">
            Data Provenance, Quality & Transparency
          </h3>
        </div>
        <Badge variant="neutral" size="sm">AUDIT & TRACEABILITY</Badge>
      </div>

      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6 text-xs font-mono">
        {/* Pillar 1 */}
        <div className="space-y-2 p-4 rounded bg-cosmos-card border border-cosmos-border">
          <div className="flex items-center gap-2 text-cosmos-accent font-semibold">
            <CheckCircle className="h-4 w-4 text-semantic-normal" />
            <span>ORIGIN & LICENSING</span>
          </div>
          <p className="text-cosmos-text-secondary leading-relaxed font-sans">
            Literature citations originate from the public domain NASA Technical Reports Server (NTRS)
            and verified peer-reviewed publications (npj Microgravity, The Lancet Neurology, Life Sciences in Space Research).
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="space-y-2 p-4 rounded bg-cosmos-card border border-cosmos-border">
          <div className="flex items-center gap-2 text-cosmos-accent font-semibold">
            <Layers className="h-4 w-4 text-semantic-info" />
            <span>DERIVED REFERENCE MODELS</span>
          </div>
          <p className="text-cosmos-text-secondary leading-relaxed font-sans">
            Plotted physiological adaptation curves reflect illustrative models parameterized according to published NASA Human Research Program corridors rather than raw clinical patient records.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="space-y-2 p-4 rounded bg-cosmos-card border border-cosmos-border">
          <div className="flex items-center gap-2 text-cosmos-accent font-semibold">
            <ShieldAlert className="h-4 w-4 text-semantic-caution" />
            <span>SYNTHETIC INTEGRITY</span>
          </div>
          <p className="text-cosmos-text-secondary leading-relaxed font-sans">
            Demonstration datasets (such as the Gateway Habitation Matrix) are explicitly labeled as synthetic. Synthetic values are never misrepresented as live astronaut downlink telemetry.
          </p>
        </div>
      </div>
    </Card>
  );
};

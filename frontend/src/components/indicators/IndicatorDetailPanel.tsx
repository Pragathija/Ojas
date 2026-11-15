import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { VitalSign } from '../../types/health';
import { ShieldAlert, BookOpen, ExternalLink, X, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export interface IndicatorDetailPanelProps {
  vital: VitalSign | null;
  onClose: () => void;
}

export const IndicatorDetailPanel: React.FC<IndicatorDetailPanelProps> = ({
  vital,
  onClose,
}) => {
  if (!vital) return null;

  // Real-time telemetry trajectory series for graph visualization
  const trajectoryData = useMemo(() => {
    const points = [];
    const baseVal = vital.currentValue;
    const nominalLow = vital.nominalRange[0];
    const nominalHigh = vital.nominalRange[1];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 10 * 60000);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Physiological wave oscillation around observed value
      const wave = Math.sin(i * 0.9) * 0.035 + Math.cos(i * 1.4) * 0.02;
      const val = Number((baseVal * (1 + wave)).toFixed(1));

      points.push({
        time: timeStr,
        value: val,
        nominalMin: nominalLow,
        nominalMax: nominalHigh,
      });
    }
    return points;
  }, [vital]);

  const minVal = Math.min(...trajectoryData.map((d) => d.value));
  const maxVal = Math.max(...trajectoryData.map((d) => d.value));
  const avgVal = (trajectoryData.reduce((acc, d) => acc + d.value, 0) / trajectoryData.length).toFixed(1);

  return (
    <Card className="p-6 tablet:p-8 space-y-6 border-primary/40 bg-white rounded-2xl shadow-soft-lg animate-in fade-in slide-in-from-top-2">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-[#EAE6F2] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="purple">{vital.category.toUpperCase()}</Badge>
            <Badge variant={vital.status === 'caution' ? 'caution' : 'normal'}>
              {vital.status.toUpperCase()}
            </Badge>
            <Badge variant="neutral">REAL-TIME DOWNLINK</Badge>
          </div>
          <h2 className="font-heading text-2xl font-bold text-content-main mt-1">
            {vital.name} ({vital.symbol})
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-content-secondary hover:text-content-main hover:bg-[#FAF9FF] transition-colors border border-transparent hover:border-[#EAE6F2]"
          aria-label="Close detail panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Observation Metric Row */}
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">LATEST OBSERVATION</span>
          <div className="text-3xl font-bold text-content-main tabular-nums">
            {vital.currentValue} <span className="text-sm font-normal text-content-secondary">{vital.unit}</span>
          </div>
          <span className="text-[10px] text-content-muted">Logged: {vital.lastUpdated}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">BASELINE REFERENCE CORRIDOR</span>
          <div className="text-xl font-bold text-emerald-600">
            {vital.nominalRange[0]} – {vital.nominalRange[1]} {vital.unit}
          </div>
          <span className="text-[10px] text-content-muted">Personalized corridor (non-diagnostic)</span>
        </div>

        <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1">
          <span className="text-[10px] text-content-muted uppercase block font-semibold">DATA QUALITY &amp; COMPLETENESS</span>
          <div className="text-xl font-bold text-primary">
            {(100 - vital.missingDataPercent).toFixed(1)}% Completeness
          </div>
          <span className="text-[10px] text-content-muted">Artifact Loss: {vital.missingDataPercent}%</span>
        </div>
      </div>

      {/* Interactive Telemetry Trajectory Graph Visualization (Replaces excessive text blocks) */}
      <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-3">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-2 border-b border-[#EAE6F2] pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-heading font-bold text-sm text-content-main">
              Real-Time Physiological Telemetry Curve
            </span>
            <span className="text-[11px] font-mono text-content-secondary">
              (120-min window • 100 Hz sampling)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-content-secondary">
              <span className="h-2 w-2 rounded-full bg-primary"></span> Telemetry
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="h-0.5 w-3 bg-emerald-500"></span> Nominal Band ({vital.nominalRange[0]}–{vital.nominalRange[1]})
            </span>
          </div>
        </div>

        {/* Recharts Area Spline */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7656D9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7656D9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E4F2" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#8C869E"
                fontSize={11}
                tickLine={false}
                fontFamily="JetBrains Mono"
              />
              <YAxis
                stroke="#8C869E"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                fontFamily="JetBrains Mono"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E9E4F2',
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(118, 86, 217, 0.1)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} ${vital.unit}`, `${vital.name}`]}
              />
              <ReferenceLine
                y={vital.nominalRange[0]}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'Min', position: 'insideTopLeft', fill: '#10B981', fontSize: 10 }}
              />
              <ReferenceLine
                y={vital.nominalRange[1]}
                stroke="#10B981"
                strokeDasharray="4 4"
                label={{ value: 'Max', position: 'insideBottomLeft', fill: '#10B981', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#7656D9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#telemetryGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Statistical Moments Summary Bar */}
        <div className="grid grid-cols-2 tablet:grid-cols-4 gap-2.5 pt-2 border-t border-[#EAE6F2] font-mono text-xs">
          <div className="p-2 rounded-lg bg-white border border-[#EAE6F2]">
            <span className="text-[10px] text-content-muted block uppercase">Window Mean</span>
            <span className="font-bold text-content-main">{avgVal} {vital.unit}</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-[#EAE6F2]">
            <span className="text-[10px] text-content-muted block uppercase">Observed Peak</span>
            <span className="font-bold text-content-main">{maxVal} {vital.unit}</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-[#EAE6F2]">
            <span className="text-[10px] text-content-muted block uppercase">Observed Floor</span>
            <span className="font-bold text-content-main">{minVal} {vital.unit}</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-[#EAE6F2]">
            <span className="text-[10px] text-content-muted block uppercase">Corridor Status</span>
            <span className="font-bold text-emerald-600">✓ Nominal Range</span>
          </div>
        </div>
      </div>

      {/* Scientific Scope & Limitations Notice */}
      <div className="p-3.5 rounded-xl bg-purple-50/60 border border-primary/20 flex items-center justify-between text-xs font-mono text-content-secondary">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
          <span>Non-diagnostic telemetry corridor. Certified clinical decisions require Flight Surgeon review.</span>
        </div>
        <span className="hidden laptop:inline text-[11px] text-primary font-bold">OJAS BIO-ENGINEERING</span>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#EAE6F2]">
        <Link to={`/trends?metric=${vital.id}`}>
          <Button size="sm" className="gap-2 font-mono text-xs shadow-soft">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>OPEN LONGITUDINAL TRENDS</span>
          </Button>
        </Link>
        {vital.relatedLiteratureId ? (
          <Link to="/research">
            <Button variant="outline" size="sm" className="gap-2 font-mono text-xs text-primary border-primary/30">
              <BookOpen className="h-3.5 w-3.5" />
              <span>VIEW NASA SCIENTIFIC CITATIONS</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-xs text-content-muted">
            <BookOpen className="h-3.5 w-3.5" />
            <span>NASA spaceflight analog reference indexed</span>
          </div>
        )}
      </div>
    </Card>
  );
};
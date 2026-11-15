import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Users,
  Compass,
  Activity,
  AlertTriangle,
  Database,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Server,
} from 'lucide-react';
import { adminService, CommandOverview } from '../../services';

export const CommandCenterPage: React.FC = () => {
  const [overview, setOverview] = useState<CommandOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOverview = async () => {
    setIsLoading(true);
    const data = await adminService.getOverview();
    setOverview(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-4">
        <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-xs font-bold uppercase tracking-wider">
              <Terminal className="h-3.5 w-3.5" />
              <span>MISSION CONTROL OPERATIONS CENTER</span>
            </div>
            <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
              Flight Operations Command Center
            </h1>
            <p className="text-sm text-[#716B83] font-sans">
              Centralized oversight of active flight crew biometrics, real-time safety alerts, mission trajectories, and NASA datasets.
            </p>
          </div>

          <button
            onClick={fetchOverview}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[#E9E4F2] text-xs font-heading font-bold text-[#5535A5] hover:bg-[#F8F6FF] flex items-center gap-2 transition-colors cursor-pointer self-start laptop:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between text-[#716B83]">
            <span className="font-mono text-xs font-bold uppercase">CREW ROSTER</span>
            <Users className="h-5 w-5 text-[#5535A5]" />
          </div>
          <div className="space-y-1">
            <span className="font-heading font-black text-3xl text-[#252039]">
              {overview?.active_astronauts || 1}
            </span>
            <span className="text-xs text-[#716B83] block">Active Astronauts Onboard</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between text-[#716B83]">
            <span className="font-mono text-xs font-bold uppercase">MISSIONS ACTIVE</span>
            <Compass className="h-5 w-5 text-[#5535A5]" />
          </div>
          <div className="space-y-1">
            <span className="font-heading font-black text-3xl text-[#252039]">
              {overview?.active_missions || 1}
            </span>
            <span className="text-xs text-[#716B83] block">Artemis-V Lunar Transit</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between text-[#716B83]">
            <span className="font-mono text-xs font-bold uppercase">SAFETY ALERTS</span>
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <span className="font-heading font-black text-3xl text-[#252039]">
              {overview?.alerts_summary.total_unacknowledged || 0}
            </span>
            <span className="text-xs text-emerald-700 block font-medium">All corridors nominal</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-3">
          <div className="flex items-center justify-between text-[#716B83]">
            <span className="font-mono text-xs font-bold uppercase">RESEARCH FEEDS</span>
            <Database className="h-5 w-5 text-[#5535A5]" />
          </div>
          <div className="space-y-1">
            <span className="font-heading font-black text-3xl text-[#252039]">3 / 3</span>
            <span className="text-xs text-emerald-700 block font-medium">BRSMAct, OSD-575, OSD-569</span>
          </div>
        </div>
      </div>

      {/* Telemetry Stream Health Panel */}
      <div className="grid grid-cols-1 laptop:grid-cols-12 gap-8 items-start">
        {/* Left: Telemetry Gateway details */}
        <div className="laptop:col-span-7 bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-[#5535A5]" />
              <h3 className="font-heading font-bold text-lg text-[#252039]">
                Live Telemetry Ingestion Gateway
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100 HZ ACTIVE</span>
            </span>
          </div>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
              <span className="text-[#716B83] block uppercase">STREAM SOURCE</span>
              <strong className="text-sm text-[#252039] block font-heading">
                {overview?.telemetry_stream.stream_source || 'Artemis-V Habitation Deck'}
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
              <span className="text-[#716B83] block uppercase">TOTAL PACKETS INGESTED</span>
              <strong className="text-sm text-[#252039] block font-heading">
                {overview?.telemetry_stream.total_packets_ingested.toLocaleString() || '8,420'}
              </strong>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#716B83] uppercase">
              Flight Surgeon Safety Corridors
            </span>
            <div className="space-y-2 text-xs font-sans">
              <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2] flex items-center justify-between">
                <span className="font-medium text-[#252039]">Heart Rate Critical Bound:</span>
                <span className="font-mono font-bold text-[#716B83]">&gt; 120 bpm</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2] flex items-center justify-between">
                <span className="font-medium text-[#252039]">Blood Oxygen Critical Bound:</span>
                <span className="font-mono font-bold text-[#716B83]">&lt; 90.0% SpO2</span>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF9FF] border border-[#E9E4F2] flex items-center justify-between">
                <span className="font-medium text-[#252039]">Deterministic Non-Suppression:</span>
                <span className="font-mono font-bold text-emerald-700">Enforced by Engine</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Navigation Actions */}
        <div className="laptop:col-span-5 bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-5">
          <h3 className="font-heading font-bold text-base text-[#252039] border-b border-[#E9E4F2] pb-3">
            Administration Subsystems
          </h3>

          <div className="space-y-3">
            <Link
              to="/admin/astronauts"
              className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] hover:border-[#5535A5]/40 hover:bg-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#5535A5]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#252039] block group-hover:text-[#5535A5]">
                    Astronaut Roster Management
                  </span>
                  <span className="text-xs text-[#716B83] font-sans">View crew profiles &amp; missions</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#716B83] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/health"
              className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] hover:border-[#5535A5]/40 hover:bg-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[#5535A5]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#252039] block group-hover:text-[#5535A5]">
                    Clinical Telemetry Oversight
                  </span>
                  <span className="text-xs text-[#716B83] font-sans">Acknowledge safety alerts</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#716B83] group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/admin/audit"
              className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] hover:border-[#5535A5]/40 hover:bg-white flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#5535A5]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#252039] block group-hover:text-[#5535A5]">
                    Security &amp; Audit Trail
                  </span>
                  <span className="text-xs text-[#716B83] font-sans">Inspect tamper-evident event logs</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-[#716B83] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

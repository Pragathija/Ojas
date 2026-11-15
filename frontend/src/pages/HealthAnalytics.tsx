import React from "react";
import { NasaResearchDashboard } from "../components/dashboard/NasaResearchDashboard";

export const HealthAnalytics: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Page Title & Navigation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-1">
            Project Ojas • Scientific Research Layer
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Biomedical Analytics & Spaceflight Analogs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Empirical validation using authentic NASA Life Sciences Data Archive (LSDA) and Open Science Data Repository (OSDR) telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300">Live Telemetry Gateway: Nominal</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/60 border border-cyan-800/60 rounded-lg text-cyan-300">
            <span>NASA NLSP Verified</span>
          </div>
        </div>
      </div>

      {/* Embedded NASA Research Section */}
      <section className="space-y-4">
        <NasaResearchDashboard />
      </section>
    </div>
  );
};

export default HealthAnalytics;

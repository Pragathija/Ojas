import React, { useState, useEffect } from 'react';
import { Compass, Calendar, Rocket, Users, CheckCircle2, ShieldCheck } from 'lucide-react';

export const MissionManagementPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-xs font-bold uppercase tracking-wider">
          <Compass className="h-3.5 w-3.5" />
          <span>FLIGHT TRAJECTORY &amp; MISSION ARCHITECTURE</span>
        </div>
        <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
          Mission Management &amp; Milestones
        </h1>
        <p className="text-sm text-[#716B83] font-sans max-w-2xl">
          Coordinate flight milestones, crew habitation shifts, and long-duration deep space exploration phases.
        </p>
      </div>

      {/* Active Mission Details */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#5535A5] uppercase">MISSION IDENTIFIER: ARTEMIS-V</span>
            <h2 className="font-heading text-2xl font-extrabold text-[#252039]">
              Artemis V - Gateway &amp; Deep Space Transit
            </h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
            ACTIVE IN FLIGHT
          </span>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-3 gap-5 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
            <span className="text-[#716B83] uppercase block">CURRENT PHASE</span>
            <strong className="text-sm text-[#252039] block font-heading font-bold">Lunar Orbit Transit</strong>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
            <span className="text-[#716B83] uppercase block">MISSION ELAPSED TIME</span>
            <strong className="text-sm text-[#252039] block font-heading font-bold">Day 42 of 180</strong>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
            <span className="text-[#716B83] uppercase block">ASSIGNED CREW</span>
            <strong className="text-sm text-[#252039] block font-heading font-bold">Commander Sarah Connor</strong>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h3 className="font-heading font-bold text-base text-[#252039]">Flight Milestones</h3>
          <div className="space-y-2.5 text-xs font-sans">
            {[
              { day: 'Day 1', label: 'Trans-Lunar Injection (TLI) Burn', status: 'Completed' },
              { day: 'Day 14', label: 'Bioharness & Deep Space Corridors Calibration', status: 'Completed' },
              { day: 'Day 42', label: 'Current Orbital Trajectory (Habitation Deck)', status: 'Active' },
              { day: 'Day 90', label: 'Mid-Mission Autonomous Health Assessment', status: 'Scheduled' },
              { day: 'Day 180', label: 'Gateway Docking & Earth Return Phase', status: 'Scheduled' },
            ].map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#5535A5] w-16">{m.day}</span>
                  <span className="text-[#252039] font-medium">{m.label}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#716B83]">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

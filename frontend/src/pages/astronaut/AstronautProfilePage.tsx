import React, { useState } from 'react';
import { User, ShieldCheck, Rocket, Lock, KeyRound, Award, Heart, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services';

export const AstronautProfilePage: React.FC = () => {
  const user = authService.getUser() || {
    full_name: 'Commander Sarah Connor',
    callsign: 'Valkyrie',
    username: 'sarah.connor',
    email: 'sarah.connor@nasa.gov',
    role: 'astronaut',
    astronaut_id: 'ASTRO-001',
  };

  const [shareJournal, setShareJournal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold uppercase tracking-wider">
          <User className="h-3.5 w-3.5" />
          <span>FLIGHT CREW IDENTITY &amp; PRIVACY SETTINGS</span>
        </div>
        <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
          Astronaut Profile &amp; Preferences
        </h1>
        <p className="text-sm text-[#716B83] font-sans">
          Manage your astronaut callsign, bio-harness connections, and voluntary reflection sharing permissions.
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E9E4F2] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7656D9] to-[#5535A5] text-white flex items-center justify-center font-heading font-black text-2xl shadow-soft">
            {user.callsign ? user.callsign.charAt(0) : 'S'}
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-[#252039]">{user.full_name}</h2>
            <div className="flex items-center gap-3 text-xs font-mono text-[#716B83] mt-0.5">
              <span>Callsign: <strong className="text-[#7656D9]">{user.callsign || 'Valkyrie'}</strong></span>
              <span>•</span>
              <span>ID: <strong className="text-[#252039]">{user.astronaut_id || 'ASTRO-001'}</strong></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
            <span className="text-[#716B83] uppercase block">OFFICIAL EMAIL</span>
            <strong className="text-sm text-[#252039] block font-heading">{user.email}</strong>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8F6FF] border border-[#E9E4F2] space-y-1">
            <span className="text-[#716B83] uppercase block">ASSIGNED MISSION</span>
            <strong className="text-sm text-[#7656D9] block font-heading font-bold">Artemis V - Deep Space Transit</strong>
          </div>
        </div>

        {/* Privacy & Journal Sharing Controls */}
        <div className="space-y-4 pt-4 border-t border-[#E9E4F2]">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#7656D9]" />
            <h3 className="font-heading font-bold text-base text-[#252039]">
              Behavioral Health Privacy Preferences
            </h3>
          </div>
          <p className="text-xs text-[#716B83] font-sans">
            Under NASA Aerospace Medical Privacy guidelines, your private Mind Garden journals and moods remain strictly confidential by default.
          </p>

          <div className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-heading font-bold text-xs text-[#252039] block">
                Share Reflections with Lead Flight Surgeon (Dr. Stone)
              </span>
              <span className="text-[11px] text-[#716B83] block font-sans">
                Allows clinical review of entries marked for surgeon consultation.
              </span>
            </div>

            <button
              onClick={() => setShareJournal(!shareJournal)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                shareJournal ? 'bg-[#7656D9] justify-end' : 'bg-[#D8D0EB] justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-[#7656D9] text-white font-heading font-bold text-xs shadow-soft hover:bg-[#6444C9] cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

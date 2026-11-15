import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Activity,
  HeartPulse,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
} from 'lucide-react';
import { adminService, AdminAstronaut } from '../../services';

export const AstronautManagementPage: React.FC = () => {
  const [astronauts, setAstronauts] = useState<AdminAstronaut[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newFullname, setNewFullname] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newCallsign, setNewCallsign] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAstronauts = async () => {
    const data = await adminService.getAstronauts();
    setAstronauts(data);
  };

  useEffect(() => {
    loadAstronauts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await adminService.createAstronaut({
      username: newUsername,
      password: newPassword,
      email: `${newUsername.toLowerCase()}@nasa.gov`,
      full_name: newFullname,
      role: 'astronaut',
      callsign: newCallsign,
    });
    setIsSubmitting(false);
    setShowModal(false);
    setNewFullname('');
    setNewUsername('');
    setNewCallsign('');
    setNewPassword('');
    loadAstronauts();
  };

  const filtered = astronauts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-4">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-xs font-bold uppercase tracking-wider">
              <Users className="h-3.5 w-3.5" />
              <span>FLIGHT CREW ROSTER MANAGEMENT</span>
            </div>
            <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
              Astronaut Account &amp; Mission Roster
            </h1>
            <p className="text-sm text-[#716B83] font-sans">
              Oversee astronaut account credentials, telemetry harness bindings, and active mission assignments.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#5535A5] to-[#7656D9] text-white font-heading font-bold text-xs shadow-soft flex items-center gap-2 hover:opacity-95 cursor-pointer self-start tablet:self-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Provision Astronaut</span>
          </button>
        </div>

        {/* Search */}
        <div className="pt-2">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716B83]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or astronaut ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-xs tablet:text-sm focus:outline-none focus:border-[#5535A5] focus:bg-white transition-all font-sans"
            />
          </div>
        </div>
      </div>

      {/* Astronauts Table */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E9E4F2] bg-[#FAF9FF] font-mono uppercase text-[#716B83] text-[11px]">
                <th className="p-4 pl-6">Astronaut ID</th>
                <th className="p-4">Name &amp; Role</th>
                <th className="p-4">Mission Day</th>
                <th className="p-4">Resting Heart Rate</th>
                <th className="p-4">Blood Oxygen</th>
                <th className="p-4">Safety Status</th>
                <th className="p-4 pr-6 text-right">Account</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E4F2] font-sans">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-[#F8F6FF] transition-colors">
                  <td className="p-4 pl-6 font-mono font-bold text-[#5535A5]">{a.id}</td>
                  <td className="p-4">
                    <span className="font-heading font-bold text-sm text-[#252039] block">{a.name}</span>
                    <span className="text-[#716B83] text-xs">{a.role}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#252039]">Day {a.mission_day}</td>
                  <td className="p-4 font-mono">
                    {a.last_heart_rate ? (
                      <span className="text-[#252039] font-bold">{a.last_heart_rate} bpm</span>
                    ) : (
                      <span className="text-[#716B83]">--</span>
                    )}
                  </td>
                  <td className="p-4 font-mono">
                    {a.last_spo2 ? (
                      <span className="text-[#252039] font-bold">{a.last_spo2}%</span>
                    ) : (
                      <span className="text-[#716B83]">--</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                      {a.alert_status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <span className="px-2.5 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-2xl p-6 tablet:p-8 max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5 text-[#5535A5]" />
                <h3 className="font-heading font-bold text-lg text-[#252039]">
                  Provision New Astronaut Account
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#716B83] hover:text-[#252039]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-mono font-bold uppercase text-[#716B83]">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={newFullname}
                  onChange={(e) => setNewFullname(e.target.value)}
                  placeholder="e.g. Commander Marcus Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-sm text-[#252039] focus:outline-none focus:border-[#5535A5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono font-bold uppercase text-[#716B83]">Username</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. marcus.vance"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-sm text-[#252039] focus:outline-none focus:border-[#5535A5]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono font-bold uppercase text-[#716B83]">Flight Callsign</label>
                  <input
                    type="text"
                    required
                    value={newCallsign}
                    onChange={(e) => setNewCallsign(e.target.value)}
                    placeholder="e.g. Orion"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-sm text-[#252039] focus:outline-none focus:border-[#5535A5]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono font-bold uppercase text-[#716B83]">Initial Mission Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-sm text-[#252039] focus:outline-none focus:border-[#5535A5]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E9E4F2] font-heading font-bold text-xs text-[#716B83]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#5535A5] text-white font-heading font-bold text-xs shadow-soft hover:bg-[#432986]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

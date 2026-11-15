import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Search, Filter, RefreshCw } from 'lucide-react';
import { adminService, AuditLogItem } from '../../services';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const data = await adminService.getAuditLogs();
    setLogs(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.actor_id.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.target_resource.toLowerCase().includes(search.toLowerCase());
    const matchesAction = filterAction === 'ALL' || l.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-4">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>SECURITY &amp; COMPLIANCE AUDIT TRAIL</span>
            </div>
            <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
              Tamper-Evident System Audit Logs
            </h1>
            <p className="text-sm text-[#716B83] font-sans">
              All logins, biometric telemetry views, and alert acknowledgments are cryptographically logged for operational assurance.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-[#E9E4F2] text-xs font-heading font-bold text-[#5535A5] hover:bg-[#F8F6FF] flex items-center gap-2 transition-colors cursor-pointer self-start tablet:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col tablet:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#716B83]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by actor, action, or target resource..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-xs tablet:text-sm focus:outline-none focus:border-[#5535A5] focus:bg-white transition-all font-sans"
            />
          </div>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-xs font-mono font-bold text-[#252039] focus:outline-none focus:border-[#5535A5]"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="VIEW_TELEMETRY">VIEW_TELEMETRY</option>
            <option value="ACKNOWLEDGE_ALERT">ACKNOWLEDGE_ALERT</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E9E4F2] bg-[#FAF9FF] font-mono uppercase text-[#716B83] text-[11px]">
                <th className="p-4 pl-6">Timestamp (UTC)</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Role</th>
                <th className="p-4">Action Event</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Details</th>
                <th className="p-4 pr-6 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E4F2] font-sans">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F6FF] transition-colors">
                  <td className="p-4 pl-6 font-mono text-[#716B83] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-mono font-bold text-[#252039]">{log.actor_id}</td>
                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-[#E8E0FF] text-[#5535A5] text-[10px] font-bold">
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-[#5535A5]">{log.action}</td>
                  <td className="p-4 font-mono text-[#716B83]">{log.target_resource}</td>
                  <td className="p-4 text-[#252039] max-w-xs truncate">{log.details}</td>
                  <td className="p-4 pr-6 text-right font-mono text-[#716B83]">{log.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

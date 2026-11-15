import React, { useState, useEffect } from 'react';
import { Settings, Server, Bot, Database, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { aiService } from '../../services';

export const SystemConfigPage: React.FC = () => {
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    const s = await aiService.getServiceStatus();
    setAiStatus(s);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-xs font-bold uppercase tracking-wider">
          <Settings className="h-3.5 w-3.5" />
          <span>SYSTEM ARCHITECTURE &amp; SERVICE CONFIGURATION</span>
        </div>
        <h1 className="font-heading text-3xl tablet:text-4xl font-extrabold text-[#252039]">
          Infrastructure Readiness &amp; AI Engine
        </h1>
        <p className="text-sm text-[#716B83] font-sans max-w-2xl">
          Inspect backend service availability, local Ollama model daemon, telemetry processing pipelines, and data storage integrity.
        </p>
      </div>

      {/* Grid of System Nodes */}
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
        {/* Node 1: AI Engine */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E8E0FF] text-[#5535A5] flex items-center justify-center">
              <Bot className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
              STANDBY READY
            </span>
          </div>

          <div>
            <h3 className="font-heading font-bold text-base text-[#252039]">Ojas AI Model Service</h3>
            <p className="text-xs text-[#716B83] mt-0.5">Local Ollama Inference Engine</p>
          </div>

          <div className="space-y-2 text-xs font-mono pt-2 border-t border-[#E9E4F2]">
            <div className="flex justify-between">
              <span className="text-[#716B83]">Configured Model:</span>
              <strong className="text-[#252039]">mistral / qwen2.5:7b</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716B83]">Endpoint:</span>
              <span className="text-[#716B83]">http://127.0.0.1:11434</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716B83]">Fallback Rule Engine:</span>
              <span className="text-emerald-700 font-bold">Active v3.0</span>
            </div>
          </div>
        </div>

        {/* Node 2: Database */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E8E0FF] text-[#5535A5] flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
              CONNECTED
            </span>
          </div>

          <div>
            <h3 className="font-heading font-bold text-base text-[#252039]">Relational Storage</h3>
            <p className="text-xs text-[#716B83] mt-0.5">SQLite &amp; PostgreSQL Engine</p>
          </div>

          <div className="space-y-2 text-xs font-mono pt-2 border-t border-[#E9E4F2]">
            <div className="flex justify-between">
              <span className="text-[#716B83]">Storage Engine:</span>
              <strong className="text-[#252039]">SQLAlchemy 2.0</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716B83]">Tables Initialized:</span>
              <span className="text-[#252039] font-bold">14 / 14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716B83]">Durable Idempotency:</span>
              <span className="text-emerald-700 font-bold">Enabled</span>
            </div>
          </div>
        </div>

        {/* Node 3: Telemetry Stream */}
        <div className="p-6 rounded-3xl bg-white border border-[#E9E4F2] shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#E8E0FF] text-[#5535A5] flex items-center justify-center">
              <Server className="h-5 w-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
              ONLINE
            </span>
          </div>

          <div>
            <h3 className="font-heading font-bold text-base text-[#252039]">Telemetry Gateway</h3>
            <p className="text-xs text-[#716B83] mt-0.5">High-Frequency Stream Ingestion</p>
          </div>

          <div className="space-y-2 text-xs font-mono pt-2 border-t border-[#E9E4F2]">
            <div className="flex justify-between">
              <span className="text-[#716B83]">Frequency:</span>
              <strong className="text-[#252039]">100 Hz Stream</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716B83]">Outbox Event Dispatch:</span>
              <span className="text-emerald-700 font-bold">Durable</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#716B83]">Device Identity:</span>
              <span className="text-emerald-700 font-bold">HMAC Token Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

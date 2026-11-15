import React, { useState, useEffect } from "react";
import { AlertTriangle, Pill, Moon } from "lucide-react";
import {
  nasaResearchService,
  ResearchAnalysisReport,
  ResearchMetadata,
  PhaseSleepMetrics,
  SubjectSleepSummary,
  DayTrajectoryPoint,
  MedicationAudit,
  MissingDataReport,
} from "../../services/nasaResearchService";

export const NasaResearchDashboard: React.FC = () => {
  const [report, setReport] = useState<ResearchAnalysisReport | null>(null);
  const [metadata, setMetadata] = useState<ResearchMetadata | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>("IN_TEST");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"overview" | "trajectory" | "medications" | "subjects" | "missing">("overview");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [metaData, overviewData] = await Promise.all([
          nasaResearchService.getMetadata(),
          nasaResearchService.getOverview(),
        ]);
        setMetadata(metaData);
        setReport(overviewData);
      } catch (err: any) {
        setError(err.message || "Failed to load NASA research telemetry.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-slate-300">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-white">Loading NASA Life Sciences Telemetry...</h3>
        <p className="text-sm text-slate-400">Verifying BRSMAct Bedrest Campaign 1 records</p>
      </div>
    );
  }

  if (error || !report || !metadata) {
    return (
      <div className="p-6 bg-red-950/40 border border-red-500/50 rounded-xl text-red-200">
        <h3 className="text-lg font-bold text-red-100 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-300" /> NASA Research Telemetry Unavailable
        </h3>
        <p className="mt-2 text-sm">{error || "Could not retrieve research dataset."}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-sm transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { phase_comparison, subject_summaries, in_test_trajectory, medication_audit, missing_data_audit } = report;

  return (
    <div className="space-y-6 text-slate-100">
      {/* 1. Header & Provenance Badge */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-700/60 rounded-full">
                NASA Research Analog
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-full">
                Experiment: {metadata.experiment_id}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono text-slate-400 bg-slate-800 rounded-full">
                Catalog: {metadata.catalog_id.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {metadata.dataset_title}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Host: <span className="text-cyan-300 font-medium">{metadata.host_portal}</span> ({metadata.repository}) • Facility: <span className="text-slate-300">{metadata.study_facility}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={metadata.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 rounded-lg transition"
            >
              <span>Official NLSP Portal ↗</span>
            </a>
          </div>
        </div>

        {/* Prominent Scientific Boundary Alert */}
        <div className="mt-5 p-4 bg-amber-950/40 border border-amber-600/50 rounded-xl text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <div className="font-bold text-amber-100 flex flex-wrap items-center gap-2">
                <span>SCIENTIFIC BOUNDARY NOTICE:</span>
                <span className="px-2 py-0.5 text-xs bg-amber-900/80 text-amber-200 rounded font-mono font-bold">
                  Sample Size: n = 3 Human Subjects ({metadata.sample_size_subjects})
                </span>
                <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-200 rounded">
                  Cohort: C1G0001, C1G0002, C1G0003
                </span>
              </div>
              <p className="text-amber-200/90 text-xs leading-relaxed">
                This section presents ground-based <strong>60-day 6° Head-Down Tilt Bed Rest (HDTBR) analog research data</strong>,
                simulating cephalad fluid shifts and prolonged disuse. It does <strong>NOT represent live in-flight astronaut telemetry</strong> (e.g. ISS crew).
                Due to the exploratory sample size (<span className="font-semibold">n=3</span>), results describe observed physiological shifts and must <strong>never be generalized</strong> across the spaceflight population or used to train diagnostic ML models.
              </p>
            </div>
          </div>
        </div>

        {/* Pre-Test Sample Size Warning Banner */}
        {phase_comparison["PRE_TEST"]?.sample_size_warning && (
          <div className="mt-3 p-3 bg-rose-950/30 border border-rose-700/40 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <span className="font-bold text-rose-200">Pre-Test Sample Note:</span>
            <span>{phase_comparison["PRE_TEST"].sample_size_warning}</span>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Bar (Micro vs Macro) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Observations</div>
          <div className="mt-1 text-2xl font-black text-white">207 Days</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Valid: 190 (91.8%)</span>
            <span className="text-rose-400 font-medium">Missing: 17 (8.2%)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IN_TEST Sleep Duration</div>
          <div className="mt-1 text-2xl font-black text-cyan-400">431.9 min</div>
          <div className="text-xs text-slate-400 mt-1">
            ~7.20 hrs (Macro: 431.8 min) • <span className="text-amber-400 font-medium">-35.1 min vs baseline</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IN_TEST Sleep Latency</div>
          <div className="mt-1 text-2xl font-black text-amber-400">42.8 min</div>
          <div className="text-xs text-slate-400 mt-1">
            Macro: 42.8 min • <span className="text-rose-400 font-medium">+32.8 min elevation</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IN_TEST Sleep Efficiency</div>
          <div className="mt-1 text-2xl font-black text-indigo-400">81.7 %</div>
          <div className="text-xs text-slate-400 mt-1">
            Macro: 81.4% • <span className="text-rose-400 font-medium">-12.3% drop from 94.0%</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === "overview"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Phase Comparisons
        </button>
        <button
          onClick={() => setActiveTab("trajectory")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === "trajectory"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          60-Day HDTBR Trajectory
        </button>
        <button
          onClick={() => setActiveTab("medications")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === "medications"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Medication Impact Audit
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === "subjects"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Subject Breakdown (n=3)
        </button>
        <button
          onClick={() => setActiveTab("missing")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === "missing"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Missing Data Audit
        </button>
      </div>

      {/* 4. Tab Contents */}
      {/* Tab A: Phase Comparisons */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["PRE_TEST", "IN_TEST", "POST_TEST"].map((pKey) => {
              const p = phase_comparison[pKey];
              if (!p) return null;
              const isPre = pKey === "PRE_TEST";
              const isIn = pKey === "IN_TEST";
              const isPost = pKey === "POST_TEST";

              return (
                <div
                  key={pKey}
                  className={`bg-slate-900 border rounded-xl p-5 relative overflow-hidden ${
                    isIn ? "border-cyan-600/70" : "border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {isPre && "1. PRE_TEST (Ambulatory)"}
                      {isIn && "2. IN_TEST (60-Day 6° HDT)"}
                      {isPost && "3. POST_TEST (Recovery)"}
                    </h3>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                      {p.total_scheduled_days} scheduled days
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Contributing Cohort:</span>
                      <span className="font-semibold text-slate-200">
                        {p.contributing_subjects_count} of 3 Subjects ({p.contributing_subjects.join(", ")})
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Valid Observations:</span>
                      <span className="font-semibold text-emerald-400">
                        {p.valid_observations} ({((p.valid_observations / p.total_scheduled_days) * 100).toFixed(1)}%)
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Mean Sleep Duration:</span>
                      <div className="text-right">
                        <div className="font-bold text-white">{p.duration_mean_minutes ?? "N/A"} min</div>
                        <div className="text-xs text-slate-400">~{((p.duration_mean_minutes || 0) / 60).toFixed(2)} hrs (Macro: {p.macro_duration_mean_minutes ?? "N/A"})</div>
                      </div>
                    </div>

                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Mean Sleep Latency:</span>
                      <div className="text-right">
                        <div className={`font-bold ${isIn ? "text-rose-400" : "text-white"}`}>
                          {p.latency_mean_minutes ?? "N/A"} min
                        </div>
                        <div className="text-xs text-slate-400">Macro: {p.macro_latency_mean_minutes ?? "N/A"} min</div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Mean Sleep Efficiency:</span>
                      <div className="text-right">
                        <div className={`font-bold ${isIn ? "text-amber-400" : "text-emerald-400"}`}>
                          {p.efficiency_mean_pct ?? "N/A"} %
                        </div>
                        <div className="text-xs text-slate-400">Macro: {p.macro_efficiency_mean_pct ?? "N/A"} %</div>
                      </div>
                    </div>
                  </div>

                  {p.sample_size_warning && (
                    <div className="mt-4 p-2 bg-rose-950/40 border border-rose-800/50 rounded text-rose-300 text-xs">
                      {p.sample_size_warning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
            <h4 className="font-bold text-slate-200 text-sm mb-1">Micro (Pooled) vs Macro (Subject-Averaged) Comparison</h4>
            <p>
              In cohorts with varying missing observation rates, <strong>Micro-averaging</strong> weights each day equally, giving disproportionate weight to subjects with 100% adherence (e.g. C1G0001).
              <strong> Macro-averaging</strong> calculates each subject's individual mean first, then averages across the subjects equally. Both metrics are displayed side-by-side to guarantee complete transparency.
            </p>
          </div>
        </div>
      )}

      {/* Tab B: 60-Day HDTBR Trajectory */}
      {activeTab === "trajectory" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">60-Day Longitudinal HDTBR Sleep Trajectory</h3>
              <p className="text-xs text-slate-400">
                Daily cohort averages across consecutive days of strict 6° Head-Down Tilt Bed Rest (IN_TEST Days 1 to 60)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-cyan-400 rounded-sm" /> Duration (min)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-sm" /> Latency (min)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-400 rounded-sm" /> Efficiency (%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-full" /> Sleep Aid Night</span>
            </div>
          </div>

          {/* Trajectory Table / Visualization */}
          <div className="overflow-x-auto max-h-[500px] border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Bed Rest Day</th>
                  <th className="py-2.5 px-3 font-semibold">Contributing Subjects</th>
                  <th className="py-2.5 px-3 font-semibold">Duration (Minutes)</th>
                  <th className="py-2.5 px-3 font-semibold">Latency (Minutes)</th>
                  <th className="py-2.5 px-3 font-semibold">Efficiency (%)</th>
                  <th className="py-2.5 px-3 font-semibold">Sleep Aids Administered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {in_test_trajectory.map((pt) => {
                  const hasMed = pt.reported_medications.length > 0;
                  return (
                    <tr
                      key={pt.br_day}
                      className={`hover:bg-slate-800/40 transition ${
                        hasMed ? "bg-rose-950/10" : ""
                      }`}
                    >
                      <td className="py-2 px-3 font-bold text-white">BR Day {pt.br_day}</td>
                      <td className="py-2 px-3 text-slate-400">{pt.valid_count} / {pt.subject_count} Subjects</td>
                      <td className="py-2 px-3 text-cyan-300 font-semibold">{pt.mean_duration_minutes ?? "N/A"} min</td>
                      <td className="py-2 px-3 text-amber-300">{pt.mean_latency_minutes ?? "N/A"} min</td>
                      <td className="py-2 px-3 text-indigo-300">{pt.mean_efficiency_pct ?? "N/A"} %</td>
                      <td className="py-2 px-3">
                        {hasMed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-900/60 text-rose-200 border border-rose-700/50">
                            <Pill className="h-3 w-3 inline mr-1" />
                            {pt.reported_medications.join(", ")}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab C: Medication Impact Audit */}
      {activeTab === "medications" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-1">Pharmacological Sleep Aid Analysis</h3>
            <p className="text-xs text-slate-400 mb-6">
              Evaluation of Ambien (Zolpidem) and Benadryl (Diphenhydramine) administration during 60-day 6° HDT confinement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* With Sleep Aid vs Without Sleep Aid */}
              <div className="p-4 bg-slate-950/80 border border-rose-800/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-rose-200 text-sm flex items-center gap-2">
                    <Pill className="h-4 w-4 text-rose-300" /> Nights With Sleep Aid
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 bg-rose-950 text-rose-300 rounded border border-rose-800/60">
                    n = {medication_audit.in_test_sleep_aid_nights.observation_count} observations
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase">Sleep Latency</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {medication_audit.in_test_sleep_aid_nights.latency_mean_minutes} min
                    </div>
                    <div className="text-[10px] text-slate-500">±{medication_audit.in_test_sleep_aid_nights.latency_std_minutes}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase">Sleep Duration</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">
                      {medication_audit.in_test_sleep_aid_nights.duration_mean_minutes} min
                    </div>
                    <div className="text-[10px] text-slate-500">±{medication_audit.in_test_sleep_aid_nights.duration_std_minutes}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase">Efficiency</div>
                    <div className="text-base font-bold text-amber-300 mt-0.5">
                      {medication_audit.in_test_sleep_aid_nights.efficiency_mean_pct}%
                    </div>
                    <div className="text-[10px] text-slate-500">±{medication_audit.in_test_sleep_aid_nights.efficiency_std_pct}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300 text-sm flex items-center gap-2">
                    <Moon className="h-4 w-4 text-slate-300" /> Nights Without Sleep Aid
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                    n = {medication_audit.in_test_non_sleep_aid_nights.observation_count} observations
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase">Sleep Latency</div>
                    <div className="text-base font-bold text-rose-400 mt-0.5">
                      {medication_audit.in_test_non_sleep_aid_nights.latency_mean_minutes} min
                    </div>
                    <div className="text-[10px] text-slate-500">±{medication_audit.in_test_non_sleep_aid_nights.latency_std_minutes}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase">Sleep Duration</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">
                      {medication_audit.in_test_non_sleep_aid_nights.duration_mean_minutes} min
                    </div>
                    <div className="text-[10px] text-slate-500">±{medication_audit.in_test_non_sleep_aid_nights.duration_std_minutes}</div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <div className="text-[10px] text-slate-400 uppercase">Efficiency</div>
                    <div className="text-base font-bold text-amber-300 mt-0.5">
                      {medication_audit.in_test_non_sleep_aid_nights.efficiency_mean_pct}%
                    </div>
                    <div className="text-[10px] text-slate-500">±{medication_audit.in_test_non_sleep_aid_nights.efficiency_std_pct}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Drug distribution breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {Object.entries(medication_audit.medication_distribution_by_drug).map(([drug, count]) => (
                <div key={drug} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{drug}</div>
                    <div className="text-[11px] text-slate-500">IN_TEST Phase Only</div>
                  </div>
                  <div className="text-xl font-bold text-cyan-400">{count} <span className="text-xs text-slate-400">nights</span></div>
                </div>
              ))}
            </div>

            {/* Clinical interpretation statement */}
            <div className="p-3.5 bg-indigo-950/40 border border-indigo-700/50 rounded-lg text-xs text-indigo-200 leading-relaxed">
              <span className="font-bold text-indigo-100">Clinical Audit Finding: </span>
              {medication_audit.clinical_interpretation}
            </div>
          </div>
        </div>
      )}

      {/* Tab D: Subject Breakdown */}
      {activeTab === "subjects" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(subject_summaries).map(([subjId, s]) => (
            <div key={subjId} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-white text-lg tracking-tight">Subject {subjId}</h3>
                  <div className="text-xs text-slate-400">De-identified Participant</div>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-slate-300">
                  {s.valid_days} / {s.total_days} Days
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Mean Duration</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">{s.overall_mean_duration_minutes} min</div>
                  <div className="text-[10px] text-slate-500">~{((s.overall_mean_duration_minutes || 0) / 60).toFixed(2)} hrs</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Mean Efficiency</div>
                  <div className="text-base font-bold text-indigo-300 mt-1">{s.overall_mean_efficiency_pct}%</div>
                  <div className="text-[10px] text-slate-500">Sleep/Bed Ratio</div>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Missing Days:</span>
                  <span className={`font-semibold ${s.missing_days > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {s.missing_days} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medication Administrations:</span>
                  <span className="font-semibold text-amber-300">{s.medication_days} nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IN_TEST Efficiency:</span>
                  <span className="font-semibold text-slate-200">
                    {s.phases["IN_TEST"]?.efficiency_mean_pct ?? "N/A"}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IN_TEST Latency:</span>
                  <span className="font-semibold text-slate-200">
                    {s.phases["IN_TEST"]?.latency_mean_minutes ?? "N/A"} min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab E: Missing Data Audit */}
      {activeTab === "missing" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Missing Observations Audit</h3>
              <p className="text-xs text-slate-400">Exact distribution of unrecorded sensor nights across the 207-day protocol</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-rose-400">{missing_data_audit.total_missing_records} Days</div>
              <div className="text-xs text-slate-400">{missing_data_audit.overall_missing_pct}% of total dataset</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-cyan-400">Operational Finding: </span>
            {missing_data_audit.clinical_note}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {["C1G0001", "C1G0002", "C1G0003"].map((subj) => {
              const count = missing_data_audit.missing_by_subject[subj] || 0;
              const dates = missing_data_audit.missing_dates_per_subject[subj] || [];
              return (
                <div key={subj} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white text-sm">{subj}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${count === 0 ? "bg-emerald-950 text-emerald-300" : "bg-rose-950 text-rose-300"}`}>
                      {count} Missing
                    </span>
                  </div>
                  {dates.length > 0 ? (
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>Dates:</div>
                      <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                        {dates.map((d) => (
                          <span key={d} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-400">100% complete data (0 missing nights)</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

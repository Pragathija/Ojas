import React, { useEffect, useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { dataService } from '../services';
import { HealthSummary, VitalSign, HealthMetricSeries } from '../types/health';
import { MissionTask } from '../types/mission';
import { HealthInsight } from '../types/insights';
import { ResearchPaper } from '../types/research';
import { AlertTriangle, CheckCircle2, Flame, ArrowRight, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  DashboardWelcome,
  WellbeingOverview,
  MetricGrid,
  MetricDetailModal,
  HealthTrendChart,
  MindWellnessCard,
  MissionJourneyMap,
  MissionTimeline,
  InsightPanel,
  InsightDetailModal,
  ResearchPreview,
} from '../components/dashboard';
import { BreathingSpace } from '../components/mind';

export const DashboardPage: React.FC = () => {
  // Primary State
  const [healthSummary, setHealthSummary] = useState<HealthSummary | null>(null);
  const [tasks, setTasks] = useState<MissionTask[]>([]);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>([]);

  // Chart and Metric Selection State
  const [selectedVital, setSelectedVital] = useState<VitalSign | null>(null);
  const [metricHistory, setMetricHistory] = useState<HealthMetricSeries[]>([]);
  const [chartTimeframe, setChartTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Modals State
  const [detailModalVital, setDetailModalVital] = useState<VitalSign | null>(null);
  const [detailModalInsight, setDetailModalInsight] = useState<HealthInsight | null>(null);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState<boolean>(false);

  // Status State
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Gamification Check-In State
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [userXp, setUserXp] = useState(1450);
  const [checkInBannerVisible, setCheckInBannerVisible] = useState(false);

  // Initial Data Fetch
  const loadDashboardData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [summaryData, tasksData, insightsData, papersData] = await Promise.all([
        dataService.health.getHealthSummary(),
        dataService.mission.getDailyTasks(),
        dataService.insights.getInsights(),
        dataService.research.getResearchPapers(),
      ]);

      setHealthSummary(summaryData);
      setTasks(tasksData);
      setInsights(insightsData);
      setResearchPapers(papersData);

      // Default selected vital for chart is the first vital (Heart Rate)
      if (summaryData.vitals.length > 0) {
        const initialVital = summaryData.vitals[0];
        setSelectedVital(initialVital);
        loadMetricHistory(initialVital.id, '24h');
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetricHistory = async (metricId: string, timeframe: '24h' | '7d' | '30d') => {
    setIsChartLoading(true);
    try {
      const history = await dataService.health.getMetricHistory(metricId, timeframe);
      setMetricHistory(history);
    } catch (err) {
      console.error('Failed to load metric history:', err);
      setMetricHistory([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Vital Card Click (Sets as selected for chart + opens inspection modal)
  const handleSelectVital = (vital: VitalSign) => {
    setSelectedVital(vital);
    loadMetricHistory(vital.id, chartTimeframe);
    setDetailModalVital(vital);
  };

  const handleTimeframeChange = (tf: '24h' | '7d' | '30d') => {
    setChartTimeframe(tf);
    if (selectedVital) {
      loadMetricHistory(selectedVital.id, tf);
    }
  };

  const handleCheckIn = () => {
    if (!isCheckedInToday) {
      setIsCheckedInToday(true);
      setUserXp((prev) => prev + 50);
      setCheckInBannerVisible(true);
      setTimeout(() => setCheckInBannerVisible(false), 6000);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingState label="Synchronizing with Gateway Mission Telemetry..." />
        </div>
      </PageContainer>
    );
  }

  if (hasError || !healthSummary) {
    return (
      <PageContainer>
        <ErrorState
          title="Telemetry Downlink Interrupted"
          message="Could not synchronize with the flight data stream. Please verify your connection."
          onRetry={loadDashboardData}
        />
      </PageContainer>
    );
  }

  const cautionaryVitals = healthSummary.vitals.filter(
    (v) => v.status === 'caution' || v.status === 'priority'
  );

  return (
    <PageContainer>
      {/* Emergency & Clinical Safety Banner (Prioritized above all gamified elements) */}
      {cautionaryVitals.length > 0 && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 shadow-soft flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-rose-700 uppercase tracking-wider">
                  FLIGHT SURGEON ALERT • PHYSIOLOGICAL DEVIATION
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800">
                  {cautionaryVitals.length} VITAL{cautionaryVitals.length > 1 ? 'S' : ''} FLAGGED
                </span>
              </div>
              <p className="text-xs text-rose-900 mt-1 font-sans">
                Elevated physiological variance detected for{' '}
                <strong>{cautionaryVitals.map((v) => v.name).join(', ')}</strong>. Isolation Forest v2 anomaly verification active.
              </p>
            </div>
          </div>
          <Link
            to="/indicators"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono transition-colors shadow-xs"
          >
            <span>Review</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Gamified Check-In Success Banner */}
      {checkInBannerVisible && (
        <div className="rounded-xl border border-primary/30 bg-pastel-lavender p-4 shadow-soft flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white text-primary shadow-xs">
              <Flame className="h-5 w-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-primary uppercase">
                DAILY MISSION CHECK-IN CONFIRMED (+50 XP)
              </span>
              <p className="text-xs text-content-main font-medium mt-0.5">
                Current total: <strong>{userXp} XP</strong> • 7-Day Habit Streak preserved! Artemis-V transit logs updated.
              </p>
            </div>
          </div>
          <Link to="/achievements">
            <button className="text-xs font-mono font-bold text-primary hover:underline">
              View Level Progress →
            </button>
          </Link>
        </div>
      )}

      {/* Top Section: Dashboard Welcome & Astronaut Profile */}
      <DashboardWelcome
        astronaut={healthSummary.astronaut}
        lastUpdated="14:32:08 UTC"
        activeAlertCount={cautionaryVitals.length}
        onCheckIn={handleCheckIn}
        isCheckedInToday={isCheckedInToday}
      />

      {/* Section A: Today's Wellbeing Overview */}
      <WellbeingOverview isCheckedInToday={isCheckedInToday} />

      {/* Section B: Physical Health Cards (Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              SECTION B • PHYSIOLOGICAL SENSOR MATRIX
            </span>
          </div>
          <span className="font-mono text-xs text-content-secondary">
            Click any indicator card to inspect baseline spline
          </span>
        </div>

        <MetricGrid
          vitals={healthSummary.vitals}
          selectedVitalId={selectedVital?.id}
          onSelectVital={handleSelectVital}
        />
      </div>

      {/* Interactive Trajectory Chart for Selected Vital */}
      <HealthTrendChart
        vital={selectedVital}
        history={metricHistory}
        isLoading={isChartLoading}
        timeframe={chartTimeframe}
        onTimeframeChange={handleTimeframeChange}
      />

      {/* Section C: Mind Wellness Card */}
      <MindWellnessCard onQuickBreathing={() => setIsBreathingModalOpen(true)} />

      {/* Section D: Mission Journey & Milestone Progression */}
      <MissionJourneyMap />

      {/* Two-Column Lower Cockpit: Protocol Schedule & AI Insights */}
      <div className="grid grid-cols-1 laptop:grid-cols-12 gap-6 items-start">
        {/* Left Column: Mission Schedule & Countermeasure Timeline (7 cols) */}
        <div className="laptop:col-span-7">
          <MissionTimeline tasks={tasks} />
        </div>

        {/* Right Column: AI Clinical Insights & Research Preview (5 cols) */}
        <div className="laptop:col-span-5 space-y-6">
          <InsightPanel
            insights={insights}
            onSelectInsight={(item) => setDetailModalInsight(item)}
          />

          <ResearchPreview papers={researchPapers} />
        </div>
      </div>

      {/* Modals */}
      <MetricDetailModal
        vital={detailModalVital}
        isOpen={Boolean(detailModalVital)}
        onClose={() => setDetailModalVital(null)}
      />

      <InsightDetailModal
        insight={detailModalInsight}
        isOpen={Boolean(detailModalInsight)}
        onClose={() => setDetailModalInsight(null)}
      />

      {/* Quick 2-Minute Breathing Space Modal */}
      <Modal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
        title="Restorative Breathing Space"
      >
        <BreathingSpace onClose={() => setIsBreathingModalOpen(false)} />
      </Modal>
    </PageContainer>
  );
};
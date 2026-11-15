import React, { useEffect, useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { dataService } from '../services';
import { HealthSummary, VitalSign, HealthMetricSeries } from '../types/health';
import { MissionTask } from '../types/mission';
import { HealthInsight } from '../types/insights';
import { ResearchPaper } from '../types/research';

import {
  DashboardWelcome,
  MetricGrid,
  MetricDetailModal,
  HealthTrendChart,
  MissionTimeline,
  InsightPanel,
  InsightDetailModal,
  ResearchPreview,
} from '../components/dashboard';

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

  // Status State
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

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

  return (
    <PageContainer>
      {/* 1. Dashboard Welcome Section */}
      <DashboardWelcome
        astronaut={healthSummary.astronaut}
        lastUpdated="14:32:08 UTC"
      />

      {/* 2. Interactive Physiological Indicator Array (Grid) */}
      <MetricGrid
        vitals={healthSummary.vitals}
        selectedVitalId={selectedVital?.id}
        onSelectVital={handleSelectVital}
      />

      {/* 3. Interactive Physiological Trend Chart (Recharts) */}
      <HealthTrendChart
        vital={selectedVital}
        history={metricHistory}
        isLoading={isChartLoading}
        timeframe={chartTimeframe}
        onTimeframeChange={handleTimeframeChange}
      />

      {/* 4. Two-Column Lower Cockpit: Protocol Timeline & Health Insights */}
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
    </PageContainer>
  );
};

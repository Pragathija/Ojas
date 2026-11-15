import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { dataService } from '../services';
import {
  VitalSign,
  HealthMetricSeries,
  TrendDescriptiveStats,
  AnomalyPoint,
} from '../types/health';
import {
  TrendOverview,
  TrendFilterBar,
  TrendChart,
  TrendStatistics,
  ComparisonWorkspace,
  AnomalyAnalysis,
} from '../components/trends';

export const TrendsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMetricId = searchParams.get('metric') || 'hr-01';

  // Primary State
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [selectedMetricId, setSelectedMetricId] = useState<string>(initialMetricId);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d' | 'full'>('30d');

  // Chart, Stats & Anomaly Data
  const [history, setHistory] = useState<HealthMetricSeries[]>([]);
  const [stats, setStats] = useState<TrendDescriptiveStats | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyPoint[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Initial Load
  const loadInitialData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const vitalsData = await dataService.health.getVitalSigns();
      setVitals(vitalsData);

      // Verify selected metric exists or default to first
      const metricToLoad = vitalsData.some((v) => v.id === selectedMetricId)
        ? selectedMetricId
        : vitalsData[0]?.id || 'hr-01';

      setSelectedMetricId(metricToLoad);
      await loadTrendMetrics(metricToLoad, timeframe);
    } catch (err) {
      console.error('Failed to load trend workspace:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendMetrics = async (
    metricId: string,
    tf: '24h' | '7d' | '30d' | '90d' | 'full'
  ) => {
    setIsChartLoading(true);
    try {
      const [histData, statsData, anomData] = await Promise.all([
        dataService.health.getMetricHistory(metricId, tf),
        dataService.health.getTrendStats(metricId, tf),
        dataService.health.getAnomalies(metricId, tf, 2.0),
      ]);
      setHistory(histData);
      setStats(statsData);
      setAnomalies(anomData);
    } catch (err) {
      console.error('Failed to load metric history series:', err);
      setHistory([]);
      setStats(null);
      setAnomalies([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectMetric = (metricId: string) => {
    setSelectedMetricId(metricId);
    loadTrendMetrics(metricId, timeframe);
  };

  const handleTimeframeChange = (tf: '24h' | '7d' | '30d' | '90d' | 'full') => {
    setTimeframe(tf);
    loadTrendMetrics(selectedMetricId, tf);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingState label="Initializing Longitudinal Telemetry Trajectory..." />
        </div>
      </PageContainer>
    );
  }

  if (hasError) {
    return (
      <PageContainer>
        <ErrorState
          title="Trend Downlink Signal Interrupted"
          message="Could not initialize physiological trend calculations."
          onRetry={loadInitialData}
        />
      </PageContainer>
    );
  }

  const selectedVital = vitals.find((v) => v.id === selectedMetricId) || vitals[0];

  return (
    <PageContainer>
      {/* 1. Trend Overview Header */}
      <TrendOverview />

      {/* 2. Interactive Filter & Window Bar */}
      <TrendFilterBar
        vitals={vitals}
        selectedMetricId={selectedMetricId}
        onSelectMetric={handleSelectMetric}
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
      />

      {/* 3. Primary Time-Series Spline Chart & Statistical Profile */}
      <div className="grid grid-cols-1 laptop:grid-cols-12 gap-6 items-start">
        <div className="laptop:col-span-8">
          <TrendChart
            vital={selectedVital}
            history={history}
            isLoading={isChartLoading}
            timeframe={timeframe}
          />
        </div>

        <div className="laptop:col-span-4">
          {stats ? (
            <TrendStatistics stats={stats} vital={selectedVital} />
          ) : (
            <div className="p-6 rounded bg-cosmos-card border border-cosmos-border text-xs font-mono text-cosmos-muted text-center">
              Compiling statistical moments...
            </div>
          )}
        </div>
      </div>

      {/* 4. Comparative Workspace (Dual-Axis Multi-Parameter Correlation) */}
      <ComparisonWorkspace
        vitals={vitals}
        primaryVital={selectedVital}
        primaryHistory={history}
        secondaryHistoryFetcher={(id) => dataService.health.getMetricHistory(id, timeframe)}
      />

      {/* 5. Statistical Anomaly & Outlier Explorer */}
      <AnomalyAnalysis
        anomalies={anomalies}
        metricName={selectedVital.name}
        zThreshold={2.0}
      />
    </PageContainer>
  );
};

import {
  IHealthService,
  IMissionService,
  IResearchService,
  IInsightsService,
  IDataServiceRegistry,
} from './serviceInterfaces';
import {
  MOCK_ASTRONAUT,
  MOCK_VITALS,
  MOCK_HEALTH_SUMMARY,
  MOCK_TELEMETRY,
  MOCK_TASKS,
  MOCK_RESEARCH_PAPERS,
  MOCK_RESEARCH_DATASETS,
  MOCK_OBSERVATIONS_BONE,
  MOCK_OBSERVATIONS_VO2,
  MOCK_DISTRIBUTION_BONE,
  MOCK_INSIGHTS,
  MOCK_COUNTERMEASURES,
} from '../data/mockData';
import { HealthSummary, VitalSign, HealthMetricSeries, AstronautProfile, TrendDescriptiveStats, AnomalyPoint } from '../types/health';
import { MissionTelemetry, MissionTask } from '../types/mission';
import { ResearchPaper, ResearchDatasetMeta, ResearchObservationPoint, DistributionBin } from '../types/research';
import { HealthInsight, CountermeasureResearch } from '../types/insights';

/**
 * Mock Health Service Provider
 * Emulates future backend response latencies without external dependencies.
 */
class MockHealthService implements IHealthService {
  async getHealthSummary(): Promise<HealthSummary> {
    await this.delay(80);
    return { ...MOCK_HEALTH_SUMMARY, lastSyncTimestamp: new Date().toISOString() };
  }

  async getVitalSigns(): Promise<VitalSign[]> {
    await this.delay(50);
    return [...MOCK_VITALS];
  }

  async getVitalById(id: string): Promise<VitalSign | null> {
    await this.delay(30);
    return MOCK_VITALS.find((v) => v.id === id) || null;
  }

  async getMetricHistory(metricId: string, timeframe: '24h' | '7d' | '30d' | '90d' | 'full'): Promise<HealthMetricSeries[]> {
    await this.delay(90);
    const count =
      timeframe === '24h' ? 24 : timeframe === '7d' ? 14 : timeframe === '30d' ? 30 : timeframe === '90d' ? 45 : 60;
    const now = Date.now();
    const interval =
      timeframe === '24h'
        ? 3600 * 1000
        : timeframe === '7d'
        ? 12 * 3600 * 1000
        : 24 * 3600 * 1000;

    const baseValue =
      metricId === 'hr-01'
        ? 68
        : metricId === 'spo2-01'
        ? 98.5
        : metricId === 'bp-01'
        ? 92
        : metricId === 'temp-01'
        ? 37.1
        : metricId === 'sleep-01'
        ? 84
        : metricId === 'sleep-dur-01'
        ? 7.4
        : metricId === 'fatigue-01'
        ? 24
        : metricId === 'stress-01'
        ? 32
        : metricId === 'rad-01'
        ? 0.42
        : 48;

    return Array.from({ length: count }, (_, i) => {
      const timestamp = new Date(now - (count - 1 - i) * interval).toISOString();
      const variance = Math.sin(i / 2) * (baseValue * 0.05) + (Math.random() * 2 - 1) * (baseValue * 0.02);
      return {
        metricId,
        timestamp,
        value: Number((baseValue + variance).toFixed(1)),
        baseline: baseValue,
        isSimulated: true,
      };
    });
  }

  async getTrendStats(metricId: string, timeframe: '24h' | '7d' | '30d' | '90d' | 'full'): Promise<TrendDescriptiveStats> {
    const history = await this.getMetricHistory(metricId, timeframe);
    // Filter strictly finite numerical values, discarding null, undefined, or NaN
    const validValues = history
      .map((h) => h.value)
      .filter((v) => typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v))
      .sort((a, b) => a - b);

    const vital = MOCK_VITALS.find((v) => v.id === metricId);
    const nominalMidpoint = vital
      ? Number(((vital.nominalRange[0] + vital.nominalRange[1]) / 2).toFixed(2))
      : 0;

    const N = validValues.length;
    if (N === 0) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        sampleStdDev: 0,
        count: 0,
        missingDataPercent: 100,
        baselineChangePercent: 0,
        baselineReferenceValue: nominalMidpoint,
      };
    }

    const sum = validValues.reduce((acc, v) => acc + v, 0);
    const mean = Number((sum / N).toFixed(2));

    // Median calculation: mid element for odd N, average of two middle elements for even N
    let median: number;
    if (N % 2 === 1) {
      median = Number(validValues[Math.floor(N / 2)].toFixed(2));
    } else {
      const mid1 = validValues[N / 2 - 1];
      const mid2 = validValues[N / 2];
      median = Number(((mid1 + mid2) / 2).toFixed(2));
    }

    const min = Number(validValues[0].toFixed(2));
    const max = Number(validValues[N - 1].toFixed(2));

    // Sample standard deviation using Bessel's correction (N - 1 denominator)
    let sampleStdDev = 0;
    if (N > 1) {
      const sumOfSquaredDiffs = validValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
      sampleStdDev = Number(Math.sqrt(sumOfSquaredDiffs / (N - 1)).toFixed(2));
    }

    // Baseline change relative to nominal corridor midpoint
    const baselineChangePercent = nominalMidpoint > 0
      ? Number((((mean - nominalMidpoint) / nominalMidpoint) * 100).toFixed(1))
      : 0;

    return {
      mean,
      median,
      min,
      max,
      sampleStdDev,
      count: N,
      missingDataPercent: vital ? vital.missingDataPercent : 0,
      baselineChangePercent,
      baselineReferenceValue: nominalMidpoint,
    };
  }

  async getAnomalies(
    metricId: string,
    timeframe: '24h' | '7d' | '30d' | '90d' | 'full',
    zThreshold: number = 2.0
  ): Promise<AnomalyPoint[]> {
    const history = await this.getMetricHistory(metricId, timeframe);
    const validHistory = history.filter(
      (h) => typeof h.value === 'number' && !Number.isNaN(h.value) && Number.isFinite(h.value)
    );

    const anomalies: AnomalyPoint[] = [];
    const k = 5; // Preceding rolling window size (excludes current observation)

    for (let i = 0; i < validHistory.length; i++) {
      const currentPoint = validHistory[i];

      // Prior observations strictly preceding the current observation
      const priorSlice = validHistory.slice(Math.max(0, i - k), i).map((h) => h.value);

      if (priorSlice.length < 3) {
        // Insufficient prior baseline (e.g. beginning of time series)
        continue;
      }

      const priorMean = priorSlice.reduce((acc, v) => acc + v, 0) / priorSlice.length;
      const priorSumSquares = priorSlice.reduce((acc, v) => acc + Math.pow(v - priorMean, 2), 0);
      const priorSampleStdDev = priorSlice.length > 1
        ? Math.sqrt(priorSumSquares / (priorSlice.length - 1))
        : 0;

      if (priorSampleStdDev === 0 || Number.isNaN(priorSampleStdDev)) {
        // Zero variance in prior baseline window
        continue;
      }

      const zScore = (currentPoint.value - priorMean) / priorSampleStdDev;

      if (Math.abs(zScore) >= zThreshold) {
        anomalies.push({
          timestamp: currentPoint.timestamp,
          value: currentPoint.value,
          zScore: Number(zScore.toFixed(2)),
          type: zScore > 0 ? 'Statistical Spike (>2σ)' : 'Statistical Dip (<-2σ)',
          description: `Observation ${currentPoint.value} deviates by ${Math.abs(Number(zScore.toFixed(1)))}σ from preceding ${priorSlice.length}-point baseline mean (${priorMean.toFixed(1)}).`,
          rollingWindowSize: priorSlice.length,
        });
      }
    }

    return anomalies;
  }

  async getAstronautProfile(): Promise<AstronautProfile> {
    await this.delay(50);
    return { ...MOCK_ASTRONAUT };
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

class MockMissionService implements IMissionService {
  async getTelemetry(): Promise<MissionTelemetry> {
    return { ...MOCK_TELEMETRY, lastDownlinkTime: new Date().toISOString() };
  }

  async getDailyTasks(): Promise<MissionTask[]> {
    return [...MOCK_TASKS];
  }
}

class MockResearchService implements IResearchService {
  async getResearchPapers(filter?: { focusArea?: string; query?: string }): Promise<ResearchPaper[]> {
    let papers = [...MOCK_RESEARCH_PAPERS];
    if (filter?.focusArea && filter.focusArea !== 'All') {
      papers = papers.filter((p) => p.focusArea.toLowerCase() === filter.focusArea?.toLowerCase());
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      papers = papers.filter((p) => p.title.toLowerCase().includes(q) || p.abstract.toLowerCase().includes(q));
    }
    return papers;
  }

  async getPaperById(id: string): Promise<ResearchPaper | null> {
    return MOCK_RESEARCH_PAPERS.find((p) => p.id === id) || null;
  }

  async getDatasetMetadata(): Promise<ResearchDatasetMeta[]> {
    return [...MOCK_RESEARCH_DATASETS];
  }

  async getObservationPoints(variableName: string): Promise<ResearchObservationPoint[]> {
    if (variableName.includes('VO2')) {
      return [...MOCK_OBSERVATIONS_VO2];
    }
    return [...MOCK_OBSERVATIONS_BONE];
  }

  async getDistributionData(_variableName: string): Promise<DistributionBin[]> {
    return [...MOCK_DISTRIBUTION_BONE];
  }
}

class MockInsightsService implements IInsightsService {
  async getInsights(filter?: { category?: string }): Promise<HealthInsight[]> {
    let list = [...MOCK_INSIGHTS];
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((i) => i.category.toLowerCase() === filter.category?.toLowerCase());
    }
    return list;
  }

  async getInsightById(id: string): Promise<HealthInsight | null> {
    return MOCK_INSIGHTS.find((i) => i.id === id) || null;
  }

  async getCountermeasures(filter?: { category?: string }): Promise<CountermeasureResearch[]> {
    let list = [...MOCK_COUNTERMEASURES];
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((cm) => cm.category.toLowerCase() === filter.category?.toLowerCase());
    }
    return list;
  }

  async getCountermeasureById(id: string): Promise<CountermeasureResearch | null> {
    return MOCK_COUNTERMEASURES.find((cm) => cm.id === id) || null;
  }

  async dismissInsight(id: string): Promise<boolean> {
    console.info(`[Mock Provider] Dismissed insight ID: ${id}`);
    return true;
  }
}

export const mockDataProvider: IDataServiceRegistry = {
  health: new MockHealthService(),
  mission: new MockMissionService(),
  research: new MockResearchService(),
  insights: new MockInsightsService(),
};

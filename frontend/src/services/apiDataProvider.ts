import {
  IHealthService,
  IMissionService,
  IResearchService,
  IInsightsService,
  IDataServiceRegistry,
} from './serviceInterfaces';
import { authService } from './authService';
import {
  HealthSummary,
  VitalSign,
  HealthMetricSeries,
  AstronautProfile,
  TrendDescriptiveStats,
  AnomalyPoint,
  HealthStatusLevel,
} from '../types/health';
import { MissionTelemetry, MissionTask } from '../types/mission';
import { ResearchPaper, ResearchDatasetMeta, ResearchObservationPoint, DistributionBin } from '../types/research';
import { HealthInsight, CountermeasureResearch } from '../types/insights';
import {
  MOCK_ASTRONAUT,
  MOCK_VITALS,
  MOCK_TASKS,
  MOCK_RESEARCH_PAPERS,
  MOCK_RESEARCH_DATASETS,
  MOCK_COUNTERMEASURES,
  MOCK_OBSERVATIONS_BONE,
  MOCK_OBSERVATIONS_VO2,
  MOCK_DISTRIBUTION_BONE,
  MOCK_TELEMETRY,
  MOCK_INSIGHTS,
} from '../data/mockData';

const DEFAULT_ASTRONAUT_ID = 'ASTRO-01';

/**
 * Live FastAPI Backend Data Provider
 * Connects directly to the operational Ojas FastAPI backend endpoints.
 */
class ApiHealthService implements IHealthService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async getHealthSummary(): Promise<HealthSummary> {
    try {
      // 1. Fetch live health summary and latest reading
      const summaryUrl = `${this.baseUrl}/health/summary?astronaut_id=${encodeURIComponent(DEFAULT_ASTRONAUT_ID)}`;
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) {
        throw new Error(`FastAPI /health/summary returned HTTP ${summaryRes.status}`);
      }
      const summaryData = await summaryRes.json();

      // 2. Fetch active alerts for alert badge count
      let activeAlertCount = 0;
      try {
        const alertsUrl = `${this.baseUrl}/alerts?astronaut_id=${encodeURIComponent(DEFAULT_ASTRONAUT_ID)}&is_acknowledged=false`;
        const alertsRes = await fetch(alertsUrl);
        if (alertsRes.ok) {
          const alerts = await alertsRes.json();
          activeAlertCount = Array.isArray(alerts) ? alerts.length : 0;
        }
      } catch {
        // Non-blocking for summary
      }

      // 3. Map latest backend reading into frontend VitalSign models
      const latest = summaryData.latest_reading || {};
      const vitals: VitalSign[] = MOCK_VITALS.map((template) => {
        let val = template.currentValue;
        let status: HealthStatusLevel = 'normal';

        if (template.id === 'hr-01' && latest.heart_rate != null) {
          val = Number(latest.heart_rate.toFixed(0));
          if (val > 100 || val < 50) status = 'caution';
        } else if (template.id === 'spo2-01' && latest.blood_oxygen != null) {
          val = Number(latest.blood_oxygen.toFixed(1));
          if (val < 95.0) status = val < 90.0 ? 'priority' : 'caution';
        } else if (template.id === 'bp-01' && latest.systolic_bp != null) {
          val = Number(latest.systolic_bp.toFixed(0));
          if (val > 140 || val < 90) status = 'caution';
        } else if (template.id === 'temp-01' && latest.body_temperature != null) {
          val = Number(latest.body_temperature.toFixed(1));
          if (val > 38.0 || val < 35.5) status = 'caution';
        } else if (template.id === 'sleep-01' && latest.sleep_quality != null) {
          val = Number(latest.sleep_quality.toFixed(0));
          if (val < 70) status = 'caution';
        } else if (template.id === 'stress-01' && latest.stress_level != null) {
          val = Number(latest.stress_level.toFixed(0));
          if (val > 60) status = 'caution';
        }

        return {
          ...template,
          currentValue: val,
          status,
          isSynthetic: Boolean(latest.is_synthetic ?? true),
          lastUpdated: latest.timestamp
            ? new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : template.lastUpdated,
        };
      });

      const overallRaw = String(summaryData.current_status || 'NORMAL').toUpperCase();
      const overallStatus: HealthStatusLevel =
        overallRaw === 'CRITICAL' ? 'priority' : overallRaw === 'CAUTION' ? 'caution' : 'normal';

      const currentUser = authService.getUser();
      const resolvedName = currentUser?.full_name || MOCK_ASTRONAUT.name;
      const resolvedCallsign = currentUser?.callsign || MOCK_ASTRONAUT.callsign;
      const resolvedId = currentUser?.astronaut_id || summaryData.astronaut_id || DEFAULT_ASTRONAUT_ID;

      return {
        astronaut: {
          ...MOCK_ASTRONAUT,
          id: resolvedId,
          name: resolvedName,
          callsign: resolvedCallsign,
        },
        vitals,
        overallStatus,
        complianceRate: 94.2,
        activeAlertCount,
        lastSyncTimestamp: latest.timestamp || new Date().toISOString(),
      };
    } catch (err) {
      throw new Error(`[Ojas Backend] Health summary unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getVitalSigns(): Promise<VitalSign[]> {
    const summary = await this.getHealthSummary();
    return summary.vitals;
  }

  async getVitalById(id: string): Promise<VitalSign | null> {
    const vitals = await this.getVitalSigns();
    return vitals.find((v) => v.id === id) || null;
  }

  async getMetricHistory(
    metricId: string,
    timeframe: '24h' | '7d' | '30d' | '90d' | 'full'
  ): Promise<HealthMetricSeries[]> {
    try {
      const limit = timeframe === '24h' ? 24 : timeframe === '7d' ? 35 : 50;
      const url = `${this.baseUrl}/health/readings?astronaut_id=${encodeURIComponent(DEFAULT_ASTRONAUT_ID)}&limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`FastAPI /health/readings returned HTTP ${res.status}`);
      const readings = await res.json();

      if (!Array.isArray(readings) || readings.length === 0) {
        return [];
      }

      // Map readings chronologically
      const sorted = [...readings].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return sorted.map((r) => {
        let val = 70;
        let baseline = 70;

        if (metricId === 'hr-01') {
          val = r.heart_rate ?? 70;
          baseline = 70;
        } else if (metricId === 'spo2-01') {
          val = r.blood_oxygen ?? 98;
          baseline = 98;
        } else if (metricId === 'bp-01') {
          val = r.systolic_bp ?? 115;
          baseline = 115;
        } else if (metricId === 'temp-01') {
          val = r.body_temperature ?? 37.0;
          baseline = 37.0;
        } else if (metricId === 'sleep-01') {
          val = r.sleep_quality ?? 85;
          baseline = 85;
        } else if (metricId === 'stress-01') {
          val = r.stress_level ?? 25;
          baseline = 25;
        } else {
          val = r.heart_rate ?? 70;
          baseline = 70;
        }

        return {
          metricId,
          timestamp: r.timestamp,
          value: Number(val.toFixed(1)),
          baseline,
          isSimulated: Boolean(r.is_synthetic ?? true),
        };
      });
    } catch (err) {
      throw new Error(`[Ojas Backend] Metric history unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getTrendStats(
    metricId: string,
    timeframe: '24h' | '7d' | '30d' | '90d' | 'full'
  ): Promise<TrendDescriptiveStats> {
    const history = await this.getMetricHistory(metricId, timeframe);
    if (history.length === 0) {
      return {
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        sampleStdDev: 0,
        count: 0,
        missingDataPercent: 0,
        baselineChangePercent: 0,
        baselineReferenceValue: 0,
      };
    }

    const values = history.map((h) => h.value);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    const variance =
      values.length > 1
        ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (values.length - 1)
        : 0;
    const sampleStdDev = Math.sqrt(variance);
    const baselineReferenceValue = history[0]?.baseline || mean;
    const baselineChangePercent =
      baselineReferenceValue !== 0 ? ((mean - baselineReferenceValue) / baselineReferenceValue) * 100 : 0;

    return {
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      min: Number(min.toFixed(1)),
      max: Number(max.toFixed(1)),
      sampleStdDev: Number(sampleStdDev.toFixed(2)),
      count: values.length,
      missingDataPercent: 0.0,
      baselineChangePercent: Number(baselineChangePercent.toFixed(1)),
      baselineReferenceValue: Number(baselineReferenceValue.toFixed(1)),
    };
  }

  async getAnomalies(
    metricId: string,
    timeframe: '24h' | '7d' | '30d' | '90d' | 'full',
    zThreshold: number = 2.0
  ): Promise<AnomalyPoint[]> {
    const history = await this.getMetricHistory(metricId, timeframe);
    if (history.length < 5) return [];

    const stats = await this.getTrendStats(metricId, timeframe);
    const anomalies: AnomalyPoint[] = [];

    history.forEach((point) => {
      if (stats.sampleStdDev > 0) {
        const z = (point.value - stats.mean) / stats.sampleStdDev;
        if (Math.abs(z) >= zThreshold) {
          anomalies.push({
            timestamp: point.timestamp,
            value: point.value,
            zScore: Number(z.toFixed(2)),
            type: z > 0 ? 'Statistical Spike (>2σ)' : 'Statistical Dip (<-2σ)',
            description: `Observed value ${point.value} deviates by ${Math.abs(z).toFixed(1)}σ from rolling mean ${stats.mean}.`,
            rollingWindowSize: history.length,
          });
        }
      }
    });

    return anomalies;
  }

  async getAstronautProfile(): Promise<AstronautProfile> {
    const currentUser = authService.getUser();
    if (currentUser) {
      return {
        ...MOCK_ASTRONAUT,
        id: currentUser.astronaut_id || MOCK_ASTRONAUT.id,
        name: currentUser.full_name || MOCK_ASTRONAUT.name,
        callsign: currentUser.callsign || MOCK_ASTRONAUT.callsign,
      };
    }
    return MOCK_ASTRONAUT;
  }
}

class ApiMissionService implements IMissionService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async getTelemetry(): Promise<MissionTelemetry> {
    try {
      const res = await fetch(`${this.baseUrl}/health/latest?astronaut_id=${encodeURIComponent(DEFAULT_ASTRONAUT_ID)}`);
      if (res.ok) {
        const r = await res.json();
        return {
          ...MOCK_TELEMETRY,
          lastDownlinkTime: r.timestamp || new Date().toISOString(),
        };
      }
    } catch {
      // fallback
    }
    return MOCK_TELEMETRY;
  }

  async getDailyTasks(): Promise<MissionTask[]> {
    return MOCK_TASKS;
  }
}

class ApiResearchService implements IResearchService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async getResearchPapers(filter?: { focusArea?: string; query?: string }): Promise<ResearchPaper[]> {
    let papers = [...MOCK_RESEARCH_PAPERS];
    if (filter?.focusArea && filter.focusArea !== 'All') {
      papers = papers.filter((p) => p.focusArea.toLowerCase() === filter.focusArea!.toLowerCase());
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      papers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q) ||
          p.authors.some((author) => author.toLowerCase().includes(q))
      );
    }
    return papers;
  }

  async getPaperById(id: string): Promise<ResearchPaper | null> {
    return MOCK_RESEARCH_PAPERS.find((p) => p.id === id) || null;
  }

  async getDatasetMetadata(): Promise<ResearchDatasetMeta[]> {
    return MOCK_RESEARCH_DATASETS;
  }

  async getObservationPoints(variableName: string): Promise<ResearchObservationPoint[]> {
    if (variableName.toLowerCase().includes('vo2')) {
      return MOCK_OBSERVATIONS_VO2;
    }
    return MOCK_OBSERVATIONS_BONE;
  }

  async getDistributionData(_variableName: string): Promise<DistributionBin[]> {
    return MOCK_DISTRIBUTION_BONE;
  }
}

class ApiInsightsService implements IInsightsService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  async getInsights(filter?: { category?: string }): Promise<HealthInsight[]> {
    try {
      // Fetch latest analysis and active alerts to enrich insights
      const alertsRes = await fetch(`${this.baseUrl}/alerts?astronaut_id=${encodeURIComponent(DEFAULT_ASTRONAUT_ID)}`);
      if (alertsRes.ok) {
        const alerts = await alertsRes.json();
        if (Array.isArray(alerts) && alerts.length > 0) {
          // If active alerts exist, return enriched insights
          const activeInsights = MOCK_INSIGHTS.map((insight, idx) => {
            const correspondingAlert = alerts[idx];
            if (correspondingAlert) {
              return {
                ...insight,
                title: `${correspondingAlert.title}`,
                summary: `${correspondingAlert.description} Recommended action: ${correspondingAlert.recommended_action}`,
                timestamp: correspondingAlert.timestamp || insight.timestamp,
              };
            }
            return insight;
          });

          if (filter?.category && filter.category !== 'All') {
            return activeInsights.filter((i) => i.category.toLowerCase() === filter.category!.toLowerCase());
          }
          return activeInsights;
        }
      }
    } catch {
      // fallback to mock insights
    }

    let result = [...MOCK_INSIGHTS];
    if (filter?.category && filter.category !== 'All') {
      result = result.filter((i) => i.category.toLowerCase() === filter.category!.toLowerCase());
    }
    return result;
  }

  async getInsightById(id: string): Promise<HealthInsight | null> {
    const all = await this.getInsights();
    return all.find((i) => i.id === id) || null;
  }

  async getCountermeasures(filter?: { category?: string }): Promise<CountermeasureResearch[]> {
    let cms = [...MOCK_COUNTERMEASURES];
    if (filter?.category && filter.category !== 'All') {
      cms = cms.filter((c) => c.category.toLowerCase() === filter.category!.toLowerCase());
    }
    return cms;
  }

  async getCountermeasureById(id: string): Promise<CountermeasureResearch | null> {
    return MOCK_COUNTERMEASURES.find((c) => c.id === id) || null;
  }

  async dismissInsight(id: string): Promise<boolean> {
    try {
      const alertId = id.replace(/^alert-/, '');
      if (/^\d+$/.test(alertId)) {
        const res = await fetch(`${this.baseUrl}/alerts/${alertId}/acknowledge`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ acknowledged_by: 'Astronaut / Mission Support' }),
        });
        return res.ok;
      }
      return true;
    } catch {
      return false;
    }
  }
}

export function createApiDataProvider(baseUrl: string): IDataServiceRegistry {
  return {
    health: new ApiHealthService(baseUrl),
    mission: new ApiMissionService(baseUrl),
    research: new ApiResearchService(baseUrl),
    insights: new ApiInsightsService(baseUrl),
  };
}

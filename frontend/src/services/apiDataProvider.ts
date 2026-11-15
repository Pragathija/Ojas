import {
  IHealthService,
  IMissionService,
  IResearchService,
  IInsightsService,
  IDataServiceRegistry,
} from './serviceInterfaces';
import { HealthSummary, VitalSign, HealthMetricSeries, AstronautProfile, TrendDescriptiveStats, AnomalyPoint } from '../types/health';
import { MissionTelemetry, MissionTask } from '../types/mission';
import { ResearchPaper, ResearchDatasetMeta, ResearchObservationPoint, DistributionBin } from '../types/research';
import { HealthInsight, CountermeasureResearch } from '../types/insights';

/**
 * Planned API Data Provider Boundary
 * NOTE: These endpoints represent planned backend API contracts for future integration.
 * They are not assumed to be operational during frontend independent development.
 */
class ApiHealthService implements IHealthService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getHealthSummary(): Promise<HealthSummary> {
    try {
      const res = await fetch(`${this.baseUrl}/health/summary`);
      if (!res.ok) throw new Error(`API health summary returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Health summary endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getVitalSigns(): Promise<VitalSign[]> {
    try {
      const res = await fetch(`${this.baseUrl}/health/vitals`);
      if (!res.ok) throw new Error(`API vitals returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Vitals endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getVitalById(id: string): Promise<VitalSign | null> {
    try {
      const res = await fetch(`${this.baseUrl}/health/vitals/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`API vital returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Vital lookup endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getMetricHistory(metricId: string, timeframe: string): Promise<HealthMetricSeries[]> {
    try {
      const res = await fetch(`${this.baseUrl}/health/metrics/${metricId}?timeframe=${timeframe}`);
      if (!res.ok) throw new Error(`API metric series returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Metric history endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getTrendStats(metricId: string, timeframe: string): Promise<TrendDescriptiveStats> {
    try {
      const res = await fetch(`${this.baseUrl}/health/metrics/${metricId}/stats?timeframe=${timeframe}`);
      if (!res.ok) throw new Error(`API stats returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Trend stats endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getAnomalies(metricId: string, timeframe: string, zThreshold: number = 2.0): Promise<AnomalyPoint[]> {
    try {
      const res = await fetch(`${this.baseUrl}/health/metrics/${metricId}/anomalies?timeframe=${timeframe}&z=${zThreshold}`);
      if (!res.ok) throw new Error(`API anomalies returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Anomalies endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async getAstronautProfile(): Promise<AstronautProfile> {
    try {
      const res = await fetch(`${this.baseUrl}/users/me/astronaut`);
      if (!res.ok) throw new Error(`API astronaut profile returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Astronaut profile endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

class ApiMissionService implements IMissionService {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  async getTelemetry(): Promise<MissionTelemetry> {
    try {
      const res = await fetch(`${this.baseUrl}/missions/active/telemetry`);
      if (!res.ok) throw new Error(`API telemetry returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Telemetry endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getDailyTasks(): Promise<MissionTask[]> {
    try {
      const res = await fetch(`${this.baseUrl}/missions/daily-tasks`);
      if (!res.ok) throw new Error(`API tasks returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Daily tasks endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

class ApiResearchService implements IResearchService {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  async getResearchPapers(filter?: { focusArea?: string; query?: string }): Promise<ResearchPaper[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.focusArea) params.append('area', filter.focusArea);
      if (filter?.query) params.append('q', filter.query);
      const res = await fetch(`${this.baseUrl}/research/papers?${params.toString()}`);
      if (!res.ok) throw new Error(`API research papers returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Research papers endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getPaperById(id: string): Promise<ResearchPaper | null> {
    try {
      const res = await fetch(`${this.baseUrl}/research/papers/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`API research paper returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Research paper lookup endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getDatasetMetadata(): Promise<ResearchDatasetMeta[]> {
    try {
      const res = await fetch(`${this.baseUrl}/research/datasets`);
      if (!res.ok) throw new Error(`API datasets returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Dataset metadata endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getObservationPoints(variableName: string): Promise<ResearchObservationPoint[]> {
    try {
      const res = await fetch(`${this.baseUrl}/research/observations?variable=${encodeURIComponent(variableName)}`);
      if (!res.ok) throw new Error(`API observations returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Observations endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getDistributionData(variableName: string): Promise<DistributionBin[]> {
    try {
      const res = await fetch(`${this.baseUrl}/research/distribution?variable=${encodeURIComponent(variableName)}`);
      if (!res.ok) throw new Error(`API distribution returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Distribution endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

class ApiInsightsService implements IInsightsService {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  async getInsights(filter?: { category?: string }): Promise<HealthInsight[]> {
    try {
      const query = filter?.category ? `?category=${encodeURIComponent(filter.category)}` : '';
      const res = await fetch(`${this.baseUrl}/ai/insights${query}`);
      if (!res.ok) throw new Error(`API insights returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Insights endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getInsightById(id: string): Promise<HealthInsight | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/insights/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`API insight returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Insight detail endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getCountermeasures(filter?: { category?: string }): Promise<CountermeasureResearch[]> {
    try {
      const query = filter?.category ? `?category=${encodeURIComponent(filter.category)}` : '';
      const res = await fetch(`${this.baseUrl}/research/countermeasures${query}`);
      if (!res.ok) throw new Error(`API countermeasures returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Countermeasures endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async getCountermeasureById(id: string): Promise<CountermeasureResearch | null> {
    try {
      const res = await fetch(`${this.baseUrl}/research/countermeasures/${id}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`API countermeasure returned HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      throw new Error(`[Planned API] Countermeasure detail endpoint unavailable: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async dismissInsight(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/insights/${id}/dismiss`, { method: 'POST' });
      return res.ok;
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

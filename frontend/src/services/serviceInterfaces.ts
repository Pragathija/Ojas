import { HealthSummary, VitalSign, HealthMetricSeries, AstronautProfile, TrendDescriptiveStats, AnomalyPoint } from '../types/health';
import { MissionTelemetry, MissionTask } from '../types/mission';
import { ResearchPaper, ResearchDatasetMeta, ResearchObservationPoint, DistributionBin } from '../types/research';
import { HealthInsight, CountermeasureResearch } from '../types/insights';

export interface IHealthService {
  getHealthSummary(): Promise<HealthSummary>;
  getVitalSigns(): Promise<VitalSign[]>;
  getVitalById(id: string): Promise<VitalSign | null>;
  getMetricHistory(metricId: string, timeframe: '24h' | '7d' | '30d' | '90d' | 'full'): Promise<HealthMetricSeries[]>;
  getTrendStats(metricId: string, timeframe: '24h' | '7d' | '30d' | '90d' | 'full'): Promise<TrendDescriptiveStats>;
  getAnomalies(metricId: string, timeframe: '24h' | '7d' | '30d' | '90d' | 'full', zThreshold?: number): Promise<AnomalyPoint[]>;
  getAstronautProfile(): Promise<AstronautProfile>;
}

export interface IMissionService {
  getTelemetry(): Promise<MissionTelemetry>;
  getDailyTasks(): Promise<MissionTask[]>;
}

export interface IResearchService {
  getResearchPapers(filter?: { focusArea?: string; query?: string }): Promise<ResearchPaper[]>;
  getPaperById(id: string): Promise<ResearchPaper | null>;
  getDatasetMetadata(): Promise<ResearchDatasetMeta[]>;
  getObservationPoints(variableName: string): Promise<ResearchObservationPoint[]>;
  getDistributionData(variableName: string): Promise<DistributionBin[]>;
}

export interface IInsightsService {
  getInsights(filter?: { category?: string }): Promise<HealthInsight[]>;
  getInsightById(id: string): Promise<HealthInsight | null>;
  getCountermeasures(filter?: { category?: string }): Promise<CountermeasureResearch[]>;
  getCountermeasureById(id: string): Promise<CountermeasureResearch | null>;
  dismissInsight(id: string): Promise<boolean>;
}

export interface IDataServiceRegistry {
  health: IHealthService;
  mission: IMissionService;
  research: IResearchService;
  insights: IInsightsService;
}

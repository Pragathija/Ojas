/**
 * Core Health and Biometrics Domain Types
 * Designed for NASA Spaceflight Countermeasures & Telemetry
 */

export type HealthStatusLevel = 'normal' | 'caution' | 'priority' | 'info';

export interface VitalSign {
  id: string;
  name: string;
  symbol: string;
  currentValue: number;
  unit: string;
  nominalRange: [number, number];
  status: HealthStatusLevel;
  trend: 'stable' | 'increasing' | 'decreasing';
  lastUpdated: string;
  confidence: number; // 0-100% telemetry fidelity
  category: 'cardiovascular' | 'respiratory' | 'circadian' | 'environmental';
  // Enhanced Provenance & Scientific Metadata
  scientificDescription: string;
  physiologicalRelevance: string;
  dataClassification: 'Synthetic Bio-Harness Stream' | 'Modeled Reference Telemetry' | 'Sensor Stream';
  isSynthetic: boolean;
  observationAvailability: 'Available' | 'Degraded' | 'Missing';
  collectionContext: string;
  missingDataPercent: number;
  scientificLimitations: string;
  relatedLiteratureId?: string;
}

export interface HealthMetricSeries {
  metricId: string;
  timestamp: string;
  value: number;
  baseline: number;
  isSimulated: boolean;
}

export interface AstronautProfile {
  id: string;
  callsign: string;
  name: string;
  missionRole: string;
  assignedMission: string;
  evaCertified: boolean;
  activeStatus: 'nominal' | 'caution' | 'critical' | 'rest';
  readinessScore: number; // 0-100
  totalSpaceflightDays: number;
}

export interface HealthSummary {
  astronaut: AstronautProfile;
  vitals: VitalSign[];
  overallStatus: HealthStatusLevel;
  complianceRate: number; // Percentage countermeasure adherence
  activeAlertCount: number;
  lastSyncTimestamp: string;
}

export interface TrendDescriptiveStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  sampleStdDev: number; // Unbiased sample standard deviation (N - 1 denominator)
  count: number; // N valid observations evaluated
  missingDataPercent: number; // Missing or artifact observations %
  baselineChangePercent: number; // Percentage change relative to nominal corridor midpoint
  baselineReferenceValue: number; // Nominal corridor midpoint reference value
}

export interface AnomalyPoint {
  timestamp: string;
  value: number;
  zScore: number;
  type: 'Statistical Spike (>2σ)' | 'Statistical Dip (<-2σ)' | 'Insufficient Prior Baseline';
  description: string;
  rollingWindowSize: number; // Rolling window k used for pre-observation baseline
}

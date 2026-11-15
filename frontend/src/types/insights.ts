/**
 * Mission Insights & Countermeasure Intelligence Domain Types
 * Designed for OJAS explainable spaceflight health research platform.
 */

export type InsightCategory =
  | 'Cardiovascular Adaptation'
  | 'Autonomic Regulation'
  | 'Sleep & Circadian Disruption'
  | 'Musculoskeletal Deconditioning'
  | 'Radiation Exposure'
  | 'Exercise Countermeasure Adherence';

export type CountermeasureCategory =
  | 'Exercise & Musculoskeletal Health'
  | 'Sleep & Circadian Health'
  | 'Cardiovascular & Autonomic Health'
  | 'Radiation Research'
  | 'Monitoring & Telemetry Technology'
  | 'Environmental Protection & Engineering';

export type CountermeasureClassification =
  | 'Established Operational Countermeasure'
  | 'Research-Supported Intervention'
  | 'Experimental Research Concept'
  | 'Monitoring & Measurement Technology'
  | 'Environmental Protection & Engineering Strategy';

export type EvidenceClassification =
  | 'Directly Measured Evidence'
  | 'Peer-Reviewed Contextual Literature'
  | 'NASA Technical Reports'
  | 'Research Concepts'
  | 'Evidence Unavailable';

export interface InsightExplainability {
  isDynamicallyCalculated: boolean;
  triggerRationale: string;
  underlyingObservations: string[];
  sampleCount: number;
  calculatedMetrics: {
    mean?: number;
    olsSlope?: number;
    olsSlopeUnit?: string;
    deviationFromMidpointPercent?: number;
    corridorStatus?: string;
    rollingZScoreMax?: number;
  };
  statisticalMethodApplied: string;
  observationTimeframe: string;
  dataClassification: 'Synthetic Bio-Harness Stream' | 'Modeled Reference Telemetry' | 'Simulation Matrix';
  isSynthetic: boolean;
  alternativeExplanations: string[];
  systemBoundariesAndUncertainties: string[];
}

export interface HealthInsight {
  id: string;
  category: InsightCategory;
  title: string;
  summary: string;
  // 4 structured analytical components
  observedPattern: string;
  statisticalInterpretation: string;
  scientificContext: string;
  investigationHypothesis: string;

  relatedIndicatorIds: string[];
  relatedIndicatorNames: string[];
  countermeasureIds: string[]; // Links to CountermeasureResearch items

  priority: 'low' | 'moderate' | 'high';
  timestamp: string;
  simulatedAnalysisTimestamp: string;

  evidenceClassification: EvidenceClassification;
  evidenceSourceId?: string; // ID linking to MOCK_RESEARCH_PAPERS
  evidenceSummary: string;
  evidenceScope: string;
  limitations: string;
  suggestedNextInvestigation: string;

  explainability: InsightExplainability;
}

export interface CountermeasureResearch {
  id: string;
  name: string;
  category: CountermeasureCategory;
  classification: CountermeasureClassification;
  scientificRationale: string;
  relevantIndicatorIds: string[];
  relevantIndicatorNames: string[];
  evidenceSourceId?: string;
  evidenceScope: string;
  evidenceLimitations: string;
  operationalConsiderations: string;
  relatedInsightIds: string[];
}

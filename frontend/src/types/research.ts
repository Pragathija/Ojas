/**
 * Research and Scientific Literature Types
 * For NASA spaceflight biomedical research, literature citations, and countermeasure data
 */

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  publicationYear: number;
  source: string;
  doi?: string;
  abstract: string;
  focusArea: 'Cardiovascular' | 'Bone Density' | 'Neuro-vestibular' | 'Circadian' | 'Radiation';
  relevanceScore: number; // 0-100
  citationCount: number;
  openAccessUrl?: string;
  isPeerReviewed: boolean;
}

export interface ResearchQueryFilter {
  focusArea?: string;
  searchQuery?: string;
  yearMin?: number;
}

export interface ResearchDatasetMeta {
  id: string;
  name: string;
  source: string;
  description: string;
  provenanceType:
    | 'NASA Open Science / NTRS'
    | 'Peer-Reviewed Journal'
    | 'Synthetic / Derived Illustrative Model'
    | 'Synthetic Demonstration Study';
  scientificContext: string;
  rawNASAObservationsIncluded: boolean;
  directNASADatasetIntegrationAvailable: boolean;
  availableVariables: string[];
  sampleInfo: string;
  validationStatus:
    | 'Validated via Published Literature'
    | 'Illustrative Model Parameterized by Published Ranges'
    | 'Synthetic Simulation';
  totalObservations?: number;
  generatedSeriesCompletenessPercent: number;
  sourceDataAvailabilityNotice: string;
}

export interface ResearchObservationPoint {
  sampleId: string;
  flightDay: number;
  variableName: string;
  observedValue: number;
  unit: string;
  nominalCorridor: [number, number];
  condition: string;
  isSimulatedDemo: boolean;
}

export interface DistributionBin {
  binRange: string;
  count: number;
  percentage: number;
}

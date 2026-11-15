/**
 * NASA BRSMAct Research API Service Client.
 *
 * Provides typed read-only access to NASA UTMB Bedrest Campaign 1
 * Actigraphy research telemetry, phase comparisons, longitudinal
 * trajectories, medication audits, and scientific metadata.
 */

export interface ResearchMetadata {
  dataset_id: string;
  dataset_title: string;
  experiment_id: string;
  mission: string;
  catalog_key: string;
  catalog_id: string;
  host_portal: string;
  source_url: string;
  repository: string;
  license: string;
  citation: string;
  study_facility: string;
  study_protocol: string;
  study_population: string;
  sample_size_subjects: number;
  study_phases: string[];
  data_processing_level: string;
  device_hardware: string;
  limitations_disclaimer: string;
}

export interface PhaseSleepMetrics {
  phase_name: string;
  total_scheduled_days: number;
  valid_observations: number;
  missing_observations: number;
  missing_rate_pct: number;
  contributing_subjects_count: number;
  contributing_subjects: string[];
  sample_size_warning?: string | null;

  duration_mean_minutes?: number | null;
  duration_std_minutes?: number | null;
  duration_median_minutes?: number | null;
  duration_min_minutes?: number | null;
  duration_max_minutes?: number | null;

  latency_mean_minutes?: number | null;
  latency_std_minutes?: number | null;
  latency_median_minutes?: number | null;
  latency_min_minutes?: number | null;
  latency_max_minutes?: number | null;

  efficiency_mean_pct?: number | null;
  efficiency_std_pct?: number | null;
  efficiency_median_pct?: number | null;
  efficiency_min_pct?: number | null;
  efficiency_max_pct?: number | null;

  macro_duration_mean_minutes?: number | null;
  macro_latency_mean_minutes?: number | null;
  macro_efficiency_mean_pct?: number | null;
}

export interface SubjectSleepSummary {
  subject_id: string;
  total_days: number;
  valid_days: number;
  missing_days: number;
  medication_days: number;
  phases: Record<string, PhaseSleepMetrics>;
  overall_mean_duration_minutes?: number | null;
  overall_mean_efficiency_pct?: number | null;
  overall_mean_latency_minutes?: number | null;
}

export interface DayTrajectoryPoint {
  test_phase: string;
  br_day: number;
  calendar_dates: string[];
  subject_count: number;
  valid_count: number;
  mean_duration_minutes?: number | null;
  mean_efficiency_pct?: number | null;
  mean_latency_minutes?: number | null;
  reported_medications: string[];
}

export interface MedicationConditionMetrics {
  observation_count: number;
  duration_mean_minutes?: number | null;
  duration_std_minutes?: number | null;
  latency_mean_minutes?: number | null;
  latency_std_minutes?: number | null;
  efficiency_mean_pct?: number | null;
  efficiency_std_pct?: number | null;
}

export interface MedicationAudit {
  total_medication_records: number;
  medication_distribution_by_drug: Record<string, number>;
  medication_distribution_by_subject: Record<string, Record<string, number>>;
  medication_distribution_by_phase: Record<string, number>;
  in_test_sleep_aid_nights: MedicationConditionMetrics;
  in_test_non_sleep_aid_nights: MedicationConditionMetrics;
  clinical_interpretation: string;
}

export interface MissingDataReport {
  total_records: number;
  total_missing_records: number;
  overall_missing_pct: number;
  missing_by_subject: Record<string, number>;
  missing_by_phase: Record<string, number>;
  missing_dates_per_subject: Record<string, string[]>;
  clinical_note: string;
}

export interface ResearchAnalysisReport {
  dataset_id: string;
  experiment_id: string;
  study_title: string;
  data_processing_level: string;
  total_observations: number;
  cohort_subjects: string[];
  phase_comparison: Record<string, PhaseSleepMetrics>;
  subject_summaries: Record<string, SubjectSleepSummary>;
  missing_data_audit: MissingDataReport;
  in_test_trajectory: DayTrajectoryPoint[];
  medication_audit: MedicationAudit;
  scientific_limitations: string;
}

const API_BASE = "/api/v1/research/nasa";

export const nasaResearchService = {
  async getMetadata(): Promise<ResearchMetadata> {
    const res = await fetch(`${API_BASE}/metadata`);
    if (!res.ok) throw new Error(`Failed to load research metadata: ${res.statusText}`);
    return res.json();
  },

  async getOverview(): Promise<ResearchAnalysisReport> {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error(`Failed to load research overview: ${res.statusText}`);
    return res.json();
  },

  async getPhases(): Promise<Record<string, PhaseSleepMetrics>> {
    const res = await fetch(`${API_BASE}/phases`);
    if (!res.ok) throw new Error(`Failed to load phase comparison: ${res.statusText}`);
    return res.json();
  },

  async getSubjects(): Promise<Record<string, SubjectSleepSummary>> {
    const res = await fetch(`${API_BASE}/subjects`);
    if (!res.ok) throw new Error(`Failed to load subject summaries: ${res.statusText}`);
    return res.json();
  },

  async getTrajectory(phase: string = "IN_TEST"): Promise<DayTrajectoryPoint[]> {
    const res = await fetch(`${API_BASE}/trajectory?phase=${encodeURIComponent(phase)}`);
    if (!res.ok) throw new Error(`Failed to load trajectory: ${res.statusText}`);
    return res.json();
  },

  async getMedications(): Promise<MedicationAudit> {
    const res = await fetch(`${API_BASE}/medications`);
    if (!res.ok) throw new Error(`Failed to load medication audit: ${res.statusText}`);
    return res.json();
  },

  async getMissingData(): Promise<MissingDataReport> {
    const res = await fetch(`${API_BASE}/missing-data`);
    if (!res.ok) throw new Error(`Failed to load missing data audit: ${res.statusText}`);
    return res.json();
  },
};

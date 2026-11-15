import { AstronautProfile, VitalSign, HealthSummary } from '../types/health';
import { MissionTelemetry, MissionTask } from '../types/mission';
import { ResearchPaper, ResearchDatasetMeta, ResearchObservationPoint, DistributionBin } from '../types/research';
import { HealthInsight, CountermeasureResearch } from '../types/insights';

/**
 * NOTICE:
 * This data contains:
 * 1. Authenticated NASA published literature citations (NTRS & peer-reviewed journals).
 * 2. Explicitly synthetic demonstration telemetry and benchmark series generated for OJAS platform validation.
 * It is NOT actual astronaut medical telemetry and does NOT represent real patient diagnostics.
 */

export const MOCK_ASTRONAUT: AstronautProfile = {
  id: 'AST-704',
  callsign: 'Vanguard-1',
  name: 'Dr. Elena Rostova',
  missionRole: 'Chief Science & Medical Officer',
  assignedMission: 'Artemis Exploration V - Mars Analog',
  evaCertified: true,
  activeStatus: 'nominal',
  readinessScore: 94,
  totalSpaceflightDays: 142,
};

export const MOCK_VITALS: VitalSign[] = [
  {
    id: 'hr-01',
    name: 'Heart Rate',
    symbol: 'HR',
    currentValue: 68,
    unit: 'BPM',
    nominalRange: [55, 95],
    status: 'normal',
    trend: 'stable',
    lastUpdated: '10s ago',
    confidence: 99.4,
    category: 'cardiovascular',
    scientificDescription: 'Frequency of cardiac ventricular contractions per minute in microgravity rest state.',
    physiologicalRelevance: 'Monitors autonomic tone, cephalad fluid redistribution, and cardiovascular deconditioning during long-duration orbital flight.',
    dataClassification: 'Synthetic Bio-Harness Stream',
    isSynthetic: true,
    observationAvailability: 'Available',
    collectionContext: 'Continuous dry-electrode bio-harness telemetry (Simulated Gateway Habitability Array).',
    missingDataPercent: 0.6,
    scientificLimitations: 'Synthetic simulation stream. Not an ECG Holter diagnostic monitor. Subject to motion artifacts during heavy aerobic exercise.',
    relatedLiteratureId: 'nasa-sp-377',
  },
  {
    id: 'hrv-01',
    name: 'Heart Rate Variability',
    symbol: 'RMSSD',
    currentValue: 48,
    unit: 'ms',
    nominalRange: [40, 90],
    status: 'normal',
    trend: 'stable',
    lastUpdated: '1m ago',
    confidence: 98.1,
    category: 'cardiovascular',
    scientificDescription: 'Root mean square of successive differences between adjacent normal-to-normal R-R intervals (RMSSD = √[1/(N-1) Σ(RR_{i+1} - RR_i)²]).',
    physiologicalRelevance: 'Primary non-invasive metric of vagally-mediated parasympathetic modulation, allostatic stress load, and post-exercise autonomic recovery.',
    dataClassification: 'Synthetic Bio-Harness Stream',
    isSynthetic: true,
    observationAvailability: 'Available',
    collectionContext: 'Short-term 5-minute resting window computed from continuous inter-beat R-R interval electrocardiographic telemetry.',
    missingDataPercent: 1.9,
    scientificLimitations: 'Synthetic demonstration model. Requires strictly standardized respiratory depth and resting conditions. Direct spaceflight clinical validation dataset not integrated; reference literature is contextual only.',
    relatedLiteratureId: undefined,
  },
  {
    id: 'spo2-01',
    name: 'Peripheral Oxygen Saturation',
    symbol: 'SpO2',
    currentValue: 98.5,
    unit: '%',
    nominalRange: [96.0, 100.0],
    status: 'normal',
    trend: 'stable',
    lastUpdated: '5s ago',
    confidence: 99.8,
    category: 'respiratory',
    scientificDescription: 'Percentage of oxygen-saturated functional hemoglobin in peripheral arterial capillaries measured optically via two-wavelength photoplethysmography.',
    physiologicalRelevance: 'Surveillance of pulmonary gas exchange and arterial oxygenation in pressurized habitat atmospheres and during extravehicular pre-breathe operations.',
    dataClassification: 'Synthetic Bio-Harness Stream',
    isSynthetic: true,
    observationAvailability: 'Available',
    collectionContext: 'Reflective pulse oximetry sensor located on the distal phalangeal sleeve.',
    missingDataPercent: 0.2,
    scientificLimitations: 'Synthetic simulation stream. Reflective pulse oximetry in microgravity is vulnerable to peripheral vasoconstriction, sensor hypoperfusion, and motion noise. Direct NASA validation paper is unavailable.',
    relatedLiteratureId: undefined,
  },
  {
    id: 'temp-01',
    name: 'Core Body Temperature',
    symbol: 'Tcore',
    currentValue: 37.1,
    unit: '°C',
    nominalRange: [36.5, 37.5],
    status: 'normal',
    trend: 'increasing',
    lastUpdated: '2m ago',
    confidence: 97.5,
    category: 'circadian',
    scientificDescription: 'Thermoregulatory equilibrium temperature of deep visceral compartments modeled in long-duration microgravity.',
    physiologicalRelevance: 'Surveillance of spaceflight-associated persistent core hyperthermia ("space fever"), thermoregulatory impairment, and endogenous circadian cycle phase shifts.',
    dataClassification: 'Synthetic Bio-Harness Stream',
    isSynthetic: true,
    observationAvailability: 'Available',
    collectionContext: 'Dual-sensor thermal heat-flux forehead array modeled after in-flight ingestible telemetric pills.',
    missingDataPercent: 2.5,
    scientificLimitations: 'Synthetic simulation stream. Displayed values are algorithmically modeled; cited spaceflight circadian literature provides contextual rhythm background, not direct numerical validation for this stream.',
    relatedLiteratureId: 'circadian-iss-flynn',
  },
  {
    id: 'sleep-01',
    name: 'Sleep Efficiency',
    symbol: 'SE',
    currentValue: 84,
    unit: '%',
    nominalRange: [80, 100],
    status: 'caution',
    trend: 'decreasing',
    lastUpdated: '4h ago',
    confidence: 94.0,
    category: 'circadian',
    scientificDescription: 'Ratio of total consolidated sleep duration to total time in crew rest quarters (Sleep Efficiency % = [Total Sleep Time / Time in Bed] × 100).',
    physiologicalRelevance: 'Key operational indicator for cumulative sleep restriction, nocturnal sleep fragmentation, and operational fatigue during exploration missions.',
    dataClassification: 'Synthetic Bio-Harness Stream',
    isSynthetic: true,
    observationAvailability: 'Available',
    collectionContext: 'Actigraphy-derived sleep scoring and ambient optical lux sensor inside crew rest quarters.',
    missingDataPercent: 6.0,
    scientificLimitations: 'Synthetic demonstration matrix. Actigraphy estimates sleep duration from wrist acceleration and may overestimate sleep efficiency by misinterpreting motionless wakefulness.',
    relatedLiteratureId: 'sleep-lancet-barger',
  },
  {
    id: 'rad-01',
    name: 'Daily Radiation Dose Rate',
    symbol: 'DOSE',
    currentValue: 0.42,
    unit: 'mSv/d',
    nominalRange: [0.0, 0.8],
    status: 'normal',
    trend: 'stable',
    lastUpdated: '15m ago',
    confidence: 99.9,
    category: 'environmental',
    scientificDescription: 'Daily equivalent biological ionizing radiation dose rate from galactic cosmic rays (GCR) and trapped belt particles.',
    physiologicalRelevance: 'Continuous monitoring of daily dose rates (mSv/d) to track exposure accumulation against mission operational constraints and career radiation limits.',
    dataClassification: 'Synthetic Bio-Harness Stream',
    isSynthetic: true,
    observationAvailability: 'Available',
    collectionContext: 'Personal active radiation dosimeter (Timepix silicon pixel detector array) worn on astronaut flight suit.',
    missingDataPercent: 0.1,
    scientificLimitations: 'Synthetic demonstration values. Represents daily ambient rate; cumulative mission dose requires numerical integration and organ-specific weighting factors.',
    relatedLiteratureId: 'radiation-coulombe-2022',
  },
];

export const MOCK_HEALTH_SUMMARY: HealthSummary = {
  astronaut: MOCK_ASTRONAUT,
  vitals: MOCK_VITALS,
  overallStatus: 'normal',
  complianceRate: 96,
  activeAlertCount: 1,
  lastSyncTimestamp: new Date().toISOString(),
};

export const MOCK_TELEMETRY: MissionTelemetry = {
  missionId: 'ARTEMIS-V',
  missionName: 'Gateway Deep Space Habitation',
  missionElapsedDays: 142,
  missionPhase: 'Orbital',
  habitatPressureKPa: 101.3,
  ambientRadiationMSv: 0.42,
  co2PartialPressureMmHg: 2.8,
  cabinOxygenPercent: 20.9,
  lastDownlinkTime: new Date().toISOString(),
};

export const MOCK_TASKS: MissionTask[] = [
  {
    id: 'task-1',
    title: 'ARED Resistive Exercise Countermeasure',
    category: 'exercise',
    scheduledTime: '08:00 UTC',
    durationMinutes: 90,
    completed: true,
    priority: 'high',
  },
  {
    id: 'task-2',
    title: 'T2 Cycle Ergometer Aerobic Conditioning',
    category: 'exercise',
    scheduledTime: '13:30 UTC',
    durationMinutes: 45,
    completed: true,
    priority: 'high',
  },
  {
    id: 'task-3',
    title: 'Salivary Cortisol & Biomarker Sampling',
    category: 'biomedical_sample',
    scheduledTime: '17:00 UTC',
    durationMinutes: 20,
    completed: false,
    priority: 'medium',
  },
  {
    id: 'task-4',
    title: 'Cognitive Psychomotor Vigilance Protocol (PVT)',
    category: 'nutrition',
    scheduledTime: '19:00 UTC',
    durationMinutes: 15,
    completed: false,
    priority: 'low',
  },
];

export const MOCK_RESEARCH_PAPERS: ResearchPaper[] = [
  {
    id: 'nasa-sp-377',
    title: 'Biomedical Results from Skylab (NASA SP-377)',
    authors: ['Richard S. Johnston', 'Lawrence F. Dietlein'],
    publicationYear: 1977,
    source: 'NASA Johnson Space Center / NASA Technical Reports Server (NTRS Document ID: 19770026836)',
    abstract:
      'Comprehensive compilation of physiological, musculoskeletal, and cardiovascular adaptations observed during the 28-day, 59-day, and 84-day Skylab space missions, establishing historical baseline deconditioning and countermeasure evaluations.',
    focusArea: 'Cardiovascular',
    relevanceScore: 98,
    citationCount: 420,
    openAccessUrl: 'https://ntrs.nasa.gov/citations/19770026836',
    isPeerReviewed: true,
  },
  {
    id: 'circadian-iss-flynn',
    title: 'Circadian misalignment affects sleep and medication use before and during spaceflight',
    authors: [
      'Erin E. Flynn-Evans',
      'Laura K. Barger',
      'Alan A. Kubey',
      'Jason P. Sullivan',
      'Charles A. Czeisler',
    ],
    publicationYear: 2016,
    source: 'npj Microgravity (Nature Publishing Group) / PubMed Central PMC4873727',
    doi: '10.1038/npjmgrav.2015.19',
    abstract:
      'Actigraphy and sleep log evaluation demonstrating that circadian phase misalignment during spaceflight directly correlates with reduced sleep duration and increased usage of sleep-promoting medications among astronauts.',
    focusArea: 'Circadian',
    relevanceScore: 96,
    citationCount: 84,
    openAccessUrl: 'https://doi.org/10.1038/npjmgrav.2015.19',
    isPeerReviewed: true,
  },
  {
    id: 'sleep-lancet-barger',
    title: 'Prevalence of sleep deficiency and use of hypnotic drugs in astronauts before, during, and after spaceflight: an observational study',
    authors: [
      'Laura K. Barger',
      'Erin E. Flynn-Evans',
      'Alan Kubey',
      'Lorcan Walsh',
      'Joseph M. Ronda',
      'Wei Wang',
      'Kenneth P. Wright Jr.',
      'Charles A. Czeisler',
    ],
    publicationYear: 2014,
    source: 'The Lancet Neurology (Vol. 13, Issue 9, pp. 904-912)',
    doi: '10.1016/S1474-4422(14)70122-X',
    abstract:
      'Large-scale observational investigation assessing subjective and objective sleep duration across Shuttle and ISS expedition crews, identifying persistent operational sleep deficiency and dependence on hypnotic countermeasures.',
    focusArea: 'Circadian',
    relevanceScore: 95,
    citationCount: 168,
    openAccessUrl: 'https://doi.org/10.1016/S1474-4422(14)70122-X',
    isPeerReviewed: true,
  },
  {
    id: 'radiation-coulombe-2022',
    title: 'Evolving radiological protection guidelines for exploration-class missions',
    authors: ['Jocelyn V. Coulombe', 'G. Harrisson', 'B. J. Lewis', 'Samy El-Jaby'],
    publicationYear: 2022,
    source: 'Life Sciences in Space Research (Vol. 36, pp. 70-77)',
    doi: '10.1016/j.lssr.2022.08.004',
    abstract:
      'Analysis of international space agency career radiation exposure limits, cosmic ray exposure models, and the proposed application of Disability-Adjusted Life Years (DALY) as a metric for deep-space mission health risk communication.',
    focusArea: 'Radiation',
    relevanceScore: 92,
    citationCount: 18,
    openAccessUrl: 'https://doi.org/10.1016/j.lssr.2022.08.004',
    isPeerReviewed: true,
  },
  {
    id: 'nasa-aerobic-hrp',
    title: 'Risk of Reduced Physical Performance Capabilities Due to Reduced Aerobic Capacity (HRP Evidence Report)',
    authors: ['Eric Rivas', 'Nicole Strock', 'E. Lichar Dillon', 'Dillon Frisco'],
    publicationYear: 2022,
    source: 'NASA Technical Reports Server (NTRS ID: 20220019338, HRP-47072)',
    abstract:
      'NASA Human Research Program review evaluating in-flight VO2peak cardiorespiratory deconditioning, inter-individual variability, and the efficacy of structured aerobic countermeasure protocols for lunar and planetary exploration.',
    focusArea: 'Cardiovascular',
    relevanceScore: 97,
    citationCount: 65,
    openAccessUrl: 'https://ntrs.nasa.gov/citations/20220019338',
    isPeerReviewed: true,
  },
];

export const MOCK_RESEARCH_DATASETS: ResearchDatasetMeta[] = [
  {
    id: 'ds-hrp-reference-model',
    name: 'OJAS Illustrative Countermeasure Reference Model',
    source: 'OJAS Prototype (Derived illustrative simulation)',
    description:
      'Synthetic illustrative series parameterized using published scientific context from NASA Human Research Program evidence reports (NTRS ID: 20220019338) and Skylab biomedical findings (NASA SP-377). Raw NASA mission observation databases are not included.',
    provenanceType: 'Synthetic / Derived Illustrative Model',
    scientificContext: 'Published NASA HRP cardiorespiratory and Skylab musculoskeletal research literature',
    rawNASAObservationsIncluded: false,
    directNASADatasetIntegrationAvailable: false,
    availableVariables: ['Simulated Bone Mineral Retention Corridor', 'Simulated Aerobic VO2 Peak Recovery'],
    sampleInfo: 'Illustrative parameterization (Day 15–180); not raw NASA patient data',
    validationStatus: 'Illustrative Model Parameterized by Published Ranges',
    generatedSeriesCompletenessPercent: 100.0,
    sourceDataAvailabilityNotice: 'Authentic raw NASA clinical logs are restricted to protected flight surgeon databases; values shown are synthetic illustrative simulations.',
  },
  {
    id: 'ds-sim-02',
    name: 'Gateway Deep Space Habitation: Synthetic Simulation Matrix',
    source: 'OJAS Prototype Development Suite',
    description:
      'Explicitly synthetic multi-parameter data streams generated to evaluate offline anomaly detection, trend drifting algorithms, and crew dashboard alert mechanisms. Contains zero authentic flight readings.',
    provenanceType: 'Synthetic Demonstration Study',
    scientificContext: 'Synthetic Gateway Artemis Analog Mission Environment',
    rawNASAObservationsIncluded: false,
    directNASADatasetIntegrationAvailable: false,
    availableVariables: ['Simulated Heart Rate Variability Series', 'Simulated Sleep Efficiency Matrix'],
    sampleInfo: 'Synthetic algorithmic generation (Strictly for UI and platform demonstration)',
    validationStatus: 'Synthetic Simulation',
    generatedSeriesCompletenessPercent: 100.0,
    sourceDataAvailabilityNotice: 'Synthetic prototype data only; no authentic mission observations present.',
  },
];

export const MOCK_OBSERVATIONS_BONE: ResearchObservationPoint[] = [
  { sampleId: 'SIM-B01', flightDay: 15, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 99.2, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-B02', flightDay: 30, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 98.6, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-B03', flightDay: 60, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 97.4, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-B04', flightDay: 90, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 96.8, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-B05', flightDay: 120, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 96.1, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-B06', flightDay: 150, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 95.7, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-B07', flightDay: 180, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 95.2, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-CTRL', flightDay: 180, variableName: 'Simulated Bone Mineral Retention Corridor', observedValue: 91.4, unit: '% baseline', nominalCorridor: [95, 100], condition: 'Inactive Baseline (Simulated)', isSimulatedDemo: true },
];

export const MOCK_OBSERVATIONS_VO2: ResearchObservationPoint[] = [
  { sampleId: 'SIM-V01', flightDay: 15, variableName: 'Simulated Aerobic VO2 Peak Recovery', observedValue: 42.1, unit: 'mL/kg/min', nominalCorridor: [38, 48], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-V02', flightDay: 45, variableName: 'Simulated Aerobic VO2 Peak Recovery', observedValue: 41.5, unit: 'mL/kg/min', nominalCorridor: [38, 48], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-V03', flightDay: 90, variableName: 'Simulated Aerobic VO2 Peak Recovery', observedValue: 40.8, unit: 'mL/kg/min', nominalCorridor: [38, 48], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-V04', flightDay: 135, variableName: 'Simulated Aerobic VO2 Peak Recovery', observedValue: 40.2, unit: 'mL/kg/min', nominalCorridor: [38, 48], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
  { sampleId: 'SIM-V05', flightDay: 180, variableName: 'Simulated Aerobic VO2 Peak Recovery', observedValue: 39.8, unit: 'mL/kg/min', nominalCorridor: [38, 48], condition: 'Active Countermeasure (Simulated)', isSimulatedDemo: true },
];

export const MOCK_DISTRIBUTION_BONE: DistributionBin[] = [
  { binRange: '< 92% (Severe Loss)', count: 2, percentage: 8.3 },
  { binRange: '92% - 94% (Cautionary)', count: 5, percentage: 20.8 },
  { binRange: '95% - 97% (Nominal Protocol)', count: 12, percentage: 50.0 },
  { binRange: '98% - 100% (High Adherence)', count: 5, percentage: 20.8 },
];

export const MOCK_COUNTERMEASURES: CountermeasureResearch[] = [
  {
    id: 'cm-ared-resistive',
    name: 'Advanced Resistive Exercise Device (ARED) Axial Loading',
    category: 'Exercise & Musculoskeletal Health',
    classification: 'Established Operational Countermeasure',
    scientificRationale:
      'High-load vacuum-cylinder axial resistive exercise applies mechanical ground-reaction loading, stimulating osteoblast differentiation and attenuating microgravity bone mineral density loss in the spine and proximal femur.',
    relevantIndicatorIds: ['hr-01'],
    relevantIndicatorNames: ['Heart Rate'],
    evidenceSourceId: 'nasa-sp-377',
    evidenceScope:
      'Operational ISS hardware since 2008. NASA SP-377 provides foundational Skylab historical context; long-duration ISS mission reports document preserved bone mineral density compared to early passive countermeasures.',
    evidenceLimitations:
      'Individual bone remodeling rates exhibit genetic and nutritional variation. Mechanical execution and cable kinematics require precise biomechanical fidelity.',
    operationalConsiderations:
      'Requires daily 60–90 minute sessions anchored to active vibration isolation stabilization (VIS) mounts to protect orbital station solar arrays.',
    relatedInsightIds: ['ins-04', 'ins-06'],
  },
  {
    id: 'cm-t2-aerobic',
    name: 'T2 Combined Treadmill & Cycle Ergometer Cardiorespiratory Conditioning',
    category: 'Exercise & Musculoskeletal Health',
    classification: 'Established Operational Countermeasure',
    scientificRationale:
      'Structured aerobic interval and continuous conditioning maintains maximal oxygen uptake (VO2peak), cardiac stroke volume, and capillary density during continuous microgravity cephalad fluid redistribution.',
    relevantIndicatorIds: ['hr-01', 'spo2-01'],
    relevantIndicatorNames: ['Heart Rate', 'Peripheral Oxygen Saturation'],
    evidenceSourceId: 'nasa-aerobic-hrp',
    evidenceScope:
      'Standard operational cardiorespiratory countermeasure across Shuttle and ISS expeditions. Validated by NASA Human Research Program Evidence Report (HRP-47072).',
    evidenceLimitations:
      'Attenuates but does not fully eliminate post-flight orthostatic intolerance or plasma volume loss upon gravitational re-entry.',
    operationalConsiderations:
      'Generates crew thermal loads and perspiration requiring robust cabin Environmental Control and Life Support System (ECLSS) moisture scavenging.',
    relatedInsightIds: ['ins-01', 'ins-06'],
  },
  {
    id: 'cm-concurrent-exercise',
    name: 'High-Intensity Interval Training & Concurrent Exercise Architecture',
    category: 'Exercise & Musculoskeletal Health',
    classification: 'Research-Supported Intervention',
    scientificRationale:
      'Concurrent training architectures evaluate whether combined high-intensity interval aerobic bouts and compound resistive lifting can reduce daily exercise crew time from 2.5 hours to 1.2 hours without accelerating physiological deconditioning.',
    relevantIndicatorIds: ['hr-01', 'hrv-01'],
    relevantIndicatorNames: ['Heart Rate', 'Heart Rate Variability'],
    evidenceSourceId: 'nasa-aerobic-hrp',
    evidenceScope:
      'Active NASA Human Research Program and ESA ground-based bed-rest analog research program. Not yet standard operational protocol for all exploration missions.',
    evidenceLimitations:
      'Risk of elevated neuromuscular fatigue and musculoskeletal overuse strain in compact exploration vehicles requires strict periodization.',
    operationalConsiderations:
      'Deep-space exploration exercise hardware (e.g. Orion/Gateway MED-2 class) possesses lower maximum resistance boundaries than the ISS ARED.',
    relatedInsightIds: ['ins-01', 'ins-06'],
  },
  {
    id: 'cm-dynamic-light',
    name: 'Solid-State Light-Based Circadian Entrainment (SSLA)',
    category: 'Sleep & Circadian Health',
    classification: 'Research-Supported Intervention',
    scientificRationale:
      'Narrow-band blue-enriched (460–480 nm) solid-state illumination stimulates intrinsically photosensitive retinal ganglion cells (ipRGCs), suppressing melatonin secretion to induce circadian phase shifts and enhance daytime alertness.',
    relevantIndicatorIds: ['sleep-01', 'temp-01'],
    relevantIndicatorNames: ['Sleep Efficiency', 'Core Body Temperature'],
    evidenceSourceId: 'circadian-iss-flynn',
    evidenceScope:
      'Flight research aboard the ISS using the Solid-State Light Assembly (SSLA). While lighting devices are installed on ISS, individualized phase-shifting interventions remain a research-supported intervention subject to operational schedule constraints.',
    evidenceLimitations:
      'Illumination must be timed strictly according to individual phase-response curves (PRC); counter-productive timing can exacerbate circadian misalignment.',
    operationalConsiderations:
      'Requires synchronized automated switching between high-lux blue-enriched wake protocols and red-enriched, low-lux pre-sleep sleep preparation modes.',
    relatedInsightIds: ['ins-03'],
  },
  {
    id: 'cm-sleep-scheduling',
    name: 'Operational Circadian Sleep Scheduling & Non-Pharmacological Hygiene',
    category: 'Sleep & Circadian Health',
    classification: 'Established Operational Countermeasure',
    scientificRationale:
      'Standardizing protected 8.5-hour sleep opportunities and enforcing quiet habitat rest periods stabilizes nocturnal sleep architecture and reduces crew reliance on hypnotic medications.',
    relevantIndicatorIds: ['sleep-01'],
    relevantIndicatorNames: ['Sleep Efficiency'],
    evidenceSourceId: 'sleep-lancet-barger',
    evidenceScope:
      'Formal NASA Flight Rules and flight medicine crew hygiene guidelines. Extensive observational cohort evidence reported by Barger et al. (2014, Lancet Neurology).',
    evidenceLimitations:
      'High-tempo operational schedules, orbital rendezvous, EVAs, and habitat acoustic noise frequently force acute schedule shifts (slam-shifting).',
    operationalConsiderations:
      'Demands strict coordination with Mission Control ground flight directors to preserve protected rest periods without non-critical communications.',
    relatedInsightIds: ['ins-03'],
  },
  {
    id: 'cm-circadian-telemetry',
    name: 'Continuous Core Temperature & Circadian Rhythm Phase Tracking',
    category: 'Monitoring & Telemetry Technology',
    classification: 'Monitoring & Measurement Technology',
    scientificRationale:
      'Longitudinal tracking of visceral core temperature circadian rhythms and wrist actigraphy estimates circadian phase angle (DLMO proxy) without invasive laboratory assays.',
    relevantIndicatorIds: ['temp-01', 'sleep-01'],
    relevantIndicatorNames: ['Core Body Temperature', 'Sleep Efficiency'],
    evidenceSourceId: 'circadian-iss-flynn',
    evidenceScope:
      'Spaceflight biomedical monitoring technology investigated across ISS expeditions. Classification: Diagnostic / monitoring sensor technology, not a therapeutic countermeasure.',
    evidenceLimitations:
      'Thermal skin contact variations, perspiration, and post-exercise metabolic elevation introduce signal noise into mathematical phase estimation.',
    operationalConsiderations:
      'Wearable sensor array must be biocompatible, comfortable for continuous multi-week deployment, and automated for low-overhead RF downlink.',
    relatedInsightIds: ['ins-03'],
  },
  {
    id: 'cm-orthostatic-reconditioning',
    name: 'Pre-Landing Fluid & Salt Loading Protocol',
    category: 'Cardiovascular & Autonomic Health',
    classification: 'Established Operational Countermeasure',
    scientificRationale:
      'Oral electrolyte rehydration solutions (water with sodium chloride tablets, ~1.0 g NaCl per 125 mL water) consumed prior to de-orbit acutely expand plasma volume to maintain central venous pressure and mitigate post-landing orthostatic intolerance.',
    relevantIndicatorIds: ['hr-01', 'hrv-01'],
    relevantIndicatorNames: ['Heart Rate', 'Heart Rate Variability'],
    evidenceSourceId: 'nasa-sp-377',
    evidenceScope:
      'Standard operational flight rule for Shuttle, Soyuz, and Commercial Crew re-entries. Early hemodynamic foundations documented in Skylab (NASA SP-377).',
    evidenceLimitations:
      'Provides temporary hemodynamic expansion lasting 2–4 hours; does not reverse autonomic baroreceptor downward resetting or venous compliance remodeling.',
    operationalConsiderations:
      'Must be ingested in exact intervals between 2 and 4 hours before de-orbit ignition to prevent premature renal diuresis.',
    relatedInsightIds: ['ins-01', 'ins-02'],
  },
  {
    id: 'cm-autonomic-monitoring',
    name: 'Resting Electrocardiographic HRV Telemetry & Autonomic Screening',
    category: 'Monitoring & Telemetry Technology',
    classification: 'Monitoring & Measurement Technology',
    scientificRationale:
      'Automated extraction of root mean square of successive differences (RMSSD) from clean R-R peaks provides non-invasive telemetry surveillance of parasympathetic vagal activity.',
    relevantIndicatorIds: ['hrv-01', 'hr-01'],
    relevantIndicatorNames: ['Heart Rate Variability', 'Heart Rate'],
    evidenceSourceId: undefined,
    evidenceScope:
      'Physiological telemetry technology used for research screening. Direct spaceflight clinical validation dataset not integrated; reference literature is contextual only.',
    evidenceLimitations:
      'Cannot differentiate physical overtraining, psychological stress, or sleep loss without multi-modal context. Sensitive to breathing depth.',
    operationalConsiderations:
      'Requires standardized 5-minute supine rest immediately post-wake to avoid postural orthostatic contamination.',
    relatedInsightIds: ['ins-02'],
  },
  {
    id: 'cm-active-dosimetry',
    name: 'Personal Active Silicon Pixel Dosimetry (Timepix Network)',
    category: 'Monitoring & Telemetry Technology',
    classification: 'Monitoring & Measurement Technology',
    scientificRationale:
      'Hybrid semiconductor pixel detector technology records individual ionizing track trajectories and linear energy transfer (LET) spectra in real time to calculate personal dose equivalent.',
    relevantIndicatorIds: ['rad-01'],
    relevantIndicatorNames: ['Daily Radiation Dose Rate'],
    evidenceSourceId: 'radiation-coulombe-2022',
    evidenceScope:
      'Operational radiation monitoring instrumentation deployed on ISS (REM / Timepix). Classification: Monitoring technology, not a biological countermeasure.',
    evidenceLimitations:
      'Measures local skin dose; deep-tissue organ equivalent doses require numerical radiation transport modeling (e.g. HZETRN).',
    operationalConsiderations:
      'Worn continuously on astronaut duty garment; wireless synchronization with habitat avionics telemetry backbone.',
    relatedInsightIds: ['ins-05'],
  },
  {
    id: 'cm-storm-shelter',
    name: 'Deep-Space Exploration Storm Shelter & Hydrogen-Rich Water Walls',
    category: 'Environmental Protection & Engineering',
    classification: 'Environmental Protection & Engineering Strategy',
    scientificRationale:
      'Arranging habitat potable water supplies and polyethylene stowage around central sleeping quarters maximizes proton scattering cross-sections, providing passive shielding during Solar Particle Events (SPE).',
    relevantIndicatorIds: ['rad-01'],
    relevantIndicatorNames: ['Daily Radiation Dose Rate'],
    evidenceSourceId: 'radiation-coulombe-2022',
    evidenceScope:
      'Exploration spacecraft architecture design concept (NASA Artemis / Gateway and Mars transit studies). Evaluated in ground accelerator simulations and transport calculations.',
    evidenceLimitations:
      'Ineffective against ultra-high energy galactic cosmic ray (GCR) ions; secondary neutron and bremsstrahlung generation must be modeled.',
    operationalConsiderations:
      'Emergency crew relocation protocol activated upon detection of coronal mass ejection shock fronts by solar observation satellites.',
    relatedInsightIds: ['ins-05'],
  },
];

export const MOCK_INSIGHTS: HealthInsight[] = [
  {
    id: 'ins-01',
    category: 'Cardiovascular Adaptation',
    title: 'Cephalad Fluid Shift & Submaximal Aerobic Trajectory',
    summary:
      'Simulated resting cardiovascular series demonstrates stable heart rate corridors with expected gradual upward drift during prolonged microgravity exposure.',
    observedPattern:
      'Simulated resting heart rate exhibits a +4.2 BPM elevation from early-mission reference corridor midpoint, stabilizing near 68 BPM.',
    statisticalInterpretation:
      'Linear regression across 30-day simulated telemetry reflects positive drift (calculated OLS slope = +0.14 BPM/cycle), remaining within the illustrative reference band (55–95 BPM).',
    scientificContext:
      'Cephalad fluid redistribution in microgravity induces acute central hypervolemia followed by diuresis, plasma volume reduction, and altered baroreflex set-points, resulting in elevated resting heart rate.',
    investigationHypothesis:
      'Simulated drift trajectory should be correlated against structured aerobic cycle ergometry sessions to evaluate cardiorespiratory reserve.',
    relatedIndicatorIds: ['hr-01'],
    relatedIndicatorNames: ['Heart Rate'],
    countermeasureIds: ['cm-t2-aerobic', 'cm-concurrent-exercise', 'cm-orthostatic-reconditioning'],
    priority: 'low',
    timestamp: '1 hour ago',
    simulatedAnalysisTimestamp: '2026-11-15T14:30:00Z',
    evidenceClassification: 'NASA Technical Reports',
    evidenceSourceId: 'nasa-aerobic-hrp',
    evidenceSummary:
      'NASA Human Research Program Evidence Report (HRP-47072) reviews microgravity-induced reductions in stroke volume, plasma volume, and peak VO2 capacity.',
    evidenceScope:
      'Provides general spaceflight cardiorespiratory deconditioning context; does not represent individual clinical validation of the synthetic series.',
    limitations:
      'Evaluated on simulated telemetry. Does not represent actual patient monitoring or clinical diagnostics.',
    suggestedNextInvestigation:
      'Compare simulated resting rate against simulated post-exercise heart rate recovery curves in the Trends workspace.',
    explainability: {
      isDynamicallyCalculated: true,
      triggerRationale:
        'Triggered by longitudinal upward slope calculation in simulated resting heart rate series over the 30-day window.',
      sampleCount: 30,
      calculatedMetrics: {
        mean: 68.2,
        olsSlope: 0.142,
        olsSlopeUnit: 'BPM/cycle',
        deviationFromMidpointPercent: -9.1,
        corridorStatus: 'Within Illustrative Reference Band',
      },
      underlyingObservations: [
        'Simulated Heart Rate telemetry (30 samples, 24-hour intervals)',
        'Illustrative reference band midpoint: 75.0 BPM (Range: 55–95 BPM)',
        'Calculated sample mean: 68.2 BPM',
        'Ordinary Least Squares (OLS) regression slope: +0.142 BPM/day',
      ],
      statisticalMethodApplied: 'Ordinary Least Squares (OLS) slope analysis and corridor boundary verification',
      observationTimeframe: '30 Flight Days (Simulated Window)',
      dataClassification: 'Synthetic Bio-Harness Stream',
      isSynthetic: true,
      alternativeExplanations: [
        'Simulated sensor noise or synthetic random walk generation artifact',
        'Normal circadian variation in baseline observation timing',
        'Simulated post-exercise residual metabolic elevation',
      ],
      systemBoundariesAndUncertainties: [
        'Model does not simulate invasive central venous pressure or real echocardiography metrics',
        'Individual cardiovascular adaptation in authentic microgravity exhibits high inter-individual variance',
      ],
    },
  },
  {
    id: 'ins-02',
    category: 'Autonomic Regulation',
    title: 'Parasympathetic Modulation & Resting HRV Stability',
    summary:
      'Simulated RMSSD metrics remain within normative corridors without sustained downward suppression, indicating steady simulated vagal balance.',
    observedPattern:
      'Mean simulated RMSSD is 48.4 ms with minor cyclic oscillation around the baseline value (48 ms).',
    statisticalInterpretation:
      'Rolling Z-score screening across preceding k=5 observation windows detected zero consecutive points exceeding |Z| ≥ 2σ.',
    scientificContext:
      'High Heart Rate Variability (RMSSD) reflects vagally-mediated parasympathetic modulation. Autonomic withdrawal is commonly observed under acute psychological stress or overtraining states.',
    investigationHypothesis:
      'Investigate whether simulated sleep efficiency reductions coincide with localized dips in morning resting RMSSD values.',
    relatedIndicatorIds: ['hrv-01', 'hr-01'],
    relatedIndicatorNames: ['Heart Rate Variability', 'Heart Rate'],
    countermeasureIds: ['cm-autonomic-monitoring', 'cm-orthostatic-reconditioning'],
    priority: 'low',
    timestamp: '3 hours ago',
    simulatedAnalysisTimestamp: '2026-11-15T12:00:00Z',
    evidenceClassification: 'Evidence Unavailable',
    evidenceSourceId: undefined,
    evidenceSummary:
      'Direct spaceflight peer-reviewed clinical validation dataset for this specific stream is not integrated into OJAS; physiological concepts reflect established autonomic monitoring literature.',
    evidenceScope:
      'General autonomic physiology principles; direct flight mission validation dataset unavailable in current release.',
    limitations:
      'Synthetic demonstration series. Real-world HRV requires strict respiratory frequency control and clean R-R peak detection.',
    suggestedNextInvestigation:
      'Perform dual-axis trend comparison between RMSSD and Sleep Efficiency in the Trends module.',
    explainability: {
      isDynamicallyCalculated: true,
      triggerRationale:
        'Generated to provide baseline autonomic surveillance summary based on absence of statistical outlier clusters.',
      sampleCount: 30,
      calculatedMetrics: {
        mean: 48.4,
        olsSlope: 0.015,
        olsSlopeUnit: 'ms/cycle',
        deviationFromMidpointPercent: -25.5,
        corridorStatus: 'Within Illustrative Reference Band',
        rollingZScoreMax: 1.18,
      },
      underlyingObservations: [
        'Simulated RMSSD telemetry (30 samples, 24-hour resting intervals)',
        'Illustrative reference band: 40–90 ms (Midpoint: 65.0 ms)',
        'Calculated sample mean: 48.4 ms (s = 1.95 ms)',
        'Preceding k=5 rolling window Z-scores: Max |Z| = 1.18σ (Threshold: 2.0σ)',
      ],
      statisticalMethodApplied: 'Rolling 5-point Z-score anomaly screening and corridor boundary verification',
      observationTimeframe: '30 Flight Days (Simulated Window)',
      dataClassification: 'Synthetic Bio-Harness Stream',
      isSynthetic: true,
      alternativeExplanations: [
        'Synthetic series model was parameterized with low variance around 48 ms',
        'Absence of simulated acute stressor events in the demonstration scenario',
      ],
      systemBoundariesAndUncertainties: [
        'HRV cannot distinguish between physical fatigue, psychological strain, or orthostatic stress without multi-modal context',
      ],
    },
  },
  {
    id: 'ins-03',
    category: 'Sleep & Circadian Disruption',
    title: 'Simulated Sleep Efficiency Drop Following Shift Communication',
    summary:
      'Simulated sleep efficiency demonstrates a localized downward trend over 3 consecutive flight cycles, dropping to 84%.',
    observedPattern:
      'Simulated sleep efficiency fell from 90% to 84%, crossing into the caution corridor threshold.',
    statisticalInterpretation:
      'Observation (84%) represents a -6.7% deviation from nominal midpoint (90%) and a -2.1σ deviation relative to pre-shift baseline mean (89.5%).',
    scientificContext:
      'Flight crews frequently experience circadian phase misalignment and sleep deficiency caused by operational slam-shifting, communication delays, and irregular habitat lighting cycles.',
    investigationHypothesis:
      'Simulated downward shift may be explored using solid-state dynamic phototherapy to model circadian phase re-entrainment.',
    relatedIndicatorIds: ['sleep-01', 'temp-01'],
    relatedIndicatorNames: ['Sleep Efficiency', 'Core Body Temperature'],
    countermeasureIds: ['cm-dynamic-light', 'cm-sleep-scheduling', 'cm-circadian-telemetry'],
    priority: 'moderate',
    timestamp: '4 hours ago',
    simulatedAnalysisTimestamp: '2026-11-15T10:30:00Z',
    evidenceClassification: 'Peer-Reviewed Contextual Literature',
    evidenceSourceId: 'circadian-iss-flynn',
    evidenceSummary:
      'Flynn-Evans et al. (2016, npj Microgravity) demonstrated that circadian misalignment directly correlates with reduced sleep duration and increased medication use in spaceflight.',
    evidenceScope:
      'Validates the operational mechanism of spaceflight circadian misalignment and sleep degradation; does not validate the synthetic telemetry stream directly.',
    limitations:
      'Demonstration scenario. Actigraphy estimation in synthetic telemetry does not differentiate motionless wakefulness from true consolidated polysomnographic sleep.',
    suggestedNextInvestigation:
      'Review Barger et al. (2014) observational findings in the Research module and inspect 7-day Sleep Efficiency trajectory.',
    explainability: {
      isDynamicallyCalculated: true,
      triggerRationale:
        'Triggered by 3 consecutive simulated observations registering below 86% sleep efficiency threshold.',
      sampleCount: 5,
      calculatedMetrics: {
        mean: 86.2,
        olsSlope: -1.4,
        olsSlopeUnit: '%/cycle',
        deviationFromMidpointPercent: -4.2,
        corridorStatus: 'Within Illustrative Reference Band (Cautionary)',
      },
      underlyingObservations: [
        'Simulated Sleep Efficiency series (FD 138: 91%, FD 139: 88%, FD 140: 85%, FD 141: 84%, FD 142: 83%)',
        'Illustrative reference band: 80–100% (Midpoint: 90.0%)',
        'Pre-shift baseline mean: 89.5%',
        'Calculated downward slope: -1.4% per flight day',
      ],
      statisticalMethodApplied: 'Threshold event detection with rolling 3-cycle persistence filter',
      observationTimeframe: 'Flight Days 138–142 (Simulated)',
      dataClassification: 'Synthetic Bio-Harness Stream',
      isSynthetic: true,
      alternativeExplanations: [
        'Simulated sensor contact movement artifact during sleep',
        'Algorithmic synthetic variance injection',
        'Normal night-to-night sleep architecture variability',
      ],
      systemBoundariesAndUncertainties: [
        'The platform cannot diagnose clinical insomnia or circadian rhythm sleep-wake disorders',
        'Does not establish circadian phase misalignment in an actual astronaut',
      ],
    },
  },
  {
    id: 'ins-04',
    category: 'Musculoskeletal Deconditioning',
    title: 'Model-Projected Bone Mineral Density Maintenance Corridor',
    summary:
      'Simulated countermeasure reference model projects bone mineral density retention above 95% baseline under active ARED loading.',
    observedPattern:
      'Simulated lumbar vertebral retention curve indicates 95.2% baseline retention at Flight Day 180 under active countermeasure model.',
    statisticalInterpretation:
      'Model trajectory remains within the modeled nominal corridor (95–100% baseline), outperforming the simulated inactive baseline (91.4%).',
    scientificContext:
      'In the absence of mechanical ground reaction forces, osteoclast-mediated bone resorption exceeds osteoblast formation, resulting in bone mineral density losses of 1–1.5% per month in weight-bearing skeletal sites.',
    investigationHypothesis:
      'Evaluate whether simulated resistive loading frequency (squat/deadlift series) maintains bone retention across mission durations exceeding 180 days.',
    relatedIndicatorIds: ['hr-01'],
    relatedIndicatorNames: ['Heart Rate'],
    countermeasureIds: ['cm-ared-resistive', 'cm-concurrent-exercise'],
    priority: 'low',
    timestamp: '6 hours ago',
    simulatedAnalysisTimestamp: '2026-11-15T08:00:00Z',
    evidenceClassification: 'NASA Technical Reports',
    evidenceSourceId: 'nasa-sp-377',
    evidenceSummary:
      'Biomedical Results from Skylab (NASA SP-377) established early foundational balance data on microgravity bone mineral loss, nitrogen loss, and calcium excretion.',
    evidenceScope:
      'NASA Technical Reports (Skylab SP-377 and HRP evidence syntheses) establish the rate of musculoskeletal unloading in microgravity.',
    limitations:
      'Derived illustrative simulation model. Not actual DXA bone densitometry or QCT volumetric scans from flight crew.',
    suggestedNextInvestigation:
      'Inspect the Research Explorer dataset "OJAS Illustrative Countermeasure Reference Model" for observation distributions.',
    explainability: {
      isDynamicallyCalculated: false,
      triggerRationale:
        'Calculated from illustrative research countermeasure model curve at Flight Day 180 interval.',
      sampleCount: 8,
      calculatedMetrics: {
        mean: 97.05,
        olsSlope: -0.024,
        olsSlopeUnit: '%/day',
        deviationFromMidpointPercent: -0.46,
        corridorStatus: 'Within Illustrative Reference Band',
      },
      underlyingObservations: [
        'Research dataset: Simulated Bone Mineral Retention Corridor (8 data points, Day 15 to Day 180)',
        'Flight Day 180 Active Countermeasure: 95.2% baseline',
        'Flight Day 180 Inactive Baseline: 91.4% baseline',
        'Projected attenuation: ~3.8% retention advantage under active resistive loading model',
      ],
      statisticalMethodApplied: 'Longitudinal model trajectory interpolation against nominal corridor boundaries',
      observationTimeframe: 'Flight Days 15–180 (Modeled Range)',
      dataClassification: 'Modeled Reference Telemetry',
      isSynthetic: true,
      alternativeExplanations: [
        'Model assumption of 100% countermeasure biomechanical efficiency',
        'Individual metabolic response differences not modeled in current simulation matrix',
      ],
      systemBoundariesAndUncertainties: [
        'Volumetric bone mineral density and cortical versus trabecular bone loss cannot be verified from synthetic model series alone',
      ],
    },
  },
  {
    id: 'ins-05',
    category: 'Radiation Exposure',
    title: 'Daily Ionizing Radiation Equivalent Rate Surveillance',
    summary:
      'Simulated personal dosimetry stream records 0.42 mSv/d, consistent with deep-space habitat GCR background models.',
    observedPattern:
      'Continuous active dosimeter telemetry shows steady ambient rate ranging from 0.40 to 0.44 mSv/d.',
    statisticalInterpretation:
      'Sample mean (0.42 mSv/d) aligns with deep-space solar minimum GCR models and remains well below acute cautionary threshold (0.8 mSv/d).',
    scientificContext:
      'Deep-space missions beyond Low Earth Orbit encounter unattenuated galactic cosmic radiation (protons and high-Z, high-energy HZE ions) and intermittent solar particle events.',
    investigationHypothesis:
      'Simulate secondary neutron shielding enhancements in habitat quarters to explore dose-rate reduction scenarios for Mars transit.',
    relatedIndicatorIds: ['rad-01'],
    relatedIndicatorNames: ['Daily Radiation Dose Rate'],
    countermeasureIds: ['cm-active-dosimetry', 'cm-storm-shelter'],
    priority: 'low',
    timestamp: '8 hours ago',
    simulatedAnalysisTimestamp: '2026-11-15T06:00:00Z',
    evidenceClassification: 'Peer-Reviewed Contextual Literature',
    evidenceSourceId: 'radiation-coulombe-2022',
    evidenceSummary:
      'Coulombe et al. (2022, Life Sciences in Space Research) reviews evolving space agency radiation protection standards, GCR transport modeling, and exploration limits.',
    evidenceScope:
      'Peer-reviewed assessment of radiological protection standards and cosmic ray models; informs the ambient rate context.',
    limitations:
      'Synthetic demonstration data stream. Real-time active dosimetry requires silicon microdosimeters (Timepix) cross-calibrated against passive TLD/OSLD badges.',
    suggestedNextInvestigation:
      'Review international radiation exposure consensus papers in the Research module.',
    explainability: {
      isDynamicallyCalculated: true,
      triggerRationale:
        'Continuous environmental surveillance monitoring verifies daily equivalent rate against NASA standard exploration limits.',
      sampleCount: 30,
      calculatedMetrics: {
        mean: 0.42,
        olsSlope: 0.0003,
        olsSlopeUnit: 'mSv/d/cycle',
        deviationFromMidpointPercent: 5.0,
        corridorStatus: 'Within Illustrative Reference Band',
      },
      underlyingObservations: [
        'Simulated Radiation Dosimeter stream (30 daily samples)',
        'Illustrative reference band: 0.0–0.8 mSv/d (Midpoint: 0.40 mSv/d)',
        'Calculated sample mean: 0.42 mSv/d (Estimated 142-day cumulative exposure: ~59.6 mSv)',
        'Calculated drift slope: +0.0003 mSv/d per mission day',
      ],
      statisticalMethodApplied: 'Cumulative numerical integration and threshold boundary verification',
      observationTimeframe: 'Mission Days 1–142 (Simulated)',
      dataClassification: 'Synthetic Bio-Harness Stream',
      isSynthetic: true,
      alternativeExplanations: [
        'Synthetic random variation around 0.42 mSv/d mean',
        'Model assumes constant solar modulation without acute solar particle events (SPE)',
      ],
      systemBoundariesAndUncertainties: [
        'Does not measure organ-specific equivalent doses (e.g. blood-forming organs, lens of eye, central nervous system)',
      ],
    },
  },
  {
    id: 'ins-06',
    category: 'Exercise Countermeasure Adherence',
    title: 'ARED & T2 Ergometer Protocol Adherence Tracking',
    summary:
      'Simulated mission task logs confirm 96% adherence to scheduled resistive and aerobic countermeasure sessions.',
    observedPattern:
      'High countermeasure adherence (96%) logged across 142 simulated mission days with nominal recovery metrics.',
    statisticalInterpretation:
      'Task completion rate of scheduled biomechanical load prescriptions exceeds the 90% operational benchmark standard.',
    scientificContext:
      'Sustained multi-modal exercise (resistive impulse loading + aerobic interval training) is the primary flight-validated operational countermeasure against multi-system microgravity deconditioning.',
    investigationHypothesis:
      'Explore correlation between simulated daily exercise duration and subjective sleep efficiency scores.',
    relatedIndicatorIds: ['hr-01', 'spo2-01'],
    relatedIndicatorNames: ['Heart Rate', 'Peripheral Oxygen Saturation'],
    countermeasureIds: ['cm-ared-resistive', 'cm-t2-aerobic', 'cm-concurrent-exercise'],
    priority: 'low',
    timestamp: '12 hours ago',
    simulatedAnalysisTimestamp: '2026-11-15T02:00:00Z',
    evidenceClassification: 'NASA Technical Reports',
    evidenceSourceId: 'nasa-aerobic-hrp',
    evidenceSummary:
      'Rivas et al. (2022, NASA HRP-47072) highlights the critical role of structured aerobic conditioning in preserving work capacity and operational mission readiness.',
    evidenceScope:
      'NASA HRP Evidence Report detailing cardiovascular and aerobic work capacity preservation.',
    limitations:
      'Simulation based on synthetic daily task schedule. Force-plate load telemetry and physiological strain index (PSI) are modeled, not experimentally measured.',
    suggestedNextInvestigation:
      'Inspect the Mission Timeline on the Dashboard to view scheduled vs. completed exercise countermeasure sessions.',
    explainability: {
      isDynamicallyCalculated: false,
      triggerRationale:
        'Triggered by task adherence aggregator evaluating completed vs. scheduled exercise tasks in MOCK_TASKS.',
      sampleCount: 4,
      calculatedMetrics: {
        mean: 96.0,
        corridorStatus: 'Exceeds 90% Operational Benchmark',
      },
      underlyingObservations: [
        'MOCK_TASKS array (ARED 90-min completed, T2 Cycle 45-min completed)',
        'Reported compliance rate: 96% across Flight Day 142 window',
        '2 completed sessions out of 2 scheduled exercise tasks',
      ],
      statisticalMethodApplied: 'Adherence ratio computation: (Completed Sessions / Scheduled Sessions) × 100',
      observationTimeframe: 'Flight Day 142 (Simulated Schedule)',
      dataClassification: 'Simulation Matrix',
      isSynthetic: true,
      alternativeExplanations: [
        'Simulation parameter fixed at high compliance for prototype demonstration',
      ],
      systemBoundariesAndUncertainties: [
        'Task completion does not verify biomechanical execution quality or individual metabolic effort',
      ],
    },
  },
];

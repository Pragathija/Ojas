/**
 * Mission and Simulation Domain Types
 */

export interface MissionTelemetry {
  missionId: string;
  missionName: string;
  missionElapsedDays: number;
  missionPhase: 'Transit' | 'Orbital' | 'Lunar Surface' | 'Return';
  habitatPressureKPa: number;
  ambientRadiationMSv: number;
  co2PartialPressureMmHg: number;
  cabinOxygenPercent: number;
  lastDownlinkTime: string;
}

export interface MissionTask {
  id: string;
  title: string;
  category: 'exercise' | 'biomedical_sample' | 'eva' | 'nutrition' | 'rest';
  scheduledTime: string;
  durationMinutes: number;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

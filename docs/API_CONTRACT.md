# Ojas API Contract & Integration Specification

**Target Version:** `1.0.0`  
**Base URL:** `http://localhost:8000/api/v1`  
**Root Health Check:** `http://localhost:8000/health`  
**Interactive Swagger UI:** `http://localhost:8000/docs`

---

## 1. Data Types & 10 Tracked Metrics

Each health reading submitted or queried adheres to this TypeScript interface:

```typescript
export interface HealthReading {
  id?: number;
  astronaut_id: string;                      // e.g., "ASTRO-01"
  timestamp?: string;                        // ISO 8601 string
  heart_rate: number;                        // BPM (30 - 250)
  blood_oxygen: number;                      // SpO2 % (50.0 - 100.0)
  systolic_bp: number;                       // mmHg (50 - 260)
  diastolic_bp: number;                      // mmHg (30 - 160, must be < systolic)
  body_temperature: number;                  // °C (30.0 - 45.0)
  sleep_duration: number;                    // Hours (0.0 - 24.0)
  sleep_quality: number;                     // Rating (0 - 100)
  stress_level: number;                      // Rating (0 - 100)
  mood?: string;                             // e.g., "Focused", "Fatigued"
  physical_activity_minutes?: number;        // Minutes (>= 0)
  fatigue_level: number;                     // 1 - 10 scale
  is_synthetic?: boolean;                    // Demonstration telemetry flag
  notes?: string;
}

export type AlertSeverity = 'NORMAL' | 'CAUTION' | 'CRITICAL';

export interface HealthAlert {
  id: number;
  astronaut_id: string;
  timestamp: string;
  severity: AlertSeverity;
  category: string;                          // "RESPIRATORY", "CARDIOVASCULAR", "COMPOUND", etc.
  title: string;
  description: string;
  recommended_action: string;
  is_acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
}

export interface MetricDeviation {
  current: number;
  baseline_mean: number;
  delta: number;
  z_score: number;
  unit: string;
  direction: 'elevated' | 'reduced' | 'nominal';
}

export interface AIAnalysisInsight {
  id: number;
  astronaut_id: string;
  timestamp: string;
  overall_status: AlertSeverity;
  severity: AlertSeverity;
  detected_abnormalities: string[];
  baseline_deviations: Record<string, MetricDeviation>;
  contributing_factors: string[];
  recommended_actions: string[];
  anomaly_score?: number | null;
  reading_id?: number;
  disclaimer: string;
}

export interface HealthSummary {
  astronaut_id: string;
  total_readings: number;
  latest_reading?: HealthReading | null;
  averages: Record<string, number>;
  current_status: AlertSeverity;
  disclaimer: string;
}
```

---

## 2. API Endpoints

### 2.1 `POST /health/readings`
- **Purpose**: Ingest new biometric packet. Automatically updates baseline and triggers risk analysis.
- **Request Body**: `HealthReading` (without `id`)
- **Success Status**: `201 Created`
- **Response**: `HealthReading`

### 2.2 `GET /health/readings`
- **Purpose**: Query paginated telemetry history.
- **Query Params**:
  - `astronaut_id` (optional string)
  - `limit` (default 50, max 500)
  - `offset` (default 0)
- **Response**: `Array<HealthReading>`

### 2.3 `GET /health/latest`
- **Purpose**: Get current status & vitals for an astronaut.
- **Query Params**:
  - `astronaut_id` (required string)
- **Response**: `HealthReading` (or 404 if not found)

### 2.4 `GET /health/summary`
- **Purpose**: Dashboard summary cards (averages, count, overall status).
- **Query Params**:
  - `astronaut_id` (required string)
- **Response**: `HealthSummary`

### 2.5 `POST /analysis/run`
- **Purpose**: Execute on-demand AI analysis for an astronaut.
- **Request Body**: `{"astronaut_id": "ASTRO-01", "reading_id": null}`
- **Response**: `AIAnalysisInsight`

### 2.6 `GET /analysis/latest`
- **Purpose**: Retrieve latest structured AI insight and recommendations.
- **Query Params**:
  - `astronaut_id` (required string)
- **Response**: `AIAnalysisInsight`

### 2.7 `GET /analysis/history`
- **Purpose**: Retrieve historical AI insights for trend charts.
- **Query Params**:
  - `astronaut_id` (required string)
  - `limit` (default 20)
- **Response**: `Array<AIAnalysisInsight>`

### 2.8 `GET /alerts`
- **Purpose**: Retrieve health alerts.
- **Query Params**:
  - `astronaut_id` (optional string)
  - `severity` (optional: `NORMAL`, `CAUTION`, `CRITICAL`)
  - `is_acknowledged` (optional boolean)
  - `limit` (default 50)
- **Response**: `Array<HealthAlert>`

### 2.9 `PATCH /alerts/{id}/acknowledge`
- **Purpose**: Acknowledge an alert.
- **Request Body**: `{"acknowledged_by": "Flight Surgeon Dr. Stone"}`
- **Response**: Updated `HealthAlert` with `is_acknowledged: true`

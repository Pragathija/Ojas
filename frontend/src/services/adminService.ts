import { authService } from './authService';

export interface CommandOverview {
  command_center: string;
  timestamp: string;
  active_astronauts: number;
  active_missions: number;
  telemetry_stream: {
    status: string;
    total_packets_ingested: number;
    last_packet_received: string | null;
    stream_source: string;
  };
  alerts_summary: {
    total_unacknowledged: number;
    critical_priority: number;
  };
  datasets: {
    nasa_brsmact: string;
    nasa_osdr_osd_575: string;
    nasa_osdr_osd_569: string;
  };
}

export interface AdminAstronaut {
  id: string;
  name: string;
  age: number;
  role: string;
  mission_day: number;
  last_heart_rate: number | null;
  last_spo2: number | null;
  last_telemetry_time: string | null;
  alert_status: string;
}

export interface AuditLogItem {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  target_resource: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class AdminService {
  private getHeaders(): Record<string, string> {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  async getOverview(): Promise<CommandOverview> {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch {}

    // Fallback demonstration command overview
    return {
      command_center: "NASA Johnson Space Center • Mission Operations",
      timestamp: new Date().toISOString(),
      active_astronauts: 1,
      active_missions: 1,
      telemetry_stream: {
        status: "NOMINAL_100HZ",
        total_packets_ingested: 8420,
        last_packet_received: new Date().toISOString(),
        stream_source: "Artemis-V Habitation Deck",
      },
      alerts_summary: {
        total_unacknowledged: 0,
        critical_priority: 0,
      },
      datasets: {
        nasa_brsmact: "VERIFIED_ACTIVE",
        nasa_osdr_osd_575: "VERIFIED_ACTIVE",
        nasa_osdr_osd_569: "VERIFIED_ACTIVE",
      },
    };
  }

  async getAstronauts(): Promise<AdminAstronaut[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/astronauts`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch {}

    return [
      {
        id: "ASTRO-001",
        name: "Commander Sarah Connor",
        age: 38,
        role: "Mission Commander",
        mission_day: 42,
        last_heart_rate: 64,
        last_spo2: 98.2,
        last_telemetry_time: new Date().toISOString(),
        alert_status: "NOMINAL",
      },
    ];
  }

  async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch {}

    return [
      {
        id: "log-1",
        actor_id: "dr.stone",
        actor_role: "flight_surgeon",
        action: "VIEW_TELEMETRY",
        target_resource: "astronaut:ASTRO-001",
        details: "Surgeon checked resting baseline trends",
        ip_address: "192.168.1.10",
        timestamp: new Date().toISOString(),
      },
      {
        id: "log-2",
        actor_id: "sarah.connor",
        actor_role: "astronaut",
        action: "LOGIN_SUCCESS",
        target_resource: "portal:astronaut",
        details: "Astronaut authenticated into Artemis-V console",
        ip_address: "10.0.0.42",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  async acknowledgeAlert(alertId: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async createAstronaut(data: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/admin/astronauts`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const adminService = new AdminService();

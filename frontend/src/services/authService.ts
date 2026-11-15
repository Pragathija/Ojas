export interface AuthUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'astronaut' | 'nasa_super_admin' | 'nasa_mission_admin' | 'flight_surgeon' | 'research_analyst' | 'operations_monitor';
  astronaut_id?: string | null;
  callsign?: string | null;
  is_active: boolean;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  portal_type: 'astronaut' | 'admin';
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class AuthService {
  private tokenKey = 'ojas_token';
  private userKey = 'ojas_user';
  private portalKey = 'ojas_portal';

  async login(username: string, password: string, portal_type: 'astronaut' | 'admin'): Promise<AuthSession> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, portal_type }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Authentication failed. Please verify credentials.');
      }

      const data = await response.json();
      const session: AuthSession = {
        token: data.access_token,
        user: data.user,
        portal_type,
      };

      this.saveSession(session);
      return session;
    } catch (err: any) {
      // If server is unreachable or offline, verify default demo credentials locally
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        return this.demoOfflineFallback(username, password, portal_type);
      }
      throw err;
    }
  }

  private demoOfflineFallback(username: string, password: string, portal_type: 'astronaut' | 'admin'): AuthSession {
    const cleanUser = username.trim().toLowerCase();
    if (portal_type === 'astronaut') {
      if (cleanUser === 'sarah.connor' && password === 'Astronaut2026!') {
        const session: AuthSession = {
          token: 'demo-offline-token-astronaut',
          user: {
            id: 'demo-sarah',
            username: 'sarah.connor',
            email: 'sarah.connor@nasa.gov',
            full_name: 'Commander Sarah Connor',
            role: 'astronaut',
            astronaut_id: 'ASTRO-001',
            callsign: 'Valkyrie',
            is_active: true,
          },
          portal_type: 'astronaut',
        };
        this.saveSession(session);
        return session;
      }
      throw new Error('Invalid astronaut credentials. Try sarah.connor / Astronaut2026!');
    } else {
      if (cleanUser === 'dr.stone' && password === 'FlightSurgeon2026!') {
        const session: AuthSession = {
          token: 'demo-offline-token-surgeon',
          user: {
            id: 'demo-stone',
            username: 'dr.stone',
            email: 'ryan.stone@nasa.gov',
            full_name: 'Dr. Ryan Stone, MD (Flight Surgeon)',
            role: 'flight_surgeon',
            astronaut_id: null,
            callsign: null,
            is_active: true,
          },
          portal_type: 'admin',
        };
        this.saveSession(session);
        return session;
      } else if (cleanUser === 'admin.houston' && password === 'NasaDirector2026!') {
        const session: AuthSession = {
          token: 'demo-offline-token-admin',
          user: {
            id: 'demo-kranz',
            username: 'admin.houston',
            email: 'admin.houston@nasa.gov',
            full_name: 'Gene Kranz (Flight Director)',
            role: 'nasa_super_admin',
            astronaut_id: null,
            callsign: null,
            is_active: true,
          },
          portal_type: 'admin',
        };
        this.saveSession(session);
        return session;
      }
      throw new Error('Invalid admin credentials. Try dr.stone / FlightSurgeon2026! or admin.houston / NasaDirector2026!');
    }
  }

  saveSession(session: AuthSession): void {
    localStorage.setItem(this.tokenKey, session.token);
    localStorage.setItem(this.userKey, JSON.stringify(session.user));
    localStorage.setItem(this.portalKey, session.portal_type);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  getPortal(): 'astronaut' | 'admin' | null {
    return localStorage.getItem(this.portalKey) as any;
  }

  isAuthenticated(requiredPortal?: 'astronaut' | 'admin'): boolean {
    const token = this.getToken();
    const portal = this.getPortal();
    if (!token) return false;
    if (requiredPortal && portal !== requiredPortal) return false;
    return true;
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.portalKey);
  }
}

export const authService = new AuthService();

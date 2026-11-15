import { authService } from './authService';

export interface GamificationState {
  astronaut_id: string;
  total_xp: number;
  level: number;
  current_streak_days: number;
  unlocked_planets: string[];
  claimed_quests: Array<{
    id: string;
    quest_id: string;
    title: string;
    xp_awarded: number;
    claimed_at: string;
  }>;
  unlocked_achievements: Array<{
    id: string;
    achievement_id: string;
    title: string;
    category: string;
    xp_awarded: number;
    unlocked_at: string;
  }>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class GamificationService {
  async getStatus(astronautId = 'ASTRO-001'): Promise<GamificationState> {
    const token = authService.getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/gamification/status?astronaut_id=${astronautId}`, { headers });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    // Fallback local storage state
    return this.getLocalState(astronautId);
  }

  async claimQuest(questId: string, title: string, xpReward = 50, astronautId = 'ASTRO-001'): Promise<{ success: boolean; xp_awarded: number; new_total_xp: number; level: number }> {
    const token = authService.getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/gamification/claim-quest?astronaut_id=${astronautId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ quest_id: questId, title, xp_reward: xpReward }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          xp_awarded: data.xp_awarded ?? xpReward,
          new_total_xp: data.new_total_xp ?? (this.getLocalState(astronautId).total_xp + xpReward),
          level: data.level ?? Math.max(1, Math.floor((data.new_total_xp || 0) / 500) + 1),
        };
      } else if (res.status === 409) {
        throw new Error('Quest has already been claimed today.');
      }
    } catch (e: any) {
      if (e.message && e.message.includes('already been claimed')) throw e;
    }

    // Local fallback
    const state = this.getLocalState(astronautId);
    if (state.claimed_quests.some(q => q.quest_id === questId)) {
      throw new Error('Quest has already been claimed today.');
    }

    state.total_xp += xpReward;
    state.level = Math.max(1, Math.floor(state.total_xp / 500) + 1);
    state.claimed_quests.push({
      id: `local-${Date.now()}`,
      quest_id: questId,
      title,
      xp_awarded: xpReward,
      claimed_at: new Date().toISOString(),
    });
    localStorage.setItem(`ojas_gamif_${astronautId}`, JSON.stringify(state));

    return {
      success: true,
      xp_awarded: xpReward,
      new_total_xp: state.total_xp,
      level: state.level,
    };
  }

  private getLocalState(astronautId: string): GamificationState {
    const raw = localStorage.getItem(`ojas_gamif_${astronautId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return {
      astronaut_id: astronautId,
      total_xp: 1450,
      level: 4,
      current_streak_days: 7,
      unlocked_planets: ['serenity_station', 'sleep_garden', 'focus_nebula', 'recovery_moon'],
      claimed_quests: [],
      unlocked_achievements: [
        {
          id: 'ach-1',
          achievement_id: 'first_orbit',
          title: 'First Orbit Check-In',
          category: 'Engagement',
          xp_awarded: 100,
          unlocked_at: new Date().toISOString(),
        },
      ],
    };
  }
}

export const gamificationService = new GamificationService();

import React from 'react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Clock, ShieldAlert, Radio, Flame, Sparkles, Award, CheckCircle2, Wifi } from 'lucide-react';
import { isUsingMockData } from '../../services';
import { AstronautProfile } from '../../types/health';
import { Link } from 'react-router-dom';

export interface DashboardWelcomeProps {
  astronaut: AstronautProfile;
  lastUpdated: string;
  activeAlertCount?: number;
  onCheckIn?: () => void;
  isCheckedInToday?: boolean;
}

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  astronaut,
  lastUpdated,
  activeAlertCount = 0,
  onCheckIn,
  isCheckedInToday = false,
}) => {
  const getInitials = (fullName: string) => {
    const cleaned = fullName.replace(/^(Commander|Dr\.|Capt\.|Lt\.|Major|Col\.)\s+/i, '').trim();
    const parts = cleaned.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return (parts[0] ? parts[0].slice(0, 2) : 'SC').toUpperCase();
  };

  const initials = getInitials(astronaut.name);

  return (
    <div className="rounded-2xl border border-[#EAE6F2] bg-white p-6 shadow-soft space-y-5">
      <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-6">
        {/* Astronaut Profile & Mission Overview */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl purple-subtle-gradient border border-primary/30 flex items-center justify-center font-heading font-black text-xl text-primary shadow-xs shrink-0">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
                ARTEMIS-V TRANSIT • FLIGHT DECK
              </span>
              <span className="text-[#EAE6F2]">•</span>
              <span className="font-mono text-xs text-content-secondary font-medium">
                DAY 42 OF 180
              </span>
            </div>

            <h1 className="font-heading text-2xl tablet:text-3xl font-black tracking-tight text-content-main">
              Welcome back, {astronaut.name}
            </h1>

            <p className="text-xs tablet:text-sm text-content-secondary max-w-2xl leading-relaxed">
              Callsign: <strong className="text-content-main font-semibold">{astronaut.callsign}</strong> • Role: <strong className="text-content-main font-semibold">{astronaut.missionRole}</strong>. Personalized physiological corridors active across all sensor arrays.
            </p>
          </div>
        </div>

        {/* Gamification Streak & Fast Check-In Action */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/achievements"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl purple-subtle-gradient border border-primary/25 hover:border-primary/50 transition-colors shadow-xs"
          >
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0" />
            <div className="text-left font-mono">
              <span className="block text-xs font-extrabold text-primary leading-tight">7-Day Streak</span>
              <span className="block text-[10px] text-content-secondary leading-tight">1,450 XP (Lvl 4)</span>
            </div>
          </Link>

          {onCheckIn && (
            <Button
              size="sm"
              variant={isCheckedInToday ? 'secondary' : 'primary'}
              onClick={onCheckIn}
              disabled={isCheckedInToday}
              className="gap-1.5 font-heading font-bold text-xs shadow-soft"
            >
              {isCheckedInToday ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Checked In (+50 XP)</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span>Daily Health Check-In</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Operational Status Badges Bar */}
      <div className="pt-4 border-t border-[#EAE6F2] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="normal" size="sm" className="gap-1.5 py-1 px-3">
            <Radio className="h-3 w-3 text-emerald-600" />
            <span>LINK: DEEP SPACE NETWORK (100 HZ DOWNLINK • 1.4s)</span>
          </Badge>

          <Badge variant="purple" size="sm" className="gap-1.5 py-1 px-3">
            <span>PHASE: TRANS-LUNAR TRANSIT (0.38G SIM)</span>
          </Badge>

          <Badge variant="neutral" size="sm" className="gap-1.5 py-1 px-3">
            <Clock className="h-3 w-3 text-content-muted" />
            <span>TELEMETRY SYNC: {lastUpdated}</span>
          </Badge>

          {isUsingMockData ? (
            <Badge variant="caution" size="sm" className="gap-1.5 py-1 px-3">
              <ShieldAlert className="h-3 w-3 text-amber-600" />
              <span>SIMULATION TELEMETRY</span>
            </Badge>
          ) : (
            <Badge variant="normal" size="sm" className="gap-1.5 py-1 px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE API DOWNLINK</span>
            </Badge>
          )}
        </div>

        {/* Notification Status */}
        <div className="flex items-center gap-2">
          {activeAlertCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              <span>{activeAlertCount} Clinical Alert Flagged</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pastel-mint text-emerald-700 border border-[#C2EAD6]">
              <span>✓ All Sensor Streams Nominal</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
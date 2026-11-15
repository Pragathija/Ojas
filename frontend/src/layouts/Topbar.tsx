import React, { useState } from 'react';
import { Menu, ShieldAlert, Bell, ChevronDown } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { isUsingMockData } from '../services';
import { Link, useLocation } from 'react-router-dom';

export interface TopbarProps {
  onToggleMobileNav: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Mission Overview',
  '/indicators': 'Health Indicators',
  '/trends': 'Health Trends',
  '/research': 'Research Explorer',
  '/insights': 'Insights & Actions',
  '/settings': 'Profile & Settings',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileNav }) => {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Mission Console';
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 border-b border-cosmos-border bg-cosmos-bg/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 tablet:px-6">
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="laptop:hidden p-1.5 text-cosmos-text-secondary hover:text-cosmos-text rounded border border-cosmos-border hover:bg-cosmos-elevated"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm tracking-wider text-cosmos-text">
            {currentTitle}
          </span>
          <span className="hidden tablet:inline text-cosmos-muted font-mono text-xs">/</span>
          <span className="hidden tablet:inline text-cosmos-text-secondary font-mono text-xs uppercase">
            OJAS MISSION OPS
          </span>
        </div>
      </div>

      {/* Center: Mission Metadata & Data-Source Indicator */}
      <div className="flex items-center gap-4 font-mono text-xs">
        {/* Synthetic Demonstration vs Live Mode */}
        {isUsingMockData ? (
          <Badge variant="caution" size="sm" className="gap-1.5 py-0.5">
            <ShieldAlert className="h-3 w-3 shrink-0" />
            <span>SIMULATION MODE (SYNTHETIC DATA)</span>
          </Badge>
        ) : (
          <Badge variant="normal" size="sm" className="gap-1.5 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-semantic-normal animate-pulse"></span>
            <span>API DOWNLINK ACTIVE</span>
          </Badge>
        )}

        <div className="hidden desktop:flex items-center gap-3 text-cosmos-muted">
          <span>MISSION: <strong className="text-cosmos-text">ARTEMIS-V</strong></span>
          <span>•</span>
          <span>LAST UPDATED: <strong className="text-cosmos-text">JUST NOW</strong></span>
        </div>
      </div>

      {/* Right: Notifications & Profile Trigger */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-1.5 rounded border border-cosmos-border bg-cosmos-card text-cosmos-text-secondary hover:text-cosmos-text hover:border-cosmos-accent/50 transition-colors relative"
            aria-label="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cosmos-accent"></span>
          </button>

          {/* Simple Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded border border-cosmos-border bg-cosmos-card shadow-2xl p-4 z-50 text-xs font-mono space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-cosmos-border pb-2">
                <span className="font-bold text-cosmos-text uppercase">Mission Notifications (2)</span>
                <span className="text-[10px] text-cosmos-muted">SYNTHETIC</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-cosmos-elevated border border-cosmos-border">
                  <div className="text-cosmos-accent font-semibold">Circadian Protocol Update</div>
                  <div className="text-cosmos-text-secondary text-[11px] mt-0.5">
                    Phototherapy countermeasure suggested prior to next orbital cycle.
                  </div>
                </div>
                <div className="p-2 rounded bg-cosmos-elevated border border-cosmos-border">
                  <div className="text-semantic-normal font-semibold">ARED Exercise Cycle Met</div>
                  <div className="text-cosmos-text-secondary text-[11px] mt-0.5">
                    100% daily load volume logged to telemetry cache.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Astronaut Profile Link */}
        <Link
          to="/settings"
          className="flex items-center gap-2 border-l border-cosmos-border pl-3 text-cosmos-text hover:text-cosmos-accent transition-colors"
        >
          <div className="h-8 w-8 rounded bg-cosmos-card border border-cosmos-border flex items-center justify-center font-mono text-xs font-bold text-cosmos-accent">
            ER
          </div>
          <div className="hidden laptop:block text-left font-mono">
            <span className="block text-xs font-semibold text-cosmos-text leading-tight">ROSTOVA, E.</span>
            <span className="block text-[10px] text-cosmos-muted leading-tight">CHIEF MED OFFICER</span>
          </div>
          <ChevronDown className="h-3 w-3 text-cosmos-muted hidden laptop:block" />
        </Link>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Menu, ShieldAlert, Bell, Sparkles, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { isUsingMockData, authService } from '../services';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export interface TopbarProps {
  onToggleMobileNav: () => void;
  onOpenAssistant?: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Mission Dashboard',
  '/space-journey': 'The Space Journey — Planetary Exploration Game',
  '/mind-garden': 'Mind Garden — Mental Wellness Sanctuary',
  '/indicators': 'Astronaut Health Indicators',
  '/trends': 'Health Trends & Analytics',
  '/research': 'NASA Research Explorer',
  '/insights': 'AI Clinical Insights',
  '/achievements': 'Mission Achievements & Habit Milestones',
  '/settings': 'Astronaut Profile & Settings',
};

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileNav, onOpenAssistant }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTitle = pageTitles[location.pathname] || 'Mission Console';
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-surface-border bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 tablet:px-6 shadow-xs">
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="laptop:hidden p-2 text-content-secondary hover:text-content-main rounded-lg border border-surface-border hover:bg-surface-subtle"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm tablet:text-base tracking-tight text-content-main">
            {currentTitle}
          </span>
          <span className="hidden tablet:inline text-surface-border font-mono text-sm">/</span>
          <span className="hidden tablet:inline text-content-secondary font-mono text-xs uppercase font-medium">
            ARTEMIS-V • DAY 42
          </span>
        </div>
      </div>

      {/* Center: Mission Metadata & Data-Source Indicator */}
      <div className="flex items-center gap-3 font-mono text-xs">
        {/* Synthetic Demonstration vs Live Mode */}
        {isUsingMockData ? (
          <Badge variant="caution" size="sm" className="gap-1.5 py-1">
            <ShieldAlert className="h-3 w-3 shrink-0" />
            <span>SIMULATION MODE</span>
          </Badge>
        ) : (
          <Badge variant="normal" size="sm" className="gap-1.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API DOWNLINK ACTIVE</span>
          </Badge>
        )}

        <div className="hidden desktop:flex items-center gap-2 text-content-secondary text-xs">
          <span>CREW: <strong className="text-content-main">4 ACTIVE</strong></span>
          <span>•</span>
          <span>HABITAT: <strong className="text-content-main">101.3 kPa</strong></span>
        </div>
      </div>

      {/* Right: AI Assistant, Notifications & Astronaut Profile with Logout */}
      <div className="flex items-center gap-2.5">
        {/* Launch AI Assistant Drawer */}
        {onOpenAssistant && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenAssistant}
            className="gap-1.5 shadow-xs font-semibold text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="hidden tablet:inline">Ojas AI</span>
          </Button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg border border-surface-border bg-white text-content-secondary hover:text-content-main hover:border-primary/40 transition-colors relative shadow-xs"
            aria-label="System Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary"></span>
          </button>

          {/* Simple Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-surface-border bg-white shadow-soft-lg p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-surface-border pb-2.5">
                <span className="font-bold text-content-main font-heading uppercase tracking-wide">
                  Mission Alerts (2)
                </span>
                <span className="text-[10px] font-mono text-content-muted">LIVE SUBSYSTEM</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-primary/20">
                  <div className="text-primary font-bold">Circadian Phototherapy Window</div>
                  <div className="text-content-secondary text-[11px] mt-0.5 leading-snug">
                    Schedule 30-minute 480nm spectrum blue-enriched light before orbital rest cycle.
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-emerald-700 font-bold">Daily Habit Quest Completed!</div>
                  <div className="text-content-secondary text-[11px] mt-0.5 leading-snug">
                    Morning biometric check-in verified. +50 Mission XP added.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Astronaut Profile Link */}
        <Link
          to="/settings"
          title="Astronaut Settings & Profile"
          className="flex items-center gap-2 border-l border-surface-border pl-3 text-content-main hover:text-primary transition-colors"
        >
          <div className="h-8 w-8 rounded-full purple-gradient flex items-center justify-center font-mono text-xs font-bold text-white shadow-xs">
            SC
          </div>
          <div className="hidden laptop:block text-left">
            <span className="block text-xs font-bold text-content-main leading-tight">CONNOR, S.</span>
            <span className="block text-[10px] font-mono text-content-secondary leading-tight">CDR • ASTRO-01</span>
          </div>
        </Link>

        {/* Dedicated Visible Logout Button */}
        <button
          onClick={handleLogout}
          title="Logout from Astronaut Portal"
          aria-label="Logout"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-surface-border text-content-secondary hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/80 transition-colors text-xs font-semibold shadow-xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden tablet:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

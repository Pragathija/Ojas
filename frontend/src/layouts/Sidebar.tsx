import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { isUsingMockData } from '../services';

const navigationLinks = [
  { name: 'Mission Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Health Indicators', href: '/indicators', icon: Activity },
  { name: 'Health Trends', href: '/trends', icon: TrendingUp },
  { name: 'Research Explorer', href: '/research', icon: BookOpen },
  { name: 'Insights & Actions', href: '/insights', icon: Lightbulb },
  { name: 'Profile & Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden laptop:flex flex-col w-64 border-r border-cosmos-border bg-cosmos-bg-secondary h-screen sticky top-0">
      {/* Brand & Call Sign */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-cosmos-border">
        <div className="h-8 w-8 rounded bg-cosmos-card border border-cosmos-border flex items-center justify-center font-heading font-bold text-cosmos-accent text-lg">
          Ω
        </div>
        <div>
          <span className="font-heading font-bold text-sm tracking-widest text-cosmos-text">OJAS</span>
          <span className="block text-[10px] font-mono text-cosmos-muted uppercase tracking-wider">AEROSPACE SYS</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
        {navigationLinks.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-cosmos-elevated text-cosmos-accent border border-cosmos-border font-semibold'
                  : 'text-cosmos-text-secondary hover:text-cosmos-text hover:bg-cosmos-card'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Provider Status / Mode Badge */}
      <div className="p-4 border-t border-cosmos-border">
        {isUsingMockData ? (
          <div className="rounded border border-semantic-caution/30 bg-semantic-caution/10 p-2.5">
            <div className="flex items-center gap-2 text-semantic-caution">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span className="font-mono text-[11px] font-medium tracking-wide uppercase">Simulation Mode</span>
            </div>
            <p className="mt-1 text-[10px] text-cosmos-text-secondary leading-tight">
              Synthetic telemetry active for platform validation.
            </p>
          </div>
        ) : (
          <div className="rounded border border-semantic-normal/30 bg-semantic-normal/10 p-2.5">
            <div className="flex items-center gap-2 text-semantic-normal">
              <span className="h-2 w-2 rounded-full bg-semantic-normal animate-pulse"></span>
              <span className="font-mono text-[11px] font-medium tracking-wide uppercase">Live Downlink</span>
            </div>
            <p className="mt-1 text-[10px] text-cosmos-text-secondary leading-tight">
              Direct telemetry stream connected.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

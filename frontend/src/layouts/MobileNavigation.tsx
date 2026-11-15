import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
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

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 laptop:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-cosmos-bg-secondary border-r border-cosmos-border p-6 flex flex-col justify-between shadow-2xl">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-cosmos-border">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-cosmos-card border border-cosmos-border flex items-center justify-center font-heading font-bold text-cosmos-accent text-sm">
                Ω
              </div>
              <span className="font-heading font-bold text-sm tracking-wider text-cosmos-text">
                OJAS
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-cosmos-text-secondary hover:text-cosmos-text"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-6 space-y-1">
            {navigationLinks.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
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
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-cosmos-border">
          {isUsingMockData && (
            <div className="rounded border border-semantic-caution/30 bg-semantic-caution/10 p-2.5 text-semantic-caution flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span className="font-mono text-[10px] uppercase">Simulation Telemetry</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

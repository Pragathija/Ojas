import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Activity,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Award,
  Settings,
  ShieldAlert,
  Flame,
  Flower2,
  Compass,
  LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { isUsingMockData, authService } from '../services';

const navigationLinks = [
  { name: 'Mission Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Space Journey', href: '/space-journey', icon: Compass, badge: 'GAME' },
  { name: 'Mind Garden', href: '/mind-garden', icon: Flower2, badge: 'NEW' },
  { name: 'Astronaut Health', href: '/indicators', icon: Activity },
  { name: 'Health Trends', href: '/trends', icon: TrendingUp },
  { name: 'AI Insights', href: '/insights', icon: Lightbulb },
  { name: 'NASA Research', href: '/research', icon: BookOpen },
  { name: 'Achievements', href: '/achievements', icon: Award, badge: 'LVL 4' },
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
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-surface-border shadow-soft-lg flex flex-col z-10 animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between px-6 h-16 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <img
              src="/ojas.svg"
              alt="Ojas Logo"
              className="h-9 w-9 object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/ojas.png';
              }}
            />
            <div>
              <span className="font-heading font-extrabold text-sm tracking-wider text-content-main">OJAS</span>
              <span className="block text-[9px] font-mono font-semibold text-primary uppercase">
                AEROSPACE SYS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-secondary hover:text-content-main hover:bg-surface-subtle"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Gamification Banner */}
        <div className="p-3.5 mx-3 mt-3 rounded-xl purple-subtle-gradient border border-primary/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-primary flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              7-Day Streak
            </span>
            <span className="font-mono text-[11px] font-bold text-content-main">1,450 XP</span>
          </div>
          <div className="mt-1.5 w-full bg-white rounded-full h-1.5 overflow-hidden">
            <div className="purple-gradient h-1.5 rounded-full w-[72%]"></div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationLinks.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary font-bold shadow-xs'
                    : 'text-content-secondary hover:text-content-main hover:bg-surface-subtle'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4 shrink-0 text-current" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-primary text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Astronaut footer & logout */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full purple-gradient flex items-center justify-center font-mono text-[11px] font-bold text-white shadow-xs">
              SC
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold text-content-main leading-tight">Sarah Connor</span>
              <span className="block text-[10px] font-mono text-content-secondary leading-tight">Commander</span>
            </div>
          </div>
          <button
            onClick={() => {
              authService.logout();
              onClose();
              window.location.href = '/login';
            }}
            title="Sign out of Ojas"
            className="p-1.5 rounded-lg text-content-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

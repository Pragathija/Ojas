import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  TrendingUp,
  BookOpen,
  Lightbulb,
  Award,
  Settings,
  Flame,
  Flower2,
  Compass,
  LogOut,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { authService } from '../services';

const navigationLinks = [
  { name: 'Mission Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Space Journey', href: '/space-journey', icon: Compass, badge: 'GAME' },
  { name: 'Mind Garden', href: '/mind-garden', icon: Flower2, badge: 'NEW' },
  { name: 'Astronaut Health', href: '/indicators', icon: Activity },
  { name: 'Health Trends', href: '/trends', icon: TrendingUp },
  { name: 'AI Insights', href: '/insights', icon: Lightbulb },
  { name: 'NASA Research', href: '/research', icon: BookOpen },
  { name: 'Achievements', href: '/achievements', icon: Award, badge: 'LVL 4' },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <aside className="hidden laptop:flex flex-col w-64 border-r border-surface-border bg-white h-screen sticky top-0 shadow-soft">
      {/* Brand & Mission Identity with Official Ojas Logo (Logo only, no outer box) */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-surface-border">
        <img
          src="/ojas.svg"
          alt="Ojas Logo"
          className="h-10 w-10 object-contain shrink-0"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/ojas.png';
          }}
        />
        <div>
          <span className="font-heading font-extrabold text-base tracking-wider text-content-main">OJAS</span>
          <span className="block text-[10px] font-mono font-medium text-primary tracking-wider uppercase">
            ASTRONAUT HEALTH
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar Navigation">
        {navigationLinks.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
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

      {/* Gamified Mission Engagement Widget */}
      <div className="p-3.5 mx-3 mb-2 rounded-xl purple-subtle-gradient border border-primary/20 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-primary flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            7-Day Streak
          </span>
          <span className="font-mono text-[11px] font-semibold text-content-main">1,450 XP</span>
        </div>
        <div className="mt-2 w-full bg-white rounded-full h-1.5 overflow-hidden border border-primary/10">
          <div className="purple-gradient h-1.5 rounded-full w-[72%]"></div>
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-content-secondary font-mono">
          <span>Level 4 Commander</span>
          <span>72% to Lvl 5</span>
        </div>
      </div>

      {/* Clean Astronaut Footer with Quick Logout */}
      <div className="p-3 mx-3 mb-3 border-t border-surface-border/80 flex items-center justify-between">
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
          onClick={handleLogout}
          title="Sign out of Ojas"
          className="p-1.5 rounded-lg text-content-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Rocket,
  Globe,
  Gamepad2,
  MessageCircle,
  Activity,
  Brain,
  Telescope,
  Trophy,
  User,
  LogOut,
  Sparkles,
  Compass,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Settings,
} from 'lucide-react';
import { authService } from '../services';
import { OjasAISlideout } from '../components/assistant/OjasAISlideout';
import { SpaceUniverseBackground } from '../components/common/SpaceUniverseBackground';
import { pageVariants } from '../lib/animations';

const NAV_ITEMS = [
  { path: '/astronaut', label: 'My Universe', icon: Rocket, exact: true },
  { path: '/astronaut/planets', label: 'Explore Planets', icon: Globe },
  { path: '/astronaut/games', label: 'Space Arcade', icon: Gamepad2, badge: 'PLAY' },
  { path: '/astronaut/ai', label: 'Ojas AI', icon: MessageCircle },
  { path: '/astronaut/health', label: 'Physical Health', icon: Activity },
  { path: '/astronaut/mind-garden', label: 'Mind Garden', icon: Brain },
  { path: '/astronaut/science', label: 'NASA Science Lab', icon: Telescope },
  { path: '/astronaut/achievements', label: 'Achievements', icon: Trophy },
  { path: '/settings', label: 'Astronaut Settings', icon: Settings },
];

export const AstronautLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser() || {
    full_name: 'Commander Sarah Connor',
    callsign: 'Valkyrie',
    username: 'sarah.connor',
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aiSlideoutOpen, setAiSlideoutOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login?portal=astronaut');
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#252039] flex flex-col selection:bg-[#7656D9] selection:text-white relative">
      {/* Background Animated Space Shuttle & Universe */}
      <SpaceUniverseBackground />

      {/* Top Universal Astronaut Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E4F2] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 tablet:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/astronaut" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#7656D9] to-[#5535A5] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform overflow-hidden p-1.5">
              <img
                src="/ojas.svg"
                alt="Ojas Logo"
                className="w-full h-full object-contain filter brightness-110"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl tracking-wider text-[#252039]">OJAS</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-[10px] font-bold">
                  ASTRONAUT
                </span>
              </div>
              <span className="block text-[9px] font-mono font-bold text-[#716B83] uppercase tracking-wider">
                ARTEMIS-V TRANSIT • DAY 42
              </span>
            </div>
          </Link>

          {/* Center Telemetry & Mission Indicators (Desktop) */}
          <div className="hidden laptop:flex items-center gap-4 text-xs font-mono">
            {/* Health data connection indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F6FF] border border-[#E9E4F2]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#19A974] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#19A974]"></span>
              </span>
              <span className="font-bold text-[#252039]">HEALTH DATA NOMINAL</span>
            </div>

            {/* Gamification Level & XP pill */}
            <Link
              to="/astronaut/achievements"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2EDFF] hover:bg-[#E8E0FF] text-[#7656D9] border border-[#7656D9]/30 transition-colors"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span className="font-bold">1,450 XP (LVL 4)</span>
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Slide-out Ojas AI Button */}
            <button
              onClick={() => setAiSlideoutOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#7656D9] to-[#5535A5] text-white font-heading font-bold text-xs shadow-soft hover:shadow-soft-md transition-all cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden mobile:inline">Ojas AI</span>
            </button>

            {/* Profile Dropdown / User Callsign Tag */}
            <div className="hidden tablet:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] text-xs">
              <span className="font-mono font-bold text-[#252039]">{user.callsign || 'Valkyrie'}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-[#E9E4F2] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[#716B83] transition-colors cursor-pointer"
              title="Logout from Astronaut Portal"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="laptop:hidden p-2 rounded-xl border border-[#E9E4F2] text-[#252039]"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Desktop Secondary Sub-navigation Bar */}
        <div className="hidden laptop:block border-t border-[#E9E4F2] bg-[#FAF9FF]/80 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto px-4 tablet:px-8 flex items-center gap-1 py-1.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all relative ${
                    active
                      ? 'bg-white text-[#7656D9] shadow-soft border border-[#E9E4F2]'
                      : 'text-[#716B83] hover:text-[#252039] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#7656D9]' : 'text-[#716B83]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#E8E0FF] text-[#7656D9] text-[9px] font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="laptop:hidden border-t border-[#E9E4F2] bg-white p-4 space-y-2 shadow-soft-lg animate-in slide-in-from-top-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-sm font-heading font-bold transition-colors ${
                    active ? 'bg-[#F2EDFF] text-[#7656D9]' : 'text-[#716B83] hover:bg-[#F8F6FF]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E8E0FF] text-[#7656D9] text-xs font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl mx-auto px-4 tablet:px-8 py-8 w-full relative z-10">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Slide-out Ojas AI Companion Drawer */}
      <OjasAISlideout isOpen={aiSlideoutOpen} onClose={() => setAiSlideoutOpen(false)} />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#716B83] border-t border-[#E9E4F2] bg-white relative z-10">
        <p>OJAS Astronaut Wellness Universe • Artemis-V Habitation Deck</p>
      </footer>
    </div>
  );
};

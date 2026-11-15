import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Terminal,
  Users,
  Compass,
  Activity,
  Database,
  FileText,
  Settings,
  LogOut,
  AlertTriangle,
  Menu,
  X,
  Stethoscope,
} from 'lucide-react';
import { authService } from '../services';

const ADMIN_NAV = [
  { path: '/admin', label: 'Command Center', icon: Terminal, exact: true },
  { path: '/admin/astronauts', label: 'Astronaut Roster', icon: Users },
  { path: '/admin/missions', label: 'Mission Operations', icon: Compass },
  { path: '/admin/health', label: 'Clinical Telemetry', icon: Activity },
  { path: '/admin/research', label: 'NASA Research Datasets', icon: Database },
  { path: '/admin/audit', label: 'Security & Audit Logs', icon: FileText },
  { path: '/admin/system', label: 'System Configuration', icon: Settings },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser() || {
    full_name: 'Dr. Ryan Stone, MD',
    role: 'flight_surgeon',
    username: 'dr.stone',
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login?portal=admin');
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#252039] flex flex-col selection:bg-[#5535A5] selection:text-white">
      {/* Top Mission Control Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E4F2] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 tablet:px-8 h-20 flex items-center justify-between">
          {/* Identity */}
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5535A5] to-[#252039] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl tracking-wider text-[#252039]">OJAS</span>
                <span className="px-2 py-0.5 rounded-full bg-[#E8E0FF] text-[#5535A5] font-mono text-[10px] font-bold">
                  NASA COMMAND
                </span>
              </div>
              <span className="block text-[9px] font-mono font-bold text-[#716B83] uppercase tracking-wider">
                JOHNSON SPACE CENTER • MISSION OPERATIONS
              </span>
            </div>
          </Link>

          {/* Operational Status Badges (Desktop) */}
          <div className="hidden laptop:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F8F6FF] border border-[#E9E4F2]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-[#252039]">GATEWAY ONLINE (100 HZ)</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F2EDFF] text-[#5535A5] border border-[#5535A5]/20 font-bold">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>ROLE: {user.role.toUpperCase()}</span>
            </div>
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden tablet:flex items-center gap-2.5 text-right">
              <div className="text-xs leading-tight">
                <span className="font-heading font-bold text-[#252039] block">{user.full_name}</span>
                <span className="font-mono text-[10px] text-[#716B83] block">{user.role}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-[#E9E4F2] text-[#716B83] hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
              title="Logout of NASA Administration"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="laptop:hidden p-2.5 rounded-xl border border-[#E9E4F2] text-[#716B83] hover:text-[#252039]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Sub-Navigation Bar */}
        <div className="hidden laptop:block border-t border-[#E9E4F2] bg-[#FAF9FF]">
          <div className="max-w-7xl mx-auto px-4 tablet:px-8 flex items-center gap-1 overflow-x-auto py-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white text-[#5535A5] shadow-xs border border-[#E9E4F2]'
                      : 'text-[#716B83] hover:text-[#252039] hover:bg-white/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#5535A5]' : 'text-[#716B83]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="laptop:hidden border-t border-[#E9E4F2] bg-white p-4 space-y-2">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl text-sm font-heading font-bold transition-colors ${
                    active ? 'bg-[#F2EDFF] text-[#5535A5]' : 'text-[#716B83] hover:bg-[#F8F6FF]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1 max-w-7xl mx-auto px-4 tablet:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#716B83] border-t border-[#E9E4F2] bg-white">
        <p>OJAS NASA Mission Administration Portal • Demonstration Platform</p>
      </footer>
    </div>
  );
};

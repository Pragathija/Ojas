import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Rocket,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  KeyRound,
  Stethoscope,
  Terminal,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react';
import { authService } from '../../services';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPortal = (searchParams.get('portal') as 'astronaut' | 'admin') || 'astronaut';

  const [portalType, setPortalType] = useState<'astronaut' | 'admin'>(initialPortal);
  const [username, setUsername] = useState(portalType === 'astronaut' ? 'sarah.connor' : 'dr.stone');
  const [password, setPassword] = useState(portalType === 'astronaut' ? 'Astronaut2026!' : 'FlightSurgeon2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePortalSwitch = (type: 'astronaut' | 'admin') => {
    setPortalType(type);
    setError(null);
    if (type === 'astronaut') {
      setUsername('sarah.connor');
      setPassword('Astronaut2026!');
    } else {
      setUsername('dr.stone');
      setPassword('FlightSurgeon2026!');
    }
  };

  const handleDemoFill = (u: string, p: string, pType: 'astronaut' | 'admin') => {
    setPortalType(pType);
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const session = await authService.login(username, password, portalType);
      if (session.portal_type === 'astronaut') {
        navigate('/astronaut');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#252039] flex flex-col justify-between selection:bg-[#7656D9] selection:text-white">
      {/* Top Banner Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 tablet:px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7656D9] to-[#5535A5] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="font-heading font-black text-xl tracking-wider text-[#252039]">OJAS</span>
            <span className="block text-[9px] font-mono font-bold text-[#7656D9] uppercase tracking-widest">
              ASTRONAUT WELLNESS UNIVERSE
            </span>
          </div>
        </Link>
        <Link
          to="/"
          className="text-xs font-heading font-bold text-[#716B83] hover:text-[#7656D9] transition-colors"
        >
          Back to Public Overview
        </Link>
      </header>

      {/* Main Dual Authentication Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl space-y-6">
          {/* Portal Switcher Tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#E8E0FF]/60 border border-[#E9E4F2] shadow-inner">
            <button
              type="button"
              onClick={() => handlePortalSwitch('astronaut')}
              className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-heading font-bold text-sm transition-all cursor-pointer ${
                portalType === 'astronaut'
                  ? 'bg-white text-[#7656D9] shadow-soft scale-[1.02]'
                  : 'text-[#716B83] hover:text-[#252039]'
              }`}
            >
              <Rocket className="h-4 w-4" />
              <span>Astronaut Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('admin')}
              className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-heading font-bold text-sm transition-all cursor-pointer ${
                portalType === 'admin'
                  ? 'bg-white text-[#5535A5] shadow-soft scale-[1.02]'
                  : 'text-[#716B83] hover:text-[#252039]'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>NASA Administration</span>
            </button>
          </div>

          {/* Authentication Card */}
          <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft-lg p-7 tablet:p-9 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2EDFF] text-[#7656D9] font-mono text-xs font-bold uppercase tracking-wider">
                {portalType === 'astronaut' ? (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>FLIGHT CREW ACCESS • ARTEMIS-V</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-[#5535A5]" />
                    <span>MISSION CONTROL &amp; CLINICAL OVERSIGHT</span>
                  </>
                )}
              </div>
              <h1 className="font-heading text-2xl tablet:text-3xl font-extrabold text-[#252039]">
                {portalType === 'astronaut' ? 'Enter Your Wellness Universe' : 'NASA Mission Command Center'}
              </h1>
              <p className="text-xs tablet:text-sm text-[#716B83] font-sans">
                {portalType === 'astronaut'
                  ? 'Authenticate to access your personal space journey, biometric baselines, and mind garden.'
                  : 'Authorized access for flight surgeons, mission directors, and biomedical monitoring engineers.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase text-[#716B83]">
                  {portalType === 'astronaut' ? 'Astronaut Username / Callsign' : 'Administrative Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B83]">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={portalType === 'astronaut' ? 'e.g. sarah.connor' : 'e.g. dr.stone'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-[#252039] text-sm focus:bg-white focus:outline-none focus:border-[#7656D9] transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold uppercase text-[#716B83]">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#716B83]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter mission password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#F8F6FF] text-[#252039] text-sm focus:bg-white focus:outline-none focus:border-[#7656D9] transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#716B83] hover:text-[#252039]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#7656D9] to-[#5535A5] hover:opacity-95 text-white font-heading font-bold text-sm shadow-soft-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Enter {portalType === 'astronaut' ? 'Astronaut Universe' : 'Command Center'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="pt-4 border-t border-[#E9E4F2] space-y-3">
              <span className="block font-mono text-[11px] font-bold uppercase text-[#716B83] tracking-wider">
                Quick Demonstration Credentials
              </span>
              <div className="grid grid-cols-1 tablet:grid-cols-2 gap-2 text-xs">
                {portalType === 'astronaut' ? (
                  <button
                    type="button"
                    onClick={() => handleDemoFill('sarah.connor', 'Astronaut2026!', 'astronaut')}
                    className="p-2.5 rounded-xl border border-[#E9E4F2] hover:border-[#7656D9] bg-[#FAF9FF] text-left space-y-0.5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-1.5 font-heading font-bold text-[#7656D9]">
                      <Rocket className="h-3.5 w-3.5" />
                      <span>Commander Sarah Connor</span>
                    </div>
                    <span className="text-[10px] text-[#716B83] block font-mono">
                      sarah.connor • Artemis-V Commander
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDemoFill('dr.stone', 'FlightSurgeon2026!', 'admin')}
                      className="p-2.5 rounded-xl border border-[#E9E4F2] hover:border-[#5535A5] bg-[#FAF9FF] text-left space-y-0.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5 font-heading font-bold text-[#5535A5]">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>Dr. Ryan Stone, MD</span>
                      </div>
                      <span className="text-[10px] text-[#716B83] block font-mono">
                        dr.stone • Lead Flight Surgeon
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDemoFill('admin.houston', 'NasaDirector2026!', 'admin')}
                      className="p-2.5 rounded-xl border border-[#E9E4F2] hover:border-[#5535A5] bg-[#FAF9FF] text-left space-y-0.5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-1.5 font-heading font-bold text-[#5535A5]">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Gene Kranz</span>
                      </div>
                      <span className="text-[10px] text-[#716B83] block font-mono">
                        admin.houston • Flight Director
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="py-6 text-center text-xs text-[#716B83] border-t border-[#E9E4F2] bg-white">
        <p>OJAS Spaceflight Health Platform • NASA Space Apps Challenge Demonstration</p>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X, Sparkles, Compass, ShieldCheck, Rocket, UserCheck } from 'lucide-react';
import { Button } from '../common/Button';

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E9E4F2] shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-11 w-11 rounded-2xl purple-gradient flex items-center justify-center font-heading font-black text-white text-xl shadow-soft group-hover:scale-105 transition-transform overflow-hidden p-1.5">
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
            <span className="font-heading font-black text-xl tracking-wider text-[#252039]">OJAS</span>
            <span className="block text-[9px] font-mono font-bold text-primary uppercase tracking-widest">
              ASTRONAUT WELLNESS UNIVERSE
            </span>
          </div>
        </Link>

        {/* Center Navigation Links: High Contrast, Bold */}
        <div className="hidden laptop:flex items-center gap-6 text-sm font-heading font-bold text-[#252039]">
          <button
            onClick={() => scrollToSection('journey')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            The Journey
          </button>
          <Link to="/mind-garden" className="hover:text-primary transition-colors">
            Mind Garden
          </Link>
          <button
            onClick={() => scrollToSection('body')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Physical Health
          </button>
          <button
            onClick={() => scrollToSection('science')}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            NASA Science
          </button>
          <Link
            to="/astronaut/games"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-lavender text-primary font-bold hover:bg-[#DDD3F9] transition-colors"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Wellness Games</span>
          </Link>
        </div>

        {/* Right CTA: Dual Portals */}
        <div className="hidden laptop:flex items-center gap-3">
          <Link to="/astronaut">
            <Button size="sm" className="gap-2 font-heading font-bold text-xs shadow-soft px-4 py-2 rounded-xl">
              <Rocket className="h-3.5 w-3.5" />
              <span>Astronaut Portal</span>
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="secondary" size="sm" className="gap-1.5 font-heading font-bold text-xs px-3.5 py-2 rounded-xl border border-primary/25">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>NASA Admin</span>
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="laptop:hidden p-2 text-[#252039] hover:text-primary rounded-lg border border-[#E9E4F2] bg-white shadow-xs"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="laptop:hidden border-b border-[#E9E4F2] bg-white p-6 space-y-4 shadow-soft-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-3 font-heading font-bold text-sm text-[#252039]">
            <button
              onClick={() => scrollToSection('journey')}
              className="text-left py-2 hover:text-primary"
            >
              The Journey
            </button>
            <Link
              to="/mind-garden"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 hover:text-primary"
            >
              Mind Garden
            </Link>
            <button
              onClick={() => scrollToSection('body')}
              className="text-left py-2 hover:text-primary"
            >
              Physical Wellness
            </button>
            <button
              onClick={() => scrollToSection('science')}
              className="text-left py-2 hover:text-primary"
            >
              NASA Science Lab
            </button>
            <Link
              to="/astronaut/games"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left py-2 text-primary font-extrabold flex items-center gap-2"
            >
              <Compass className="h-4 w-4" />
              <span>Wellness Games</span>
            </Link>
          </div>
          <div className="pt-3 border-t border-[#E9E4F2] flex flex-col gap-2.5">
            <Link to="/astronaut" onClick={() => setMobileMenuOpen(false)}>
              <Button size="md" className="w-full gap-2 font-heading font-bold text-sm shadow-soft rounded-xl">
                <Rocket className="h-4 w-4" />
                <span>Astronaut Portal</span>
              </Button>
            </Link>
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" size="md" className="w-full gap-2 font-heading font-bold text-sm rounded-xl border border-primary/25">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>NASA Administration</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
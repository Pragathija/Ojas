import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cosmos-bg/85 backdrop-blur-md border-b border-cosmos-border transition-all">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded bg-cosmos-card border border-cosmos-border flex items-center justify-center font-heading font-bold text-cosmos-accent text-xl group-hover:border-cosmos-accent/60 transition-colors">
            Ω
          </div>
          <div>
            <span className="font-heading font-bold text-lg tracking-[0.2em] text-cosmos-text">OJAS</span>
            <span className="block text-[9px] font-mono text-cosmos-muted uppercase tracking-widest">BEYOND EARTH</span>
          </div>
        </Link>

        {/* Center Editorial Navigation */}
        <div className="hidden laptop:flex items-center gap-8 text-sm font-medium text-cosmos-text-secondary">
          <button
            onClick={() => scrollToSection('mission-challenge')}
            className="hover:text-cosmos-text transition-colors duration-150 cursor-pointer"
          >
            The Mission
          </button>
          <button
            onClick={() => scrollToSection('ojas-approach')}
            className="hover:text-cosmos-text transition-colors duration-150 cursor-pointer"
          >
            Our Approach
          </button>
          <button
            onClick={() => scrollToSection('scientific-foundation')}
            className="hover:text-cosmos-text transition-colors duration-150 cursor-pointer"
          >
            The Science
          </button>
          <button
            onClick={() => scrollToSection('product-preview')}
            className="hover:text-cosmos-text transition-colors duration-150 cursor-pointer"
          >
            System Preview
          </button>
        </div>

        {/* Right CTA */}
        <div className="hidden laptop:flex items-center gap-4">
          <Link to="/dashboard">
            <Button size="sm" className="gap-2 font-mono text-xs px-4">
              <span>ENTER OJAS</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="laptop:hidden flex items-center gap-2">
          <Link to="/dashboard">
            <Button size="sm" className="text-xs px-3 font-mono">
              ENTER
            </Button>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-cosmos-text-secondary hover:text-cosmos-text rounded border border-cosmos-border hover:bg-cosmos-elevated"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="laptop:hidden border-b border-cosmos-border bg-cosmos-bg-secondary px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3 text-sm font-medium text-cosmos-text-secondary">
            <button
              onClick={() => scrollToSection('mission-challenge')}
              className="text-left py-2 hover:text-cosmos-text border-b border-cosmos-border/50"
            >
              The Mission
            </button>
            <button
              onClick={() => scrollToSection('ojas-approach')}
              className="text-left py-2 hover:text-cosmos-text border-b border-cosmos-border/50"
            >
              Our Approach
            </button>
            <button
              onClick={() => scrollToSection('scientific-foundation')}
              className="text-left py-2 hover:text-cosmos-text border-b border-cosmos-border/50"
            >
              The Science
            </button>
            <button
              onClick={() => scrollToSection('product-preview')}
              className="text-left py-2 hover:text-cosmos-text"
            >
              System Preview
            </button>
          </div>
          <div className="pt-2">
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center gap-2 font-mono text-xs">
                <span>LAUNCH MISSION DASHBOARD</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

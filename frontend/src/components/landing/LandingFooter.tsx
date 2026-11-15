import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-cosmos-bg py-16 border-t border-cosmos-border text-cosmos-text-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-12">
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-8">
          {/* Identity & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded bg-cosmos-card border border-cosmos-border flex items-center justify-center font-heading font-bold text-cosmos-accent text-sm">
                Ω
              </div>
              <span className="font-heading font-bold text-sm tracking-widest text-cosmos-text">OJAS</span>
            </div>
            <p className="font-mono text-xs text-cosmos-accent">Beyond Earth. Within.</p>
            <p className="text-cosmos-muted text-xs leading-relaxed">
              Biomedical telemetry, countermeasure compliance, and adaptive health intelligence engineered for long-duration deep space exploration.
            </p>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase text-cosmos-text font-semibold tracking-wider block">
              Application
            </span>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <Link to="/dashboard" className="hover:text-cosmos-accent transition-colors">
                  Mission Overview
                </Link>
              </li>
              <li>
                <Link to="/indicators" className="hover:text-cosmos-accent transition-colors">
                  Health Indicators
                </Link>
              </li>
              <li>
                <Link to="/trends" className="hover:text-cosmos-accent transition-colors">
                  Health Trends
                </Link>
              </li>
              <li>
                <Link to="/insights" className="hover:text-cosmos-accent transition-colors">
                  Insights & Actions
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-cosmos-accent transition-colors">
                  Profile & Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Research & Science */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase text-cosmos-text font-semibold tracking-wider block">
              Scientific Foundation
            </span>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <Link to="/research" className="hover:text-cosmos-accent transition-colors">
                  NASA Research Explorer
                </Link>
              </li>
              <li>
                <a href="#scientific-foundation" className="hover:text-cosmos-accent transition-colors">
                  Methodology & Provenance
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/hrp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cosmos-accent transition-colors"
                >
                  NASA Human Research Program ↗
                </a>
              </li>
              <li>
                <a
                  href="https://ntrs.nasa.gov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cosmos-accent transition-colors"
                >
                  NASA Technical Reports (NTRS) ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Challenge & Disclaimers */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase text-cosmos-text font-semibold tracking-wider block">
              Challenge Attribution
            </span>
            <p className="text-cosmos-muted leading-relaxed text-[11px]">
              Developed for the NASA Space Apps Challenge.
            </p>
            <p className="text-cosmos-muted leading-relaxed text-[10px]">
              Disclaimer: Educational prototype platform. Does not represent official NASA endorsement or medical clinical software.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-cosmos-border/60 flex flex-col tablet:flex-row items-center justify-between gap-4 font-mono text-[11px] text-cosmos-muted">
          <span>© 2026 OJAS Aerospace System. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-semantic-normal"></span>
            <span>COSMOS DESIGN SYSTEM v0.2</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

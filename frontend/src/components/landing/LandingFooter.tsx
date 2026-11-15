import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-white py-16 border-t border-surface-border text-content-secondary text-xs">
      <div className="max-w-7xl mx-auto px-4 tablet:px-8 space-y-12">
        <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-8">
          {/* Identity & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/ojas.svg"
                alt="Ojas Logo"
                className="h-9 w-9 object-contain shrink-0"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/ojas.png';
                }}
              />
              <span className="font-heading font-extrabold text-base tracking-wider text-content-main">OJAS</span>
            </div>
            <p className="font-mono text-xs text-primary font-bold">Beyond Earth. Within Your Health.</p>
            <p className="text-content-secondary text-xs leading-relaxed">
              Biomedical telemetry, gamified habit compliance, and adaptive health intelligence engineered for long-duration deep space exploration.
            </p>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase text-content-main font-bold tracking-wider block">
              Application Subsystems
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">
                  Mission Dashboard
                </Link>
              </li>
              <li>
                <Link to="/mind-garden" className="hover:text-primary font-semibold text-primary transition-colors">
                  Mind Garden Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/indicators" className="hover:text-primary transition-colors">
                  Astronaut Health Indicators
                </Link>
              </li>
              <li>
                <Link to="/trends" className="hover:text-primary transition-colors">
                  Longitudinal Health Trends
                </Link>
              </li>
              <li>
                <Link to="/insights" className="hover:text-primary transition-colors">
                  AI Clinical Insights
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-primary transition-colors">
                  Gamified Achievements
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-primary transition-colors">
                  Astronaut Profile & Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentic NASA Research Foundations */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase text-content-main font-bold tracking-wider block">
              NASA Research Resources
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/research" className="hover:text-primary transition-colors">
                  SpaceX Inspiration4 (OSD-575 CMP & Cytokines)
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-primary transition-colors">
                  SpaceX Inspiration4 (OSD-569 Hematology)
                </Link>
              </li>
              <li>
                <Link to="/research" className="hover:text-primary transition-colors">
                  UTMB Bedrest Campaign 1 Actigraphy (BRSMAct)
                </Link>
              </li>
              <li>
                <a
                  href="https://osdr.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  NASA Open Science Data Repository (OSDR) ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Standards & Transparency */}
          <div className="space-y-3">
            <span className="font-mono text-xs uppercase text-content-main font-bold tracking-wider block">
              NASA Space Apps 2026
            </span>
            <p className="text-[11px] leading-relaxed text-content-secondary">
              Developed for NASA Space Apps Challenge 2026. Non-clinical aerospace engineering prototype. Powered by FastAPI, Python 3.12, Scikit-learn, React 18, and authentic NASA OSDR spaceflight data.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-border pt-6 flex flex-col tablet:flex-row items-center justify-between gap-4 font-mono text-[11px] text-content-secondary">
          <p>© 2026 Project Ojas • Space Health & Exploration Medicine Prototype</p>
          <div className="flex items-center gap-4">
            <span>NASA-STD-3001 Parameterized</span>
            <span>•</span>
            <span className="text-primary font-bold">White + Purple Visual Identity</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import {
  LandingNavbar,
  HeroSplit,
  MissionChallenge,
  OjasApproach,
  ScientificFoundation,
  ProductPreview,
  FinalCTA,
  LandingFooter,
} from '../components/landing';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-cosmos-bg text-cosmos-text selection:bg-cosmos-accent selection:text-white">
      {/* Editorial Navigation */}
      <LandingNavbar />

      <main>
        {/* 1. Cinematic Split-Screen Hero */}
        <HeroSplit />

        {/* 2. Space Changes Everything Challenge Section */}
        <MissionChallenge />

        {/* 3. The OJAS Approach: Monitor, Understand, Act */}
        <OjasApproach />

        {/* 4. Scientific Rigor & NASA Research Foundation */}
        <ScientificFoundation />

        {/* 5. Actual Dashboard Product Preview */}
        <ProductPreview />

        {/* 6. High-Impact Final Call To Action */}
        <FinalCTA />
      </main>

      {/* 7. Minimal Aerospace Footer */}
      <LandingFooter />
    </div>
  );
};

import React from 'react';
import {
  LandingNavbar,
  HeroSpaceUniverse,
  DiscoverOjas,
  MindInSpace,
  BodyInSpace,
  ScientificFoundation,
  DailySpaceJourney,
  ProductPreview,
  FinalCTA,
  LandingFooter,
} from '../components/landing';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8F6FF] text-[#252039] selection:bg-[#7656D9] selection:text-white">
      {/* Editorial Navigation */}
      <LandingNavbar />

      <main>
        {/* 1. Immersive Astronaut Space Universe Hero (45% astronaut illustration, no purple rectangle over text) */}
        <HeroSpaceUniverse />

        {/* Section A: Discover Ojas */}
        <DiscoverOjas />

        {/* Section B: Your Mind in Space (Mind Garden Preview) */}
        <MindInSpace />

        {/* Section C: Your Body in Space (Physical Telemetry & Baselines) */}
        <BodyInSpace />

        {/* Section D: Explore NASA Science (BRSMAct, OSD-575, OSD-569) */}
        <ScientificFoundation />

        {/* Section E: Your Daily Space Journey (Exploration Roadmap & Habits) */}
        <DailySpaceJourney />

        {/* Live Cockpit Product Preview */}
        <ProductPreview />

        {/* Section F: Begin Your Mission (Final CTA) */}
        <FinalCTA />
      </main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};
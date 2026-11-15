import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Compass,
  Telescope,
  Sparkles,
  Trophy,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { gamificationService } from '../../services';

interface OutpostLocation {
  id: string;
  name: string;
  celestialZone: string;
  tagline: string;
  nasaFact: string;
  scienceFocus: string;
  unlocked: boolean;
  xpValue: number;
}

const OUTPOSTS: OutpostLocation[] = [
  {
    id: 'iss-cupola',
    name: 'ISS Cupola Observation Bay',
    celestialZone: 'Low Earth Orbit (400 km)',
    tagline: 'Autonomic recovery via the Overview Effect',
    nasaFact: 'Astronauts reporting views of Earth’s thin atmospheric limb show increased parasympathetic heart rate variability (HRV) and measurable decreases in salivary cortisol.',
    scienceFocus: 'Overview Effect & Autonomic Nervous Balance',
    unlocked: true,
    xpValue: 50,
  },
  {
    id: 'artemis-gateway',
    name: 'Lunar Gateway South Pole Base',
    celestialZone: 'Cislunar Halo Orbit (384,400 km)',
    tagline: 'Deep space circadian rhythm entrainment',
    nasaFact: 'NASA bed-rest and lunar analog studies confirm that narrow-band blue-enriched LED illumination during morning shifts promotes cortisol awakening and reduces sleep latency by 32%.',
    scienceFocus: 'Circadian Photobiology & Melatonin Synthesis',
    unlocked: true,
    xpValue: 50,
  },
  {
    id: 'inspiration4-pod',
    name: 'Inspiration4 Multi-Epoch Station',
    celestialZone: 'High Orbit Exploration (585 km)',
    tagline: 'Empirical NASA OSDR Immune & Hematology',
    nasaFact: 'Data from NASA OSDR study OSD-569 and OSD-575 showed transient lymphocyte decreases and cytokine elevations within 24 hours of orbit entry, which fully returned to baseline upon Earth return.',
    scienceFocus: 'NASA OSDR OSD-575 & OSD-569 Biomarkers',
    unlocked: true,
    xpValue: 50,
  },
  {
    id: 'mars-transit-deck',
    name: 'Deep Space Mars Transit Deck',
    celestialZone: 'Interplanetary Transit (55 Million km)',
    tagline: 'Microgravity musculoskeletal countermeasure',
    nasaFact: 'Astronauts performing resistive exercises on the ARED system retain up to 98% of bone mineral density in the lumbar spine and femoral neck across 6-month spaceflight durations.',
    scienceFocus: 'ARED Countermeasure Verification',
    unlocked: false,
    xpValue: 75,
  },
  {
    id: 'europa-ice-lab',
    name: 'Europa Subsurface Horizon Lab',
    celestialZone: 'Outer Solar System Station',
    tagline: 'Osmoregulation & fluid shift preservation',
    nasaFact: 'Cephalad fluid shift causes transient nasal congestion and baroreceptor recalibration during the first 72 hours of microgravity, stabilized by monitored sodium and electrolyte protocols.',
    scienceFocus: 'Fluid Shift Countermeasures',
    unlocked: false,
    xpValue: 100,
  },
];

export const OrbitExplorerGame: React.FC = () => {
  const [locations, setLocations] = useState<OutpostLocation[]>(OUTPOSTS);
  const [selectedLoc, setSelectedLoc] = useState<OutpostLocation>(OUTPOSTS[0]);
  const [exploredCount, setExploredCount] = useState<number>(3);
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleExploreLocation = (loc: OutpostLocation) => {
    setSelectedLoc(loc);
    if (!loc.unlocked) {
      const updated = locations.map((l) => (l.id === loc.id ? { ...l, unlocked: true } : l));
      setLocations(updated);
      setExploredCount((prev) => prev + 1);

      gamificationService.claimQuest(`orbit-explorer-${loc.id}`, `Explored ${loc.name}`, loc.xpValue)
        .then(() => setXpClaimed(true))
        .catch(() => setXpClaimed(true));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              GAME 6 • EDUCATIONAL SPACE EXPLORATION
            </span>
            <Badge variant="purple" size="sm">{exploredCount} OF {locations.length} STATIONS DISCOVERED</Badge>
          </div>
          <h2 className="font-heading font-extrabold text-2xl text-[#252039] mt-1">
            Orbit Explorer — Space Science &amp; Outposts
          </h2>
          <p className="text-xs text-[#716B83] mt-0.5 font-sans">
            Navigate between authentic aerospace research outposts, inspect spaceflight human factors, and unlock achievements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-pastel-mint border border-[#C2EAD6] text-emerald-800 font-bold">
            NASA Science Grounded
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 laptop:grid-cols-12 gap-6">
        {/* Left Column: Outposts List */}
        <div className="laptop:col-span-5 space-y-3">
          <span className="text-xs font-mono font-bold text-[#716B83] uppercase block mb-1">
            Celestial Outpost Registry
          </span>
          {locations.map((loc) => {
            const isSelected = selectedLoc.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleExploreLocation(loc)}
                className={`w-full p-4 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#7656D9] bg-[#F2EDFF] ring-2 ring-[#7656D9]/30 shadow-soft'
                    : 'border-[#E9E4F2] bg-white hover:bg-[#FAF9FF]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="font-mono text-[10px] text-primary uppercase font-bold block">
                    {loc.celestialZone}
                  </span>
                  <h4 className="font-heading font-bold text-sm text-[#252039]">{loc.name}</h4>
                  <span className="text-[11px] text-[#716B83] line-clamp-1">{loc.scienceFocus}</span>
                </div>
                <div>
                  {loc.unlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Explored</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#E8E0FF] text-[#7656D9] text-[10px] font-mono font-bold">
                      +{loc.xpValue} XP
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Outpost Dossier */}
        <div className="laptop:col-span-7 bg-gradient-to-b from-[#FAF9FF] to-white rounded-3xl border border-[#E9E4F2] p-6 tablet:p-8 space-y-6 shadow-soft">
          <div className="flex items-center justify-between border-b border-[#E9E4F2] pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-primary uppercase">
                {selectedLoc.celestialZone}
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-[#252039] mt-0.5">
                {selectedLoc.name}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-pastel-lavender flex items-center justify-center text-primary shadow-soft">
              <Globe className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-4 text-sm font-sans">
            <div className="p-4 rounded-2xl bg-white border border-[#E9E4F2] space-y-1.5">
              <span className="text-xs font-mono font-bold text-primary uppercase block">
                NASA Human Research Program Finding
              </span>
              <p className="text-[#252039] leading-relaxed text-xs tablet:text-sm">
                "{selectedLoc.nasaFact}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-[#E9E4F2]">
                <span className="text-[#716B83] block text-[10px]">EXPLORATION DOMAIN</span>
                <span className="font-bold text-[#252039]">{selectedLoc.scienceFocus}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E9E4F2]">
                <span className="text-[#716B83] block text-[10px]">ETHICAL STATUS</span>
                <span className="font-bold text-emerald-600">Educational • Non-Clinical</span>
              </div>
            </div>
          </div>

          {selectedLoc.unlocked ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800 flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Dossier Discovered &amp; Logged to Astronaut Knowledge Archive</span>
            </div>
          ) : (
            <Button
              size="md"
              onClick={() => handleExploreLocation(selectedLoc)}
              className="w-full gap-2 font-heading font-bold text-xs rounded-xl shadow-soft"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Outpost &amp; Claim +{selectedLoc.xpValue} XP</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

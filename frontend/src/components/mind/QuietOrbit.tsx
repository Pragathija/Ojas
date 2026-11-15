import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Compass, Sparkles, Eye, RefreshCw } from 'lucide-react';

const CONTEMPLATIVE_PROMPTS = [
  "Looking back at Earth from 400 kilometers: every border, every conflict, every worry dissolves into a thin blue ribbon of atmosphere.",
  "You are floating in quiet stillness. Your heart beats with the same steady cadence whether standing under gravity or drifting along orbital trajectories.",
  "Notice the gentle rotation of the stars outside the cupola. In space, silence is not an absence, but a wide presence.",
  "Rest your eyes on the curved horizon. Allow your shoulders to drop and release any tension held from today's mission schedule.",
  "You are part of a very small lineage of humans who have seen night fall across entire continents in seconds. Breathe that wonder in.",
];

export const QuietOrbit: React.FC = () => {
  const [promptIndex, setPromptIndex] = useState(0);

  const nextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % CONTEMPLATIVE_PROMPTS.length);
  };

  return (
    <Card className="p-6 tablet:p-8 space-y-6 border-[#EAE6F2] shadow-soft overflow-hidden">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              CUPOLA OBSERVATION DECK
            </span>
            <Badge variant="purple" size="sm">MINDFUL PERSPECTIVE</Badge>
          </div>
          <h2 className="font-heading text-xl tablet:text-2xl font-bold text-content-main mt-1">
            Quiet Orbit
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            A serene contemplation space inspired by the Overview Effect experienced by space travelers.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={nextPrompt}
          className="text-xs font-sans gap-1.5 text-primary border-primary/30"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Next Perspective</span>
        </Button>
      </div>

      {/* Peaceful Space Artwork Window */}
      <div className="relative rounded-2xl overflow-hidden border border-[#EAE6F2] bg-gradient-to-b from-[#1C1832] via-[#2D2650] to-[#423972] p-8 tablet:p-12 text-white min-h-[260px] flex flex-col justify-between shadow-soft">
        {/* Decorative Space Elements */}
        <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-white/70 animate-ping" />
        <div className="absolute top-12 left-16 w-1.5 h-1.5 rounded-full bg-pastel-blue/80" />
        <div className="absolute top-24 right-28 w-1 h-1 rounded-full bg-pastel-lavender/60" />
        <div className="absolute top-8 left-1/3 w-1.5 h-1.5 rounded-full bg-white/90" />
        <div className="absolute bottom-16 right-16 w-1 h-1 rounded-full bg-white/50" />

        {/* Planet Horizon Curve */}
        <div className="absolute -bottom-36 -left-20 -right-20 h-64 rounded-[100%] bg-gradient-to-t from-[#5535A5] via-[#7656D9]/50 to-transparent border-t-2 border-[#A890FE]/40 filter blur-xs" />
        <div className="absolute -bottom-48 -left-10 -right-10 h-64 rounded-[100%] bg-[#19A974]/20 filter blur-md" />

        {/* Top Orbit Telemetry Tag */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-white/70">
          <div className="flex items-center gap-2">
            <Compass className="h-3.5 w-3.5 text-primary-light" />
            <span>ALTITUDE: 418 KM • INCLINATION: 51.6°</span>
          </div>
          <span className="text-[11px] text-white/60">SUNRISE IN: 34 MIN</span>
        </div>

        {/* Central Overview Effect Quote */}
        <div className="relative z-10 my-6 max-w-xl mx-auto text-center space-y-3">
          <Sparkles className="h-5 w-5 text-pastel-lavender mx-auto opacity-80" />
          <p className="font-heading text-base tablet:text-lg font-medium leading-relaxed text-white/95 italic">
            "{CONTEMPLATIVE_PROMPTS[promptIndex]}"
          </p>
        </div>

        {/* Bottom Tag */}
        <div className="relative z-10 text-center">
          <span className="font-mono text-[10px] tracking-widest uppercase text-white/50">
            Pause here for as long as you wish • No objectives required
          </span>
        </div>
      </div>
    </Card>
  );
};
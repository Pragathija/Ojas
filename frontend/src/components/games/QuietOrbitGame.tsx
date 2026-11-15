import React, { useState, useRef } from 'react';
import { Eye, Volume2, VolumeX, RefreshCw, Trophy, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { gamificationService } from '../../services';

const CONTEMPLATIVE_PROMPTS = [
  "Looking back at Earth from 400 kilometers: every border, every conflict, every worry dissolves into a thin blue ribbon of atmosphere.",
  "You are floating in quiet stillness. Your heart beats with the same steady cadence whether standing under gravity or drifting along orbital trajectories.",
  "Notice the gentle rotation of the stars outside the cupola. In space, silence is not an absence, but a wide presence.",
  "Rest your eyes on the curved horizon. Allow your shoulders to drop and release any tension held from today's mission schedule.",
  "You are part of a very small lineage of humans who have seen night fall across entire continents in seconds. Breathe that wonder in.",
];

export const QuietOrbitGame: React.FC = () => {
  const [promptIdx, setPromptIdx] = useState(0);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const toggleAudio = () => {
    if (!ambientAudio) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz calming cosmic drone
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
        setAmbientAudio(true);
      } catch {}
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {}
      }
      setAmbientAudio(false);
    }
  };

  const handleNextPerspective = () => {
    setPromptIdx((p) => (p + 1) % CONTEMPLATIVE_PROMPTS.length);
    if (!xpClaimed) {
      gamificationService.claimQuest('quiet-orbit-contemplation', 'Quiet Orbit Perspective Reflection', 50)
        .then(() => setXpClaimed(true))
        .catch(() => setXpClaimed(true));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shadow-xs">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">Quiet Orbit</h3>
            <p className="text-xs text-[#716B83] font-sans">
              Contemplative cupola orbital panoramic sanctuary inspired by the astronaut Overview Effect.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              ambientAudio
                ? 'bg-[#E8E0FF] text-[#7656D9] border-[#7656D9]/40 font-bold'
                : 'border-[#E9E4F2] text-[#716B83] hover:text-[#252039]'
            }`}
          >
            {ambientAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>432 Hz Drone: {ambientAudio ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleNextPerspective}
            className="px-4 py-2 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] text-xs font-heading font-bold text-[#7656D9] hover:bg-[#E8E0FF] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Next Perspective</span>
          </button>
        </div>
      </div>

      {/* Panoramic Visual Window */}
      <div className="relative rounded-2xl overflow-hidden border border-[#5535A5]/30 bg-gradient-to-b from-[#1C1832] via-[#2D2650] to-[#423972] p-8 tablet:p-12 text-white min-h-[300px] flex flex-col justify-between shadow-soft">
        {/* Ambient Stars */}
        <div className="absolute top-6 left-12 w-1.5 h-1.5 rounded-full bg-white/70 animate-ping" />
        <div className="absolute top-16 right-24 w-1 h-1 rounded-full bg-mint/80" />
        <div className="absolute bottom-28 left-1/3 w-1.5 h-1.5 rounded-full bg-purple-200/60" />
        <div className="absolute top-28 right-12 w-1 h-1 rounded-full bg-white/50" />

        {/* Planet Horizon Curve */}
        <div className="absolute -bottom-40 -left-20 -right-20 h-72 rounded-[100%] bg-gradient-to-t from-[#5535A5] via-[#7656D9]/50 to-transparent border-t-2 border-[#A890FE]/40 filter blur-xs pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <span className="font-mono text-xs uppercase tracking-widest text-mint font-bold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>PERSPECTIVE {promptIdx + 1} OF {CONTEMPLATIVE_PROMPTS.length}</span>
          </span>
          <p className="font-heading text-lg tablet:text-2xl font-medium leading-relaxed max-w-2xl text-slate-100">
            "{CONTEMPLATIVE_PROMPTS[promptIdx]}"
          </p>
        </div>

        <div className="relative z-10 pt-8 flex items-center justify-between text-xs text-purple-200/80 font-sans">
          <span>Artemis-V Habitation Deck Observation</span>
          {xpClaimed && (
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-mono text-[11px] font-bold">
              +50 XP Claimed
            </span>
          )}
        </div>
      </div>

      {/* Non-clinical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-2.5 text-[11px] text-[#716B83]">
        <ShieldCheck className="h-4 w-4 text-[#7656D9] shrink-0" />
        <span>
          Voluntary mindfulness reflection. Designed for relaxation and inner calm during interplanetary cruise.
        </span>
      </div>
    </div>
  );
};

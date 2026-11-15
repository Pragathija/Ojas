import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { gamificationService } from '../../services';

export const BreathingSpaceGame: React.FC = () => {
  const [durationMinutes, setDurationMinutes] = useState(2);
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setSecondsRemaining(durationMinutes * 60);
    setIsActive(false);
    setIsCompleted(false);
  }, [durationMinutes]);

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz gentle tone
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch {}
  };

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setIsCompleted(true);
          playChime();
          // Claim XP
          gamificationService.claimQuest('breathing-space', '2-Minute Box Breathing', 50)
            .then((r) => setXpAwarded(r.xp_awarded))
            .catch(() => setXpAwarded(50));
          return 0;
        }
        return prev - 1;
      });

      setPhaseSeconds((prev) => {
        if (prev <= 1) {
          playChime();
          setPhase((p) => {
            if (p === 'Inhale') return 'Hold';
            if (p === 'Hold') return 'Exhale';
            if (p === 'Exhale') return 'Pause';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, soundEnabled]);

  const toggleActive = () => {
    if (!isActive && !audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {}
    }
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setSecondsRemaining(durationMinutes * 60);
    setPhase('Inhale');
    setPhaseSeconds(4);
    setIsCompleted(false);
    setXpAwarded(null);
  };

  const getCircleScale = () => {
    if (phase === 'Inhale') return 1.35;
    if (phase === 'Hold') return 1.35;
    if (phase === 'Exhale') return 0.85;
    return 0.85;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shadow-xs">
            <Wind className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">Breathing Space</h3>
            <p className="text-xs text-[#716B83] font-sans">
              4-4-4-4 box breathing pacing for natural autonomic nervous system recovery.
            </p>
          </div>
        </div>

        {/* Duration Selectors & Sound Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] text-xs font-mono">
            {[1, 2, 3, 5].map((m) => (
              <button
                key={m}
                onClick={() => setDurationMinutes(m)}
                disabled={isActive}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  durationMinutes === m
                    ? 'bg-white text-[#7656D9] font-bold shadow-xs'
                    : 'text-[#716B83] hover:text-[#252039]'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl border border-[#E9E4F2] text-[#716B83] hover:text-[#7656D9] transition-colors"
            title={soundEnabled ? 'Mute acoustic chime' : 'Enable acoustic chime'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Interactive Visual Breathing Center */}
      <div className="relative py-12 flex flex-col items-center justify-center overflow-hidden">
        {/* Animated Rings */}
        <div
          className="w-56 h-56 rounded-full border border-[#7656D9]/25 flex items-center justify-center transition-all duration-1000 ease-in-out"
          style={{ transform: `scale(${isActive ? getCircleScale() : 1})` }}
        >
          <div
            className="w-44 h-44 rounded-full bg-gradient-to-br from-[#E8E0FF] to-[#FAF9FF] border border-[#7656D9]/40 flex flex-col items-center justify-center shadow-soft transition-all duration-1000 ease-in-out"
            style={{ transform: `scale(${isActive ? (phase === 'Inhale' || phase === 'Hold' ? 1.05 : 0.95) : 1})` }}
          >
            <span className="font-heading font-extrabold text-2xl text-[#7656D9]">
              {isActive ? phase : 'Ready'}
            </span>
            <span className="font-mono text-3xl font-black text-[#252039] mt-1">
              {isActive ? `${phaseSeconds}s` : formatTime(secondsRemaining)}
            </span>
          </div>
        </div>

        {/* Phase Guidance Caption */}
        <p className="mt-8 font-heading font-bold text-sm text-[#716B83]">
          {isActive
            ? phase === 'Inhale'
              ? 'Breathe in slowly through your nose...'
              : phase === 'Hold'
              ? 'Hold breath gently without strain...'
              : phase === 'Exhale'
              ? 'Exhale smoothly through your mouth...'
              : 'Pause before next breath cycle...'
            : 'Click start to begin gentle box breathing.'}
        </p>

        <span className="text-xs font-mono text-[#716B83] mt-1">
          Time Remaining: {formatTime(secondsRemaining)}
        </span>
      </div>

      {/* Completion Modal / Banner */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-heading font-bold text-sm block">Breathing Session Completed</span>
              <p className="text-xs text-emerald-700">
                You have engaged your parasympathetic relaxation response. Routine habits logged.
              </p>
            </div>
          </div>
          {xpAwarded && (
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
              +{xpAwarded} XP Claimed
            </span>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={toggleActive}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#7656D9] to-[#5535A5] text-white font-heading font-bold text-sm shadow-soft flex items-center gap-2 hover:opacity-95 transition-transform active:scale-95 cursor-pointer"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-white" />
              <span>{secondsRemaining < durationMinutes * 60 ? 'Resume' : 'Start Session'}</span>
            </>
          )}
        </button>

        <button
          onClick={resetExercise}
          className="px-5 py-3 rounded-xl border border-[#E9E4F2] text-[#716B83] hover:text-[#252039] font-heading font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Non-clinical Disclaimer Notice */}
      <div className="p-3.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-2.5 text-[11px] text-[#716B83]">
        <ShieldCheck className="h-4 w-4 text-[#7656D9] shrink-0" />
        <span>
          Non-clinical wellness activity. Does not treat or prevent medical or psychiatric conditions. Exit freely at any time.
        </span>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Wind, X } from 'lucide-react';

export interface BreathingSpaceProps {
  onClose?: () => void;
}

type BreathPhase = 'Inhale' | 'Hold (Stillness)' | 'Exhale' | 'Rest (Pause)';

const PHASE_DURATIONS = {
  'Inhale': 4,
  'Hold (Stillness)': 4,
  'Exhale': 4,
  'Rest (Pause)': 4,
};

export const BreathingSpace: React.FC<BreathingSpaceProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [phase, setPhase] = useState<BreathPhase>('Inhale');
  const [cycleTime, setCycleTime] = useState<number>(4);
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(120); // 2 minutes
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [completedCycles, setCompletedCycles] = useState<number>(0);

  // Web Audio Context for peaceful ambient tone
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSoftChime = (freq: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch {
      // Audio not supported or blocked
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && totalSecondsLeft > 0) {
      interval = setInterval(() => {
        setTotalSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });

        setCycleTime((prev) => {
          if (prev <= 1) {
            // Transition phase
            setPhase((curr) => {
              if (curr === 'Inhale') {
                playSoftChime(440); // A4
                return 'Hold (Stillness)';
              } else if (curr === 'Hold (Stillness)') {
                playSoftChime(392); // G4
                return 'Exhale';
              } else if (curr === 'Exhale') {
                playSoftChime(329.63); // E4
                return 'Rest (Pause)';
              } else {
                playSoftChime(523.25); // C5
                setCompletedCycles((c) => c + 1);
                return 'Inhale';
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, totalSecondsLeft, soundEnabled]);

  const handleToggle = () => {
    if (!isActive && soundEnabled) {
      playSoftChime(440);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('Inhale');
    setCycleTime(4);
    setTotalSecondsLeft(120);
    setCompletedCycles(0);
  };

  // Determine expanding/contracting scale
  const getScaleClass = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'Inhale') return 'scale-125 transition-transform duration-[4000ms] ease-in-out';
    if (phase === 'Hold (Stillness)') return 'scale-125';
    if (phase === 'Exhale') return 'scale-75 transition-transform duration-[4000ms] ease-in-out';
    return 'scale-75';
  };

  const minutes = Math.floor(totalSecondsLeft / 60);
  const seconds = totalSecondsLeft % 60;

  return (
    <Card className="p-6 tablet:p-8 space-y-6 border-[#EAE6F2] shadow-soft relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              RESTORATIVE PACING
            </span>
            <Badge variant="purple" size="sm">BOX BREATHING (4-4-4-4)</Badge>
          </div>
          <h2 className="font-heading text-xl tablet:text-2xl font-bold text-content-main mt-1">
            Breathing Space
          </h2>
          <p className="text-xs text-content-secondary mt-0.5">
            A 2-minute autonomous parasympathetic reset. No scores, no evaluation—simply breathe with the rhythm.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-pastel-lavender border-primary/30 text-primary'
                : 'bg-white border-[#EAE6F2] text-content-secondary hover:text-content-main'
            }`}
            title={soundEnabled ? 'Mute ambient chime' : 'Enable soft ambient chime'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[#EAE6F2] bg-white text-content-secondary hover:text-content-main transition-colors"
              title="Close breathing space"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Breathing Bubble Arena */}
      <div className="py-8 flex flex-col items-center justify-center relative min-h-[300px]">
        {/* Soft background glow circles */}
        <div className="absolute w-64 h-64 rounded-full bg-pastel-lavender/60 filter blur-2xl" />
        <div className="absolute w-48 h-48 rounded-full bg-pastel-blue/70 filter blur-xl" />

        {/* Dynamic Expanding/Contracting Breathing Orb */}
        <div
          className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-soft-lg transition-transform ${getScaleClass()} ${
            phase === 'Inhale'
              ? 'bg-gradient-to-tr from-[#EEE8FF] via-[#EAF3FF] to-[#FFFFFF] border-2 border-primary/40'
              : phase === 'Exhale'
              ? 'bg-gradient-to-tr from-[#E9F7F0] via-[#EEE8FF] to-[#FFFFFF] border-2 border-emerald-400/40'
              : 'bg-gradient-to-tr from-[#FAF9FF] via-[#EEE8FF] to-[#FFFFFF] border-2 border-[#EAE6F2]'
          }`}
        >
          <Wind className="h-6 w-6 text-primary mb-1 animate-pulse" />
          <span className="font-heading text-lg font-bold text-content-main tracking-tight">
            {isActive ? phase : 'Ready'}
          </span>
          {isActive && (
            <span className="font-mono text-2xl font-black text-primary mt-1">
              {cycleTime}s
            </span>
          )}
        </div>

        {/* Breathing Subtext Guidance */}
        <div className="mt-8 text-center space-y-1 z-10">
          <p className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
            {isActive
              ? phase === 'Inhale'
                ? 'Gently draw air through your nose...'
                : phase === 'Hold (Stillness)'
                ? 'Rest gently in natural stillness...'
                : phase === 'Exhale'
                ? 'Slowly release breath through your mouth...'
                : 'Pause comfortably before the next breath...'
              : 'Press Start when you are ready to begin.'}
          </p>
          <p className="text-xs text-content-secondary">
            Completed: <strong>{completedCycles} cycles</strong> • Time Remaining: <strong>{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</strong>
          </p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 pt-4 border-t border-[#EAE6F2]">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleToggle}
            className="gap-2 font-heading font-semibold shadow-soft"
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>{totalSecondsLeft < 120 ? 'Resume Breathing' : 'Begin 2-Minute Breathing'}</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleReset}
            className="gap-2 font-heading font-semibold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-content-muted font-sans block">
            Optional countermeasure for microgravity autonomic pacing and pre-sleep relaxation.
          </span>
        </div>
      </div>
    </Card>
  );
};
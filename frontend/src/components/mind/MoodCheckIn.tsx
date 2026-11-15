import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Sparkles, Heart, Smile, Sun, Moon, Cloud, ShieldAlert, Check, Target, Zap, Wind, Lock } from 'lucide-react';

export interface MoodEntry {
  mood: string;
  emoji: string;
  energyLevel: number;
  perceivedStress: number;
  reflection: string;
  timestamp: string;
}

export interface MoodCheckInProps {
  onSave?: (entry: MoodEntry) => void;
  savedToday?: boolean;
}

const MOOD_OPTIONS = [
  { label: 'Calm', icon: Smile, color: 'bg-[#E9F7F0] text-[#19A974] border-[#C2EAD6]', desc: 'At peace, balanced, centered' },
  { label: 'Happy', icon: Sparkles, color: 'bg-[#FFF9E6] text-[#D99A1E] border-[#FDE9B6]', desc: 'Optimistic, engaged, energized' },
  { label: 'Focused', icon: Target, color: 'bg-[#EAF3FF] text-[#2F7BE5] border-[#BFDBFE]', desc: 'Clear-minded, locked into tasks' },
  { label: 'Tired', icon: Moon, color: 'bg-[#F2ECFF] text-[#7656D9] border-[#DDD3F9]', desc: 'Fatigued, ready for recovery' },
  { label: 'Stressed', icon: Zap, color: 'bg-[#FFF1E8] text-[#E06D3B] border-[#FED7AA]', desc: 'Under operational pressure' },
  { label: 'Overwhelmed', icon: Wind, color: 'bg-[#FFEBEB] text-[#D9435F] border-[#FECDD3]', desc: 'High mental load, needing space' },
];

export const MoodCheckIn: React.FC<MoodCheckInProps> = ({ onSave, savedToday = false }) => {
  const [selectedMood, setSelectedMood] = useState<string>('Calm');
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [perceivedStress, setPerceivedStress] = useState<number>(3);
  const [reflection, setReflection] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(savedToday);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MoodEntry = {
      mood: selectedMood,
      emoji: selectedMood,
      energyLevel,
      perceivedStress,
      reflection,
      timestamp: new Date().toISOString(),
    };

    // Save to local storage for privacy
    try {
      const existing = JSON.parse(localStorage.getItem('ojas_mood_history') || '[]');
      existing.push(entry);
      localStorage.setItem('ojas_mood_history', JSON.stringify(existing));
    } catch (err) {
      console.warn('Local storage write skipped:', err);
    }

    if (onSave) onSave(entry);
    setSubmitted(true);
  };

  return (
    <Card className="p-6 tablet:p-8 space-y-6 border-[#EAE6F2] shadow-soft">
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
              SELF-REPORTED STATE
            </span>
            <Badge variant="purple" size="sm">VOLUNTARY</Badge>
          </div>
          <h2 className="font-heading text-xl tablet:text-2xl font-bold text-content-main mt-1">
            How are you feeling in orbit today?
          </h2>
          <p className="text-xs tablet:text-sm text-content-secondary mt-0.5">
            Check in with your mind. This is your private reflective space—not shared with flight control.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pastel-mint border border-[#C2EAD6] text-[#19A974] text-xs font-medium font-sans">
          <Lock className="h-3.5 w-3.5 text-[#19A974]" />
          <span>Private &amp; Device-Encrypted</span>
        </div>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-pastel-mint/60 border border-[#C2EAD6] text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-soft flex items-center justify-center text-primary">
            {(() => {
              const matched = MOOD_OPTIONS.find((m) => m.label === selectedMood);
              const IconComp = matched ? matched.icon : Smile;
              return <IconComp className="h-6 w-6" />;
            })()}
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-content-main">
              Today's Reflection Logged: {selectedMood}
            </h3>
            <p className="text-xs text-content-secondary max-w-md mx-auto mt-1">
              Thank you for tuning in to your wellbeing. Remember, emotional waves during long-duration flight are completely normal.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="text-xs font-sans text-primary border-primary/30 mt-2"
          >
            Update Check-In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-content-secondary uppercase tracking-wider">
              1. Primary State
            </label>
            <div className="grid grid-cols-2 tablet:grid-cols-3 laptop:grid-cols-6 gap-2.5">
              {MOOD_OPTIONS.map((option) => {
                const isSelected = selectedMood === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setSelectedMood(option.label)}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${option.color} ring-2 ring-primary ring-offset-1 font-bold shadow-soft scale-[1.02]`
                        : 'bg-white border-[#EAE6F2] hover:bg-[#FAF9FF] text-content-main'
                    }`}
                  >
                    <div className="mb-2">
                      <option.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-heading font-semibold">{option.label}</span>
                    <span className="text-[10px] text-content-muted leading-tight mt-1 line-clamp-1">
                      {option.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sliders: Energy & Perceived Stress */}
          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6 pt-2">
            {/* Energy Slider */}
            <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-content-secondary uppercase">
                  Vital Energy: {energyLevel} / 10
                </span>
                <span className="text-[11px] font-sans text-content-muted">
                  {energyLevel <= 3 ? 'Resting' : energyLevel <= 7 ? 'Sustained' : 'Peak Energy'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full h-2 bg-[#EEE8FF] rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-mono text-content-muted">
                <span>Depleted</span>
                <span>Balanced</span>
                <span>Vibrant</span>
              </div>
            </div>

            {/* Perceived Stress Slider */}
            <div className="p-4 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-content-secondary uppercase">
                  Perceived Pressure: {perceivedStress} / 10
                </span>
                <span className="text-[11px] font-sans text-content-muted">
                  {perceivedStress <= 3 ? 'Tranquil' : perceivedStress <= 6 ? 'Manageable' : 'Demanding'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={perceivedStress}
                onChange={(e) => setPerceivedStress(Number(e.target.value))}
                className="w-full h-2 bg-[#EEE8FF] rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] font-mono text-content-muted">
                <span>Serene</span>
                <span>Active</span>
                <span>High Load</span>
              </div>
            </div>
          </div>

          {/* Optional Short Reflection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-content-secondary uppercase tracking-wider">
              2. Optional Personal Reflection
            </label>
            <textarea
              rows={2}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="What is occupying your thoughts today? (e.g. Earth views, crew dynamics, mission milestones...)"
              className="w-full p-3.5 text-xs rounded-xl bg-white border border-[#EAE6F2] text-content-main placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-sans resize-none"
            />
          </div>

          {/* Action Row & Disclaimer */}
          <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 pt-2 border-t border-[#EAE6F2]">
            <p className="text-[11px] text-content-muted leading-relaxed font-sans max-w-lg">
              <strong>Human Factors Note:</strong> Mood check-ins are personal self-reflective tools. Ojas does not formulate psychiatric assessments or medical diagnoses from check-ins.
            </p>
            <Button type="submit" variant="primary" size="md" className="gap-2 shrink-0 font-heading font-semibold shadow-soft">
              <Check className="h-4 w-4" />
              <span>Record Check-In</span>
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};
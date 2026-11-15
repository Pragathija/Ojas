import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Flower2, Wind, Sparkles, Check, Heart, Lock, Smile, Target, Moon, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOODS = [
  { label: 'Calm', icon: Smile, color: 'bg-pastel-mint text-emerald-700 border-[#C2EAD6]' },
  { label: 'Happy', icon: Sparkles, color: 'bg-[#FFF9E6] text-[#D99A1E] border-[#FDE9B6]' },
  { label: 'Focused', icon: Target, color: 'bg-pastel-blue text-[#2F7BE5] border-[#BFDBFE]' },
  { label: 'Tired', icon: Moon, color: 'bg-pastel-lavender text-primary border-[#DDD3F9]' },
  { label: 'Stressed', icon: Zap, color: 'bg-pastel-peach text-[#E06D3B] border-[#FED7AA]' },
  { label: 'Overwhelmed', icon: Wind, color: 'bg-[#FFEBEB] text-[#D9435F] border-[#FECDD3]' },
];

export interface MindWellnessCardProps {
  onQuickBreathing?: () => void;
}

export const MindWellnessCard: React.FC<MindWellnessCardProps> = ({ onQuickBreathing }) => {
  const [selectedMood, setSelectedMood] = useState<string>('Calm');
  const [stressLevel, setStressLevel] = useState<number>(3);
  const [shortReflection, setShortReflection] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSaveCheckIn = () => {
    try {
      const history = JSON.parse(localStorage.getItem('ojas_mood_history') || '[]');
      history.push({
        mood: selectedMood,
        energyLevel: 8,
        perceivedStress: stressLevel,
        reflection: shortReflection,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('ojas_mood_history', JSON.stringify(history));
    } catch {
      // Storage fallback
    }
    setSaved(true);
  };

  return (
    <Card className="p-6 border-[#EAE6F2] bg-white shadow-soft space-y-5">
      {/* Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 border-b border-[#EAE6F2] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
              <Flower2 className="h-4 w-4 text-primary" />
              <span>SECTION C • MENTAL RESTORATION</span>
            </span>
            <Badge variant="purple" size="sm">VOLUNTARY</Badge>
          </div>
          <h3 className="font-heading text-lg font-bold text-content-main mt-0.5">
            How are you feeling today in orbit?
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {onQuickBreathing && (
            <Button
              size="sm"
              variant="outline"
              onClick={onQuickBreathing}
              className="gap-1.5 font-heading text-xs font-semibold text-primary border-primary/30"
            >
              <Wind className="h-3.5 w-3.5" />
              <span>2-Min Breathing</span>
            </Button>
          )}
          <Link to="/mind-garden">
            <Button size="sm" variant="secondary" className="text-xs font-heading font-semibold">
              Mind Garden Sanctuary →
            </Button>
          </Link>
        </div>
      </div>

      {saved ? (
        <div className="p-5 rounded-2xl bg-pastel-mint/60 border border-[#C2EAD6] text-center space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full bg-white shadow-xs flex items-center justify-center text-primary">
            {(() => {
              const matched = MOODS.find((m) => m.label === selectedMood);
              const IconComp = matched ? matched.icon : Smile;
              return <IconComp className="h-5 w-5" />;
            })()}
          </div>
          <h4 className="font-heading text-sm font-bold text-content-main">
            Daily Check-In Saved: {selectedMood}
          </h4>
          <p className="text-xs text-content-secondary max-w-md mx-auto">
            Your self-reported reflection is safely stored locally. Take a mindful moment whenever needed today.
          </p>
          <button
            onClick={() => setSaved(false)}
            className="text-xs font-mono font-bold text-primary hover:underline mt-1"
          >
            Edit Check-In
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mood Selector Buttons */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-content-secondary uppercase">
              Select Current Feeling:
            </label>
            <div className="grid grid-cols-2 mobile:grid-cols-3 laptop:grid-cols-6 gap-2">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.label;
                const IconComp = m.icon;
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setSelectedMood(m.label)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? `${m.color} ring-2 ring-primary ring-offset-1 font-bold shadow-xs`
                        : 'bg-[#FAF9FF] border-[#EAE6F2] hover:bg-white text-content-main'
                    }`}
                  >
                    <IconComp className="h-5 w-5 mb-1" />
                    <span className="text-xs font-heading font-semibold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stress Scale & Short Reflection in Row */}
          <div className="grid grid-cols-1 tablet:grid-cols-12 gap-4">
            <div className="tablet:col-span-4 p-3.5 rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-content-secondary uppercase">Stress: {stressLevel}/10</span>
                <span className="text-content-muted text-[11px]">
                  {stressLevel <= 3 ? 'Tranquil' : stressLevel <= 6 ? 'Manageable' : 'High Load'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-[#EEE8FF] rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="tablet:col-span-8 flex gap-2">
              <input
                type="text"
                value={shortReflection}
                onChange={(e) => setShortReflection(e.target.value)}
                placeholder="Optional short reflection for today..."
                className="flex-1 p-3 text-xs rounded-xl bg-[#FAF9FF] border border-[#EAE6F2] text-content-main placeholder:text-content-muted focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all font-sans"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveCheckIn}
                className="shrink-0 font-heading font-semibold text-xs shadow-soft"
              >
                <Check className="h-4 w-4" />
                <span>Save</span>
              </Button>
            </div>
          </div>

          {/* Explicit Safety Invariant Notice */}
          <div className="pt-2 border-t border-[#EAE6F2] flex items-center justify-between text-[11px] font-sans text-content-muted">
            <div className="flex items-center gap-1.5 text-content-secondary">
              <Lock className="h-3.5 w-3.5 text-[#19A974] shrink-0" />
              <span>Self-reported reflection strictly private. Ojas never formulates psychiatric or medical diagnoses.</span>
            </div>
            <span className="font-mono text-[10px] text-primary font-bold">Confidential</span>
          </div>
        </div>
      )}
    </Card>
  );
};
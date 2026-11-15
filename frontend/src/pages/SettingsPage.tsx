import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Sliders,
  Heart,
  Shield,
  Rocket,
  Check,
  Moon,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  Lock,
  Download,
  Trash2,
  Compass,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { pageVariants, cardVariants } from '../lib/animations';

interface AstronautSettingsState {
  // Personalization
  theme: 'space-light' | 'orbital-lavender';
  animationIntensity: 'gentle' | 'dynamic' | 'reduced';
  reducedMotion: boolean;
  ambientSound: boolean;
  soundVolume: number;
  notifications: boolean;
  // Wellness
  breathingDuration: number; // minutes: 2, 3, 5
  dailyReminders: boolean;
  gameDifficulty: 'relaxed' | 'normal' | 'focused';
  privateMoodOnly: boolean;
  // Privacy
  aiContextConsent: boolean;
  journalLocalOnly: boolean;
  allowSurgeonTrendView: boolean;
}

const DEFAULT_SETTINGS: AstronautSettingsState = {
  theme: 'space-light',
  animationIntensity: 'gentle',
  reducedMotion: false,
  ambientSound: true,
  soundVolume: 40,
  notifications: true,
  breathingDuration: 2,
  dailyReminders: true,
  gameDifficulty: 'normal',
  privateMoodOnly: true,
  aiContextConsent: true,
  journalLocalOnly: true,
  allowSurgeonTrendView: true,
};

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'personalization' | 'wellness' | 'privacy' | 'mission'>('profile');
  const [settings, setSettings] = useState<AstronautSettingsState>(() => {
    try {
      const saved = localStorage.getItem('ojas_astronaut_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    localStorage.setItem('ojas_astronaut_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AstronautSettingsState>(key: K, val: AstronautSettingsState[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2400);
  };

  const handleExportData = () => {
    const backup = {
      profile: {
        id: 'ASTRO-001',
        name: 'Commander Sarah Connor',
        callsign: 'Valkyrie',
        mission: 'ARTEMIS-V',
      },
      settings,
      journalHistory: JSON.parse(localStorage.getItem('ojas_journal_entries') || '[]'),
      moodHistory: JSON.parse(localStorage.getItem('ojas_mood_history') || '[]'),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ojas_astronaut_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local game state and cached offline entries? Your server credentials remain safe.')) {
      localStorage.removeItem('ojas_gamif_ASTRO-001');
      localStorage.removeItem('ojas_user_xp');
      alert('Local session cache refreshed.');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-8 max-w-6xl mx-auto"
    >
      {/* Top Header */}
      <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 flex flex-col tablet:flex-row tablet:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold uppercase mb-2">
            <Compass className="h-3.5 w-3.5" />
            <span>ASTRONAUT PROFILE &amp; PREFERENCES</span>
          </div>
          <h1 className="font-heading font-extrabold text-3xl tablet:text-4xl text-[#252039] tracking-tight">
            Astronaut Experience Settings
          </h1>
          <p className="text-sm tablet:text-base text-[#716B83] mt-1 font-sans">
            Customize your space wellness environment, mindfulness pacing, audio ambients, and confidential data controls.
          </p>
        </div>

        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold"
          >
            <Check className="h-4 w-4" />
            <span>Preferences Auto-Saved</span>
          </motion.div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E9E4F2] pb-3">
        {[
          { id: 'profile', label: 'Astronaut Profile', icon: User },
          { id: 'personalization', label: 'Personalization', icon: Sliders },
          { id: 'wellness', label: 'Wellness Preferences', icon: Heart },
          { id: 'privacy', label: 'Data & Privacy', icon: Shield },
          { id: 'mission', label: 'Mission Information', icon: Rocket },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs tablet:text-sm transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#7656D9] text-white shadow-soft'
                  : 'bg-white text-[#716B83] hover:text-[#252039] hover:bg-[#F2EDFF] border border-[#E9E4F2]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab A: Astronaut Profile */}
      {activeTab === 'profile' && (
        <motion.div variants={cardVariants} initial="initial" animate="animate" className="grid grid-cols-1 laptop:grid-cols-12 gap-8">
          <div className="laptop:col-span-4 bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 text-center space-y-4">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-[#7656D9] to-[#9BDCC3] flex items-center justify-center text-white shadow-soft-md">
              <span className="font-heading font-black text-3xl">SC</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-[#252039]">Commander Sarah Connor</h3>
              <p className="font-mono text-xs text-primary font-bold">Callsign: VALKYRIE • ASTRO-001</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="purple" size="sm">MISSION COMMANDER</Badge>
              <Badge variant="normal" size="sm">EVA CERTIFIED</Badge>
            </div>
            <div className="pt-4 border-t border-[#E9E4F2] text-left text-xs font-mono space-y-2.5 text-[#716B83]">
              <div className="flex justify-between">
                <span>Crew Flight Role:</span>
                <span className="font-bold text-[#252039]">Lead Pilot &amp; Payload Specialist</span>
              </div>
              <div className="flex justify-between">
                <span>Bio-Harness ID:</span>
                <span className="font-bold text-[#252039]">HARNESS-ALPHA-9</span>
              </div>
              <div className="flex justify-between">
                <span>Spaceflight Experience:</span>
                <span className="font-bold text-[#252039]">428 Total Days in Orbit</span>
              </div>
            </div>
          </div>

          <div className="laptop:col-span-8 bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
            <h3 className="font-heading font-bold text-lg text-[#252039] border-b border-[#E9E4F2] pb-3">
              Astronaut Account &amp; Flight Credentials
            </h3>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#716B83] uppercase">Full Legal Name</label>
                <input
                  type="text"
                  disabled
                  value="Sarah J. Connor, Ph.D."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] text-sm text-[#252039] font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#716B83] uppercase">Mission Call Sign</label>
                <input
                  type="text"
                  disabled
                  value="VALKYRIE"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] text-sm text-[#252039] font-medium font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#716B83] uppercase">Assigned Spacecraft</label>
                <input
                  type="text"
                  disabled
                  value="Artemis-V Interplanetary Transport"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] text-sm text-[#252039] font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-[#716B83] uppercase">Flight Surgeon Assigned</label>
                <input
                  type="text"
                  disabled
                  value="Dr. Ryan Stone, MD (Johnson Space Center)"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E9E4F2] bg-[#FAF9FF] text-sm text-[#252039] font-medium"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-[#E9E4F2] space-y-2">
              <span className="font-heading font-bold text-xs text-[#252039] uppercase block">
                Crew Identity Notice
              </span>
              <p className="text-xs text-[#716B83] leading-relaxed">
                Core aerospace assignments and biosensor hardware pairings are managed by NASA Houston Flight Control. To request callsign alterations or crew reassignments, contact Mission Operations.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab B: Personalization */}
      {activeTab === 'personalization' && (
        <motion.div variants={cardVariants} initial="initial" animate="animate" className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
          <h3 className="font-heading font-bold text-lg text-[#252039] border-b border-[#E9E4F2] pb-3">
            Interface Appearance &amp; Motion Controls
          </h3>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
            {/* Visual Theme Selection */}
            <div className="p-5 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] space-y-3">
              <span className="font-heading font-bold text-sm text-[#252039] block">Color Theme</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateSetting('theme', 'space-light')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.theme === 'space-light'
                      ? 'border-[#7656D9] bg-white ring-2 ring-[#7656D9]/30 font-bold'
                      : 'border-[#E9E4F2] bg-white hover:border-[#7656D9]/40'
                  }`}
                >
                  <span className="block font-heading text-xs text-[#252039]">Space Light</span>
                  <span className="text-[11px] text-[#716B83]">Clean lavender &amp; white</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('theme', 'orbital-lavender')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    settings.theme === 'orbital-lavender'
                      ? 'border-[#7656D9] bg-white ring-2 ring-[#7656D9]/30 font-bold'
                      : 'border-[#E9E4F2] bg-white hover:border-[#7656D9]/40'
                  }`}
                >
                  <span className="block font-heading text-xs text-[#252039]">Orbital Glow</span>
                  <span className="text-[11px] text-[#716B83]">Soft deep violet accents</span>
                </button>
              </div>
            </div>

            {/* Animation Intensity & Reduced Motion */}
            <div className="p-5 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-heading font-bold text-sm text-[#252039] block">Reduced Motion Mode</span>
                  <span className="text-xs text-[#716B83]">Minimizes celestial shuttle and floating animations</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  className="h-5 w-5 rounded text-[#7656D9] focus:ring-[#7656D9] cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-[#E9E4F2]">
                <span className="text-xs font-mono font-bold text-[#716B83] block mb-2">Space Shuttle Animation Intensity</span>
                <div className="flex gap-2">
                  {(['gentle', 'dynamic', 'reduced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => updateSetting('animationIntensity', lvl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-heading capitalize font-bold cursor-pointer transition-colors ${
                        settings.animationIntensity === lvl
                          ? 'bg-[#7656D9] text-white'
                          : 'bg-white border border-[#E9E4F2] text-[#716B83] hover:text-[#252039]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ambient Soundscape Preference */}
            <div className="p-5 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {settings.ambientSound ? (
                    <Volume2 className="h-5 w-5 text-primary" />
                  ) : (
                    <VolumeX className="h-5 w-5 text-[#716B83]" />
                  )}
                  <div>
                    <span className="font-heading font-bold text-sm text-[#252039] block">Ambient Space Soundscape</span>
                    <span className="text-xs text-[#716B83]">432 Hz harmonic drone in Quiet Orbit &amp; Breathing sessions</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.ambientSound}
                  onChange={(e) => updateSetting('ambientSound', e.target.checked)}
                  className="h-5 w-5 rounded text-[#7656D9] focus:ring-[#7656D9] cursor-pointer"
                />
              </div>

              {settings.ambientSound && (
                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-xs font-mono text-[#716B83]">
                    <span>Soundscape Volume</span>
                    <span>{settings.soundVolume}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.soundVolume}
                    onChange={(e) => updateSetting('soundVolume', Number(e.target.value))}
                    className="w-full accent-[#7656D9] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Daily Habit Reminders */}
            <div className="p-5 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] space-y-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#252039] block">Daily Optional Reminders</span>
                  <span className="text-xs text-[#716B83]">Gentle prompt for morning check-in and evening rest</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => updateSetting('notifications', e.target.checked)}
                className="h-5 w-5 rounded text-[#7656D9] focus:ring-[#7656D9] cursor-pointer"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab C: Wellness Preferences */}
      {activeTab === 'wellness' && (
        <motion.div variants={cardVariants} initial="initial" animate="animate" className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
          <h3 className="font-heading font-bold text-lg text-[#252039] border-b border-[#E9E4F2] pb-3">
            Mindfulness &amp; Game Session Tuning
          </h3>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
            {/* Preferred Box Breathing Duration */}
            <div className="p-5 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] space-y-3">
              <span className="font-heading font-bold text-sm text-[#252039] block">
                Default Box Breathing Session Length
              </span>
              <p className="text-xs text-[#716B83]">
                Sets initial countdown for Breathing Space relaxation cycles.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateSetting('breathingDuration', m)}
                    className={`p-2.5 rounded-xl border text-center font-heading font-bold text-xs cursor-pointer transition-all ${
                      settings.breathingDuration === m
                        ? 'bg-[#7656D9] text-white border-[#7656D9] shadow-soft'
                        : 'bg-white text-[#252039] border-[#E9E4F2] hover:bg-[#F2EDFF]'
                    }`}
                  >
                    {m} Minute{m > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Cognitive Game Difficulty Preference */}
            <div className="p-5 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] space-y-3">
              <span className="font-heading font-bold text-sm text-[#252039] block">
                Game Difficulty Preference
              </span>
              <p className="text-xs text-[#716B83]">
                Adjusts starting speed in Focus Nebula and sequence length in Cosmic Memory.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['relaxed', 'normal', 'focused'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => updateSetting('gameDifficulty', diff)}
                    className={`p-2.5 rounded-xl border text-center font-heading font-bold text-xs capitalize cursor-pointer transition-all ${
                      settings.gameDifficulty === diff
                        ? 'bg-[#7656D9] text-white border-[#7656D9] shadow-soft'
                        : 'bg-white text-[#252039] border-[#E9E4F2] hover:bg-[#F2EDFF]'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab D: Data and Privacy */}
      {activeTab === 'privacy' && (
        <motion.div variants={cardVariants} initial="initial" animate="animate" className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
          <h3 className="font-heading font-bold text-lg text-[#252039] border-b border-[#E9E4F2] pb-3">
            Behavioral Privacy &amp; Data Safeguards
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-sm text-[#252039] block">Local Journal Encryption</span>
                <span className="text-xs text-[#716B83]">Personal thoughts remain on this terminal and are never included in flight telemetry</span>
              </div>
              <input
                type="checkbox"
                checked={settings.journalLocalOnly}
                onChange={(e) => updateSetting('journalLocalOnly', e.target.checked)}
                className="h-5 w-5 rounded text-[#7656D9] focus:ring-[#7656D9] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-sm text-[#252039] block">AI Conversation Context Consent</span>
                <span className="text-xs text-[#716B83]">Allow Ojas AI Companion to reference your previous session notes for personalized coaching</span>
              </div>
              <input
                type="checkbox"
                checked={settings.aiContextConsent}
                onChange={(e) => updateSetting('aiContextConsent', e.target.checked)}
                className="h-5 w-5 rounded text-[#7656D9] focus:ring-[#7656D9] cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl border border-[#E9E4F2] bg-[#FAF9FF] flex items-center justify-between">
              <div>
                <span className="font-heading font-bold text-sm text-[#252039] block">Flight Surgeon Macro Trend Sharing</span>
                <span className="text-xs text-[#716B83]">Allows Dr. Stone to see aggregated resting heart rate and sleep duration averages (no raw thoughts)</span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSurgeonTrendView}
                onChange={(e) => updateSetting('allowSurgeonTrendView', e.target.checked)}
                className="h-5 w-5 rounded text-[#7656D9] focus:ring-[#7656D9] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E9E4F2] flex flex-wrap items-center justify-between gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportData}
              className="gap-2 font-heading font-bold text-xs rounded-xl border border-primary/30"
            >
              <Download className="h-4 w-4 text-primary" />
              <span>Export Personal Wellness Archive</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearCache}
              className="gap-2 font-heading font-bold text-xs rounded-xl text-rose-600 border border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset Local Game Cache</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tab E: Mission Information */}
      {activeTab === 'mission' && (
        <motion.div variants={cardVariants} initial="initial" animate="animate" className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
          <h3 className="font-heading font-bold text-lg text-[#252039] border-b border-[#E9E4F2] pb-3">
            Mission ARTEMIS-V Operational Horizon
          </h3>

          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-5 text-center">
            <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#E9E4F2] space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#716B83] font-bold">Current Flight Phase</span>
              <span className="font-heading font-extrabold text-xl text-[#7656D9] block">Translunar Transit</span>
              <span className="text-xs text-[#716B83]">Course correction complete</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#E9E4F2] space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#716B83] font-bold">Elapsed Mission Time</span>
              <span className="font-heading font-extrabold text-xl text-[#252039] block">Day 42 of 180</span>
              <span className="text-xs text-emerald-600 font-bold">Nominal timeline pacing</span>
            </div>
            <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#E9E4F2] space-y-1">
              <span className="font-mono text-[10px] uppercase text-[#716B83] font-bold">Habitation Environment</span>
              <span className="font-heading font-extrabold text-xl text-[#252039] block">Deck A • Cupola Active</span>
              <span className="text-xs text-[#716B83]">101.3 kPa • 21% O2 nominal</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pastel-lavender/60 border border-[#E8E0FF] space-y-1.5 text-xs text-[#252039]">
            <span className="font-heading font-bold text-primary flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Role-Based Authorization Architecture
            </span>
            <p className="text-[#716B83] leading-relaxed">
              Operational parameters, 100 Hz sensor sampling rates, and clinical alert dispatch thresholds are governed under strict NASA Ground Control jurisdiction. Only authorized Flight Surgeons and Mission Directors can modify telemetry downlink channels from the NASA Administration Portal.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

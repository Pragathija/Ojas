import React, { useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  MoodCheckIn,
  BreathingSpace,
  QuietOrbit,
  ReflectionJournal,
  EmotionalTrendsChart,
} from '../components/mind';
import { Sparkles, Wind, Eye, BookOpen, LineChart, Heart, Flower2 } from 'lucide-react';

export const MindGardenPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'breathing' | 'orbit' | 'journal' | 'trends'>('checkin');

  return (
    <PageContainer>
      {/* Page Hero / Welcome Header */}
      <div className="rounded-2xl border border-[#EAE6F2] bg-gradient-to-r from-[#FAF9FF] via-[#EEE8FF]/40 to-[#EAF3FF]/40 p-6 tablet:p-8 shadow-soft space-y-4">
        <div className="flex flex-col laptop:flex-row laptop:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1.5">
                <Flower2 className="h-4 w-4 text-primary" />
                <span>REST & REFLECTIVE SANCTUARY</span>
              </span>
              <span className="text-[#EAE6F2]">•</span>
              <Badge variant="purple" size="sm">NON-CLINICAL</Badge>
            </div>

            <h1 className="font-heading text-2xl tablet:text-4xl font-extrabold tracking-tight text-content-main">
              Mind Garden
            </h1>

            <p className="text-xs tablet:text-sm text-content-secondary max-w-2xl leading-relaxed">
              A peaceful space wellness sanctuary. Nurture your mind, explore contemplative orbital perspectives, and reflect on your mission journey without operational pressure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white border border-[#EAE6F2] text-xs font-mono shadow-xs">
              <span className="text-content-muted block text-[10px]">CURRENT CREW ENVIRONMENT</span>
              <span className="font-bold text-emerald-600">Quiet Circadian Phase • 0.38G Sim</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="pt-4 border-t border-[#EAE6F2] flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              activeTab === 'checkin'
                ? 'bg-primary text-white border-primary shadow-soft'
                : 'bg-white text-content-secondary border-[#EAE6F2] hover:bg-[#FAF9FF] hover:text-content-main'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mood Check-In</span>
          </button>

          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              activeTab === 'breathing'
                ? 'bg-primary text-white border-primary shadow-soft'
                : 'bg-white text-content-secondary border-[#EAE6F2] hover:bg-[#FAF9FF] hover:text-content-main'
            }`}
          >
            <Wind className="h-3.5 w-3.5" />
            <span>Breathing Space</span>
          </button>

          <button
            onClick={() => setActiveTab('orbit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              activeTab === 'orbit'
                ? 'bg-primary text-white border-primary shadow-soft'
                : 'bg-white text-content-secondary border-[#EAE6F2] hover:bg-[#FAF9FF] hover:text-content-main'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quiet Orbit</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              activeTab === 'journal'
                ? 'bg-primary text-white border-primary shadow-soft'
                : 'bg-white text-content-secondary border-[#EAE6F2] hover:bg-[#FAF9FF] hover:text-content-main'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Reflection Journal</span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
              activeTab === 'trends'
                ? 'bg-primary text-white border-primary shadow-soft'
                : 'bg-white text-content-secondary border-[#EAE6F2] hover:bg-[#FAF9FF] hover:text-content-main'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Emotional Trends</span>
          </button>
        </div>
      </div>

      {/* Main Content Sections Based on Active Tab */}
      <div className="space-y-6">
        {activeTab === 'checkin' && <MoodCheckIn />}
        {activeTab === 'breathing' && <BreathingSpace />}
        {activeTab === 'orbit' && <QuietOrbit />}
        {activeTab === 'journal' && <ReflectionJournal />}
        {activeTab === 'trends' && <EmotionalTrendsChart />}
      </div>
    </PageContainer>
  );
};
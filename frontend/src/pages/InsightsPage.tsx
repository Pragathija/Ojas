import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../layouts/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { dataService } from '../services';
import {
  HealthInsight,
  CountermeasureResearch,
  InsightCategory,
  CountermeasureCategory,
} from '../types/insights';
import {
  InsightOverview,
  InsightCategoryFilter,
  InsightCard,
  InsightExplainability,
  CountermeasureExplorer,
} from '../components/insights';
import { computeInsightExplainability } from '../utils/explainabilityCalculator';
import { Lightbulb, Layers } from 'lucide-react';

const INSIGHT_CATEGORIES: (InsightCategory | 'All')[] = [
  'All',
  'Cardiovascular Adaptation',
  'Autonomic Regulation',
  'Sleep & Circadian Disruption',
  'Musculoskeletal Deconditioning',
  'Radiation Exposure',
  'Exercise Countermeasure Adherence',
];

export const InsightsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialInsightId = searchParams.get('id');
  const initialTab = searchParams.get('tab') === 'countermeasures' ? 'countermeasures' : 'insights';

  // Primary State
  const [activeTab, setActiveTab] = useState<'insights' | 'countermeasures'>(initialTab);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [countermeasures, setCountermeasures] = useState<CountermeasureResearch[]>([]);

  // Filtering & Selection
  const [selectedInsightCategory, setSelectedInsightCategory] = useState<InsightCategory | 'All'>('All');
  const [selectedCountermeasureCategory, setSelectedCountermeasureCategory] = useState<CountermeasureCategory | 'All'>('All');
  const [selectedInsight, setSelectedInsight] = useState<HealthInsight | null>(null);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [insightsData, countermeasuresData] = await Promise.all([
        dataService.insights.getInsights(),
        dataService.insights.getCountermeasures(),
      ]);

      // Dynamically compute explainability for insights with active primary indicators
      const enrichedInsights = await Promise.all(
        insightsData.map(async (ins) => {
          if (ins.relatedIndicatorIds.length > 0) {
            try {
              const primaryIndicatorId = ins.relatedIndicatorIds[0];
              const history = await dataService.health.getMetricHistory(primaryIndicatorId, '30d');
              const vital = await dataService.health.getVitalById(primaryIndicatorId);
              return computeInsightExplainability(ins, history, vital || undefined);
            } catch {
              return ins;
            }
          }
          return ins;
        })
      );

      setInsights(enrichedInsights);
      setCountermeasures(countermeasuresData);

      // Select requested insight or first insight
      if (initialInsightId) {
        const found = enrichedInsights.find((i) => i.id === initialInsightId);
        if (found) {
          setSelectedInsight(found);
        } else if (enrichedInsights.length > 0) {
          setSelectedInsight(enrichedInsights[0]);
        }
      } else if (enrichedInsights.length > 0) {
        setSelectedInsight(enrichedInsights[0]);
      }
    } catch (err) {
      console.error('Failed to load insights workspace:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: insights.length };
    insights.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + 1;
    });
    return counts;
  }, [insights]);

  // Filtered insights
  const filteredInsights = useMemo(() => {
    if (selectedInsightCategory === 'All') return insights;
    return insights.filter((i) => i.category === selectedInsightCategory);
  }, [insights, selectedInsightCategory]);

  const handleSelectInsight = (insight: HealthInsight) => {
    setSelectedInsight(insight);
  };

  const handleNavigateToCountermeasures = (insightId: string) => {
    const targetInsight = insights.find((i) => i.id === insightId);
    if (targetInsight && targetInsight.countermeasureIds.length > 0) {
      const firstCm = countermeasures.find((cm) => cm.id === targetInsight.countermeasureIds[0]);
      if (firstCm) {
        setSelectedCountermeasureCategory(firstCm.category);
      }
    }
    setActiveTab('countermeasures');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleNavigateToResearch = (_paperId?: string) => {
    navigate('/research');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingState label="Auditing Mission Intelligence & Explainability Models..." />
        </div>
      </PageContainer>
    );
  }

  if (hasError) {
    return (
      <PageContainer>
        <ErrorState
          title="Insights Telemetry Signal Interrupted"
          message="Could not initialize mission explainability and countermeasure repository."
          onRetry={loadData}
        />
      </PageContainer>
    );
  }

  const evidenceLinkedCount = insights.filter((i) => i.evidenceClassification !== 'Evidence Unavailable').length;

  return (
    <PageContainer>
      {/* 1. Header & Disclaimers */}
      <InsightOverview
        totalCount={insights.length}
        syntheticCount={insights.length}
        evidenceLinkedCount={evidenceLinkedCount}
        lastSimulatedTimestamp={insights[0]?.simulatedAnalysisTimestamp || new Date().toISOString()}
      />

      {/* 2. Primary Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-cosmos-border pb-3">
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold transition-colors border ${
            activeTab === 'insights'
              ? 'bg-cosmos-accent text-cosmos-bg border-cosmos-accent'
              : 'bg-cosmos-card text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text'
          }`}
        >
          <Lightbulb className="h-4 w-4" />
          <span>MISSION INSIGHTS ({insights.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('countermeasures')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-mono font-bold transition-colors border ${
            activeTab === 'countermeasures'
              ? 'bg-cosmos-accent text-cosmos-bg border-cosmos-accent'
              : 'bg-cosmos-card text-cosmos-text-secondary border-cosmos-border hover:text-cosmos-text'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>COUNTERMEASURE EXPLORER ({countermeasures.length})</span>
        </button>
      </div>

      {/* 3. Main Workspace Content */}
      {activeTab === 'insights' ? (
        <div className="space-y-6">
          {/* Category Filter Bar */}
          <InsightCategoryFilter
            categories={INSIGHT_CATEGORIES}
            selectedCategory={selectedInsightCategory}
            onSelectCategory={setSelectedInsightCategory}
            categoryCounts={categoryCounts}
          />

          {/* Explainability Inspector Panel for Selected Insight */}
          {selectedInsight && (
            <InsightExplainability
              insight={selectedInsight}
              onClose={() => setSelectedInsight(null)}
              onNavigateToCountermeasures={handleNavigateToCountermeasures}
              onNavigateToResearch={handleNavigateToResearch}
            />
          )}

          {/* Grid of Insight Cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs text-cosmos-muted px-1">
              <span>ACTIVE RESEARCH PATTERNS ({filteredInsights.length} AVAILABLE)</span>
              <span>CLICK CARD TO INSPECT EXPLAINABILITY</span>
            </div>
            <div className="grid grid-cols-1 laptop:grid-cols-2 gap-6 items-stretch">
              {filteredInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  isSelected={selectedInsight?.id === insight.id}
                  onSelect={() => handleSelectInsight(insight)}
                  onNavigateToCountermeasures={handleNavigateToCountermeasures}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Countermeasure Explorer Workspace */
        <CountermeasureExplorer
          countermeasures={countermeasures}
          selectedCategory={selectedCountermeasureCategory}
          onSelectCategory={setSelectedCountermeasureCategory}
          onNavigateToResearch={handleNavigateToResearch}
        />
      )}
    </PageContainer>
  );
};

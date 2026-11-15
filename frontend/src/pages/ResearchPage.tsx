import React, { useEffect, useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { dataService } from '../services';
import {
  ResearchPaper,
  ResearchDatasetMeta,
  ResearchObservationPoint,
  DistributionBin,
} from '../types/research';

import {
  ResearchOverview,
  DatasetSummary,
  ResearchFilterBar,
  ResearchTrendChart,
  DistributionChart,
  ValidationPanel,
  LiteratureCard,
  DataProvenance,
  ObservationDetailModal,
} from '../components/research';

export const ResearchPage: React.FC = () => {
  // Data States
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [datasets, setDatasets] = useState<ResearchDatasetMeta[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('ds-hrp-01');

  // Visualization States
  const [selectedVariable, setSelectedVariable] = useState<string>('Bone Mineral Retention Rate');
  const [observations, setObservations] = useState<ResearchObservationPoint[]>([]);
  const [distribution, setDistribution] = useState<DistributionBin[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);

  // Loading / Error
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Categories list
  const categories = ['All', 'Cardiovascular', 'Bone Density', 'Circadian', 'Radiation'];

  // Initial Load
  const loadResearchData = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const [papersData, datasetsData] = await Promise.all([
        dataService.research.getResearchPapers(),
        dataService.research.getDatasetMetadata(),
      ]);

      setPapers(papersData);
      setDatasets(datasetsData);

      // Load initial observation & distribution series
      await loadVariableVisualizations('Bone Mineral Retention Rate');
    } catch (err) {
      console.error('Failed to load research explorer data:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVariableVisualizations = async (variableName: string) => {
    setIsChartLoading(true);
    try {
      const [obsData, distData] = await Promise.all([
        dataService.research.getObservationPoints(variableName),
        dataService.research.getDistributionData(variableName),
      ]);
      setObservations(obsData);
      setDistribution(distData);
    } catch (err) {
      console.error('Failed to load variable visualizations:', err);
      setObservations([]);
      setDistribution([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  useEffect(() => {
    loadResearchData();
  }, []);

  const handleVariableChange = (varName: string) => {
    setSelectedVariable(varName);
    loadVariableVisualizations(varName);
  };

  // Filtered publications
  const filteredPapers = papers.filter((paper) => {
    const matchesCategory =
      selectedCategory === 'All' || paper.focusArea.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingState label="Indexing NASA Biomedical Literature Repositories..." />
        </div>
      </PageContainer>
    );
  }

  if (hasError) {
    return (
      <PageContainer>
        <ErrorState
          title="Research Downlink Signal Interrupted"
          message="Could not load the spaceflight scientific evidence repository."
          onRetry={loadResearchData}
        />
      </PageContainer>
    );
  }

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  return (
    <PageContainer>
      {/* 1. Research Overview Header */}
      <ResearchOverview
        datasets={datasets}
        citationCount={papers.length}
      />

      {/* 2. Interactive Dataset Explorer & Benchmark Repositories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm font-bold tracking-wider uppercase text-content-main">
            Indexed Scientific Datasets &amp; Physiological Models
          </h2>
          <span className="font-mono text-xs text-content-secondary">
            SELECT TO INSPECT VARIABLES
          </span>
        </div>

        <div className="grid grid-cols-1 laptop:grid-cols-2 gap-4">
          {datasets.map((dataset) => (
            <DatasetSummary
              key={dataset.id}
              dataset={dataset}
              isSelected={selectedDatasetId === dataset.id}
              onSelect={() => {
                setSelectedDatasetId(dataset.id);
                if (dataset.availableVariables.length > 0) {
                  handleVariableChange(dataset.availableVariables[0]);
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* 3. Scientific Visualizations Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#EAE6F2] shadow-soft">
          <span className="font-mono text-xs text-content-main uppercase font-semibold">
            Active Variable: <strong className="text-primary font-bold">{selectedVariable}</strong>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-content-muted mr-1">SWITCH VARIABLE:</span>
            {selectedDataset.availableVariables.map((vName) => {
              const isSelected = selectedVariable === vName;
              return (
                <button
                  key={vName}
                  onClick={() => handleVariableChange(vName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    isSelected
                      ? 'bg-primary text-white font-bold border-primary shadow-xs'
                      : 'bg-[#FAF9FF] text-content-secondary border-[#EAE6F2] hover:bg-primary-light/40 hover:text-primary'
                  }`}
                >
                  {vName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dual Chart Row: Trend & Cohort Distribution */}
        <div className="grid grid-cols-1 laptop:grid-cols-12 gap-6 items-start">
          <div className="laptop:col-span-7">
            <ResearchTrendChart
              variableName={selectedVariable}
              observations={observations}
              isLoading={isChartLoading}
            />
          </div>

          <div className="laptop:col-span-5">
            <DistributionChart
              variableName={selectedVariable}
              data={distribution}
              isLoading={isChartLoading}
            />
          </div>
        </div>
      </div>

      {/* 4. Scientific Validation & Methodology */}
      <ValidationPanel />

      {/* 5. Peer-Reviewed Literature & Citations */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-content-main">
            Peer-Reviewed Spaceflight Literature ({filteredPapers.length})
          </h2>
          <span className="font-mono text-xs text-content-muted">NASA NTRS &amp; PUBMED INDEXED</span>
        </div>

        {/* Filter & Search Bar */}
        <ResearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        {filteredPapers.length === 0 ? (
          <EmptyState
            title="No Research Citations Found"
            description="No publications match your category and keyword filter."
          />
        ) : (
          <div className="space-y-4">
            {filteredPapers.map((paper) => (
              <LiteratureCard
                key={paper.id}
                paper={paper}
                onSelect={() => setSelectedPaper(paper)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. Data Provenance & Traceability */}
      <DataProvenance />

      {/* Modal: Deep Paper Detail */}
      <ObservationDetailModal
        paper={selectedPaper}
        isOpen={Boolean(selectedPaper)}
        onClose={() => setSelectedPaper(null)}
      />
    </PageContainer>
  );
};

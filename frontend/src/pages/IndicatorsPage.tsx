import React, { useEffect, useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { dataService } from '../services';
import { VitalSign } from '../types/health';
import { IndicatorOverview, IndicatorGrid, IndicatorDetailPanel } from '../components/indicators';

export const IndicatorsPage: React.FC = () => {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [selectedVital, setSelectedVital] = useState<VitalSign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadVitals = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await dataService.health.getVitalSigns();
      setVitals(data);
      if (data.length > 0) {
        setSelectedVital(data[0]);
      }
    } catch (err) {
      console.error('Failed to load indicators:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVitals();
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingState label="Indexing Physiological Sensor Telemetry..." />
        </div>
      </PageContainer>
    );
  }

  if (hasError) {
    return (
      <PageContainer>
        <ErrorState
          title="Sensor Array Signal Interrupted"
          message="Could not read physiological sensor configuration."
          onRetry={loadVitals}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* 1. Header Overview & Completeness */}
      <IndicatorOverview vitals={vitals} />

      {/* 2. Detail Inspector Panel (if active) */}
      {selectedVital && (
        <IndicatorDetailPanel
          vital={selectedVital}
          onClose={() => setSelectedVital(null)}
        />
      )}

      {/* 3. Responsive Grid of Indicators */}
      <IndicatorGrid
        vitals={vitals}
        selectedVitalId={selectedVital?.id}
        onSelectVital={(vital) => setSelectedVital(vital)}
      />
    </PageContainer>
  );
};

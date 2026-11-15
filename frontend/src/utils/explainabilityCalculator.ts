import { HealthInsight } from '../types/insights';
import { HealthMetricSeries, VitalSign } from '../types/health';
import { MOCK_VITALS } from '../data/mockData';

/**
 * Calculates Ordinary Least Squares (OLS) linear regression slope
 * over an array of numbers: y = a + b*x, where x is index 0..N-1.
 * Returns slope b (change per unit time / observation cycle).
 */
export function calculateOlsSlope(values: number[]): number {
  const n = values.length;
  if (n <= 1) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = values[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  return Number(slope.toFixed(3));
}

/**
 * Dynamically computes explainability metadata from live or mock series data.
 * When underlying series changes, recalculated values flow directly into the explainability panel.
 */
export function computeInsightExplainability(
  insight: HealthInsight,
  series?: HealthMetricSeries[],
  vital?: VitalSign
): HealthInsight {
  if (!series || series.length === 0) {
    return insight;
  }

  const values = series.map((s) => s.value).filter((v) => typeof v === 'number' && Number.isFinite(v));
  const n = values.length;
  if (n === 0) return insight;

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = Number((sum / n).toFixed(2));
  const olsSlope = calculateOlsSlope(values);

  const matchedVital = vital || MOCK_VITALS.find((v) => v.id === insight.relatedIndicatorIds[0]);
  const midpoint = matchedVital
    ? (matchedVital.nominalRange[0] + matchedVital.nominalRange[1]) / 2
    : mean;

  const deviationFromMidpoint = midpoint > 0
    ? Number((((mean - midpoint) / midpoint) * 100).toFixed(1))
    : 0;

  // Clone insight and update explainability dynamically
  const updatedExplainability = {
    ...insight.explainability,
    isDynamicallyCalculated: true,
    sampleCount: n,
    calculatedMetrics: {
      mean,
      olsSlope,
      olsSlopeUnit: matchedVital ? `${matchedVital.unit}/observation` : 'units/step',
      deviationFromMidpointPercent: deviationFromMidpoint,
      corridorStatus: matchedVital && (mean < matchedVital.nominalRange[0] || mean > matchedVital.nominalRange[1])
        ? 'Outside Illustrative Reference Band'
        : 'Within Illustrative Reference Band',
    },
    underlyingObservations: [
      `Evaluated ${n} simulated observation points across ${insight.explainability.observationTimeframe}`,
      `Calculated series sample mean: ${mean} ${matchedVital?.unit || ''}`,
      `Ordinary Least Squares (OLS) slope: ${olsSlope > 0 ? '+' : ''}${olsSlope} ${matchedVital?.unit || ''}/observation`,
      `Deviation from illustrative reference midpoint (${midpoint} ${matchedVital?.unit || ''}): ${deviationFromMidpoint > 0 ? '+' : ''}${deviationFromMidpoint}%`,
    ],
  };

  return {
    ...insight,
    explainability: updatedExplainability,
  };
}

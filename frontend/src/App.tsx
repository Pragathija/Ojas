import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { LoadingState } from './components/common/LoadingState';

// Route Lazy-Loading for Optimal Code-Splitting & Minimal Initial Bundle
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const IndicatorsPage = lazy(() =>
  import('./pages/IndicatorsPage').then((m) => ({ default: m.IndicatorsPage }))
);
const TrendsPage = lazy(() =>
  import('./pages/TrendsPage').then((m) => ({ default: m.TrendsPage }))
);
const ResearchPage = lazy(() =>
  import('./pages/ResearchPage').then((m) => ({ default: m.ResearchPage }))
);
const InsightsPage = lazy(() =>
  import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingState label="Loading Mission Subsystem..." />
  </div>
);

export const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Standalone Landing Page outside AppShell */}
        <Route path="/" element={<LandingPage />} />

        {/* Authenticated / Dashboard AppShell Routes */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/indicators" element={<IndicatorsPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;

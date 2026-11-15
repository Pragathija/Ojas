import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { AstronautLayout } from './layouts/AstronautLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { LoadingState } from './components/common/LoadingState';

// Public Pages
const LandingPage = lazy(() =>
  import('./pages/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const LoginPage = lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);

// Astronaut Portal Pages
const AstronautUniversePage = lazy(() =>
  import('./pages/astronaut/AstronautUniversePage').then((m) => ({ default: m.AstronautUniversePage }))
);
const WellnessGamesPage = lazy(() =>
  import('./pages/astronaut/WellnessGamesPage').then((m) => ({ default: m.WellnessGamesPage }))
);
const OjasAIPage = lazy(() =>
  import('./pages/astronaut/OjasAIPage').then((m) => ({ default: m.OjasAIPage }))
);
const AstronautProfilePage = lazy(() =>
  import('./pages/astronaut/AstronautProfilePage').then((m) => ({ default: m.AstronautProfilePage }))
);
const SpaceJourneyPage = lazy(() =>
  import('./pages/SpaceJourneyPage').then((m) => ({ default: m.SpaceJourneyPage }))
);
const MindGardenPage = lazy(() =>
  import('./pages/MindGardenPage').then((m) => ({ default: m.MindGardenPage }))
);
const AchievementsPage = lazy(() =>
  import('./pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage }))
);
const ResearchPage = lazy(() =>
  import('./pages/ResearchPage').then((m) => ({ default: m.ResearchPage }))
);

// NASA Administration Portal Pages
const CommandCenterPage = lazy(() =>
  import('./pages/admin/CommandCenterPage').then((m) => ({ default: m.CommandCenterPage }))
);
const AstronautManagementPage = lazy(() =>
  import('./pages/admin/AstronautManagementPage').then((m) => ({ default: m.AstronautManagementPage }))
);
const MissionManagementPage = lazy(() =>
  import('./pages/admin/MissionManagementPage').then((m) => ({ default: m.MissionManagementPage }))
);
const HealthMonitoringPage = lazy(() =>
  import('./pages/admin/HealthMonitoringPage').then((m) => ({ default: m.HealthMonitoringPage }))
);
const AuditLogsPage = lazy(() =>
  import('./pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage }))
);
const SystemConfigPage = lazy(() =>
  import('./pages/admin/SystemConfigPage').then((m) => ({ default: m.SystemConfigPage }))
);

// Telemetry & Engineering Pages (AppShell)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const IndicatorsPage = lazy(() =>
  import('./pages/IndicatorsPage').then((m) => ({ default: m.IndicatorsPage }))
);
const TrendsPage = lazy(() =>
  import('./pages/TrendsPage').then((m) => ({ default: m.TrendsPage }))
);
const InsightsPage = lazy(() =>
  import('./pages/InsightsPage').then((m) => ({ default: m.InsightsPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingState label="Connecting to Space Systems..." />
  </div>
);

export const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 1. Public Facing Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Astronaut Wellness Universe Portal */}
        <Route path="/astronaut" element={<AstronautLayout />}>
          <Route index element={<AstronautUniversePage />} />
          <Route path="planets" element={<SpaceJourneyPage />} />
          <Route path="games" element={<WellnessGamesPage />} />
          <Route path="space-arcade" element={<WellnessGamesPage />} />
          <Route path="ai" element={<OjasAIPage />} />
          <Route path="health" element={<DashboardPage />} />
          <Route path="mind-garden" element={<MindGardenPage />} />
          <Route path="science" element={<ResearchPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="profile" element={<AstronautProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* 3. NASA Administration Portal */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<CommandCenterPage />} />
          <Route path="astronauts" element={<AstronautManagementPage />} />
          <Route path="missions" element={<MissionManagementPage />} />
          <Route path="health" element={<HealthMonitoringPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="audit" element={<AuditLogsPage />} />
          <Route path="system" element={<SystemConfigPage />} />
        </Route>

        {/* 4. Legacy and Direct Navigation Compatibility */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/indicators" element={<IndicatorsPage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/mind-garden" element={<MindGardenPage />} />
          <Route path="/space-journey" element={<SpaceJourneyPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;

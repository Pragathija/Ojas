import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';
import { MissionAssistantDrawer } from '../components/assistant/MissionAssistantDrawer';

export const AppShell: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-ground flex text-content-main">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Mobile Drawer Navigation */}
      <MobileNavigation isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Interactive AI Mission Assistant Drawer */}
      <MissionAssistantDrawer isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onToggleMobileNav={() => setMobileNavOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

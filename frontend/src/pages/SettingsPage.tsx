import React, { useEffect, useState } from 'react';
import { PageContainer } from '../layouts/PageContainer';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { LoadingState } from '../components/common/LoadingState';
import { dataService, isUsingMockData } from '../services';
import { AstronautProfile } from '../types/health';

export const SettingsPage: React.FC = () => {
  const [profile, setProfile] = useState<AstronautProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.health.getAstronautProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  if (loading || !profile) {
    return (
      <PageContainer>
        <LoadingState label="Loading Astronaut Profile Profile..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Profile & Settings"
        tagline="Astronaut Identity, Security Credentials & Telemetry Configuration"
        badge={<Badge variant="normal">ACTIVE FLIGHT STATUS</Badge>}
      />

      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <Card className="p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-cosmos-elevated border-2 border-cosmos-border flex items-center justify-center font-heading font-bold text-2xl text-cosmos-accent">
              ER
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-cosmos-text">{profile.name}</h3>
              <p className="font-mono text-xs text-cosmos-muted">{profile.callsign} • {profile.id}</p>
            </div>
            <Badge variant="accent">{profile.missionRole}</Badge>
          </div>

          <div className="pt-4 border-t border-cosmos-border space-y-3 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-cosmos-muted">ASSIGNMENT:</span>
              <span className="text-cosmos-text text-right">{profile.assignedMission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cosmos-muted">EVA CERTIFIED:</span>
              <span className="text-semantic-normal">YES (CLASS 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cosmos-muted">TOTAL SPACEFLIGHT:</span>
              <span className="text-cosmos-text">{profile.totalSpaceflightDays} DAYS</span>
            </div>
          </div>
        </Card>

        {/* Right Columns: System Preferences */}
        <div className="laptop:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="border-b border-cosmos-border pb-3 flex items-center justify-between">
              <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-cosmos-text">
                Telemetry & Downlink Configuration
              </h4>
              <Badge variant={isUsingMockData ? 'caution' : 'normal'}>
                {isUsingMockData ? 'MOCK SIMULATION' : 'LIVE API'}
              </Badge>
            </div>

            <div className="space-y-4">
              <Input
                label="Assigned Mission ID"
                defaultValue={profile.assignedMission}
                readOnly
              />
              <Select
                label="Biometric Sample Interval"
                defaultValue="100hz"
                options={[
                  { value: '100hz', label: '100 Hz (Continuous Mission Telemetry)' },
                  { value: '10hz', label: '10 Hz (Power Conservation Mode)' },
                  { value: '1hz', label: '1 Hz (Minimal Bandwidth Link)' },
                ]}
              />
              <Select
                label="Alert Notification Threshold"
                defaultValue="standard"
                options={[
                  { value: 'sensitive', label: 'High Sensitivity (Trigger on 1σ drift)' },
                  { value: 'standard', label: 'Standard Clinical (Trigger on 2σ drift)' },
                  { value: 'critical_only', label: 'Off-Nominal Only (EVA Critical)' },
                ]}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button size="sm">Save Configuration</Button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

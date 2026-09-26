import React from 'react';
import { SuperAdminControlCenter } from './admin/SuperAdminControlCenter';
import { BirthDetails, PanchangaData, OrganizationProfile, PlanetPosition } from '../types/astrology';

export const AdminControlPanel: React.FC<{
  onClosePanel?: () => void;
  onNavigateApp?: (tab: string) => void;
  initialTab?: string;
  profiles?: BirthDetails[];
  todayPanchanga?: PanchangaData;
  orgProfile?: OrganizationProfile;
  transitPlanets?: PlanetPosition[];
}> = ({ onClosePanel, initialTab, profiles, todayPanchanga, orgProfile, transitPlanets }) => {
  const mappedTab =
    initialTab === 'dashboard' ? 'overview' :
    initialTab === 'samachar' || initialTab === 'samachar_editor' ? 'samachar_editor' :
    initialTab === 'whatsapp' || initialTab === 'daily_whatsapp' ? 'daily_whatsapp' :
    initialTab === 'esewa' ? 'finance' :
    initialTab === 'audit' ? 'security_audit' :
    initialTab === 'admin_roles' ? 'rbac' :
    initialTab === 'pricing' ? 'settings' :
    initialTab === 'members' ? 'memberships' :
    (initialTab || 'overview');

  return (
    <SuperAdminControlCenter
      onClose={onClosePanel}
      initialTab={mappedTab}
      profiles={profiles}
      todayPanchanga={todayPanchanga}
      orgProfile={orgProfile}
      transitPlanets={transitPlanets}
    />
  );
};

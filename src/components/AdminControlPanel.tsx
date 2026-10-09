import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SuperAdminControlCenter } from './admin/SuperAdminControlCenter';
import { BirthDetails, PanchangaData, OrganizationProfile, PlanetPosition } from '../types/astrology';
import { ShieldAlert, RefreshCw, Home, Activity } from 'lucide-react';
import { calculatePanchanga } from '../utils/panchangaEngine';

interface AdminErrorBoundaryProps {
  children: ReactNode;
  onResetToOverview?: () => void;
  onGoHome?: () => void;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminErrorBoundary caught an error in SuperAdminControlCenter:', error, errorInfo);
  }

  handleSelfHeal = () => {
    try {
      this.setState({ hasError: false, error: null });
      this.props.onResetToOverview?.();
    } catch {
      window.location.hash = '#admin_control';
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[520px] w-full bg-[#0C0A09] text-stone-100 border border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-300">
              सुपरएडमिन नियन्त्रण कक्ष सुरक्षित रिकभरी
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              कुनै मोड्युल वा डेटा विश्लेषण गर्दा प्राविधिक समस्या उत्पन्न भयो। प्रणालीलाई सुरक्षित ओभरभ्यु मोडमा फर्काउन तलका विकल्पहरू प्रयोग गर्नुहोस्।
            </p>
            {this.state.error?.message && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-900/60 rounded-xl text-[11px] font-mono text-rose-300 break-words text-left">
                त्रुटि विवरण: {this.state.error.message}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.handleSelfHeal}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Activity className="w-4 h-4" />
              <span>केन्द्रीय ओभरभ्युमा फर्कनुहोस् (Go to Overview)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
              }}
              className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-stone-700 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>पुनः प्रयास गर्नुहोस् (Retry)</span>
            </button>

            {this.props.onGoHome && (
              <button
                type="button"
                onClick={this.props.onGoHome}
                className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-stone-800 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>गृहपृष्ठ (Dashboard) मा फर्कनुहोस्</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AdminControlPanel: React.FC<{
  onClosePanel?: () => void;
  onNavigateApp?: (tab: string) => void;
  initialTab?: string;
  profiles?: BirthDetails[];
  todayPanchanga?: PanchangaData;
  orgProfile?: OrganizationProfile;
  transitPlanets?: PlanetPosition[];
}> = ({
  onClosePanel,
  onNavigateApp,
  initialTab,
  profiles = [],
  todayPanchanga,
  orgProfile,
  transitPlanets = []
}) => {
  const [currentTab, setCurrentTab] = React.useState<string>(() => {
    return initialTab === 'user_control' || initialTab === 'users' || initialTab === 'menu_control' ? 'user_control' :
      initialTab === 'dashboard' ? 'overview' :
      initialTab === 'samachar' || initialTab === 'samachar_editor' ? 'samachar_editor' :
      initialTab === 'whatsapp' || initialTab === 'daily_whatsapp' ? 'daily_whatsapp' :
      initialTab === 'esewa' ? 'finance' :
      initialTab === 'audit' ? 'security_audit' :
      initialTab === 'admin_roles' ? 'rbac' :
      initialTab === 'pricing' ? 'settings' :
      initialTab === 'members' ? 'memberships' :
      initialTab === 'services' || initialTab === 'pages' ? 'pages_services' :
      (initialTab || 'overview');
  });

  React.useEffect(() => {
    if (initialTab) {
      const mapped =
        initialTab === 'user_control' || initialTab === 'users' || initialTab === 'menu_control' ? 'user_control' :
        initialTab === 'dashboard' ? 'overview' :
        initialTab === 'samachar' || initialTab === 'samachar_editor' ? 'samachar_editor' :
        initialTab === 'whatsapp' || initialTab === 'daily_whatsapp' ? 'daily_whatsapp' :
        initialTab === 'esewa' ? 'finance' :
        initialTab === 'audit' ? 'security_audit' :
        initialTab === 'admin_roles' ? 'rbac' :
        initialTab === 'pricing' ? 'settings' :
        initialTab === 'members' ? 'memberships' :
        initialTab === 'services' || initialTab === 'pages' ? 'pages_services' :
        (initialTab || 'overview');
      setCurrentTab(mapped);
    }
  }, [initialTab]);

  const fallbackPanchanga = React.useMemo(() => {
    if (todayPanchanga) return todayPanchanga;
    try {
      return calculatePanchanga(new Date().toISOString().split('T')[0], '06:00', 27.7172, 85.3240, 5.75);
    } catch {
      return undefined;
    }
  }, [todayPanchanga]);

  return (
    <AdminErrorBoundary
      onResetToOverview={() => setCurrentTab('overview')}
      onGoHome={onClosePanel}
    >
      <SuperAdminControlCenter
        onClose={onClosePanel}
        onNavigateApp={onNavigateApp}
        initialTab={currentTab}
        profiles={profiles || []}
        todayPanchanga={todayPanchanga || fallbackPanchanga}
        orgProfile={orgProfile}
        transitPlanets={transitPlanets || []}
      />
    </AdminErrorBoundary>
  );
};

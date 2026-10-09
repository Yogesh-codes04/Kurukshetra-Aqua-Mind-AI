import React, { useEffect, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { ExportModal } from './components/modals/ExportModal';
import { RecordReadingModal } from './components/modals/RecordReadingModal';
import { SimulateScenarioModal } from './components/modals/SimulateScenarioModal';
import { Sidebar } from './components/Sidebar';
import {
  defaultCommunityProfile,
  getScenariosForFacilities,
  initialBudgetState,
  initialFacilities,
  initialMeterReadings,
  initialWaterAvailability,
  societyPresets,
} from './data/mockData';
import { AiInsights } from './screens/AiInsights';
import { BudgetPlanner } from './screens/BudgetPlanner';
import { DashboardOverview } from './screens/DashboardOverview';
import { DemandForecasts } from './screens/DemandForecasts';
import { FacilityManagement } from './screens/FacilityManagement';
import { ReportsAnalytics } from './screens/ReportsAnalytics';
import { SettingsConfig } from './screens/SettingsConfig';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { LanguageCode, ThemeMode, UserProfile } from './types/profile';
import {
  BudgetState,
  CommunityProfile,
  Facility,
  MeterReadingRecord,
  ScarcityScenarioId,
  ScreenId,
  SimulationResult,
  UserRole,
  WaterAvailability,
} from './types/water';
import { runWaterAllocationSimulation } from './utils/allocationEngine';
import { getStoredProfile, saveStoredProfile } from './utils/profileStorage';
import { applyTheme, getStoredTheme, setStoredTheme } from './utils/theme';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('overview');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [budgetState, setBudgetState] = useState<BudgetState>(initialBudgetState);
  const [communityProfile, setCommunityProfile] = useState<CommunityProfile>(defaultCommunityProfile);
  const [hasAppliedPreset, setHasAppliedPreset] = useState<boolean>(false);

  // FEATURE 1: Theme State & Reactive Application
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  // FEATURE 2: User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredProfile());

  // FEATURE 5: Language State
  const [language, setLanguage] = useState<LanguageCode>(() => userProfile.preferredLanguage || 'en');

  // Apply theme on mount and when theme changes; listen for system media query
  useEffect(() => {
    applyTheme(theme);

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handleMediaChange = () => {
        applyTheme('system');
      };
      mq.addEventListener('change', handleMediaChange);
      return () => mq.removeEventListener('change', handleMediaChange);
    }
  }, [theme]);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    saveStoredProfile(updated);
    if (updated.preferredLanguage && updated.preferredLanguage !== language) {
      setLanguage(updated.preferredLanguage);
    }
  };

  const handleSelectLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    const updated = { ...userProfile, preferredLanguage: newLang };
    setUserProfile(updated);
    saveStoredProfile(updated);
  };

  // FEATURE 1 & 2 & 3 & 4: Water Availability, Facilities, Scenarios, and Allocation Simulation
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [waterAvailability, setWaterAvailability] =
    useState<WaterAvailability>(initialWaterAvailability);
  const [selectedScenario, setSelectedScenario] = useState<ScarcityScenarioId>('moderate');
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>('soc-3-societies');

  // Dynamic scenarios adjusted to current facilities' combined baseline
  const activeScenarios = useMemo(() => {
    return getScenariosForFacilities(facilities);
  }, [facilities]);

  // FEATURE 6: Meter Readings Ledger
  const [meterReadings, setMeterReadings] =
    useState<MeterReadingRecord[]>(initialMeterReadings);

  // Real deterministic allocation simulation result
  const [simulationVersion, setSimulationVersion] = useState(0);
  const simulationResult: SimulationResult = useMemo(() => {
    return runWaterAllocationSimulation(facilities, waterAvailability);
  }, [facilities, waterAvailability, simulationVersion]);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Role toggle
  const handleToggleRole = () => {
    setUserRole((prev) => (prev === 'admin' ? 'viewer' : 'admin'));
  };

  // Society demo preset selection
  const handleSelectSocietyPreset = (presetId: string) => {
    setSelectedSocietyId(presetId);
    const preset = societyPresets.find((p) => p.id === presetId);
    if (preset) {
      setFacilities([...preset.facilities]);
      setWaterAvailability((prev) => ({
        ...prev,
        dailySupplyLiters: preset.dailySupplyLiters,
        reservoirCapacityLiters: preset.reservoirCapacityLiters,
        currentStoredLiters: preset.currentStoredLiters,
        incomingSupplyLiters: preset.incomingSupplyLiters,
      }));
      setSelectedScenario('moderate');
    }
  };

  // Scenario selection
  const handleSelectScenario = (id: ScarcityScenarioId) => {
    setSelectedScenario(id);
    if (id !== 'custom') {
      const scenario = activeScenarios.find((s) => s.id === id);
      if (scenario) {
        setWaterAvailability((prev) => ({
          ...prev,
          dailySupplyLiters: scenario.supplyLiters,
          incomingSupplyLiters: scenario.incomingSupplyLiters,
          currentStoredLiters: scenario.currentStoredLiters,
          reservoirCapacityLiters: scenario.reservoirCapacityLiters,
        }));
      }
    }
  };

  // Re-run simulation explicitly
  const handleRunSimulation = () => {
    setSimulationVersion((v) => v + 1);
  };

  // Record reading callback
  const handleRecordReadingSuccess = (newReading: MeterReadingRecord) => {
    setMeterReadings((prev) => [newReading, ...prev]);
  };

  // Preset applied from overview or forecast
  const handleApplyPreset = () => {
    setBudgetState((prev) => ({
      ...prev,
      residential: 52000,
      commercial: 18000,
      facilities: 12000,
      landscaping: 4500,
      activePreset: 'conservation',
    }));
    setHasAppliedPreset(true);
  };

  // Scenario applied from simulation modal
  const handleApplyScenario = (scenario: {
    residential: number;
    commercial: number;
    facilities: number;
    landscaping: number;
  }) => {
    setBudgetState((prev) => ({
      ...prev,
      ...scenario,
      activePreset: 'custom',
    }));
    setHasAppliedPreset(true);
    setCurrentScreen('water-budget');
  };

  const handleNavigate = (screen: ScreenId) => {
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-[#F4F8FB] dark:bg-[#071322] text-[#172B4D] dark:text-[#F1F5F9] antialiased transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentScreen={currentScreen}
          onSelectScreen={handleNavigate}
          userRole={userRole}
          onToggleRole={handleToggleRole}
          unreadCount={2}
          userProfile={userProfile}
          currentLanguage={language}
        />
      </div>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B3C5D]/50 dark:bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#0B1728] z-10 shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-200">
            <Sidebar
              currentScreen={currentScreen}
              onSelectScreen={handleNavigate}
              userRole={userRole}
              onToggleRole={handleToggleRole}
              unreadCount={2}
              userProfile={userProfile}
              currentLanguage={language}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentScreen={currentScreen}
          userRole={userRole}
          onOpenRecordModal={() => setIsRecordModalOpen(true)}
          onOpenNotifications={() => handleNavigate('ai-insights')}
          unreadCount={2}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
          userProfile={userProfile}
          currentTheme={theme}
          onSelectTheme={handleSelectTheme}
          currentLanguage={language}
          onSelectLanguage={handleSelectLanguage}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentScreen === 'overview' && (
            <DashboardOverview
              onNavigate={handleNavigate}
              onOpenRecordModal={() => setIsRecordModalOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
              userRole={userRole}
              facilities={facilities}
              waterAvailability={waterAvailability}
              onUpdateWaterAvailability={(wa) => {
                setWaterAvailability(wa);
                setSelectedScenario('custom');
              }}
              selectedScenario={selectedScenario}
              onSelectScenario={handleSelectScenario}
              scenarios={activeScenarios}
              simulationResult={simulationResult}
              onRunSimulation={handleRunSimulation}
              meterReadings={meterReadings}
              selectedSocietyId={selectedSocietyId}
              onSelectSociety={handleSelectSocietyPreset}
              societyPresets={societyPresets}
            />
          )}

          {currentScreen === 'facilities' && (
            <FacilityManagement
              facilities={facilities}
              onUpdateFacilities={(updated) => {
                setFacilities(updated);
                setSelectedSocietyId('custom');
              }}
              userRole={userRole}
              onNavigateToSimulator={() => handleNavigate('overview')}
              onLoadSocietyPreset={handleSelectSocietyPreset}
              selectedSocietyPresetId={selectedSocietyId}
            />
          )}

          {currentScreen === 'water-budget' && (
            <BudgetPlanner
              userRole={userRole}
              onOpenExport={() => setIsExportModalOpen(true)}
              budgetState={budgetState}
              onUpdateBudget={setBudgetState}
            />
          )}

          {currentScreen === 'forecasts' && (
            <DemandForecasts
              onNavigate={handleNavigate}
              onOpenSimulation={() => setIsSimulationModalOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
              userRole={userRole}
            />
          )}

          {currentScreen === 'ai-insights' && (
            <AiInsights
              onNavigate={handleNavigate}
              onOpenSimulation={() => setIsSimulationModalOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
              userRole={userRole}
              onMitigationApplied={handleApplyPreset}
            />
          )}

          {currentScreen === 'reports' && (
            <ReportsAnalytics
              userRole={userRole}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsConfig
              userRole={userRole}
              communityProfile={communityProfile}
              onUpdateProfile={setCommunityProfile}
              currentTheme={theme}
              onSelectTheme={handleSelectTheme}
              currentLanguage={language}
              onSelectLanguage={handleSelectLanguage}
              onNavigateToProfile={() => handleNavigate('profile')}
            />
          )}

          {currentScreen === 'profile' && (
            <UserProfileScreen
              profile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              currentTheme={theme}
              onSelectTheme={handleSelectTheme}
              currentLanguage={language}
              onSelectLanguage={handleSelectLanguage}
              onNavigateToSimulator={() => handleNavigate('overview')}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <RecordReadingModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={handleRecordReadingSuccess}
      />

      <SimulateScenarioModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onApplyScenario={handleApplyScenario}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}

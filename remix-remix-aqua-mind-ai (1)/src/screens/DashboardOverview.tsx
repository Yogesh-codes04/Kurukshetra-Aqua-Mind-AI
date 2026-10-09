import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Building2,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Droplets,
  HardHat,
  HelpCircle,
  Info,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Facility,
  MeterReadingRecord,
  ScarcityScenario,
  ScarcityScenarioId,
  ScreenId,
  SimulationResult,
  SocietyPreset,
  UserRole,
  WaterAvailability,
} from '../types/water';

interface DashboardOverviewProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenRecordModal: () => void;
  onOpenExport: () => void;
  userRole: UserRole;
  facilities: Facility[];
  waterAvailability: WaterAvailability;
  onUpdateWaterAvailability: (wa: WaterAvailability) => void;
  selectedScenario: ScarcityScenarioId;
  onSelectScenario: (id: ScarcityScenarioId) => void;
  scenarios: ScarcityScenario[];
  simulationResult: SimulationResult;
  onRunSimulation: () => void;
  meterReadings: MeterReadingRecord[];
  selectedSocietyId?: string;
  onSelectSociety?: (societyId: string) => void;
  societyPresets?: SocietyPreset[];
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenRecordModal,
  onOpenExport,
  userRole,
  facilities,
  waterAvailability,
  onUpdateWaterAvailability,
  selectedScenario,
  onSelectScenario,
  scenarios,
  simulationResult,
  onRunSimulation,
  meterReadings,
  selectedSocietyId,
  onSelectSociety,
  societyPresets = [],
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccessToast, setSimSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'chart'>('table');
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null);

  // Form local state for immediate responsive typing
  const [supplyInput, setSupplyInput] = useState<number | ''>(waterAvailability.dailySupplyLiters);
  const [capacityInput, setCapacityInput] = useState<number | ''>(waterAvailability.reservoirCapacityLiters);
  const [storedInput, setStoredInput] = useState<number | ''>(waterAvailability.currentStoredLiters);
  const [incomingInput, setIncomingInput] = useState<number | ''>(waterAvailability.incomingSupplyLiters);
  const [periodInput, setPeriodInput] = useState<number | ''>(waterAvailability.planningPeriodDays);
  const [shortageInput, setShortageInput] = useState<number | ''>(waterAvailability.expectedShortageDurationDays);

  // Synchronize when scenario or external waterAvailability updates
  React.useEffect(() => {
    setSupplyInput(waterAvailability.dailySupplyLiters);
    setCapacityInput(waterAvailability.reservoirCapacityLiters);
    setStoredInput(waterAvailability.currentStoredLiters);
    setIncomingInput(waterAvailability.incomingSupplyLiters);
    setPeriodInput(waterAvailability.planningPeriodDays);
    setShortageInput(waterAvailability.expectedShortageDurationDays);
  }, [waterAvailability]);

  // Validation
  const parsedSupply = Number(supplyInput) || 0;
  const parsedCapacity = Number(capacityInput) || 0;
  const parsedStored = Number(storedInput) || 0;
  const parsedIncoming = Number(incomingInput) || 0;
  const parsedPeriod = Number(periodInput) || 1;
  const parsedShortage = Number(shortageInput) || 0;

  const errors: string[] = [];
  if (parsedSupply < 0) errors.push('Daily available supply cannot be negative.');
  if (parsedCapacity <= 0) errors.push('Reservoir capacity must be greater than zero.');
  if (parsedStored < 0) errors.push('Current stored volume cannot be negative.');
  if (parsedStored > parsedCapacity && parsedCapacity > 0) {
    errors.push(`Current stored water (${parsedStored.toLocaleString()} L) cannot exceed reservoir capacity (${parsedCapacity.toLocaleString()} L).`);
  }
  if (parsedIncoming < 0) errors.push('Expected incoming supply cannot be negative.');
  if (parsedPeriod <= 0) errors.push('Planning period must be at least 1 day.');
  if (parsedShortage < 0) errors.push('Shortage duration cannot be negative.');

  const hasFormErrors = errors.length > 0;

  const handleFieldChange = (field: keyof WaterAvailability, val: number) => {
    const updated = {
      ...waterAvailability,
      [field]: val,
    };
    onUpdateWaterAvailability(updated);
  };

  const handleTriggerSimulate = () => {
    if (hasFormErrors) return;
    setIsSimulating(true);
    setTimeout(() => {
      onRunSimulation();
      setIsSimulating(false);
      setSimSuccessToast(true);
      setTimeout(() => setSimSuccessToast(false), 3000);
    }, 250);
  };

  const activeScenarioObj = scenarios.find((s) => s.id === selectedScenario);

  // Storage percentage calculation
  const storageFillPct =
    parsedCapacity > 0 ? Math.min(100, Math.round((parsedStored / parsedCapacity) * 100)) : 0;

  // Days of storage remaining under current deficit
  const dailyDeficit = Math.max(0, simulationResult.totalDemand - parsedSupply);
  const daysOfStorageRemaining =
    dailyDeficit > 0 && parsedStored > 0
      ? (parsedStored / dailyDeficit).toFixed(1)
      : parsedStored > 0
      ? 'Surplus (No Drawdown)'
      : '0.0';

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-16">
      {/* Simulation Feedback Toast */}
      {simSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3C5D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#00A6C7]/50 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#18A999]" />
          <div className="text-xs">
            <span className="font-bold text-white block">Simulation Recalculated</span>
            <span className="text-[#A0C4DF]">
              Deterministic allocation completed across {facilities.length} facilities.
            </span>
          </div>
        </div>
      )}

      {/* Top Banner: Prototype & Simulation Model Disclaimer */}
      <div className="bg-[#0B3C5D] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#174A6E] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00A6C7]/20 border border-[#00A6C7]/40 flex items-center justify-center shrink-0 mt-0.5">
            <Scale className="w-5 h-5 text-[#00A6C7]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base sm:text-lg tracking-tight">
                AquaMind AI — Water Scarcity & Allocation Simulator
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00A6C7]/30 text-[#67E8F9] text-[10px] font-bold uppercase tracking-wider border border-[#00A6C7]/40">
                Decision-Support Prototype
              </span>
            </div>
            <p className="text-xs text-[#CBD8E4] mt-1 max-w-3xl leading-relaxed">
              Deterministic simulation engine for municipal water scarcity planning. Models emergency trade-offs, protects critical baselines, and distributes scarce water with transparent proportional fairness.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('facilities')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors"
          >
            <Building2 className="w-4 h-4 text-[#00A6C7]" />
            <span>Manage Facilities ({facilities.length})</span>
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold text-white transition-colors"
            title="Export simulation scenario report"
          >
            <Download className="w-4 h-4 text-[#00A6C7]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* FEATURE: HOUSING SOCIETY DEMO SELECTOR (3 Societies + Same Hospital & Company) */}
      {societyPresets.length > 0 && (
        <div className="bg-white dark:bg-[#0D1929] rounded-2xl p-5 border border-[#DFE7EF] dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00A6C7]" />
                <span className="text-xs font-bold text-[#62748A] dark:text-slate-400 uppercase tracking-wider">
                  Housing Society Demo Grids
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  Demo Datasets
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#0B3C5D] dark:text-slate-100">
                Compare 2 to 3 Societies + Same Hospital & Company
              </h2>
            </div>
            <span className="text-xs text-[#62748A] dark:text-slate-400">
              Active Grid:{' '}
              <strong className="text-cyan-600 dark:text-cyan-400">
                {societyPresets.find((s) => s.id === selectedSocietyId)?.shortName || 'Custom'}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {societyPresets.map((soc) => {
              const isSelected = soc.id === selectedSocietyId;
              return (
                <button
                  key={soc.id}
                  type="button"
                  onClick={() => onSelectSociety && onSelectSociety(soc.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-2 ring-cyan-500/20 shadow-xs'
                      : 'border-[#DFE7EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-[#F4F8FB] dark:bg-[#071220]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {soc.shortName}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {soc.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-cyan-700 dark:text-cyan-400">
                    <span>{soc.badge}</span>
                    <span>{soc.facilities.length} Facilities</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Context Summary of the Demo comparison */}
          <div className="pt-2 border-t border-[#DFE7EF] dark:border-slate-800/80 flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] text-[#62748A] dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                <strong>2 to 3 Housing Societies:</strong> Green Valley (30k L) • Silver Oak (22k L) • Palm Meadows (18k L)
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>
                <strong>Shared Critical Anchor:</strong> General County Hospital (35,000 L/day • 25,000 L protected min)
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>
                <strong>Shared Enterprise Anchor:</strong> Metro Tech Park & Commercial Co. (25,000 L/day • 5,000 L min)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 3: SCARCITY SCENARIOS PICKER */}
      <div className="bg-white rounded-2xl p-5 border border-[#DFE7EF] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider">
                Feature 3 — Scarcity Scenarios
              </span>
              <span className="text-[11px] text-[#00A6C7] font-semibold">• Instant Preset Tuning</span>
            </div>
            <h2 className="text-lg font-bold text-[#0B3C5D]">Select Scarcity Stress Scenario</h2>
          </div>
          <span className="text-xs text-[#62748A]">
            Current: <strong className="text-[#0B3C5D]">{activeScenarioObj?.name || 'Custom'}</strong> (
            {parsedSupply.toLocaleString()} L/day)
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-3 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'border-[#00A6C7] bg-[#E1F5FE]/60 ring-2 ring-[#00A6C7]/30 shadow-xs'
                    : 'border-[#DFE7EF] bg-[#F4F8FB] hover:bg-white hover:border-[#CBD8E4]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#0B3C5D]">{sc.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#00A6C7]" />}
                </div>
                <div className="text-base font-extrabold text-[#0B3C5D] tabular-nums">
                  {sc.supplyLiters.toLocaleString()}{' '}
                  <span className="text-[10px] font-normal text-[#62748A]">L/day</span>
                </div>
                <div className="mt-1 text-[10px] font-semibold text-[#00677D] truncate">
                  {sc.badge}
                </div>
              </button>
            );
          })}

          {/* Custom Scenario Button */}
          <button
            onClick={() => onSelectScenario('custom')}
            className={`p-3 rounded-xl border text-left transition-all ${
              selectedScenario === 'custom'
                ? 'border-[#00A6C7] bg-[#E1F5FE]/60 ring-2 ring-[#00A6C7]/30 shadow-xs'
                : 'border-[#DFE7EF] bg-[#F4F8FB] hover:bg-white hover:border-[#CBD8E4]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-[#0B3C5D]">Custom Input</span>
              {selectedScenario === 'custom' && (
                <span className="w-2 h-2 rounded-full bg-[#00A6C7]" />
              )}
            </div>
            <div className="text-xs text-[#62748A] mt-1">Manual Supply Rate</div>
            <div className="text-[10px] font-semibold text-[#00677D] mt-1.5">User Configured</div>
          </button>
        </div>

        {/* Scenario Assumptions Banner */}
        {activeScenarioObj && (
          <div className="mt-3 p-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-xl text-xs text-[#172B4D] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#00A6C7] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-[#0B3C5D]">
                Scenario Assumptions ({activeScenarioObj.name}):
              </span>
              <p className="text-[#62748A]">{activeScenarioObj.assumptions}</p>
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 1: EDITABLE WATER AVAILABILITY FORM & SIMULATE TRIGGER */}
      <div className="bg-white rounded-2xl p-5 border border-[#DFE7EF] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#DFE7EF]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider">
                Feature 1 — Water Availability
              </span>
              <span className="text-[11px] text-[#18A999] font-semibold">• Strict Numeric Validation</span>
            </div>
            <h2 className="text-lg font-bold text-[#0B3C5D]">Hydrological Planning Inputs</h2>
            <p className="text-xs text-[#62748A] mt-0.5">
              Configure daily supply rates (L/day) and static storage reservoirs (L). Negative and impossible storage values are strictly prevented.
            </p>
          </div>

          {/* PROMINENT SIMULATE BUTTON */}
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={handleTriggerSimulate}
              disabled={isSimulating || hasFormErrors}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] ${
                hasFormErrors
                  ? 'bg-[#CBD8E4] text-[#62748A] cursor-not-allowed'
                  : 'bg-[#00A6C7] hover:bg-[#0092AF] text-[#0B3C5D] font-extrabold ring-4 ring-[#00A6C7]/20 hover:ring-[#00A6C7]/30'
              }`}
            >
              <Play
                className={`w-4 h-4 fill-current ${isSimulating ? 'animate-spin' : ''}`}
              />
              <span>{isSimulating ? 'SIMULATING...' : 'SIMULATE ALLOCATION'}</span>
            </button>
          </div>
        </div>

        {/* Validation Errors Display */}
        {hasFormErrors && (
          <div className="my-4 p-3.5 bg-[#FFF0F0] border border-[#FFD0D0] rounded-xl text-xs text-[#D64545] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Input Validation Error: Please correct values before running simulation</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Editable Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {/* Field 1: Available Supply */}
          <div className="p-3.5 rounded-xl border border-[#DFE7EF] bg-[#F4F8FB]/60 focus-within:border-[#00A6C7] focus-within:bg-white transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0B3C5D]">
                Available Water Supply
              </label>
              <span className="text-[10px] font-bold text-[#00677D] bg-[#E1F5FE] px-2 py-0.5 rounded">
                Daily Flow (L/day)
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={supplyInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setSupplyInput(val);
                if (typeof val === 'number') {
                  handleFieldChange('dailySupplyLiters', Math.max(0, val));
                }
              }}
              className="w-full text-lg font-bold text-[#0B3C5D] tabular-nums bg-transparent border-b border-[#CBD8E4] pb-1 focus:outline-none focus:border-[#00A6C7]"
              placeholder="e.g. 90000"
            />
            <span className="text-[11px] text-[#62748A] mt-1 block">
              Total volume allocated across facilities per 24-hour cycle.
            </span>
          </div>

          {/* Field 2: Reservoir Capacity */}
          <div className="p-3.5 rounded-xl border border-[#DFE7EF] bg-[#F4F8FB]/60 focus-within:border-[#00A6C7] focus-within:bg-white transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0B3C5D]">
                Reservoir / Tank Capacity
              </label>
              <span className="text-[10px] font-bold text-[#62748A] bg-[#DFE7EF] px-2 py-0.5 rounded">
                Stored Volume (Litres)
              </span>
            </div>
            <input
              type="number"
              min="1"
              step="10000"
              value={capacityInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setCapacityInput(val);
                if (typeof val === 'number') {
                  handleFieldChange('reservoirCapacityLiters', Math.max(1, val));
                }
              }}
              className="w-full text-lg font-bold text-[#0B3C5D] tabular-nums bg-transparent border-b border-[#CBD8E4] pb-1 focus:outline-none focus:border-[#00A6C7]"
              placeholder="e.g. 500000"
            />
            <span className="text-[11px] text-[#62748A] mt-1 block">
              Total physical storage volume of municipal holding reservoirs.
            </span>
          </div>

          {/* Field 3: Current Stored Water */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              parsedStored > parsedCapacity && parsedCapacity > 0
                ? 'border-[#D64545] bg-[#FFF0F0]'
                : 'border-[#DFE7EF] bg-[#F4F8FB]/60 focus-within:border-[#00A6C7] focus-within:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0B3C5D]">
                Current Stored Water
              </label>
              <span className="text-[10px] font-bold text-[#62748A] bg-[#DFE7EF] px-2 py-0.5 rounded">
                Stored Volume (Litres)
              </span>
            </div>
            <input
              type="number"
              min="0"
              max={parsedCapacity || undefined}
              step="10000"
              value={storedInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setStoredInput(val);
                if (typeof val === 'number') {
                  handleFieldChange('currentStoredLiters', Math.max(0, val));
                }
              }}
              className="w-full text-lg font-bold text-[#0B3C5D] tabular-nums bg-transparent border-b border-[#CBD8E4] pb-1 focus:outline-none focus:border-[#00A6C7]"
              placeholder="e.g. 320000"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-[#62748A]">Reservoir Level:</span>
              <span className="font-bold text-[#0B3C5D] tabular-nums">
                {storageFillPct}% Full ({parsedStored.toLocaleString()} L)
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#DFE7EF] rounded-full overflow-hidden mt-1">
              <div
                className={`h-full transition-all ${
                  storageFillPct < 25
                    ? 'bg-[#D64545]'
                    : storageFillPct < 50
                    ? 'bg-[#F4B942]'
                    : 'bg-[#00A6C7]'
                }`}
                style={{ width: `${Math.min(100, storageFillPct)}%` }}
              />
            </div>
          </div>

          {/* Field 4: Expected Incoming Water Supply */}
          <div className="p-3.5 rounded-xl border border-[#DFE7EF] bg-[#F4F8FB]/60 focus-within:border-[#00A6C7] focus-within:bg-white transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0B3C5D]">
                Expected Incoming Supply
              </label>
              <span className="text-[10px] font-bold text-[#00677D] bg-[#E1F5FE] px-2 py-0.5 rounded">
                Daily Flow (L/day)
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={incomingInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setIncomingInput(val);
                if (typeof val === 'number') {
                  handleFieldChange('incomingSupplyLiters', Math.max(0, val));
                }
              }}
              className="w-full text-lg font-bold text-[#0B3C5D] tabular-nums bg-transparent border-b border-[#CBD8E4] pb-1 focus:outline-none focus:border-[#00A6C7]"
              placeholder="e.g. 85000"
            />
            <span className="text-[11px] text-[#62748A] mt-1 block">
              Continuous recharge / aqueduct inflow to reservoir.
            </span>
          </div>

          {/* Field 5: Planning Period */}
          <div className="p-3.5 rounded-xl border border-[#DFE7EF] bg-[#F4F8FB]/60 focus-within:border-[#00A6C7] focus-within:bg-white transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0B3C5D]">
                Planning Period
              </label>
              <span className="text-[10px] font-bold text-[#62748A] bg-[#DFE7EF] px-2 py-0.5 rounded">
                Horizon (Days)
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="90"
              value={periodInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setPeriodInput(val);
                if (typeof val === 'number') {
                  handleFieldChange('planningPeriodDays', Math.max(1, val));
                }
              }}
              className="w-full text-lg font-bold text-[#0B3C5D] tabular-nums bg-transparent border-b border-[#CBD8E4] pb-1 focus:outline-none focus:border-[#00A6C7]"
              placeholder="e.g. 7"
            />
            <span className="text-[11px] text-[#62748A] mt-1 block">
              Horizon for statutory rationing schedule & reserve burn.
            </span>
          </div>

          {/* Field 6: Expected Shortage Duration */}
          <div className="p-3.5 rounded-xl border border-[#DFE7EF] bg-[#F4F8FB]/60 focus-within:border-[#00A6C7] focus-within:bg-white transition-all">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#0B3C5D]">
                Expected Shortage Duration
              </label>
              <span className="text-[10px] font-bold text-[#62748A] bg-[#DFE7EF] px-2 py-0.5 rounded">
                Drought Window (Days)
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="90"
              value={shortageInput}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setShortageInput(val);
                if (typeof val === 'number') {
                  handleFieldChange('expectedShortageDurationDays', Math.max(0, val));
                }
              }}
              className="w-full text-lg font-bold text-[#0B3C5D] tabular-nums bg-transparent border-b border-[#CBD8E4] pb-1 focus:outline-none focus:border-[#00A6C7]"
              placeholder="e.g. 5"
            />
            <span className="text-[11px] text-[#62748A] mt-1 block">
              Projected calendar duration of curtailed pipeline feed.
            </span>
          </div>
        </div>
      </div>

      {/* FEATURE 5: RESULTS DASHBOARD — 6 TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* KPI 1: Available Supply */}
        <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1.5">
              <span>Available Supply</span>
              <Droplets className="w-4 h-4 text-[#00A6C7]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B3C5D] tabular-nums">
              {simulationResult.availableSupply.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#62748A]">L/day</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DFE7EF] text-[11px] text-[#62748A]">
            Simulated flow available
          </div>
        </div>

        {/* KPI 2: Total Demand */}
        <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1.5">
              <span>Total Demand</span>
              <Layers className="w-4 h-4 text-[#0B3C5D]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B3C5D] tabular-nums">
              {simulationResult.totalDemand.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#62748A]">L/day</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DFE7EF] text-[11px] text-[#62748A]">
            Combined facility baselines
          </div>
        </div>

        {/* KPI 3: Total Allocated */}
        <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1.5">
              <span>Total Allocated</span>
              <CheckCircle2 className="w-4 h-4 text-[#18A999]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B3C5D] tabular-nums">
              {simulationResult.totalAllocated.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#62748A]">L/day</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DFE7EF] text-[11px] font-semibold text-[#18A999]">
            {(
              (simulationResult.totalAllocated / (simulationResult.totalDemand || 1)) *
              100
            ).toFixed(1)}
            % of demand met
          </div>
        </div>

        {/* KPI 4: Total Unmet Demand */}
        <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1.5">
              <span>Unmet Demand</span>
              <TrendingDown className="w-4 h-4 text-[#D64545]" />
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold tabular-nums ${
                simulationResult.totalUnmetDemand > 0 ? 'text-[#D64545]' : 'text-[#18A999]'
              }`}
            >
              {simulationResult.totalUnmetDemand.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#62748A]">L/day</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DFE7EF] text-[11px] text-[#62748A]">
            {simulationResult.totalUnmetDemand > 0
              ? `${(
                  (simulationResult.totalUnmetDemand / (simulationResult.totalDemand || 1)) *
                  100
                ).toFixed(1)}% community shortage`
              : 'Zero shortage (100% fulfilled)'}
          </div>
        </div>

        {/* KPI 5: Remaining Reserve */}
        <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1.5">
              <span>Remaining Reserve</span>
              <Database className="w-4 h-4 text-[#00A6C7]" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#0B3C5D] tabular-nums">
              {simulationResult.remainingReserve.toLocaleString()}{' '}
              <span className="text-xs font-normal text-[#62748A]">L/day</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DFE7EF] text-[11px] text-[#62748A]">
            Storage Buffer: {daysOfStorageRemaining} days
          </div>
        </div>

        {/* KPI 6: Critical Facility Protection */}
        <div
          className={`rounded-xl p-4 border shadow-2xs flex flex-col justify-between ${
            simulationResult.criticalDeficitCount > 0
              ? 'bg-[#FFF0F0] border-[#FFD0D0]'
              : 'bg-white border-[#DFE7EF]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-1.5">
              <span
                className={
                  simulationResult.criticalDeficitCount > 0
                    ? 'text-[#D64545]'
                    : 'text-[#62748A]'
                }
              >
                Critical Status
              </span>
              {simulationResult.criticalDeficitCount > 0 ? (
                <ShieldAlert className="w-4 h-4 text-[#D64545]" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-[#18A999]" />
              )}
            </div>
            <div
              className={`text-xl sm:text-2xl font-bold tabular-nums ${
                simulationResult.criticalDeficitCount > 0
                  ? 'text-[#D64545]'
                  : 'text-[#18A999]'
              }`}
            >
              {simulationResult.criticalDeficitCount > 0
                ? `${simulationResult.criticalDeficitCount} Deficit!`
                : '100% Protected'}
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#DFE7EF] text-[11px]">
            {simulationResult.criticalDeficitCount > 0 ? (
              <span className="text-[#D64545] font-semibold">
                -{simulationResult.criticalUnmetLiters.toLocaleString()} L min deficit
              </span>
            ) : (
              <span className="text-[#18A999] font-medium">All vital minimums met</span>
            )}
          </div>
        </div>
      </div>

      {/* CRITICAL SHORTAGE WARNING BANNER IF SUB-MINIMUM */}
      {!simulationResult.allMinimumsMet && (
        <div className="bg-[#FFF0F0] border-2 border-[#D64545] rounded-2xl p-5 shadow-sm text-[#821E1E]">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-6 h-6 text-[#D64545] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-[#D64545]">
                CRITICAL SHORTAGE: All Protected Minimums CANNOT Be Met
              </h3>
              <p className="text-xs sm:text-sm text-[#A82828] leading-relaxed">
                Available daily supply ({simulationResult.availableSupply.toLocaleString()} L/day) is below the statutory life-safety baseline sum across facilities. The allocation engine has instituted emergency triage rationing: non-essential and commercial facilities are reduced to zero to prevent total catastrophic failure of emergency health facilities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 5: BAR CHART & ALLOCATION TABLE DUAL VIEW */}
      <div className="bg-white rounded-2xl border border-[#DFE7EF] shadow-2xs overflow-hidden">
        {/* Table & Chart Tab Toggle */}
        <div className="p-5 border-b border-[#DFE7EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider">
                Feature 5 — Results Dashboard
              </span>
              <span className="text-[11px] font-semibold text-[#00A6C7]">
                • Facility-Level Allocation
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0B3C5D]">
              Demand vs Allocation vs Minimum Requirement
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-[#F4F8FB] border border-[#DFE7EF] rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'table'
                    ? 'bg-[#0B3C5D] text-white shadow-xs'
                    : 'text-[#62748A] hover:text-[#172B4D]'
                }`}
              >
                Allocation Table
              </button>
              <button
                onClick={() => setActiveTab('chart')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'chart'
                    ? 'bg-[#0B3C5D] text-white shadow-xs'
                    : 'text-[#62748A] hover:text-[#172B4D]'
                }`}
              >
                Comparison Bar Chart
              </button>
            </div>

            <button
              onClick={onOpenExport}
              className="p-2 text-[#62748A] hover:text-[#0B3C5D] hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-xl transition-colors"
              title="Export Table Data"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: FACILITY ALLOCATION TABLE */}
        {activeTab === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FB] border-b border-[#DFE7EF] text-[#62748A] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Facility & Sector</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3 text-right">Daily Demand</th>
                  <th className="py-3 px-3 text-right">Min Required</th>
                  <th className="py-3 px-3 text-right">Allocated Water</th>
                  <th className="py-3 px-3 text-right">Unmet Deficit</th>
                  <th className="py-3 px-4 text-center">% Fulfilled</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Allocation Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE7EF]">
                {simulationResult.facilityAllocations.map((fa) => {
                  const isCriticalAlert = fa.priority === 'Critical' && !fa.minMet;
                  return (
                    <tr
                      key={fa.facilityId}
                      className={`hover:bg-[#F4F8FB]/70 transition-colors ${
                        isCriticalAlert ? 'bg-[#FFF5F5]' : ''
                      }`}
                    >
                      {/* Facility Name & Sector */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0B3C5D] text-xs sm:text-sm">
                          {fa.facilityName}
                        </div>
                        <div className="text-[11px] text-[#62748A] flex items-center gap-1.5 mt-0.5">
                          <span>{fa.type}</span>
                          <span>•</span>
                          <span>{fa.peopleProtected.toLocaleString()} people served</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            fa.priority === 'Critical'
                              ? 'bg-[#FFF0F0] text-[#D64545] border border-[#FFD0D0]'
                              : fa.priority === 'High'
                              ? 'bg-[#FFF8E6] text-[#B76E00] border border-[#FFE4A3]'
                              : fa.priority === 'Medium'
                              ? 'bg-[#E1F5FE] text-[#00677D] border border-[#B3E5FC]'
                              : 'bg-[#F4F8FB] text-[#62748A] border border-[#DFE7EF]'
                          }`}
                        >
                          {fa.priority}
                        </span>
                      </td>

                      {/* Daily Demand */}
                      <td className="py-3 px-3 text-right font-medium text-[#172B4D] tabular-nums">
                        {fa.demandLiters.toLocaleString()} L
                      </td>

                      {/* Minimum Required */}
                      <td className="py-3 px-3 text-right font-medium text-[#18A999] tabular-nums">
                        {fa.minLiters.toLocaleString()} L
                      </td>

                      {/* Allocated Water */}
                      <td className="py-3 px-3 text-right font-bold text-[#0B3C5D] tabular-nums text-sm">
                        {fa.allocatedLiters.toLocaleString()} L
                      </td>

                      {/* Unmet Deficit */}
                      <td className="py-3 px-3 text-right tabular-nums">
                        {fa.unmetLiters > 0 ? (
                          <span className="font-bold text-[#D64545]">
                            -{fa.unmetLiters.toLocaleString()} L
                          </span>
                        ) : (
                          <span className="text-[#18A999] font-medium">0 L</span>
                        )}
                      </td>

                      {/* % Fulfilled */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[#F4F8FB] border border-[#DFE7EF] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                fa.fulfilledPercentage >= 100
                                  ? 'bg-[#18A999]'
                                  : fa.fulfilledPercentage >= 70
                                  ? 'bg-[#00A6C7]'
                                  : fa.fulfilledPercentage >= 40
                                  ? 'bg-[#F4B942]'
                                  : 'bg-[#D64545]'
                              }`}
                              style={{ width: `${Math.min(100, fa.fulfilledPercentage)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[#0B3C5D] tabular-nums shrink-0 w-10 text-right">
                            {fa.fulfilledPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {fa.status === 'fully_met' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
                            100% Met
                          </span>
                        ) : fa.status === 'partially_met' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E1F5FE] text-[#00677D] border border-[#B3E5FC]">
                            Proportional Surplus
                          </span>
                        ) : fa.status === 'minimum_only' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF8E6] text-[#B76E00] border border-[#FFE4A3]">
                            Min Baseline Only
                          </span>
                        ) : fa.status === 'critical_deficit' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF0F0] text-[#D64545] border border-[#FFD0D0]">
                            Below Minimum
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F8FB] text-[#62748A] border border-[#DFE7EF]">
                            Curtailed (0 L)
                          </span>
                        )}
                      </td>

                      {/* Allocation Rationale */}
                      <td className="py-3 px-4 text-[#62748A] max-w-xs text-[11px] leading-relaxed">
                        {fa.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-[#F4F8FB] font-bold text-[#0B3C5D] border-t-2 border-[#DFE7EF]">
                <tr>
                  <td className="py-3 px-4">Total ({facilities.length} Facilities)</td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {simulationResult.totalDemand.toLocaleString()} L
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#18A999]">
                    {facilities.reduce((s, f) => s + f.minLiters, 0).toLocaleString()} L
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-sm text-[#0B3C5D]">
                    {simulationResult.totalAllocated.toLocaleString()} L
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums text-[#D64545]">
                    -{simulationResult.totalUnmetDemand.toLocaleString()} L
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums">
                    {(
                      (simulationResult.totalAllocated / (simulationResult.totalDemand || 1)) *
                      100
                    ).toFixed(1)}
                    % Overall
                  </td>
                  <td colSpan={2} className="py-3 px-4 text-xs font-normal text-[#62748A]">
                    Simulated deterministic allocation
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* TAB 2: COMPARISON BAR CHART */}
        {activeTab === 'chart' && (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-[#DFE7EF]">
              <div className="text-xs text-[#62748A]">
                Hover over facility bars to inspect demand, allocation, and protected thresholds.
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#0B3C5D]" />
                  <span className="text-[#0B3C5D]">Daily Demand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#00A6C7]" />
                  <span className="text-[#00A6C7]">Allocated Water</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#18A999] border border-[#18A999]" />
                  <span className="text-[#18A999]">Minimum Required</span>
                </div>
              </div>
            </div>

            {/* SVG Responsive Bar Chart */}
            <div className="space-y-5">
              {simulationResult.facilityAllocations.map((fa) => {
                const maxBarVal = Math.max(
                  ...simulationResult.facilityAllocations.map((f) => f.demandLiters),
                  40000
                );
                const demandWidthPct = (fa.demandLiters / maxBarVal) * 100;
                const allocatedWidthPct = (fa.allocatedLiters / maxBarVal) * 100;
                const minWidthPct = (fa.minLiters / maxBarVal) * 100;

                const isHovered = hoveredFacilityId === fa.facilityId;

                return (
                  <div
                    key={fa.facilityId}
                    onMouseEnter={() => setHoveredFacilityId(fa.facilityId)}
                    onMouseLeave={() => setHoveredFacilityId(null)}
                    className={`p-3 rounded-xl border transition-all ${
                      isHovered
                        ? 'border-[#00A6C7] bg-[#F4F8FB] shadow-xs'
                        : 'border-[#DFE7EF] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B3C5D] text-sm">
                          {fa.facilityName}
                        </span>
                        <span className="text-[#62748A]">({fa.type})</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E1F5FE] text-[#00677D]">
                          {fa.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs tabular-nums">
                        <span>
                          Demand: <strong>{fa.demandLiters.toLocaleString()} L</strong>
                        </span>
                        <span>•</span>
                        <span className="text-[#00A6C7] font-bold">
                          Allocated: {fa.allocatedLiters.toLocaleString()} L (
                          {fa.fulfilledPercentage.toFixed(0)}%)
                        </span>
                        <span>•</span>
                        <span className="text-[#18A999]">
                          Min: {fa.minLiters.toLocaleString()} L
                        </span>
                      </div>
                    </div>

                    {/* Tri-Bar Visual */}
                    <div className="space-y-1.5">
                      {/* Demand Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#62748A] w-16 shrink-0">Demand:</span>
                        <div className="flex-1 h-3 bg-[#F4F8FB] rounded overflow-hidden">
                          <div
                            className="h-full bg-[#0B3C5D] rounded transition-all"
                            style={{ width: `${demandWidthPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Allocated Bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#00A6C7] font-bold w-16 shrink-0">
                          Allocated:
                        </span>
                        <div className="flex-1 h-3 bg-[#F4F8FB] rounded overflow-hidden">
                          <div
                            className={`h-full rounded transition-all ${
                              fa.allocatedLiters < fa.minLiters
                                ? 'bg-[#D64545]'
                                : 'bg-[#00A6C7]'
                            }`}
                            style={{ width: `${allocatedWidthPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Minimum Threshold Marker */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#18A999] font-semibold w-16 shrink-0">
                          Min Req:
                        </span>
                        <div className="flex-1 h-2 bg-[#F4F8FB] rounded overflow-hidden">
                          <div
                            className="h-full bg-[#18A999] rounded transition-all"
                            style={{ width: `${minWidthPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 5: EXPLAINABILITY ENGINE ("Why Water Was Distributed This Way") */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#DFE7EF] shadow-2xs">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#DFE7EF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E1F5FE] text-[#00A6C7] flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#00A6C7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider">
                  Deterministic Audit Trail
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#1B5E20]">
                  Verifiable Math
                </span>
              </div>
              <h2 className="text-lg font-bold text-[#0B3C5D]">
                Why Water Was Distributed This Way
              </h2>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#62748A]">
            <Clock className="w-3.5 h-3.5" />
            <span>Computed: {new Date(simulationResult.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* High-Level Overview */}
        <div className="my-4 p-4 rounded-xl bg-[#F4F8FB] border border-[#DFE7EF] text-sm text-[#0B3C5D] font-medium leading-relaxed">
          {simulationResult.explanation}
        </div>

        {/* Chronological Step-by-Step Decision Logic */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#62748A] uppercase tracking-wider">
            Chronological Algorithm Execution Steps:
          </h3>
          <div className="space-y-2">
            {simulationResult.stepExplanations.map((step, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-[#DFE7EF]/80 bg-white flex items-start gap-2.5 text-xs text-[#172B4D]"
              >
                <div className="w-5 h-5 rounded-full bg-[#0B3C5D] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="leading-relaxed">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trade-off Rationale Callouts */}
        {simulationResult.tradeOffNotes.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[#DFE7EF]">
            <h3 className="text-xs font-bold text-[#D64545] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#D64545]" />
              <span>Simulated Policy Trade-offs & Compromises:</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {simulationResult.tradeOffNotes.map((to, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-[#FFF8E6] border border-[#FFE4A3] rounded-lg text-xs text-[#875E03] flex items-start gap-2"
                >
                  <span className="font-bold text-[#B76E00]">•</span>
                  <span>{to}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FEATURE 6: RECENT METER LOGS PREVIEW */}
      <div className="bg-white rounded-2xl p-5 border border-[#DFE7EF] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#62748A] uppercase tracking-wider">
                Feature 6 — Meter Readings
              </span>
              <span className="text-[11px] font-semibold text-[#00A6C7]">
                • Field Ledger Verification
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0B3C5D]">Recent Meter Logs</h2>
            <p className="text-xs text-[#62748A] mt-0.5">
              Explicit distinction between manual field entries and automated sensor outputs.
            </p>
          </div>

          <button
            onClick={onOpenRecordModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99] shrink-0"
          >
            <Plus className="w-4 h-4 text-[#00A6C7]" />
            <span>Record New Reading</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8FB] border-b border-[#DFE7EF] text-[#62748A] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Zone / Sub-Meter</th>
                <th className="py-2.5 px-3">Source Attribution</th>
                <th className="py-2.5 px-3 text-right">Measured Volume</th>
                <th className="py-2.5 px-3">Reading Mode</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Technician Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE7EF]">
              {meterReadings.slice(0, 5).map((reading) => (
                <tr key={reading.id} className="hover:bg-[#F4F8FB]/50 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-[#0B3C5D]">
                    {reading.zone}
                  </td>
                  <td className="py-2.5 px-3">
                    {reading.source === 'manual' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E6] text-[#B76E00] border border-[#FFE4A3]">
                        <HardHat className="w-3 h-3 text-[#B76E00]" />
                        Manual Field Entry
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E1F5FE] text-[#00677D] border border-[#B3E5FC]">
                        <Cpu className="w-3 h-3 text-[#00A6C7]" />
                        Sensor Source
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#0B3C5D] tabular-nums">
                    {reading.volume.toLocaleString()} L
                  </td>
                  <td className="py-2.5 px-3 capitalize text-[#62748A]">
                    {reading.readingType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-[#62748A] whitespace-nowrap">
                    {new Date(reading.readingDate).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-[#62748A] max-w-xs truncate">
                    {reading.technicianNotes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

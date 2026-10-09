import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  CloudRain,
  Download,
  Gavel,
  Lock,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Verified,
} from 'lucide-react';
import { BudgetState, UserRole } from '../types/water';

interface BudgetPlannerProps {
  userRole: UserRole;
  onOpenExport: () => void;
  budgetState: BudgetState;
  onUpdateBudget: (newState: BudgetState) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  userRole,
  onOpenExport,
  budgetState,
  onUpdateBudget,
}) => {
  const [previewActive, setPreviewActive] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const totalCapacity = budgetState.totalAvailable; // 100,000 L
  const totalAllocated =
    budgetState.residential +
    budgetState.commercial +
    budgetState.facilities +
    budgetState.landscaping +
    budgetState.reserveLocked;
  const remainingBuffer = totalCapacity - totalAllocated;
  const allocatedPct = ((totalAllocated / totalCapacity) * 100).toFixed(1);

  const isOverBudget = totalAllocated > totalCapacity;
  const isResidentialDeficit = budgetState.residential < 45000;

  const handleSectorChange = (sector: keyof Omit<BudgetState, 'totalAvailable' | 'reserveLocked' | 'activePreset'>, val: number) => {
    onUpdateBudget({
      ...budgetState,
      [sector]: Math.max(0, val),
      activePreset: 'custom',
    });
  };

  const handlePresetSelect = (preset: 'standard' | 'conservation' | 'custom') => {
    if (preset === 'standard') {
      onUpdateBudget({
        ...budgetState,
        residential: 52000,
        commercial: 20000,
        facilities: 12000,
        landscaping: 7500,
        activePreset: 'standard',
      });
    } else if (preset === 'conservation') {
      onUpdateBudget({
        ...budgetState,
        residential: 52000,
        commercial: 18000,
        facilities: 10500,
        landscaping: 4500,
        activePreset: 'conservation',
      });
    } else {
      onUpdateBudget({
        ...budgetState,
        activePreset: 'custom',
      });
    }
  };

  const handleApplyRecommendedPlan = () => {
    onUpdateBudget({
      ...budgetState,
      residential: 52000,
      commercial: 18000,
      facilities: 12000,
      landscaping: 4500,
      activePreset: 'conservation',
    });
    setSaveToast('Recommended 5,000 L conservation plan applied!');
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handlePreviewToggle = () => {
    setPreviewActive(true);
    setTimeout(() => setPreviewActive(false), 2000);
  };

  const handleSaveDraft = () => {
    setSaveToast('Water allocation draft successfully saved and indexed in audit ledger.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-12">
      {/* Toast Feedback */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3C5D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#00A6C7]/40 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#18A999]" />
          <span className="text-sm font-medium">{saveToast}</span>
        </div>
      )}

      {/* Top Header & Period Context */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#00A6C7] text-xs font-bold uppercase tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Optimization & Policy Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tracking-tight">Water Budget Planner</h1>
          <p className="text-sm text-[#62748A] mt-0.5">
            Create a balanced, audit-ready, and transparent water allocation plan.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Selector */}
          <div className="bg-white border border-[#DFE7EF] rounded-lg px-3 py-1.5 shadow-2xs flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#62748A] uppercase">Active Preset</span>
            <select
              value={budgetState.activePreset}
              onChange={(e) => handlePresetSelect(e.target.value as any)}
              className="text-xs font-bold text-[#0B3C5D] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="standard">Standard Plan</option>
              <option value="conservation">Conservation Level 1 (Deficit Mode)</option>
              <option value="custom">Custom Budget</option>
            </select>
          </div>

          <button
            onClick={() => handlePresetSelect('standard')}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#62748A] hover:text-[#172B4D] shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#0B3C5D] shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#00A6C7]" />
            <span>Export Plan</span>
          </button>

          {userRole === 'admin' ? (
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-[0.99]"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          ) : (
            <div className="px-3 py-1.5 bg-[#F4F8FB] rounded-lg text-xs text-[#62748A] italic border border-[#DFE7EF]">
              Viewer Mode (Read-Only)
            </div>
          )}
        </div>
      </div>

      {/* Budget Summary KPI Banner */}
      <div className="bg-white rounded-xl p-5 border border-[#DFE7EF] shadow-2xs">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-center">
          {/* Metric 1 */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider block">
              Total Available Water
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-[#0B3C5D] tabular-nums">
                {totalCapacity.toLocaleString()}
              </span>
              <span className="text-xs text-[#62748A]">L/day</span>
            </div>
            <span className="text-[11px] text-[#62748A]">Hydrological Safe Yield</span>
          </div>

          {/* Metric 2 */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider block">Total Allocated</span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl sm:text-2xl font-bold tabular-nums ${
                  isOverBudget ? 'text-[#D64545]' : 'text-[#0B3C5D]'
                }`}
              >
                {totalAllocated.toLocaleString()}
              </span>
              <span className="text-xs text-[#62748A]">L/day</span>
            </div>
            <span
              className={`text-[11px] font-semibold ${isOverBudget ? 'text-[#D64545]' : 'text-[#00A6C7]'}`}
            >
              {allocatedPct}% of capacity committed
            </span>
          </div>

          {/* Metric 3 */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider block">Emergency Reserve</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-[#0B3C5D] tabular-nums">10,000</span>
              <span className="text-xs text-[#62748A]">L/day</span>
            </div>
            <span className="text-[11px] text-[#00A6C7] font-semibold">10.0% fixed policy minimum</span>
          </div>

          {/* Metric 4 */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider block">
              Remaining Unallocated
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-xl sm:text-2xl font-bold tabular-nums ${
                  remainingBuffer < 0 ? 'text-[#D64545]' : 'text-[#0B3C5D]'
                }`}
              >
                {remainingBuffer < 0 ? `-${Math.abs(remainingBuffer).toLocaleString()}` : remainingBuffer.toLocaleString()}
              </span>
              <span className="text-xs text-[#62748A]">L/day</span>
            </div>
            <span className="text-[11px] text-[#62748A]">
              {remainingBuffer < 0 ? (
                <strong className="text-[#D64545]">Deficit Overrun by {Math.abs(remainingBuffer).toLocaleString()} L</strong>
              ) : (
                `Safe operational buffer (${((remainingBuffer / totalCapacity) * 100).toFixed(1)}%)`
              )}
            </span>
          </div>

          {/* Metric 5: Audit Compliance Badge */}
          <div className="col-span-2 lg:col-span-1 bg-[#F4F8FB] p-3 rounded-xl border border-[#DFE7EF] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider">Audit Compliance</span>
              <Verified className="w-3.5 h-3.5 text-[#00A6C7]" />
            </div>
            <div className="my-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  isOverBudget
                    ? 'bg-[#FFEBEE] text-[#D64545]'
                    : isResidentialDeficit
                    ? 'bg-[#FFF8E1] text-[#875E03]'
                    : 'bg-[#E1F5FE] text-[#00677D]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOverBudget ? 'bg-[#D64545]' : isResidentialDeficit ? 'bg-[#F4B942]' : 'bg-[#00A6C7]'
                  }`}
                />
                {isOverBudget
                  ? 'CAPACITY OVERAGE'
                  : isResidentialDeficit
                  ? 'RESIDENTIAL DEFICIT'
                  : 'BALANCED & COMPLIANT'}
              </span>
            </div>
            <p className="text-[10px] text-[#62748A]">
              {isOverBudget
                ? 'Allocations exceed 100,000 L daily yield threshold.'
                : 'All statutory policy and human needs satisfied.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Sector Allocations & Constraints Editor */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#DFE7EF] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE7EF]/60">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#00A6C7]" />
                  <h2 className="text-lg font-bold text-[#0B3C5D]">Sector Allocations & Constraints Editor</h2>
                </div>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Adjust sector allocations using sliders or numeric inputs. Dynamic recalculation ensures limits and essential human needs are protected.
                </p>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[#F4F8FB] rounded-lg text-[#62748A] border border-[#DFE7EF] text-xs shrink-0 self-start sm:self-auto font-medium">
                <Lock className="w-3 h-3 text-[#00A6C7]" />
                <span>Cap: 100,000 L</span>
              </div>
            </div>

            {/* Sector Rows Container */}
            <div className="space-y-3.5">
              {/* Sector 1: Residential */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  previewActive ? 'bg-[#E1F5FE]/30 border-[#00A6C7]' : 'bg-[#FAFCFE] border-[#DFE7EF] hover:border-[#CBD8E4]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B3C5D]">Residential</span>
                      <span className="px-2 py-0.5 rounded bg-[#CEE5FF] text-[#00263F] text-[10px] font-bold">
                        Priority 1 Essential
                      </span>
                    </div>
                    <span className="text-xs text-[#62748A]">Essential domestic human needs</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center bg-white border border-[#DFE7EF] rounded-lg px-2.5 py-1 shadow-2xs">
                      <input
                        type="number"
                        min="45000"
                        max="65000"
                        step="500"
                        value={budgetState.residential}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => handleSectorChange('residential', Number(e.target.value))}
                        className="w-20 text-right font-bold text-xs sm:text-sm text-[#0B3C5D] bg-transparent focus:outline-none tabular-nums"
                      />
                      <span className="text-xs text-[#62748A] ml-1">L/day</span>
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-[#62748A] tabular-nums">
                      {((budgetState.residential / totalCapacity) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="mt-3">
                  <input
                    type="range"
                    min="45000"
                    max="65000"
                    step="250"
                    value={budgetState.residential}
                    disabled={userRole !== 'admin'}
                    onChange={(e) => handleSectorChange('residential', Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DFE7EF] rounded-lg accent-[#0B3C5D] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#62748A] mt-1">
                    <span className="text-[#00A6C7] font-semibold">Min Baseline: 45,000 L</span>
                    <span>Cap: 65,000 L</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-[#0D685E] flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Minimum per capita threshold: 108 L/resident/day (Compliant with WHO Guidelines).</span>
                </div>
              </div>

              {/* Sector 2: Commercial */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  previewActive ? 'bg-[#FFF8E1]/30 border-[#F4B942]' : 'bg-[#FAFCFE] border-[#DFE7EF] hover:border-[#CBD8E4]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B3C5D]">Commercial</span>
                      <span className="px-2 py-0.5 rounded bg-[#E2E8F0] text-[#62748A] text-[10px] font-bold">Tier 2</span>
                    </div>
                    <span className="text-xs text-[#62748A]">Retail, Cafes, & Coworking Offices</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center bg-white border border-[#DFE7EF] rounded-lg px-2.5 py-1 shadow-2xs">
                      <input
                        type="number"
                        min="15000"
                        max="30000"
                        step="500"
                        value={budgetState.commercial}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => handleSectorChange('commercial', Number(e.target.value))}
                        className="w-20 text-right font-bold text-xs sm:text-sm text-[#0B3C5D] bg-transparent focus:outline-none tabular-nums"
                      />
                      <span className="text-xs text-[#62748A] ml-1">L/day</span>
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-[#62748A] tabular-nums">
                      {((budgetState.commercial / totalCapacity) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="mt-3">
                  <input
                    type="range"
                    min="15000"
                    max="30000"
                    step="250"
                    value={budgetState.commercial}
                    disabled={userRole !== 'admin'}
                    onChange={(e) => handleSectorChange('commercial', Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DFE7EF] rounded-lg accent-[#00A6C7] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#62748A] mt-1">
                    <span>Min: 15,000 L</span>
                    <span>Max: 30,000 L</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#62748A]">
                  Commercial baseline met. Graywater recycling active in Block C retail arcade.
                </div>
              </div>

              {/* Sector 3: Institutional & Facilities */}
              <div className="p-4 rounded-xl bg-[#FAFCFE] border border-[#DFE7EF] hover:border-[#CBD8E4] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B3C5D]">Institutional & Facilities</span>
                      <span className="px-2 py-0.5 rounded bg-[#E2E8F0] text-[#62748A] text-[10px] font-bold">Tier 2</span>
                    </div>
                    <span className="text-xs text-[#62748A]">Daycare, Clubhouse, Pool & Gym</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center bg-white border border-[#DFE7EF] rounded-lg px-2.5 py-1 shadow-2xs">
                      <input
                        type="number"
                        min="8000"
                        max="18000"
                        step="500"
                        value={budgetState.facilities}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => handleSectorChange('facilities', Number(e.target.value))}
                        className="w-20 text-right font-bold text-xs sm:text-sm text-[#0B3C5D] bg-transparent focus:outline-none tabular-nums"
                      />
                      <span className="text-xs text-[#62748A] ml-1">L/day</span>
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-[#62748A] tabular-nums">
                      {((budgetState.facilities / totalCapacity) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="mt-3">
                  <input
                    type="range"
                    min="8000"
                    max="18000"
                    step="250"
                    value={budgetState.facilities}
                    disabled={userRole !== 'admin'}
                    onChange={(e) => handleSectorChange('facilities', Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DFE7EF] rounded-lg accent-[#18A999] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#62748A] mt-1">
                    <span>Min: 8,000 L</span>
                    <span>Max: 18,000 L</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#62748A]">
                  Clubhouse pool top-up throttled to off-peak cycle (22:00 – 04:00).
                </div>
              </div>

              {/* Sector 4: Irrigation & Landscaping */}
              <div
                className={`p-4 rounded-xl border transition-all ${
                  previewActive ? 'bg-[#E0F2F1]/50 border-[#18A999]' : 'bg-[#FAFCFE] border-[#DFE7EF] hover:border-[#CBD8E4]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B3C5D]">Irrigation & Landscaping</span>
                      <span className="px-2 py-0.5 rounded bg-[#E0F2F1] text-[#00677D] text-[10px] font-bold">
                        Non-Essential
                      </span>
                    </div>
                    <span className="text-xs text-[#62748A]">Parklands, Turf Irrigation & Decorative Fountains</span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center bg-white border border-[#DFE7EF] rounded-lg px-2.5 py-1 shadow-2xs">
                      <input
                        type="number"
                        min="3000"
                        max="15000"
                        step="500"
                        value={budgetState.landscaping}
                        disabled={userRole !== 'admin'}
                        onChange={(e) => handleSectorChange('landscaping', Number(e.target.value))}
                        className="w-20 text-right font-bold text-xs sm:text-sm text-[#0B3C5D] bg-transparent focus:outline-none tabular-nums"
                      />
                      <span className="text-xs text-[#62748A] ml-1">L/day</span>
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-[#62748A] tabular-nums">
                      {((budgetState.landscaping / totalCapacity) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="mt-3">
                  <input
                    type="range"
                    min="3000"
                    max="15000"
                    step="250"
                    value={budgetState.landscaping}
                    disabled={userRole !== 'admin'}
                    onChange={(e) => handleSectorChange('landscaping', Number(e.target.value))}
                    className="w-full h-1.5 bg-[#DFE7EF] rounded-lg accent-[#18A999] cursor-pointer"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[#62748A] mt-1">
                    <span>Min: 3,000 L</span>
                    <span>Max: 15,000 L</span>
                  </div>
                </div>
                <div className="mt-2 p-2 bg-[#E1F5FE]/60 rounded-lg text-[11px] text-[#00677D] flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#00A6C7] shrink-0" />
                  <span>AI Suggested Reduction: -2,500 L to cushion weekend evaporation deficit.</span>
                </div>
              </div>

              {/* Sector 5: Mandatory Emergency Reserve (Policy Locked) */}
              <div className="p-4 rounded-xl bg-[#F4F8FB] border border-[#DFE7EF]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B3C5D]">Mandatory Emergency Reserve</span>
                      <span className="px-2 py-0.5 rounded bg-[#0B3C5D] text-white text-[10px] font-bold">
                        Policy Locked
                      </span>
                    </div>
                    <span className="text-xs text-[#62748A]">
                      Fire safety, blackout storage, and municipal reserve covenants
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="flex items-center bg-[#E2E8F0]/50 border border-[#CBD8E4] rounded-lg px-2.5 py-1">
                      <Lock className="w-3.5 h-3.5 text-[#62748A] mr-1" />
                      <span className="font-bold text-xs sm:text-sm text-[#0B3C5D] tabular-nums">10,000</span>
                      <span className="text-xs text-[#62748A] ml-1">L/day</span>
                    </div>
                    <span className="w-12 text-right text-xs font-bold text-[#0B3C5D] tabular-nums">10.0%</span>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full h-1.5 bg-[#CBD8E4] rounded-lg overflow-hidden">
                    <div className="h-full bg-[#0B3C5D] rounded-lg w-full" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#62748A] mt-1 font-medium">
                    <span className="flex items-center gap-1 text-[#0B3C5D]">
                      <Gavel className="w-3 h-3" />
                      <span>Statutory Requirement (10.0% Immutable)</span>
                    </span>
                    <span>Locked</span>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#62748A]">
                  Mandated by Regional Water Board Rule 14-B. Modification requires board supermajority.
                </div>
              </div>
            </div>

            {/* Live Allocation Capacity Multi-Segment Bar */}
            <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-[#62748A]">Live Allocation Capacity</span>
                <div className="flex items-center gap-1.5 font-bold text-[#0B3C5D]">
                  <span className="tabular-nums">{totalAllocated.toLocaleString()}</span>
                  <span className="text-[#62748A] font-normal">/ 100,000 L</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[11px] ${
                      isOverBudget ? 'bg-[#FFEBEE] text-[#D64545]' : 'bg-white text-[#00A6C7]'
                    }`}
                  >
                    {allocatedPct}%
                  </span>
                </div>
              </div>

              {/* Stacked Bar Meter */}
              <div className="w-full h-3.5 bg-[#E2E8F0] rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-[#0B3C5D] transition-all duration-300"
                  style={{ width: `${(budgetState.residential / totalCapacity) * 100}%` }}
                  title="Residential"
                />
                <div
                  className="bg-[#00A6C7] transition-all duration-300"
                  style={{ width: `${(budgetState.commercial / totalCapacity) * 100}%` }}
                  title="Commercial"
                />
                <div
                  className="bg-[#61DBFE] transition-all duration-300"
                  style={{ width: `${(budgetState.facilities / totalCapacity) * 100}%` }}
                  title="Facilities"
                />
                <div
                  className="bg-[#18A999] transition-all duration-300"
                  style={{ width: `${(budgetState.landscaping / totalCapacity) * 100}%` }}
                  title="Landscaping"
                />
                <div
                  className="bg-[#172B4D] transition-all duration-300"
                  style={{ width: '10%' }}
                  title="Emergency Reserve"
                />
              </div>

              {/* Segment Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#62748A]">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B3C5D]" />
                  <span>Residential</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A6C7]" />
                  <span>Commercial</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#61DBFE]" />
                  <span>Facilities</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#18A999]" />
                  <span>Irrigation</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#172B4D]" />
                  <span>Reserve</span>
                </div>
              </div>

              {/* Inline Verification Status Message */}
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                  isOverBudget
                    ? 'bg-[#FFEBEE] border-[#D64545]/40 text-[#D64545]'
                    : isResidentialDeficit
                    ? 'bg-[#FFF8E1] border-[#F4B942]/40 text-[#875E03]'
                    : 'bg-white border-[#DFE7EF] text-[#172B4D]'
                }`}
              >
                {isOverBudget ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#D64545]" />
                    <span className="font-semibold">
                      Policy Violation: Total allocations exceed sustainable community yield by{' '}
                      {(totalAllocated - totalCapacity).toLocaleString()} L/day.
                    </span>
                  </>
                ) : isResidentialDeficit ? (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#F4B942]" />
                    <span className="font-semibold">
                      Warning: Residential allocation is beneath the 45,000 L human right baseline.
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#18A999]" />
                    <span className="font-medium">
                      Constraints Verified: All minimum essential human needs (45,000 L) and emergency reserves (10,000 L) are fully satisfied.
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Smart Allocation Recommendations & Scenarios */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#DFE7EF] shadow-2xs space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[#00A6C7] mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Aqua Mind Intelligence</span>
                </div>
                <h2 className="text-lg font-bold text-[#0B3C5D]">Smart Allocation Recommendations</h2>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Explainable, constraint-aware optimization proposed by predictive models.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold shrink-0">
                94% Confidence
              </span>
            </div>

            {/* Recommendation Card 1: Deficit Mitigation */}
            <div className="p-4 rounded-xl bg-[#FAFCFE] border border-[#DFE7EF] space-y-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D64545]" />
                  <h3 className="text-xs font-bold text-[#0B3C5D]">Address Projected Jul 25 Deficit (-5,000 L)</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#FFEBEE] text-[#D64545] text-[10px] font-bold">Priority High</span>
              </div>

              <p className="text-xs text-[#62748A] leading-relaxed">
                Weather forecast indicates a <strong className="text-[#172B4D]">32°C high</strong>, accelerating landscape
                evapotranspiration. Shifting 3,000 L from Landscaping and 2,000 L from Commercial HVAC will eliminate the 5,000 L deficit{' '}
                <strong className="text-[#00A6C7]">without touching domestic residential supply</strong>.
              </p>

              {/* Before & After Mini-Table Comparison */}
              <div className="bg-white rounded-lg border border-[#DFE7EF] overflow-hidden text-xs">
                <div className="grid grid-cols-4 px-3 py-1.5 bg-[#F4F8FB] border-b border-[#DFE7EF] text-[10px] font-bold text-[#62748A] uppercase">
                  <span>Sector</span>
                  <span className="text-right">Current</span>
                  <span className="text-right">Proposed</span>
                  <span className="text-right">Delta</span>
                </div>
                <div className="divide-y divide-[#DFE7EF]/60">
                  <div className="grid grid-cols-4 px-3 py-2 items-center">
                    <span className="font-semibold text-[#172B4D]">Residential</span>
                    <span className="text-right tabular-nums text-[#62748A]">52,000 L</span>
                    <span className="text-right tabular-nums font-bold text-[#172B4D]">52,000 L</span>
                    <span className="text-right text-[10px] font-bold text-[#0D685E]">0 L (Protected)</span>
                  </div>
                  <div className="grid grid-cols-4 px-3 py-2 items-center bg-[#FAFCFE]">
                    <span className="font-semibold text-[#172B4D]">Landscaping</span>
                    <span className="text-right tabular-nums text-[#62748A]">7,500 L</span>
                    <span className="text-right tabular-nums font-bold text-[#172B4D]">4,500 L</span>
                    <span className="text-right text-[10px] font-bold text-[#D64545]">-3,000 L (-40%)</span>
                  </div>
                  <div className="grid grid-cols-4 px-3 py-2 items-center">
                    <span className="font-semibold text-[#172B4D]">Commercial</span>
                    <span className="text-right tabular-nums text-[#62748A]">20,000 L</span>
                    <span className="text-right tabular-nums font-bold text-[#172B4D]">18,000 L</span>
                    <span className="text-right text-[10px] font-bold text-[#D64545]">-2,000 L (-10%)</span>
                  </div>
                  <div className="grid grid-cols-4 px-3 py-2 items-center bg-[#E0F2F1]">
                    <span className="font-bold text-[#004E5F]">Total Buffer</span>
                    <span className="text-right tabular-nums text-[#62748A]">+3,500 L</span>
                    <span className="text-right tabular-nums font-bold text-[#0D685E]">+8,500 L</span>
                    <span className="text-right text-[10px] font-bold text-[#0D685E]">+5k L Neutralized</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePreviewToggle}
                  className="w-full sm:w-1/2 py-2 px-3 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#0B3C5D] transition-colors text-center"
                >
                  {previewActive ? 'Previewing Highlights...' : 'Preview Changes'}
                </button>
                {userRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={handleApplyRecommendedPlan}
                    className="w-full sm:w-1/2 py-2 px-3 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00A6C7]" />
                    <span>Apply Approved Plan</span>
                  </button>
                ) : (
                  <span className="w-full sm:w-1/2 text-center text-xs text-[#62748A] italic">Admin role required</span>
                )}
              </div>

              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white border border-[#DFE7EF] text-[11px] text-[#62748A]">
                <ShieldCheck className="w-4 h-4 text-[#00A6C7] shrink-0 mt-0.5" />
                <span>
                  Aqua Mind AI never automatically commits changes. Review and committee sign-off required prior to field telemetry dispatch.
                </span>
              </div>
            </div>

            {/* Recommendation Card 2: Rainwater Inflow */}
            <div className="p-4 rounded-xl bg-[#FAFCFE] border border-[#DFE7EF] space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CloudRain className="w-4 h-4 text-[#00A6C7]" />
                  <h3 className="text-xs font-bold text-[#0B3C5D]">Rainwater Harvesting Inflow Adjustment</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">Opportunity</span>
              </div>

              <p className="text-xs text-[#62748A] leading-relaxed">
                Precipitation expected on July 29 (<strong className="text-[#172B4D]">+15mm</strong>). Potential rainwater
                catchment tank top-up of <strong className="text-[#00A6C7]">~18,000 L</strong>, allowing increased secondary non-potable reuse.
              </p>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#62748A] font-medium">Tanks: 74% Capacity</span>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('conservation')}
                  className="flex items-center gap-1 text-xs font-bold text-[#00A6C7] hover:text-[#0B3C5D]"
                >
                  <span>Factor into August Budget</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Operational Telemetry Card */}
            <div className="p-4 rounded-xl bg-white border border-[#DFE7EF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#F4F8FB] border border-[#DFE7EF] flex items-center justify-center text-[#00A6C7]">
                  <Verified className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0B3C5D] block">Phase 1-4 Flow Meters Synced</span>
                  <span className="text-[11px] text-[#62748A]">24 out of 24 smart node transceivers active</span>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#18A999]">
                <span className="w-2 h-2 rounded-full bg-[#18A999] animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

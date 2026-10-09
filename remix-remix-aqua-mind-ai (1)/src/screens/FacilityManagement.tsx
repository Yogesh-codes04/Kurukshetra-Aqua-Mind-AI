import React, { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit2,
  Filter,
  HeartPulse,
  Info,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { initialFacilities, multiSocietyFacilities, societyPresets } from '../data/mockData';
import { Facility, FacilityPriority, UserRole } from '../types/water';

interface FacilityManagementProps {
  facilities: Facility[];
  onUpdateFacilities: (facilities: Facility[]) => void;
  userRole: UserRole;
  onNavigateToSimulator: () => void;
  onLoadSocietyPreset?: (presetId: string) => void;
  selectedSocietyPresetId?: string;
}

export const FacilityManagement: React.FC<FacilityManagementProps> = ({
  facilities,
  onUpdateFacilities,
  userRole,
  onNavigateToSimulator,
  onLoadSocietyPreset,
  selectedSocietyPresetId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Healthcare');
  const [formDemand, setFormDemand] = useState<number | ''>(25000);
  const [formMin, setFormMin] = useState<number | ''>(10000);
  const [formPriority, setFormPriority] = useState<FacilityPriority>('High');
  const [formPeople, setFormPeople] = useState<number | ''>(500);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setFormName('');
    setFormType('Commercial');
    setFormDemand(20000);
    setFormMin(8000);
    setFormPriority('Medium');
    setFormPeople(400);
    setFormNotes('');
    setFormError(null);
    setEditingFacility(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (f: Facility) => {
    setFormName(f.name);
    setFormType(f.type);
    setFormDemand(f.demandLiters);
    setFormMin(f.minLiters);
    setFormPriority(f.priority);
    setFormPeople(f.peopleServed);
    setFormNotes(f.notes || '');
    setFormError(null);
    setEditingFacility(f);
    setIsAddModalOpen(true);
  };

  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const nameTrimmed = formName.trim();
    if (!nameTrimmed) {
      setFormError('Facility name is required.');
      return;
    }

    // Check duplicate name
    const isDuplicate = facilities.some(
      (f) =>
        f.name.toLowerCase() === nameTrimmed.toLowerCase() &&
        (!editingFacility || f.id !== editingFacility.id)
    );
    if (isDuplicate) {
      setFormError(`A facility named "${nameTrimmed}" already exists.`);
      return;
    }

    const demand = Number(formDemand);
    const min = Number(formMin);
    const people = Number(formPeople);

    if (isNaN(demand) || demand <= 0) {
      setFormError('Daily water demand must be a positive number.');
      return;
    }

    if (isNaN(min) || min < 0) {
      setFormError('Minimum required water cannot be negative.');
      return;
    }

    if (min > demand) {
      setFormError('Minimum required water cannot exceed total daily demand.');
      return;
    }

    if (isNaN(people) || people < 0) {
      setFormError('People served must be a non-negative number.');
      return;
    }

    if (editingFacility) {
      // Update existing
      const updated = facilities.map((f) =>
        f.id === editingFacility.id
          ? {
              ...f,
              name: nameTrimmed,
              type: formType,
              demandLiters: demand,
              minLiters: min,
              priority: formPriority,
              peopleServed: people,
              notes: formNotes.trim() || undefined,
            }
          : f
      );
      onUpdateFacilities(updated);
      showToast(`Updated "${nameTrimmed}" successfully.`);
    } else {
      // Add new
      const newFacility: Facility = {
        id: `fac-${Date.now()}`,
        name: nameTrimmed,
        type: formType,
        demandLiters: demand,
        minLiters: min,
        priority: formPriority,
        peopleServed: people,
        notes: formNotes.trim() || undefined,
      };
      onUpdateFacilities([...facilities, newFacility]);
      showToast(`Added "${nameTrimmed}" to facility registry.`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteFacility = (id: string) => {
    if (facilities.length <= 1) {
      showToast('Cannot delete all facilities. At least one facility is required.');
      setDeleteConfirmId(null);
      return;
    }
    const target = facilities.find((f) => f.id === id);
    const updated = facilities.filter((f) => f.id !== id);
    onUpdateFacilities(updated);
    setDeleteConfirmId(null);
    showToast(`Removed "${target?.name || 'Facility'}" from registry.`);
  };

  const handleResetToDemo = () => {
    onUpdateFacilities([...initialFacilities]);
    if (onLoadSocietyPreset) {
      onLoadSocietyPreset('soc-3-societies');
    }
    showToast('Reset to default 3 Societies Grid (3 Societies + Hospital + Company = 160,000 L/day).');
  };

  // Calculations
  const totalDemand = facilities.reduce((sum, f) => sum + f.demandLiters, 0);
  const totalMin = facilities.reduce((sum, f) => sum + f.minLiters, 0);
  const totalPeople = facilities.reduce((sum, f) => sum + f.peopleServed, 0);

  // Filtered facilities
  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      selectedPriorityFilter === 'all' || f.priority === selectedPriorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityBadgeClass = (priority: FacilityPriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-[#FFF0F0] text-[#D64545] border-[#FFD0D0]';
      case 'High':
        return 'bg-[#FFF8E6] text-[#B76E00] border-[#FFE4A3]';
      case 'Medium':
        return 'bg-[#E1F5FE] text-[#00677D] border-[#B3E5FC]';
      case 'Low':
        return 'bg-[#F4F8FB] text-[#62748A] border-[#DFE7EF]';
    }
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3C5D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#00A6C7]/40 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#18A999]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[11px] font-bold uppercase tracking-wider">
              Community Infrastructure
            </span>
            <span className="text-[#62748A] text-xs">•</span>
            <span className="text-xs font-semibold text-[#00A6C7]">Facility Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tracking-tight">
            Facility Management
          </h1>
          <p className="text-sm text-[#62748A] mt-0.5">
            Configure consumer endpoints, daily baselines, priority tiers, and protected minimum thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleResetToDemo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-xl text-xs font-semibold text-[#62748A] hover:text-[#0B3C5D] transition-colors"
            title="Reset to default 5 facilities"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Facilities</span>
          </button>

          {userRole === 'admin' ? (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-[#00A6C7]" />
              <span>Add Facility</span>
            </button>
          ) : (
            <div className="text-xs text-[#62748A] bg-white border border-[#DFE7EF] px-3 py-2 rounded-xl">
              Viewer mode: switch role to Admin to add/edit
            </div>
          )}
        </div>
      </div>

      {/* FEATURE: Quick Society Demo Presets Selector (3 Societies + Hospital + Company) */}
      <div className="bg-white dark:bg-[#0D1929] rounded-2xl p-4 sm:p-5 border border-[#DFE7EF] dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#00A6C7]" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Housing Society Demo Presets
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Compare 2 to 3 residential societies competing alongside the same Hospital and Company
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
          {societyPresets.map((preset) => {
            const isMatch =
              selectedSocietyPresetId === preset.id ||
              (facilities.length === preset.facilities.length &&
                preset.facilities.every((pf) => facilities.some((f) => f.id === pf.id)));

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  if (onLoadSocietyPreset) {
                    onLoadSocietyPreset(preset.id);
                  } else {
                    onUpdateFacilities([...preset.facilities]);
                  }
                  showToast(`Loaded "${preset.name}" dataset (${preset.facilities.length} facilities).`);
                }}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isMatch
                    ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 ring-2 ring-cyan-500/20 shadow-xs'
                    : 'border-[#DFE7EF] dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-[#F4F8FB] dark:bg-[#071220]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {preset.shortName}
                    </span>
                    {isMatch && <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-cyan-700 dark:text-cyan-400">
                  <span>{preset.badge}</span>
                  <span>{preset.facilities.length} Endpoints</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#DFE7EF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-2">
            <span>Total Facilities</span>
            <Building2 className="w-4 h-4 text-[#00A6C7]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">
            {facilities.length}
          </div>
          <p className="text-xs text-[#62748A] mt-1">Active municipal endpoints</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#DFE7EF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-2">
            <span>Total Combined Demand</span>
            <Layers className="w-4 h-4 text-[#00A6C7]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">
            {totalDemand.toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#62748A]">L/day</span>
          </div>
          <p className="text-xs text-[#62748A] mt-1">Normal daily baseline consumption</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#DFE7EF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-2">
            <span>Protected Minimum</span>
            <Shield className="w-4 h-4 text-[#18A999]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">
            {totalMin.toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#62748A]">L/day</span>
          </div>
          <p className="text-xs text-[#62748A] mt-1">
            Essential life-safety threshold ({((totalMin / (totalDemand || 1)) * 100).toFixed(0)}% of demand)
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#DFE7EF] shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-2">
            <span>Population Served</span>
            <Users className="w-4 h-4 text-[#00A6C7]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">
            {totalPeople.toLocaleString()}{' '}
            <span className="text-xs font-normal text-[#62748A]">people</span>
          </div>
          <p className="text-xs text-[#62748A] mt-1">Direct community beneficiaries</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#62748A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facilities by name or sector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs md:text-sm text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#62748A] shrink-0" />
          <span className="text-xs font-semibold text-[#62748A] shrink-0">Priority:</span>
          {['all', 'Critical', 'High', 'Medium', 'Low'].map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedPriorityFilter === p
                  ? 'bg-[#0B3C5D] text-white shadow-xs'
                  : 'bg-[#F4F8FB] text-[#62748A] hover:text-[#172B4D] border border-[#DFE7EF]'
              }`}
            >
              {p === 'all' ? 'All Tiers' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFacilities.map((f) => {
          const minRatio = f.demandLiters > 0 ? (f.minLiters / f.demandLiters) * 100 : 0;
          return (
            <div
              key={f.id}
              className="bg-white rounded-xl border border-[#DFE7EF] p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border mb-1.5 ${getPriorityBadgeClass(
                        f.priority
                      )}`}
                    >
                      {f.priority} Priority
                    </span>
                    <h3 className="font-bold text-[#0B3C5D] text-base">{f.name}</h3>
                    <span className="text-xs text-[#62748A] font-medium">{f.type} Sector</span>
                  </div>

                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(f)}
                        className="p-1.5 text-[#62748A] hover:text-[#00A6C7] hover:bg-[#F4F8FB] rounded-lg transition-colors"
                        title="Edit facility"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(f.id)}
                        className="p-1.5 text-[#62748A] hover:text-[#D64545] hover:bg-[#FFF0F0] rounded-lg transition-colors"
                        title="Delete facility"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {f.notes && (
                  <p className="text-xs text-[#62748A] mb-3 line-clamp-2 bg-[#F4F8FB] p-2 rounded-lg border border-[#DFE7EF]/60">
                    {f.notes}
                  </p>
                )}

                {/* Demand & Minimum Visual Breakdown */}
                <div className="space-y-2 my-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#62748A]">Daily Demand:</span>
                    <span className="font-bold text-[#0B3C5D] tabular-nums">
                      {f.demandLiters.toLocaleString()} L/day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#62748A]">Minimum Required:</span>
                    <span className="font-bold text-[#18A999] tabular-nums">
                      {f.minLiters.toLocaleString()} L/day ({minRatio.toFixed(0)}%)
                    </span>
                  </div>

                  {/* Visual Bar: Minimum vs Discretionary */}
                  <div className="w-full h-2.5 bg-[#F4F8FB] rounded-full overflow-hidden flex border border-[#DFE7EF]">
                    <div
                      className="bg-[#18A999] h-full"
                      style={{ width: `${minRatio}%` }}
                      title={`Protected Minimum: ${f.minLiters.toLocaleString()} L`}
                    />
                    <div
                      className="bg-[#00A6C7]/30 h-full"
                      style={{ width: `${100 - minRatio}%` }}
                      title={`Discretionary Demand: ${(f.demandLiters - f.minLiters).toLocaleString()} L`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#62748A]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#18A999]" />
                      Protected Min
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#00A6C7]/40" />
                      Discretionary
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DFE7EF] flex items-center justify-between text-xs text-[#62748A]">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#00A6C7]" />
                  <span>
                    <strong className="text-[#0B3C5D] tabular-nums">{f.peopleServed.toLocaleString()}</strong> people served
                  </span>
                </div>
                <button
                  onClick={onNavigateToSimulator}
                  className="text-[#00A6C7] font-semibold hover:underline text-[11px]"
                >
                  Simulate Allocation →
                </button>
              </div>

              {/* Inline Delete Confirmation */}
              {deleteConfirmId === f.id && (
                <div className="mt-3 p-3 bg-[#FFF0F0] border border-[#FFD0D0] rounded-xl text-xs space-y-2 animate-in fade-in">
                  <p className="font-semibold text-[#D64545]">
                    Delete {f.name}? This will remove it from all scarcity simulations.
                  </p>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2.5 py-1 text-xs text-[#62748A] hover:bg-white rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteFacility(f.id)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-[#D64545] hover:bg-[#B53333] rounded"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-[#DFE7EF]">
          <Building2 className="w-10 h-10 text-[#62748A] mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-[#0B3C5D]">No facilities found</h4>
          <p className="text-xs text-[#62748A] mt-1 max-w-sm mx-auto">
            No facilities matched your search or priority filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPriorityFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#0B3C5D] text-white rounded-lg text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C5D]/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DFE7EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-[#DFE7EF]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E1F5FE] text-[#00677D] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#00A6C7]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0B3C5D] text-base">
                    {editingFacility ? 'Edit Facility Endpoint' : 'Register New Facility'}
                  </h3>
                  <p className="text-xs text-[#62748A]">
                    Configure demand constraints and essential rationing priority
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#62748A] hover:text-[#172B4D] hover:bg-[#F4F8FB] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFacility} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl border border-[#D64545]/40 bg-[#FFF5F5] text-[#D64545] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                    Facility Name <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. County Dialysis Center"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-medium focus:outline-none focus:border-[#00A6C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                    Facility Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-medium focus:outline-none focus:border-[#00A6C7]"
                  >
                    <option value="Healthcare">Healthcare & Emergency</option>
                    <option value="Education">Education & School</option>
                    <option value="Residential">Residential Community</option>
                    <option value="Commercial">Commercial & Retail</option>
                    <option value="Recreation">Recreation & Parkland</option>
                    <option value="Industrial">Light Industrial</option>
                    <option value="Municipal">Municipal Administrative</option>
                  </select>
                </div>
              </div>

              {/* Demand & Min */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                    Daily Demand (Litres/Day) <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="100"
                    value={formDemand}
                    onChange={(e) => setFormDemand(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-bold tabular-nums focus:outline-none focus:border-[#00A6C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                    Minimum Required (Litres/Day) <span className="text-[#D64545]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="100"
                    value={formMin}
                    onChange={(e) => setFormMin(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-bold tabular-nums focus:outline-none focus:border-[#00A6C7]"
                  />
                </div>
              </div>

              {/* Priority & People Served */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                    Allocation Priority
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as FacilityPriority)}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-medium focus:outline-none focus:border-[#00A6C7]"
                  >
                    <option value="Critical">Critical (Rank 1 - Healthcare & Triage)</option>
                    <option value="High">High (Rank 2 - Sanitation & Schools)</option>
                    <option value="Medium">Medium (Rank 3 - Commercial & Workplaces)</option>
                    <option value="Low">Low (Rank 4 - Discretionary & Parks)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                    People Served
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formPeople}
                    onChange={(e) => setFormPeople(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-bold tabular-nums focus:outline-none focus:border-[#00A6C7]"
                  />
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                  Operational / Rationing Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Critical dialysis units must receive unchlorinated continuous feed."
                  className="w-full p-2.5 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DFE7EF]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#62748A] hover:text-[#172B4D] rounded-lg hover:bg-[#F4F8FB] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0B3C5D] hover:bg-[#082C44] rounded-lg shadow-xs transition-all"
                >
                  {editingFacility ? 'Update Facility' : 'Save Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

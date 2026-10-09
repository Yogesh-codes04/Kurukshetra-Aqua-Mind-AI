import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bolt,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Layers,
  Lightbulb,
  Radio,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Thermometer,
  UserCheck,
  Users,
  Verified,
  Wrench,
  Zap,
} from 'lucide-react';
import { mockAlerts } from '../data/mockData';
import { AlertItem, ScreenId, UserRole } from '../types/water';

interface AiInsightsProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenSimulation: () => void;
  onOpenExport: () => void;
  userRole: UserRole;
  onMitigationApplied: () => void;
}

export const AiInsights: React.FC<AiInsightsProps> = ({
  onNavigate,
  onOpenSimulation,
  onOpenExport,
  userRole,
  onMitigationApplied,
}) => {
  const [selectedAlertId, setSelectedAlertId] = useState<string>('ALT-8402');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'budget_exceeded' | 'info'>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<'active' | 'acknowledged' | 'resolved'>('active');
  
  // Interactive mitigations selection for the deep-dive panel
  const [selectedMitigations, setSelectedMitigations] = useState<{ [id: string]: boolean }>({
    'mit-1': true,
    'mit-2': true,
    'mit-3': true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedAlert = mockAlerts.find((a) => a.id === selectedAlertId) || mockAlerts[0];

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (lifecycleFilter === 'active' && alert.status !== 'active') return false;
    if (lifecycleFilter === 'acknowledged' && alert.status !== 'acknowledged') return false;
    if (lifecycleFilter === 'resolved' && alert.status !== 'resolved') return false;
    return true;
  });

  // Calculate cumulative mitigation volume
  const totalMitigationLiters = selectedAlert.prescribedMitigations.reduce((sum, m) => {
    return sum + (selectedMitigations[m.id] ? m.impactLiters : 0);
  }, 0);

  const mitigationTarget = selectedAlert.impactVolume || 12000;
  const mitigationPct = Math.min(100, Math.round((totalMitigationLiters / mitigationTarget) * 1000) / 10);

  const toggleMitigation = (id: string) => {
    setSelectedMitigations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleApplyPreset = () => {
    onMitigationApplied();
    setToastMessage(`Mitigation preset applied: +${totalMitigationLiters.toLocaleString()} L/day conserved!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcknowledgeAll = () => {
    setToastMessage('All active operational alerts marked as acknowledged.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3C5D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#00A6C7]/40 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#18A999]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Summary Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A6C7] animate-pulse" />
              Predictive Intelligence
            </span>
            <span className="text-xs text-[#62748A]">
              Autonomous Anomaly Engine v4.2 • Scanned 128 Smart Meters (4m ago)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tracking-tight">AI Insights & Alerts</h1>
          <p className="text-sm text-[#62748A] mt-0.5 max-w-3xl">
            Understand emerging water anomalies, deficit risks, and constraint violations with transparent mathematical
            explainability and calibrated mitigation trajectories.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap lg:self-start">
          <button
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F4F8FB] hover:bg-[#EBF3F9] text-[#0B3C5D] text-xs font-semibold border border-[#DFE7EF] transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-[#18A999]" />
            <span>Acknowledge All</span>
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F4F8FB] hover:bg-[#EBF3F9] text-[#0B3C5D] text-xs font-semibold border border-[#DFE7EF] transition-colors"
          >
            <Download className="w-4 h-4 text-[#62748A]" />
            <span>Export Digest</span>
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B3C5D] hover:bg-[#082C44] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Sliders className="w-4 h-4 text-[#00A6C7]" />
            <span>Configure Thresholds</span>
          </button>
        </div>
      </div>

      {/* Filter & State Navigation Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Severity Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              severityFilter === 'all'
                ? 'bg-[#0B3C5D] text-white shadow-xs'
                : 'bg-[#F4F8FB] text-[#62748A] hover:bg-[#EBF3F9]'
            }`}
          >
            All Alerts ({mockAlerts.length})
          </button>
          <button
            onClick={() => setSeverityFilter('critical')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              severityFilter === 'critical'
                ? 'bg-[#D64545] text-white shadow-xs'
                : 'bg-[#FFEBEE] text-[#D64545] hover:bg-[#FFCDD2]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D64545]" />
            Critical (2)
          </button>
          <button
            onClick={() => setSeverityFilter('warning')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              severityFilter === 'warning'
                ? 'bg-[#F4B942] text-[#875E03] shadow-xs'
                : 'bg-[#FFF8E1] text-[#875E03] hover:bg-[#FFECB3]'
            }`}
          >
            Warning (3)
          </button>
          <button
            onClick={() => setSeverityFilter('budget_exceeded')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              severityFilter === 'budget_exceeded'
                ? 'bg-[#00A6C7] text-white shadow-xs'
                : 'bg-[#E1F5FE] text-[#00677D] hover:bg-[#B3E5FC]'
            }`}
          >
            Budget Exceeded (1)
          </button>
          <button
            onClick={() => setSeverityFilter('info')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              severityFilter === 'info'
                ? 'bg-[#18A999] text-white shadow-xs'
                : 'bg-[#E0F2F1] text-[#0D685E] hover:bg-[#B2DFDB]'
            }`}
          >
            Informational (1)
          </button>
        </div>

        {/* Lifecycle Toggle */}
        <div className="flex items-center p-1 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg shrink-0 self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setLifecycleFilter('active')}
            className={`px-3 py-1 rounded-md transition-all ${
              lifecycleFilter === 'active' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Active & Pending
          </button>
          <button
            onClick={() => setLifecycleFilter('acknowledged')}
            className={`px-3 py-1 rounded-md transition-all ${
              lifecycleFilter === 'acknowledged' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Acknowledged
          </button>
          <button
            onClick={() => setLifecycleFilter('resolved')}
            className={`px-3 py-1 rounded-md transition-all ${
              lifecycleFilter === 'resolved' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Resolved Archive
          </button>
        </div>
      </div>

      {/* Master-Detail 7:5 Analytical Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Alert Queue & Triage Stream */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#62748A] px-1 font-semibold">
            <span className="uppercase tracking-wider">
              Telemetry Stream Priority Triage ({filteredAlerts.length} items)
            </span>
            <span className="flex items-center gap-1 text-[#00A6C7]">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> Live Polling
            </span>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-[#DFE7EF] space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#18A999] mx-auto" />
              <h3 className="font-bold text-[#0B3C5D]">No Alerts in this View</h3>
              <p className="text-xs text-[#62748A]">All water streams are operating within calibrated bounds.</p>
              <button
                onClick={() => {
                  setSeverityFilter('all');
                  setLifecycleFilter('active');
                }}
                className="px-4 py-2 bg-[#0B3C5D] text-white rounded-lg text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSelected = selectedAlertId === alert.id;
              const isCritical = alert.severity === 'critical';
              const isWarning = alert.severity === 'warning';

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlertId(alert.id)}
                  className={`bg-white rounded-xl p-5 border transition-all cursor-pointer relative shadow-2xs ${
                    isSelected
                      ? 'border-[#00A6C7] ring-2 ring-[#00A6C7]/20 shadow-xs'
                      : 'border-[#DFE7EF] hover:border-[#CBD8E4]'
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className={`absolute left-0 top-3 bottom-3 w-1.5 rounded-r ${
                      isCritical ? 'bg-[#D64545]' : isWarning ? 'bg-[#F4B942]' : 'bg-[#00A6C7]'
                    }`}
                  />

                  <div className="pl-2 space-y-3">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            isCritical
                              ? 'bg-[#FFEBEE] text-[#D64545]'
                              : isWarning
                              ? 'bg-[#FFF8E1] text-[#875E03]'
                              : 'bg-[#E1F5FE] text-[#00677D]'
                          }`}
                        >
                          {alert.categoryLabel}
                        </span>
                        <span className="text-[11px] font-mono text-[#62748A]">{alert.code}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#62748A]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{alert.timestamp} ({alert.timeAgo})</span>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#0B3C5D]">{alert.title}</h2>
                      <p className="text-xs text-[#62748A] mt-1 leading-relaxed">{alert.description}</p>
                    </div>

                    {/* Key Metrics Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F4F8FB] p-3 rounded-xl border border-[#DFE7EF]/70">
                      <div>
                        <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">
                          Impact Volume
                        </span>
                        <span
                          className={`text-base font-bold tabular-nums ${
                            isCritical ? 'text-[#D64545]' : 'text-[#0B3C5D]'
                          }`}
                        >
                          {alert.impactVolume > 0 ? alert.impactVolume.toLocaleString() : 'N/A'}{' '}
                          <span className="text-xs font-normal text-[#62748A]">{alert.impactUnit}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">
                          Breach Horizon
                        </span>
                        <span className="text-xs font-semibold text-[#172B4D]">{alert.breachWindow}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">
                          Confidence
                        </span>
                        <span className="text-xs font-bold text-[#00A6C7]">{alert.confidence}% Bayesian</span>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="px-2.5 py-1 rounded bg-[#E1F5FE] text-[#00677D] font-bold text-[11px]">
                            ✓ Active in Deep-Dive
                          </span>
                        ) : (
                          <span className="text-[#00A6C7] font-semibold hover:underline">
                            Click to Inspect Explainability →
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate('water-budget');
                          }}
                          className="px-2.5 py-1 text-[#62748A] hover:text-[#172B4D] rounded-md hover:bg-[#F4F8FB]"
                        >
                          Review Water Budget
                        </button>
                      </div>

                      {userRole === 'admin' && alert.severity === 'critical' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenSimulation();
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-[#D64545] hover:bg-[#B71C1C] text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
                        >
                          <Bolt className="w-3.5 h-3.5" />
                          <span>Trigger Mitigation</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right (5 cols): Causal Attribution Engine (Explainable AI Deep-Dive Panel) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#DFE7EF] shadow-2xs space-y-5">
            {/* Header & Breadcrumb */}
            <div className="space-y-1 pb-3 border-b border-[#DFE7EF]/60">
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] text-[#62748A]">
                <div className="flex items-center gap-1 font-semibold">
                  <span>Alerts</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[#D64545]">{selectedAlert.code}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-[#0B3C5D]">SHAP Decomposition</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] font-bold text-[10px]">
                  Prophet + Bi-LSTM
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <h2 className="text-lg font-bold text-[#0B3C5D]">Causal Attribution Engine</h2>
                <span className="text-xs font-bold text-[#00A6C7] bg-[#F4F8FB] px-2 py-0.5 rounded border border-[#DFE7EF]">
                  Conf: {selectedAlert.confidence}%
                </span>
              </div>
            </div>

            {/* SECTION 1: Quantitative Anomaly Horizon (Micro Graph) */}
            <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#62748A] uppercase tracking-wider text-[10px]">
                  Section 1 • Quantitative Anomaly Horizon
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-[#00677D]">
                    <span className="w-2.5 h-0.5 bg-[#00A6C7] rounded" /> Safe Cap (100k)
                  </span>
                  <span className="flex items-center gap-1 text-[#D64545] font-semibold">
                    <span className="w-2.5 h-1.5 bg-[#D64545] rounded" /> Surge Peak (112k)
                  </span>
                </div>
              </div>

              {/* SVG Micro Time-Series Graph */}
              <div className="w-full bg-white p-3 rounded-lg border border-[#DFE7EF]">
                <svg className="w-full h-32" viewBox="0 0 460 130" fill="none">
                  {/* Baseline Grid dashed lines */}
                  <line x1="20" y1="20" x2="440" y2="20" stroke="#DFE7EF" strokeDasharray="3 3" />
                  <line x1="20" y1="60" x2="440" y2="60" stroke="#DFE7EF" strokeDasharray="3 3" />
                  <line x1="20" y1="95" x2="440" y2="95" stroke="#DFE7EF" strokeDasharray="3 3" />

                  {/* 100k Safe Cap Line at y=55 */}
                  <line x1="20" y1="55" x2="440" y2="55" stroke="#00A6C7" strokeDasharray="4 2" strokeWidth="1.5" />
                  <text x="25" y="50" fill="#00677D" fontSize="9" fontWeight="700" fontFamily="Inter">
                    CAPACITY CEILING: 100,000 L/DAY
                  </text>

                  {/* Breach Area Fill */}
                  <path d="M 230 55 Q 280 18 330 18 Q 380 18 410 55 Z" fill="#D64545" fillOpacity="0.18" />

                  {/* Forecast Surge Curve */}
                  <path
                    d="M 20 85 C 70 82, 110 78, 160 80 C 200 82, 220 70, 250 45 C 280 20, 330 18, 360 26 C 390 34, 415 60, 440 78"
                    stroke="#0B3C5D"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Peak Marker */}
                  <circle cx="330" cy="18" r="5" fill="#D64545" />
                  <circle cx="330" cy="18" r="9" stroke="#D64545" strokeWidth="1.5" opacity="0.5" />

                  {/* Breach Tooltip */}
                  <rect x="275" y="2" width="110" height="15" rx="3" fill="#0B3C5D" />
                  <text x="330" y="12" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                    Peak: 112,000 L (+12k)
                  </text>

                  {/* X Axis labels */}
                  <text x="20" y="118" fill="#62748A" fontSize="9" fontFamily="Inter">
                    Jul 24 (Wed)
                  </text>
                  <text x="160" y="118" fill="#62748A" fontSize="9" fontFamily="Inter">
                    Jul 25 (08:00)
                  </text>
                  <text x="330" y="118" fill="#D64545" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                    Breach Window
                  </text>
                  <text x="440" y="118" fill="#62748A" fontSize="9" textAnchor="end" fontFamily="Inter">
                    Jul 26 (Fri)
                  </text>
                </svg>
              </div>

              {/* Quantitative Metrics Row */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-white rounded-lg border border-[#DFE7EF]">
                  <span className="text-[10px] text-[#62748A] block uppercase font-bold">Safe Limit</span>
                  <span className="font-bold text-[#0B3C5D]">100,000 L</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#DFE7EF]">
                  <span className="text-[10px] text-[#D64545] block uppercase font-bold">Forecast Peak</span>
                  <span className="font-bold text-[#D64545]">112,000 L</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-[#DFE7EF]">
                  <span className="text-[10px] text-[#62748A] block uppercase font-bold">Duration</span>
                  <span className="font-bold text-[#0B3C5D]">36h Window</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: Causal Factor Attribution (SHAP Waterfall) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#62748A] uppercase tracking-wider text-[10px]">
                  Section 2 • Causal Factor Attribution (SHAP Values)
                </span>
                <span className="font-bold text-[#0B3C5D]">Σ {selectedAlert.impactVolume.toLocaleString()} L Total</span>
              </div>

              <div className="p-4 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-3">
                {selectedAlert.shapDrivers.map((driver, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#172B4D]">{driver.name}</span>
                      <span className="font-bold text-[#D64545] tabular-nums">
                        +{driver.impactLiters.toLocaleString()} L ({driver.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-[#D64545]' : idx === 1 ? 'bg-[#00A6C7]' : 'bg-[#0B3C5D]'
                        }`}
                        style={{ width: `${driver.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}

                <p className="text-[10px] text-[#62748A] pt-1 flex items-center gap-1 border-t border-[#DFE7EF]/60">
                  <Verified className="w-3.5 h-3.5 text-[#00A6C7] shrink-0" />
                  <span>
                    Trained on 18 months of Green Valley microclimate & smart telemetry. Zero ungrounded heuristics.
                  </span>
                </p>
              </div>
            </div>

            {/* SECTION 3: Prescribed Mitigation Interventions */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#62748A] uppercase tracking-wider text-[10px]">
                  Section 3 • Prescribed Mitigation Interventions
                </span>
                <span className="font-bold text-[#0D685E]">
                  {selectedAlert.prescribedMitigations.length} Actions Available
                </span>
              </div>

              <div className="space-y-2">
                {selectedAlert.prescribedMitigations.map((mit) => {
                  const isChecked = !!selectedMitigations[mit.id];
                  return (
                    <div
                      key={mit.id}
                      onClick={() => toggleMitigation(mit.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked ? 'bg-[#FAFCFE] border-[#00A6C7] shadow-2xs' : 'bg-white border-[#DFE7EF] opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMitigation(mit.id)}
                            className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer mt-0.5"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#0B3C5D] block">{mit.title}</span>
                            <span className="text-[11px] text-[#62748A]">{mit.description}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#0D685E] tabular-nums shrink-0">
                          -{mit.impactLiters.toLocaleString()} L
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cumulative Yield Meter */}
              <div className="p-3.5 bg-[#E0F2F1] rounded-xl border border-[#18A999]/30 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#004E5F]">
                  <span>Cumulative Mitigation Yield</span>
                  <span className="tabular-nums">
                    {totalMitigationLiters.toLocaleString()} L / {mitigationTarget.toLocaleString()} L
                  </span>
                </div>
                <div className="w-full bg-white h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#18A999] h-full rounded-full transition-all duration-300"
                    style={{ width: `${mitigationPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#004E5F] font-semibold">
                  <span>{mitigationPct}% Deficit Neutralized</span>
                  <span>Gap: {Math.max(0, mitigationTarget - totalMitigationLiters).toLocaleString()} L/day</span>
                </div>
              </div>
            </div>

            {/* SECTION 4: Governance & Safety Sign-Off */}
            <div className="space-y-3 pt-2 border-t border-[#DFE7EF]/60">
              <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] text-[11px] text-[#62748A] flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#00A6C7] shrink-0 mt-0.5" />
                <span>
                  <strong>Governance Safety Constraint:</strong> Aqua Mind AI never automatically manipulates physical
                  flow valves without verified administrator authorization.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {userRole === 'admin' ? (
                  <button
                    type="button"
                    onClick={handleApplyPreset}
                    className="flex-1 py-2 px-3 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00A6C7]" />
                    <span>Apply Mitigation Preset</span>
                  </button>
                ) : (
                  <div className="flex-1 text-center py-2 text-xs text-[#62748A] italic bg-[#F4F8FB] rounded-lg">
                    Admin sign-off required
                  </div>
                )}
                <button
                  type="button"
                  onClick={onOpenSimulation}
                  className="py-2 px-3 bg-[#F4F8FB] hover:bg-[#EBF3F9] text-[#0B3C5D] border border-[#DFE7EF] rounded-lg text-xs font-semibold transition-colors"
                >
                  Simulate
                </button>
              </div>
            </div>
          </div>

          {/* Sensor Fleet Telemetry Health Widget */}
          <div className="bg-white rounded-xl p-4 border border-[#DFE7EF] shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#62748A] uppercase tracking-wider text-[10px]">
                Sensor Fleet Telemetry Health
              </span>
              <span className="text-[#0D685E] font-bold text-[11px]">0 Packet Loss</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#F4F8FB] rounded-lg flex items-center justify-between">
                <span className="text-[#62748A]">Gateways Online</span>
                <span className="font-bold text-[#0B3C5D]">14 / 14</span>
              </div>
              <div className="p-2.5 bg-[#F4F8FB] rounded-lg flex items-center justify-between">
                <span className="text-[#62748A]">Sensors Calibrated</span>
                <span className="font-bold text-[#0B3C5D]">128 (100%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

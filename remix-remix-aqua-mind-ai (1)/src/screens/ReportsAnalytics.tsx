import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplets,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  Leaf,
  Mail,
  RefreshCw,
  Search,
  Shield,
  TrendingDown,
  TrendingUp,
  Verified,
} from 'lucide-react';
import { julyReportRecords, mockMeterLedger } from '../data/mockData';
import { MeterLedgerRow, UserRole } from '../types/water';

interface ReportsAnalyticsProps {
  userRole: UserRole;
  onOpenExport: () => void;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ userRole, onOpenExport }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'july' | 'qtd' | 'custom'>('july');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [metricDisplay, setMetricDisplay] = useState<'volume' | 'cumulative' | 'per_capita'>('volume');
  const [searchQuery, setSearchQuery] = useState('');
  const [meterStatusFilter, setMeterStatusFilter] = useState<'all' | 'over_quota' | 'zero' | 'loss'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered meter records
  const filteredMeters = mockMeterLedger.filter((meter) => {
    const matchesSearch =
      meter.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meter.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meter.meterArchitecture.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (meterStatusFilter === 'over_quota') return meter.complianceStatus === 'over_quota';
    if (meterStatusFilter === 'zero') return meter.adherenceDelta === 0;
    if (meterStatusFilter === 'loss') return false; // 0 packet loss
    return true;
  });

  const handleExportPdf = () => {
    setToastMessage('Compiling ISO 14046 executive PDF report...');
    setTimeout(() => {
      setToastMessage('PDF report generated and downloaded.');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1200);
  };

  const handleScheduleDigest = () => {
    setToastMessage('Automated Monday 07:00 MST executive digest scheduled.');
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

      {/* Top Meta Breadcrumb Banner & Context Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-[#62748A]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A6C7] animate-pulse" />
            Audited Data Stream
          </span>
          <span>•</span>
          <span className="font-medium text-[#172B4D]">128 Calibrated Smart Flow Meters</span>
          <span>•</span>
          <span className="text-[#0D685E] font-semibold flex items-center gap-1">
            <Verified className="w-3.5 h-3.5" /> 99.8% Data Completeness
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="px-2 py-0.5 rounded bg-[#F4F8FB] text-[#62748A] text-[11px] font-medium border border-[#DFE7EF]">
            Sample Demonstration Dataset
          </span>
        </div>
        <div className="text-[11px] text-[#62748A] self-stretch xl:self-auto flex items-center justify-end gap-1">
          <span className="uppercase font-semibold">Ledger Sync:</span>
          <span className="font-mono font-bold text-[#0B3C5D]">UTC 14:32:08 (Hash #8F4A2)</span>
        </div>
      </div>

      {/* Page Header & Global Command Strip */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A6C7]">
              Executive Analytics & Compliance
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">
              ISO 14046 Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-[#62748A] mt-0.5 max-w-3xl">
            Audit historical consumption, evaluate sector budget adherence, track verified conservation outcomes, and validate
            predictive forecast accuracy with calibrated ground-truth sensors.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-[#00A6C7]" />
            <span>Export PDF Summary</span>
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] text-[#0B3C5D] rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00A6C7]" />
            <span>Export Clean CSV</span>
          </button>
          <button
            onClick={handleScheduleDigest}
            className="p-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] text-[#62748A] hover:text-[#0B3C5D] rounded-lg shadow-2xs transition-colors"
            title="Schedule Automated Digest"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Control Hub */}
      <div className="bg-white p-4 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Period Segmented Controls */}
        <div className="flex items-center overflow-x-auto p-1 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg">
          <button
            onClick={() => setSelectedPeriod('7d')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPeriod === '7d' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('30d')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPeriod === '30d' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setSelectedPeriod('july')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all ${
              selectedPeriod === 'july' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Current Month (July 2025)
          </button>
          <button
            onClick={() => setSelectedPeriod('qtd')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPeriod === 'qtd' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Quarter-to-Date (Q3)
          </button>
          <button
            onClick={() => setSelectedPeriod('custom')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              selectedPeriod === 'custom' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Sector dropdown & Reset */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[220px]">
            <Filter className="w-4 h-4 text-[#00A6C7] absolute left-3 top-3 pointer-events-none" />
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full h-10 pl-9 pr-8 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-medium text-[#172B4D] focus:outline-none focus:border-[#00A6C7] cursor-pointer"
            >
              <option value="all">All Sectors (Residential, Comm, Inst, Irrig)</option>
              <option value="residential">Residential (Phase 1–4)</option>
              <option value="commercial">Commercial & Retail Center</option>
              <option value="institutional">Institutional & Clubhouse</option>
              <option value="irrigation">Common Landscape & Irrigation</option>
              <option value="reserve">Fire & Safety Reserve</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSectorFilter('all');
              setSelectedPeriod('july');
              setSearchQuery('');
              setMeterStatusFilter('all');
            }}
            className="h-10 px-3 bg-[#F4F8FB] hover:bg-[#EBF3F9] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#62748A] hover:text-[#0B3C5D] flex items-center gap-1.5"
            title="Reset all filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 4-Card Executive KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Consumption */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Total Consumption</span>
              <div className="w-8 h-8 rounded-lg bg-[#F4F8FB] flex items-center justify-center text-[#0B3C5D]">
                <Droplets className="w-4 h-4 text-[#00A6C7]" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">2,184,000</span>
              <span className="text-sm font-medium text-[#62748A]">L</span>
              <span className="text-xs text-[#62748A] font-semibold">(2.18 ML)</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DFE7EF]/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[11px] font-bold">
                <TrendingDown className="w-3.5 h-3.5" />
                4.8% vs. Prior 30-Day
              </span>
              <span className="text-xs text-[#62748A]">(-110k L Saved)</span>
            </div>
            <p className="text-[11px] text-[#62748A]">Avg 72,800 L/day across 542 units + 28 meters.</p>
          </div>
        </div>

        {/* Card 2: Budget Adherence Score */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Budget Adherence</span>
              <div className="w-8 h-8 rounded-lg bg-[#F4F8FB] flex items-center justify-center text-[#00A6C7]">
                <Shield className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">96.2%</span>
              <span className="text-sm font-bold text-[#0D685E]">Optimal</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DFE7EF]/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Good Standing (±5% Tolerance)
              </span>
            </div>
            <p className="text-[11px] text-[#62748A]">3 of 4 sectors operated under assigned volumetric ceilings.</p>
          </div>
        </div>

        {/* Card 3: Verified Water Savings */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Verified Water Savings</span>
              <div className="w-8 h-8 rounded-lg bg-[#E0F2F1] flex items-center justify-center text-[#0D685E]">
                <Leaf className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#0D685E] tabular-nums">+142,500</span>
              <span className="text-sm font-medium text-[#62748A]">L Net</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DFE7EF]/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[11px] font-bold">
                <Shield className="w-3.5 h-3.5" />
                1.4 Days Emergency Reserve Equiv.
              </span>
            </div>
            <p className="text-[11px] text-[#62748A]">Driven by HVAC pre-cooling shift & smart turf pauses.</p>
          </div>
        </div>

        {/* Card 4: Forecast Model Accuracy */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Forecast Model Accuracy</span>
              <div className="w-8 h-8 rounded-lg bg-[#F4F8FB] flex items-center justify-center text-[#00A6C7]">
                <BarChart2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tabular-nums">97.6%</span>
              <span className="text-xs font-semibold text-[#62748A]">(2.4% MAPE)</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#DFE7EF]/70 space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4F8FB] border border-[#DFE7EF] text-[#0B3C5D] text-[11px] font-bold">
                Bi-LSTM v4.3 Benchmark
              </span>
            </div>
            <p className="text-[11px] text-[#62748A]">Evaluated across 720 hourly predictions against true readings.</p>
          </div>
        </div>
      </div>

      {/* Main Analytical Row: Split 8-Col Combo Chart & 4-Col Variance Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Visualization A: Actual vs. Planned Combo Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE7EF]/60">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#0B3C5D]">Actual vs. Planned Water Consumption</h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">
                    July 2025 Daily
                  </span>
                </div>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Comparison of raw metered telemetry against planned statutory ceiling and rolling historical baseline.
                </p>
              </div>

              {/* View Toggle */}
              <div className="inline-flex p-0.5 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs self-start sm:self-auto">
                <button
                  onClick={() => setMetricDisplay('volume')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    metricDisplay === 'volume' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                  }`}
                >
                  Volume (kL)
                </button>
                <button
                  onClick={() => setMetricDisplay('cumulative')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    metricDisplay === 'cumulative' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                  }`}
                >
                  Cumulative
                </button>
                <button
                  onClick={() => setMetricDisplay('per_capita')}
                  className={`px-2.5 py-1 rounded font-semibold ${
                    metricDisplay === 'per_capita' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                  }`}
                >
                  Per Capita
                </button>
              </div>
            </div>

            {/* Legend & Detected Breaches */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-2 mt-2 px-3 bg-[#F4F8FB] rounded-lg text-xs text-[#172B4D]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3 rounded-xs bg-[#61DBFE]" />
                  <span className="font-medium">Daily Actual Flow</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-[#D64545] border-b border-dashed border-[#D64545]" />
                  <span className="font-medium">Budget Ceiling (100k L)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-[#18A999]" />
                  <span className="font-medium">30-Day Baseline (76.5k L)</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#FFEBEE] text-[#D64545] text-[10px] font-bold">
                2 Detected Breaches
              </span>
            </div>

            {/* High-Fidelity SVG Combo Chart */}
            <div className="relative w-full h-72 sm:h-80 bg-[#FAFCFE] rounded-xl p-3 sm:p-4 mt-3 border border-[#DFE7EF] select-none overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 760 280" preserveAspectRatio="none">
                {/* Gridlines */}
                <line x1="45" y1="20" x2="745" y2="20" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="45" y1="80" x2="745" y2="80" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="45" y1="140" x2="745" y2="140" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="45" y1="200" x2="745" y2="200" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="45" y1="240" x2="745" y2="240" stroke="#DFE7EF" strokeWidth="1.5" />

                {/* Y-Axis Labels */}
                <text x="38" y="24" fill="#62748A" fontSize="10" textAnchor="end" fontFamily="Inter">
                  120k
                </text>
                <text x="38" y="84" fill="#62748A" fontSize="10" textAnchor="end" fontFamily="Inter">
                  100k
                </text>
                <text x="38" y="144" fill="#62748A" fontSize="10" textAnchor="end" fontFamily="Inter">
                  75k
                </text>
                <text x="38" y="204" fill="#62748A" fontSize="10" textAnchor="end" fontFamily="Inter">
                  50k
                </text>
                <text x="38" y="244" fill="#62748A" fontSize="10" textAnchor="end" fontFamily="Inter">
                  0k
                </text>

                {/* 31-Day Bars */}
                {julyReportRecords.map((rec, i) => {
                  const barWidth = 14;
                  const x = 55 + i * 21.5;
                  // Map 0 -> 240, 120k -> 20. height per 1000L = 220 / 120 = 1.833
                  const barHeight = Math.min(220, (rec.actual / 120000) * 220);
                  const y = 240 - barHeight;
                  const isSpike = rec.isSpike;

                  return (
                    <g key={rec.day}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill={isSpike ? '#D64545' : '#61DBFE'}
                        className="transition-all hover:opacity-80"
                      />
                    </g>
                  );
                })}

                {/* Budget Cap Line at 100k (y = 80) */}
                <line x1="45" y1="80" x2="715" y2="80" stroke="#D64545" strokeDasharray="6 4" strokeWidth="2" />

                {/* Prior Period Average (76.5k at y = 136) */}
                <line x1="45" y1="136" x2="715" y2="136" stroke="#18A999" strokeWidth="2.5" />

                {/* Callout Flag 1: Jul 12 Spike (x = 55 + 11*21.5 = 291) */}
                <g transform="translate(291, 36)">
                  <rect x="-35" y="-18" width="70" height="20" rx="4" fill="#0B3C5D" opacity="0.95" />
                  <text x="0" y="-4" fill="#FFFFFF" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="Inter">
                    Jul 12 Spike
                  </text>
                  <line x1="0" y1="2" x2="0" y2="24" stroke="#D64545" strokeWidth="1.5" />
                  <circle cx="0" cy="25" r="2.5" fill="#D64545" />
                </g>

                {/* Callout Flag 2: Jul 20 Heatwave (x = 55 + 19*21.5 = 463) */}
                <g transform="translate(463, 26)">
                  <rect x="-42" y="-18" width="84" height="20" rx="4" fill="#0B3C5D" opacity="0.95" />
                  <text x="0" y="-4" fill="#FFFFFF" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="Inter">
                    Jul 20 Heatwave
                  </text>
                  <line x1="0" y1="2" x2="0" y2="22" stroke="#D64545" strokeWidth="1.5" />
                  <circle cx="0" cy="23" r="2.5" fill="#D64545" />
                </g>

                {/* X-Axis Date Markers */}
                <text x="62" y="258" fill="#62748A" fontSize="10" textAnchor="middle" fontFamily="Inter">
                  Jul 01
                </text>
                <text x="167" y="258" fill="#62748A" fontSize="10" textAnchor="middle" fontFamily="Inter">
                  Jul 06
                </text>
                <text x="293" y="258" fill="#D64545" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                  Jul 12
                </text>
                <text x="419" y="258" fill="#62748A" fontSize="10" textAnchor="middle" fontFamily="Inter">
                  Jul 18
                </text>
                <text x="463" y="258" fill="#D64545" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                  Jul 20
                </text>
                <text x="566" y="258" fill="#62748A" fontSize="10" textAnchor="middle" fontFamily="Inter">
                  Jul 25
                </text>
                <text x="692" y="258" fill="#62748A" fontSize="10" textAnchor="middle" fontFamily="Inter">
                  Jul 31
                </text>
              </svg>
            </div>
          </div>

          {/* Lower Diagnostic Footer */}
          <div className="mt-4 pt-3 border-t border-[#DFE7EF]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#F4F8FB] p-3 rounded-lg text-xs">
            <span className="text-[#62748A] flex items-center gap-1.5">
              <Verified className="w-4 h-4 text-[#00A6C7]" />
              <span>29 of 31 days stayed strictly below the 100k L statutory budget ceiling.</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#62748A] uppercase font-bold text-[10px]">Mean Daily Variance:</span>
              <span className="font-bold text-[#0D685E] tabular-nums">-3,700 L/day</span>
            </div>
          </div>
        </div>

        {/* Visualization B: Sector Budget Variance (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B3C5D]">Sector Budget Variance</h2>
                <p className="text-xs text-[#62748A]">Allocated progress vs metered telemetry across community zones.</p>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#F4F8FB] text-[#0B3C5D] text-[10px] font-bold">July Quotas</span>
            </div>

            {/* Variance Progress Bars */}
            <div className="space-y-4">
              {/* Sector 1: Residential */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B3C5D]">1. Residential (Phase 1–4)</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[10px] font-bold">
                    -4.0% Under Budget
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#00A6C7] h-full rounded-full" style={{ width: '96%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#62748A]">
                  <span>Alloc: 1,440,000 L</span>
                  <span className="font-bold text-[#172B4D]">Actual: 1,382,000 L</span>
                </div>
              </div>

              {/* Sector 2: Commercial */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B3C5D]">2. Commercial & Retail Center</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF8E1] text-[#875E03] text-[10px] font-bold">
                    +5.0% Slight Overrun
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#F4B942] h-full rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#62748A]">
                  <span>Alloc: 560,000 L</span>
                  <span className="font-bold text-[#D64545]">Actual: 588,000 L (+28k)</span>
                </div>
              </div>

              {/* Sector 3: Institutional */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B3C5D]">3. Institutional & Clubhouse</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[10px] font-bold">
                    -5.0% Under Budget
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#00A6C7] h-full rounded-full" style={{ width: '95%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#62748A]">
                  <span>Alloc: 240,000 L</span>
                  <span className="font-bold text-[#172B4D]">Actual: 228,000 L</span>
                </div>
              </div>

              {/* Sector 4: Landscape */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B3C5D]">4. Landscape & Irrigation</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[10px] font-bold">
                    -10.0% Target Achieved
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#18A999] h-full rounded-full" style={{ width: '90%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#62748A]">
                  <span>Alloc: 180,000 L</span>
                  <span className="font-bold text-[#172B4D]">Actual: 162,000 L</span>
                </div>
              </div>

              {/* Sector 5: Fire Reserve */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0B3C5D]">5. Fire & Safety Reserve</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#CEE5FF] text-[#0B3C5D] text-[10px] font-bold">
                    100% Protected
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#0B3C5D] h-full rounded-full" style={{ width: '100%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#62748A]">
                  <span>Statutory: 300,000 L</span>
                  <span className="font-bold text-[#172B4D]">Actual Intact: 300,000 L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combined Net Variance Pill */}
          <div className="mt-5 p-4 rounded-xl bg-[#E0F2F1] border border-[#18A999]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#004E5F] uppercase tracking-wider block">
                Combined July Net Variance
              </span>
              <span className="text-base font-bold text-[#0D685E] tabular-nums">+80,000 L Net Savings</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-white text-[#0D685E] flex items-center justify-center shadow-2xs">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Metered Consumption & Compliance Ledger Table */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#DFE7EF]/60">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#0B3C5D]">Metered Consumption & Compliance Ledger</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F4F8FB] text-[#62748A] text-[10px] font-bold">
                Detailed Audit Records
              </span>
            </div>
            <p className="text-xs text-[#62748A] mt-0.5">
              Granular breakdown of physical telemetry, allocated ceilings, and variance penalties per sub-zone.
            </p>
          </div>

          {/* Search Bar & Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] sm:w-64">
              <Search className="w-4 h-4 text-[#62748A] absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search meter ID, block, facility..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
              />
            </div>

            <div className="flex items-center p-1 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold">
              <button
                onClick={() => setMeterStatusFilter('all')}
                className={`px-2.5 py-1 rounded transition-all ${
                  meterStatusFilter === 'all' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                All Meters
              </button>
              <button
                onClick={() => setMeterStatusFilter('over_quota')}
                className={`px-2.5 py-1 rounded transition-all ${
                  meterStatusFilter === 'over_quota' ? 'bg-white text-[#D64545] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                Over-Quota (3)
              </button>
              <button
                onClick={() => setMeterStatusFilter('zero')}
                className={`px-2.5 py-1 rounded transition-all ${
                  meterStatusFilter === 'zero' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                Zero Variance
              </button>
              <button
                onClick={() => setMeterStatusFilter('loss')}
                className={`px-2.5 py-1 rounded transition-all ${
                  meterStatusFilter === 'loss' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                Telemetry Loss (0)
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F8FB] text-[#62748A] text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Zone / Facility</th>
                <th className="py-2.5 px-3">Meter Architecture</th>
                <th className="py-2.5 px-3 text-right">Allocated Quota (L)</th>
                <th className="py-2.5 px-3 text-right">Recorded Usage (L)</th>
                <th className="py-2.5 px-3 text-right">Adherence / Delta</th>
                <th className="py-2.5 px-3 text-center">Compliance Status</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE7EF]/60">
              {filteredMeters.slice((currentPage - 1) * 5, currentPage * 5).map((meter) => {
                const isOver = meter.complianceStatus === 'over_quota';
                const isProtected = meter.complianceStatus === 'protected';

                return (
                  <tr key={meter.id} className={`hover:bg-[#F4F8FB]/50 ${isOver ? 'bg-[#FFEBEE]/15' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0B3C5D]">{meter.zoneName}</div>
                      <div className="text-[11px] text-[#62748A]">
                        ID: {meter.id} • {meter.substation}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#F4F8FB] border border-[#DFE7EF] text-[11px] text-[#172B4D]">
                        {meter.meterArchitecture}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-[#62748A]">
                      {meter.allocatedQuota.toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold text-[#0B3C5D]">
                      {meter.recordedUsage.toLocaleString()} L
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span
                        className={`font-bold ${
                          isOver ? 'text-[#D64545]' : isProtected ? 'text-[#0B3C5D]' : 'text-[#0D685E]'
                        }`}
                      >
                        {meter.adherenceDelta > 0 ? `+${meter.adherenceDelta.toLocaleString()}` : meter.adherenceDelta.toLocaleString()} L ({meter.percentageDelta > 0 ? `+${meter.percentageDelta}%` : `${meter.percentageDelta}%`})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOver
                            ? 'bg-[#FFF8E1] text-[#875E03]'
                            : isProtected
                            ? 'bg-[#E2E8F0] text-[#0B3C5D]'
                            : 'bg-[#E0F2F1] text-[#0D685E]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOver ? 'bg-[#F4B942]' : isProtected ? 'bg-[#0B3C5D]' : 'bg-[#18A999]'
                          }`}
                        />
                        {isOver ? 'Quota Exceeded' : isProtected ? 'Protected' : 'Compliant'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={onOpenExport}
                        className="p-1.5 text-[#62748A] hover:text-[#0B3C5D] rounded hover:bg-[#F4F8FB]"
                        title="Download Zone CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-[#62748A]">
          <span>Showing {(currentPage - 1) * 5 + 1}–{Math.min(currentPage * 5, filteredMeters.length)} of {filteredMeters.length} Sub-Zones</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-[#F4F8FB] hover:bg-[#EBF3F9] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 rounded bg-[#E1F5FE] text-[#00677D] font-bold text-xs">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(Math.ceil(filteredMeters.length / 5), p + 1))}
              disabled={currentPage >= Math.ceil(filteredMeters.length / 5)}
              className="px-2.5 py-1 rounded bg-[#F4F8FB] hover:bg-[#EBF3F9] disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Predictive Model Backtest Validation (Prophet + Bi-LSTM v4.3) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded bg-[#E1F5FE] text-[#00677D] flex items-center justify-center">
              <Verified className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-base font-bold text-[#0B3C5D]">Predictive Model Backtest Validation</h3>
            <span className="px-2 py-0.5 rounded-full bg-[#F4F8FB] border border-[#DFE7EF] text-[10px] font-bold text-[#0B3C5D]">
              Prophet + Bi-LSTM v4.3
            </span>
          </div>
          <p className="text-xs text-[#62748A] leading-relaxed">
            Historical backtest evaluated against 90 days of ground-truth smart meter telemetry. Prediction bounds accurately
            encompassed <strong className="text-[#172B4D]">95.4%</strong> of real-world volumetric fluctuations with zero
            undetected critical leak patterns.
          </p>
        </div>

        {/* Mini Validation Metric Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] min-w-[110px]">
            <span className="text-[10px] font-bold text-[#62748A] uppercase block">R² Fit Score</span>
            <span className="text-lg font-bold text-[#0B3C5D] tabular-nums">0.941</span>
            <span className="text-[10px] text-[#0D685E] font-semibold block">High Precision</span>
          </div>
          <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] min-w-[130px]">
            <span className="text-[10px] font-bold text-[#62748A] uppercase block">Mean Abs. Error (MAE)</span>
            <span className="text-lg font-bold text-[#0B3C5D] tabular-nums">±1,840 L</span>
            <span className="text-[10px] text-[#62748A] block">Per 24h cycle</span>
          </div>
          <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] min-w-[130px]">
            <span className="text-[10px] font-bold text-[#62748A] uppercase block">False Anomaly Rate</span>
            <span className="text-lg font-bold text-[#0D685E] tabular-nums">1.2%</span>
            <span className="text-[10px] text-[#0D685E] font-semibold block">Near-Zero False Alerts</span>
          </div>
        </div>
      </div>

      {/* Footer Governance Disclaimer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#62748A] pt-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#00A6C7]" />
          <span>Aqua Mind AI Audited Telemetry Protocol • Certified for Community Governance & Municipal Filing</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Water Loss Index: <strong>0.84 ILI (Class A)</strong></span>
          <span>•</span>
          <button onClick={onOpenExport} className="text-[#00A6C7] font-semibold hover:underline">
            Download Cryptographic Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};

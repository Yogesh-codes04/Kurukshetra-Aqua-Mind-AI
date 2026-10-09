import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Filter,
  Layers,
  LineChart,
  MemoryStick,
  Percent,
  Play,
  Radio,
  RefreshCw,
  Shield,
  Sliders,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Users,
  Verified,
  Wind,
} from 'lucide-react';
import { forecastTrajectoryData } from '../data/mockData';
import { ScreenId, UserRole } from '../types/water';

interface DemandForecastsProps {
  onNavigate: (screen: ScreenId) => void;
  onOpenSimulation: () => void;
  onOpenExport: () => void;
  userRole: UserRole;
}

export const DemandForecasts: React.FC<DemandForecastsProps> = ({
  onNavigate,
  onOpenSimulation,
  onOpenExport,
  userRole,
}) => {
  const [horizon, setHorizon] = useState<'7d' | '14d' | '30d'>('7d');
  const [unitMode, setUnitMode] = useState<'liters' | 'kl'>('liters');
  const [showCiBand, setShowCiBand] = useState(true);
  const [showWeatherOverlay, setShowWeatherOverlay] = useState(false);

  // Mitigation sandbox live toggles
  const [mitigateIrrigation, setMitigateIrrigation] = useState(true);
  const [mitigateHvac, setMitigateHvac] = useState(true);
  const [mitigateRainwater, setMitigateRainwater] = useState(true);
  const [safeguardAcknowledged, setSafeguardAcknowledged] = useState(false);
  const [commitToast, setCommitToast] = useState<string | null>(null);

  // Dynamic simulation calculation
  const basePeak = 112000;
  const irrigationRelief = mitigateIrrigation ? 4500 : 0;
  const hvacRelief = mitigateHvac ? 2200 : 0;
  const rainwaterRelief = mitigateRainwater ? 5000 : 0;
  const totalRelief = irrigationRelief + hvacRelief + rainwaterRelief;
  const simulatedPeak = basePeak - totalRelief;
  const isDeficitEliminated = simulatedPeak <= 100000;

  const handleCommitSimulation = () => {
    setCommitToast('Simulation committed! Redirecting to Water Budget Planner...');
    setTimeout(() => {
      onNavigate('water-budget');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-[1680px] mx-auto pb-12">
      {/* Toast Feedback */}
      {commitToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3C5D] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#00A6C7]/40 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-[#18A999]" />
          <span className="text-sm font-medium">{commitToast}</span>
        </div>
      )}

      {/* Header Block & Model Meta */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A6C7] animate-pulse" />
              Predictive Hydro-Engine Active
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#F4F8FB] border border-[#DFE7EF] text-[#0B3C5D] text-[11px] font-semibold">
              Ensemble Prophet + Bi-LSTM v4.3
            </span>
            <span className="text-xs text-[#62748A]">Retrained 3h ago (09:42 UTC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3C5D] tracking-tight">Water Demand Forecast</h1>
          <p className="text-sm text-[#62748A] mt-0.5 max-w-3xl">
            Anticipate future hydraulic consumption, diagnose micro-climate driver attributions, and enact load-shedding
            protocols before municipal safe-yield buffers are compromised.
          </p>
        </div>

        {/* Action Cluster */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#0B3C5D] shadow-2xs transition-colors"
          >
            <Sliders className="w-4 h-4 text-[#00A6C7]" />
            <span>Simulate Weather</span>
          </button>
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#0B3C5D] shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#62748A]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => onNavigate('water-budget')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-[0.99]"
          >
            <span>Review Water Budget</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizon Controls & Diagnostic Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block mb-1">
              Forecast Horizon
            </span>
            <div className="inline-flex p-1 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg gap-1">
              <button
                onClick={() => setHorizon('7d')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  horizon === '7d' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00A6C7]" />
                <span>7 Days (Operational)</span>
                <span className="px-1.5 py-0.2 rounded bg-[#E1F5FE] text-[#00677D] text-[10px]">94.8% Conf</span>
              </button>
              <button
                onClick={() => setHorizon('14d')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  horizon === '14d' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                <span>14 Days (Tactical)</span>
                <span className="text-[10px] text-[#62748A]">87.1%</span>
              </button>
              <button
                onClick={() => setHorizon('30d')}
                className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  horizon === '30d' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                }`}
              >
                <span>30 Days (Strategic)</span>
                <span className="text-[10px] text-[#62748A]">78.4%</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:block w-px h-8 bg-[#DFE7EF]" />

          <div>
            <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block mb-1">
              Comparative Baseline
            </span>
            <div className="px-3 py-1.5 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs font-semibold text-[#172B4D] flex items-center gap-2">
              <span className="text-[#00A6C7] font-bold">vs.</span>
              <span>Prior 30-Day Rolling Normal</span>
            </div>
          </div>
        </div>

        {/* Telemetry Stream Health */}
        <div className="flex items-center gap-4 flex-wrap text-xs text-[#62748A]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F8FB] rounded-lg border border-[#DFE7EF]">
            <Radio className="w-4 h-4 text-[#00A6C7]" />
            <span className="font-semibold text-[#172B4D]">128 Smart Meters • 4 Weather Stations</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#18A999]" />
            <span>Loss Function: Huber Robust (δ=1.35)</span>
          </div>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Safe Supply Ceiling</span>
            <Shield className="w-4 h-4 text-[#00A6C7]" />
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#0B3C5D] tabular-nums">100,000</span>
            <span className="text-xs text-[#62748A]">L/day</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#62748A]">Hydrological Safe Yield</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">Stable Inflow</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Projected Peak Demand</span>
            <TrendingUp className="w-4 h-4 text-[#D64545]" />
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#172B4D] tabular-nums">112,000</span>
            <span className="text-xs text-[#62748A]">L/day</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#62748A]">Friday Jul 25 Peak</span>
            <span className="px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#D64545] text-[10px] font-bold">+12.0% Surge</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-[#D64545]/30 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#D64545]/5 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#D64545] uppercase tracking-wider">Net Deficit Exposure</span>
            <AlertTriangle className="w-4 h-4 text-[#D64545]" />
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#D64545] tabular-nums">12,000</span>
            <span className="text-xs text-[#D64545]">L/day</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#62748A]">48h Risk: 22.5k L</span>
            <span className="px-2 py-0.5 rounded-full bg-[#D64545] text-white text-[10px] font-bold">Action Required</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider">Empirical Calibration</span>
            <Verified className="w-4 h-4 text-[#00A6C7]" />
          </div>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#0B3C5D] tabular-nums">94.8%</span>
            <span className="text-xs text-[#62748A]">Reliability</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#62748A]">CI: ±3,800 L</span>
            <span className="px-2 py-0.5 rounded-full bg-[#E0F2F1] text-[#0D685E] text-[10px] font-bold">MAPE: 2.4%</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Row: Chart (8 cols) & XAI Attribution (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (8 cols): Interactive Trajectory Chart */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DFE7EF]/60">
              <div>
                <h2 className="text-lg font-bold text-[#0B3C5D]">Demand Trajectory & Probabilistic Bounds</h2>
                <p className="text-xs text-[#62748A] mt-0.5">
                  Historical telemetry transitioned to forecast horizon with 95% Bayesian confidence envelopment.
                </p>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="inline-flex p-0.5 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs">
                  <button
                    onClick={() => setUnitMode('liters')}
                    className={`px-2 py-1 rounded font-semibold ${
                      unitMode === 'liters' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                    }`}
                  >
                    Liters
                  </button>
                  <button
                    onClick={() => setUnitMode('kl')}
                    className={`px-2 py-1 rounded font-semibold ${
                      unitMode === 'kl' ? 'bg-white text-[#0B3C5D] shadow-xs' : 'text-[#62748A]'
                    }`}
                  >
                    kL
                  </button>
                </div>

                <button
                  onClick={() => setShowCiBand(!showCiBand)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    showCiBand
                      ? 'bg-[#E1F5FE] text-[#00677D] border-[#00A6C7]/30'
                      : 'bg-white text-[#62748A] border-[#DFE7EF]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#00A6C7]" />
                  <span>95% CI Band</span>
                </button>

                <button
                  onClick={() => setShowWeatherOverlay(!showWeatherOverlay)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    showWeatherOverlay
                      ? 'bg-[#FFF8E1] text-[#875E03] border-[#F4B942]/40'
                      : 'bg-white text-[#62748A] border-[#DFE7EF]'
                  }`}
                >
                  <Thermometer className="w-3.5 h-3.5 text-[#F4B942]" />
                  <span>Weather Overlay</span>
                </button>
              </div>
            </div>

            {/* Legend Ribbon */}
            <div className="flex items-center gap-4 py-2 mt-2 px-3 bg-[#F4F8FB] rounded-lg text-xs text-[#172B4D] flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#00A6C7] rounded-full" />
                <span>Recorded Historical (Jul 18–23)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#0B3C5D] rounded-full" />
                <span>Projected Demand (Jul 25–30)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-[#E1F5FE] border border-[#00A6C7]/20" />
                <span>95% CI Band (±3,800 L)</span>
              </div>
              <div className="flex items-center gap-1.5 sm:ml-auto">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-[#D64545]" />
                <span className="text-[#D64545] font-semibold text-[11px]">Supply Ceiling (100k L)</span>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="relative w-full h-72 sm:h-80 bg-[#FAFCFE] rounded-xl p-3 sm:p-4 mt-3 border border-[#DFE7EF] select-none overflow-hidden">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 880 280" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="foreCiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A3CBF2" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#A3CBF2" stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id="foreDeficitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFDAD6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#FFDAD6" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="50" y1="30" x2="840" y2="30" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="50" y1="90" x2="840" y2="90" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="50" y1="150" x2="840" y2="150" stroke="#DFE7EF" strokeDasharray="3 3" />
                <line x1="50" y1="210" x2="840" y2="210" stroke="#DFE7EF" strokeDasharray="3 3" />

                {/* Y-Axis Labels */}
                <text x="42" y="34" fill="#62748A" fontSize="11" textAnchor="end" fontFamily="Inter">
                  120k L
                </text>
                <text x="42" y="94" fill="#D64545" fontSize="11" fontWeight="700" textAnchor="end" fontFamily="Inter">
                  100k L
                </text>
                <text x="42" y="154" fill="#62748A" fontSize="11" textAnchor="end" fontFamily="Inter">
                  80k L
                </text>
                <text x="42" y="214" fill="#62748A" fontSize="11" textAnchor="end" fontFamily="Inter">
                  60k L
                </text>

                {/* 100k Safe Supply Ceiling */}
                <line x1="50" y1="90" x2="840" y2="90" stroke="#D64545" strokeDasharray="6 4" strokeWidth="2" />
                <text x="830" y="82" fill="#D64545" fontSize="10" fontWeight="700" textAnchor="end" fontFamily="Inter">
                  SAFE CEILING 100,000 L/DAY
                </text>

                {/* 95% Confidence Interval Band for Friday-Wednesday */}
                {showCiBand && (
                  <path
                    d="M 430,175 
                       L 500,42 
                       L 570,68 
                       L 640,88 
                       L 710,105 
                       L 780,128 
                       L 780,152 
                       L 710,132 
                       L 640,118 
                       L 570,98 
                       L 500,68 
                       L 430,185 Z"
                    fill="url(#foreCiGrad)"
                  />
                )}

                {/* Deficit Exceedance Polygon (Area above y=90) */}
                <path d="M 465,90 Q 500,50 535,70 L 610,90 Z" fill="url(#foreDeficitGrad)" />

                {/* Historical Line: Mon 18 - Wed 23 */}
                <path
                  d="M 90,178 L 155,171 L 225,182 L 295,175 L 365,168 L 430,175"
                  fill="none"
                  stroke="#00A6C7"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="90" cy="178" r="4.5" fill="#FFFFFF" stroke="#00A6C7" strokeWidth="2.5" />
                <circle cx="155" cy="171" r="4.5" fill="#FFFFFF" stroke="#00A6C7" strokeWidth="2.5" />
                <circle cx="225" cy="182" r="4.5" fill="#FFFFFF" stroke="#00A6C7" strokeWidth="2.5" />
                <circle cx="295" cy="175" r="4.5" fill="#FFFFFF" stroke="#00A6C7" strokeWidth="2.5" />
                <circle cx="365" cy="168" r="4.5" fill="#FFFFFF" stroke="#00A6C7" strokeWidth="2.5" />
                <circle cx="430" cy="175" r="5" fill="#00A6C7" stroke="#FFFFFF" strokeWidth="2" />

                {/* Vertical Divider for Today */}
                <line x1="430" y1="20" x2="430" y2="245" stroke="#0B3C5D" strokeDasharray="3 2" strokeWidth="1.5" />
                <g transform="translate(430, 16)">
                  <rect x="-60" y="0" width="120" height="18" rx="4" fill="#0B3C5D" />
                  <text x="0" y="12" fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                    TODAY (JUL 24)
                  </text>
                </g>

                {/* Forecast Line (Navy Dashed): Jul 24 -> Jul 25 112k -> Jul 26 104k -> Jul 27 98k */}
                <path
                  d="M 430,175 L 500,54 L 570,78 L 640,96 L 710,115 L 780,136"
                  fill="none"
                  stroke="#0B3C5D"
                  strokeWidth="3.5"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle cx="500" cy="54" r="6.5" fill="#D64545" stroke="#FFFFFF" strokeWidth="2.5" />
                <circle cx="570" cy="78" r="5" fill="#0B3C5D" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="640" cy="96" r="5" fill="#0B3C5D" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="710" cy="115" r="5" fill="#0B3C5D" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="780" cy="136" r="5" fill="#0B3C5D" stroke="#FFFFFF" strokeWidth="2" />

                {/* Peak Surge Callout Flag */}
                <g transform="translate(500, 10)">
                  <rect x="-85" y="0" width="170" height="36" rx="6" fill="#0B3C5D" />
                  <text x="0" y="14" fill="#00A6C7" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                    PEAK EXCEEDANCE: 112K L
                  </text>
                  <text x="0" y="27" fill="#EDF0FF" fontSize="9" textAnchor="middle" fontFamily="Inter">
                    Deficit Risk: -12k L • 34°C Heat
                  </text>
                  <polygon points="-5,36 5,36 0,42" fill="#0B3C5D" />
                </g>

                {/* Optional Weather Overlay Temperature Points */}
                {showWeatherOverlay && (
                  <g fill="#D97706" fontSize="9" fontWeight="600" textAnchor="middle" fontFamily="Inter">
                    <text x="90" y="200">29°C</text>
                    <text x="225" y="202">31°C</text>
                    <text x="430" y="195">32°C</text>
                    <text x="500" y="75">34°C</text>
                    <text x="570" y="98">34°C</text>
                    <text x="780" y="155">29°C</text>
                  </g>
                )}

                {/* X-Axis Timeline */}
                <text x="90" y="260" fill="#62748A" fontSize="11" textAnchor="middle" fontFamily="Inter">
                  Mon 18
                </text>
                <text x="225" y="260" fill="#62748A" fontSize="11" textAnchor="middle" fontFamily="Inter">
                  Wed 20
                </text>
                <text x="365" y="260" fill="#62748A" fontSize="11" textAnchor="middle" fontFamily="Inter">
                  Fri 22
                </text>
                <text x="430" y="260" fill="#0B3C5D" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                  Thu 24
                </text>
                <text x="500" y="260" fill="#D64545" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="Inter">
                  Fri 25 (Peak)
                </text>
                <text x="570" y="260" fill="#0B3C5D" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="Inter">
                  Sat 26
                </text>
                <text x="640" y="260" fill="#0B3C5D" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="Inter">
                  Sun 27
                </text>
                <text x="780" y="260" fill="#0B3C5D" fontSize="11" fontWeight="600" textAnchor="middle" fontFamily="Inter">
                  Tue 29
                </text>
              </svg>
            </div>
          </div>

          {/* Integrated Metrics Footer */}
          <div className="mt-4 pt-3 border-t border-[#DFE7EF]/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg">
              <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">7-Day Mean Demand</span>
              <span className="text-sm font-bold text-[#0B3C5D] tabular-nums">101,400 L/day</span>
              <span className="text-[10px] text-[#62748A] block mt-0.5">+3.2% vs 30d baseline</span>
            </div>
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg">
              <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Peak Window</span>
              <span className="text-sm font-bold text-[#D64545] tabular-nums">36 Consecutive Hours</span>
              <span className="text-[10px] text-[#62748A] block mt-0.5">Fri 08:00 – Sat 20:00</span>
            </div>
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg">
              <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Cumulative Risk</span>
              <span className="text-sm font-bold text-[#D64545] tabular-nums">22,500 L Total</span>
              <span className="text-[10px] text-[#62748A] block mt-0.5">Requires reserve offset</span>
            </div>
            <div className="p-2.5 bg-[#F4F8FB] rounded-lg">
              <span className="text-[10px] font-bold text-[#62748A] uppercase tracking-wider block">Model Accuracy</span>
              <span className="text-sm font-bold text-[#00A6C7] tabular-nums">2.41% Error Bound</span>
              <span className="text-[10px] text-[#62748A] block mt-0.5">Calibrated on 18mo data</span>
            </div>
          </div>
        </div>

        {/* Right (4 cols): Explainable AI (SHAP Waterfall Attribution) */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00A6C7]" />
                <span className="text-[11px] font-bold text-[#00A6C7] uppercase tracking-wider">Predictive Drivers</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">
                94.8% Attributed
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#0B3C5D]">Why Is Demand Expected to Spike?</h3>
              <p className="text-xs text-[#62748A] mt-1">
                SHAP feature attribution decomposed across local microclimate feeds and telemetry anomalies.
              </p>
            </div>

            {/* Drivers List */}
            <div className="space-y-2.5">
              {/* Driver 1 */}
              <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-[#D64545]" />
                    Weather & Evapotranspiration
                  </span>
                  <span className="font-bold text-[#D64545] tabular-nums">+6,200 L (+51.6%)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#D64545] h-full rounded-full" style={{ width: '51.6%' }} />
                </div>
                <p className="text-[11px] text-[#62748A]">
                  Ambient heat reaching 34°C accelerating landscape irrigation demand and HVAC cooling evaporative loss.
                </p>
              </div>

              {/* Driver 2 */}
              <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#00A6C7]" />
                    Weekend Occupancy Dynamics
                  </span>
                  <span className="font-bold text-[#0B3C5D] tabular-nums">+3,400 L (+28.3%)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00A6C7] h-full rounded-full" style={{ width: '28.3%' }} />
                </div>
                <p className="text-[11px] text-[#62748A]">
                  Historical 14% domestic uplift from residential occupancy, clubhouse pool replenishment, and laundry.
                </p>
              </div>

              {/* Driver 3 */}
              <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-[#0B3C5D]" />
                    Municipal Pressure Throttling
                  </span>
                  <span className="font-bold text-[#0B3C5D] tabular-nums">+1,800 L (+15.0%)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0B3C5D] h-full rounded-full" style={{ width: '15%' }} />
                </div>
                <p className="text-[11px] text-[#62748A]">
                  Regional utility off-peak line maintenance lowering inlet pressure, triggering booster pump recharge.
                </p>
              </div>

              {/* Driver 4 */}
              <div className="p-3 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#172B4D] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#62748A]" />
                    Base Greenspace Maintenance
                  </span>
                  <span className="font-bold text-[#62748A] tabular-nums">+600 L (+5.1%)</span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#62748A] h-full rounded-full" style={{ width: '5.1%' }} />
                </div>
                <p className="text-[11px] text-[#62748A]">
                  Scheduled turf aeration and baseline soil conditioning across Phase 2 parklands.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#DFE7EF]/60 text-[11px] text-[#62748A] flex items-start gap-1.5">
            <Verified className="w-4 h-4 text-[#00A6C7] shrink-0 mt-0.5" />
            <span>
              Constraint regression trained on 18 months of Green Valley telemetry. Zero black-box heuristics; 100% auditable sensor weighting.
            </span>
          </div>
        </div>
      </div>

      {/* Mitigation Sandbox (5 cols) & Sector Table (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (5 cols): Scenario Mitigation Sandbox */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#00A6C7]" />
                <h3 className="text-base font-bold text-[#0B3C5D]">Scenario Mitigation Sandbox</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#F4F8FB] text-[#0B3C5D] text-[10px] font-bold">
                Active Model Test
              </span>
            </div>

            <p className="text-xs text-[#62748A]">
              Simulate administrative intervention protocols to neutralize projected weekend peak exceedance below 100,000 L/day.
            </p>

            {/* Interactive Toggles */}
            <div className="space-y-2.5">
              {/* Lever 1 */}
              <div className="p-3.5 rounded-xl bg-[#FAFCFE] border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D] block">Enforce Level-2 Irrigation Restrictions</span>
                    <span className="text-[11px] text-[#62748A]">Suspend automated landscape sprinklers 06:00–21:00</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mitigateIrrigation}
                    onChange={(e) => setMitigateIrrigation(e.target.checked)}
                    className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer shrink-0 mt-1"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#00A6C7]">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Mitigates -4,500 L/day
                  </span>
                  <span className="text-[#62748A] text-[11px]">Peak 112k → 107.5k L</span>
                </div>
              </div>

              {/* Lever 2 */}
              <div className="p-3.5 rounded-xl bg-[#FAFCFE] border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D]">Shift Commercial HVAC Pre-Cooling</span>
                    <span className="text-[11px] text-[#62748A]">Run chillers 01:00–05:00 low-evaporation cycle</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mitigateHvac}
                    onChange={(e) => setMitigateHvac(e.target.checked)}
                    className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer shrink-0 mt-1"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#00A6C7]">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Mitigates -2,200 L/day
                  </span>
                  <span className="text-[#62748A] text-[11px]">Peak 107.5k → 105.3k L</span>
                </div>
              </div>

              {/* Lever 3 */}
              <div className="p-3.5 rounded-xl bg-[#FAFCFE] border border-[#DFE7EF] space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#0B3C5D]">Deploy Rainwater Buffer Reserves</span>
                    <span className="text-[11px] text-[#62748A]">Route Tank A & B non-potable reserves to secondary mains</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mitigateRainwater}
                    onChange={(e) => setMitigateRainwater(e.target.checked)}
                    className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer shrink-0 mt-1"
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#00A6C7]">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" /> Neutralizes -5,000 L/day
                  </span>
                  <span className="text-[#62748A] text-[11px]">Peak 105.3k → 100.3k L</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Sandbox Result Ribbon */}
          <div className="mt-4 p-4 rounded-xl bg-[#E0F2F1] border border-[#18A999]/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#004E5F] uppercase tracking-wider">Projected Net Result</span>
              <span className="font-bold text-[#0D685E] tabular-nums">
                {isDeficitEliminated ? `Deficit Eliminated (-${totalRelief.toLocaleString()} L)` : `Shortfall Remaining (+${(simulatedPeak - 100000).toLocaleString()} L)`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#0B3C5D] tabular-nums">
                Simulated Peak: {simulatedPeak.toLocaleString()} L
              </span>
              <span className="px-2 py-0.5 rounded bg-white text-[#0D685E] text-xs font-bold shadow-2xs">
                {((simulatedPeak / 100000) * 100).toFixed(1)}% Capacity
              </span>
            </div>

            {userRole === 'admin' ? (
              <button
                type="button"
                onClick={handleCommitSimulation}
                className="w-full py-2 bg-[#0B3C5D] hover:bg-[#082C44] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Commit Simulation to Water Budget Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="text-center text-xs text-[#62748A] italic">Admin login required to commit changes.</div>
            )}
          </div>
        </div>

        {/* Right (7 cols): Sector-by-Sector Forecast Breakdown Table */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-xl border border-[#DFE7EF] shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#DFE7EF]/60">
              <div>
                <h3 className="text-base font-bold text-[#0B3C5D]">Sector-by-Sector Forecast Allocation</h3>
                <p className="text-xs text-[#62748A]">Baseline variance comparison and municipal quota risk exposure.</p>
              </div>
              <span className="px-2.5 py-1 bg-[#F4F8FB] border border-[#DFE7EF] text-[#0B3C5D] rounded-lg text-xs font-semibold">
                All 4 Zones
              </span>
            </div>

            {/* High-Density Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F8FB] text-[#62748A] text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Consumer Sector</th>
                    <th className="py-2.5 px-3">Baseline</th>
                    <th className="py-2.5 px-3">Forecast Peak</th>
                    <th className="py-2.5 px-3">Projected Delta</th>
                    <th className="py-2.5 px-3">Risk Rating</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE7EF]/60">
                  <tr className="hover:bg-[#F4F8FB]/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0B3C5D]">Residential (Phases 1–4)</div>
                      <div className="text-[11px] text-[#62748A]">542 Metered Units</div>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-[#62748A]">60,000 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#0B3C5D]">67,000 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#D64545]">+11.6%</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">
                        Elevated Demand
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('water-budget')}
                        className="text-[#00A6C7] font-semibold hover:underline"
                      >
                        Adjust Quota
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F4F8FB]/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0B3C5D]">Commercial & Retail Center</div>
                      <div className="text-[11px] text-[#62748A]">28 Leased Facilities</div>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-[#62748A]">20,000 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#0B3C5D]">23,500 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#D64545]">+17.5%</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#E1F5FE] text-[#00677D] text-[10px] font-bold">
                        Elevated Demand
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigate('water-budget')}
                        className="text-[#00A6C7] font-semibold hover:underline"
                      >
                        Adjust Quota
                      </button>
                    </td>
                  </tr>

                  <tr className="bg-[#FFEBEE]/20 hover:bg-[#FFEBEE]/40">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#D64545]">Facilities & Turf Irrigation</div>
                      <div className="text-[11px] text-[#62748A]">14 Sub-Main Valves</div>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-[#62748A]">12,000 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#D64545]">16,500 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#D64545]">+37.5%</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#D64545] text-[10px] font-bold">
                        Severe Deficit Risk
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={onOpenSimulation}
                        className="text-[#D64545] font-bold hover:underline"
                      >
                        Throttle Valve
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-[#F4F8FB]/50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0B3C5D]">Emergency & Safety Reserve</div>
                      <div className="text-[11px] text-[#62748A]">Inviolable Buffer</div>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-[#62748A]">10,000 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#0B3C5D]">10,000 L</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-[#00A6C7]">0.0%</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-[#E2E8F0] text-[#0B3C5D] text-[10px] font-bold">
                        Protected Buffer
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[#62748A] text-[11px]">
                      Locked (Law)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#DFE7EF]/60 flex items-center justify-between text-xs text-[#62748A] flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Verified className="w-4 h-4 text-[#00A6C7]" />
              <span>Cross-validated against municipal flow meters with zero packet drops in 72 hours.</span>
            </span>
            <span className="font-bold text-[#0B3C5D] tabular-nums">System Sum: 112,000 L Peak vs 100,000 L Yield</span>
          </div>
        </div>
      </div>

      {/* Automated Peak-Demand Safeguard Trigger Banner */}
      <div className="bg-[#0B3C5D] text-white p-5 sm:p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-[#00A6C7]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-base font-bold text-white block">
              Automated Peak-Demand Safeguard Trigger is Armed
            </span>
            <p className="text-xs text-[#E1F5FE] mt-1 max-w-2xl leading-relaxed">
              If Friday 10:00 demand exceeds 92,000 L/day trajectory, Aqua Mind AI will automatically throttle Zone 4 landscape feeder valves by 40% and issue community conservation SMS alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
          >
            Configure Thresholds
          </button>
          <button
            type="button"
            onClick={() => setSafeguardAcknowledged(!safeguardAcknowledged)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
              safeguardAcknowledged
                ? 'bg-[#18A999] text-white'
                : 'bg-[#00A6C7] hover:bg-[#008FA8] text-white'
            }`}
          >
            {safeguardAcknowledged ? '✓ Acknowledged' : 'Acknowledge Safeguard'}
          </button>
        </div>
      </div>
    </div>
  );
};

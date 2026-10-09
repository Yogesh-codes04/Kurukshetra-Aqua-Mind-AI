import React, { useState } from 'react';
import { ArrowRight, Check, Droplets, Sparkles, Sun, Thermometer, X } from 'lucide-react';

interface SimulateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (scenario: {
    residential: number;
    commercial: number;
    facilities: number;
    landscaping: number;
  }) => void;
}

export const SimulateScenarioModal: React.FC<SimulateScenarioModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
}) => {
  const [tempDelta, setTempDelta] = useState(4); // +4°C heatwave
  const [irrigationCut, setIrrigationCut] = useState(35); // 35% cut
  const [hvacShift, setHvacShift] = useState(true); // shift chiller
  const [rainwaterAux, setRainwaterAux] = useState(true); // auxiliary rainwater

  if (!isOpen) return null;

  // Base forecast surge is 112,000 L
  const baseSurge = 112000;
  // Weather impact: +1,200 L per degree above baseline
  const weatherSurge = (tempDelta - 2) * 1200;
  // Mitigations
  const irrigationSavings = Math.round(7500 * (irrigationCut / 100));
  const hvacSavings = hvacShift ? 2200 : 0;
  const rainwaterSavings = rainwaterAux ? 5000 : 0;
  const totalMitigated = irrigationSavings + hvacSavings + rainwaterSavings;

  const simulatedPeak = Math.max(90000, baseSurge + weatherSurge - totalMitigated);
  const netDeficit = Math.max(0, simulatedPeak - 100000);
  const isDeficitNeutralized = netDeficit === 0;

  const handleApply = () => {
    onApplyScenario({
      residential: 52000,
      commercial: hvacShift ? 18000 : 20000,
      facilities: 12000,
      landscaping: Math.max(3500, 7500 - irrigationSavings),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C5D]/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#DFE7EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-[#DFE7EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E1F5FE] text-[#00677D] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#00A6C7]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B3C5D] text-base">Conservation Scenario Sandbox</h3>
              <p className="text-xs text-[#62748A]">Model micro-climate stress & test load-shedding interventions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#62748A] hover:text-[#172B4D] hover:bg-[#F4F8FB] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Weather Stress Slider */}
          <div className="p-3.5 bg-[#F4F8FB] rounded-xl border border-[#DFE7EF]/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#D64545]" />
                <span className="text-xs font-bold text-[#172B4D]">Ambient Heatwave Lift</span>
              </div>
              <span className="text-xs font-bold text-[#D64545] tabular-nums">+{tempDelta}°C (Peak ~{30 + tempDelta}°C)</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={tempDelta}
              onChange={(e) => setTempDelta(Number(e.target.value))}
              className="w-full h-2 bg-[#DFE7EF] rounded-lg accent-[#D64545] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#62748A] mt-1 font-medium">
              <span>Nominal (0°C)</span>
              <span>Moderate (+4°C)</span>
              <span>Severe Extreme (+8°C)</span>
            </div>
          </div>

          {/* Intervention Levers */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-[#62748A] uppercase tracking-wider block">
              Active Intervention Levers
            </span>

            {/* Lever 1: Irrigation cut */}
            <div className="p-3 bg-white rounded-xl border border-[#DFE7EF] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#172B4D]">Common Parkland Irrigation Curtailment</span>
                <span className="text-xs font-bold text-[#18A999] tabular-nums">-{irrigationCut}% (-{irrigationSavings.toLocaleString()} L/day)</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={irrigationCut}
                onChange={(e) => setIrrigationCut(Number(e.target.value))}
                className="w-full h-1.5 bg-[#DFE7EF] rounded-lg accent-[#18A999] cursor-pointer"
              />
            </div>

            {/* Lever 2: Commercial HVAC */}
            <label className="p-3 bg-white rounded-xl border border-[#DFE7EF] flex items-center justify-between cursor-pointer hover:bg-[#F4F8FB] transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#172B4D]">Commercial HVAC Pre-Cooling Shift</span>
                <span className="text-[11px] text-[#62748A]">Run chillers 01:00-05:00 low-evaporation cycle</span>
              </div>
              <input
                type="checkbox"
                checked={hvacShift}
                onChange={(e) => setHvacShift(e.target.checked)}
                className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer"
              />
            </label>

            {/* Lever 3: Rainwater tank buffer */}
            <label className="p-3 bg-white rounded-xl border border-[#DFE7EF] flex items-center justify-between cursor-pointer hover:bg-[#F4F8FB] transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#172B4D]">Rainwater Catchment Auxiliary Injection</span>
                <span className="text-[11px] text-[#62748A]">Route 5,000 L non-potable reserve into secondary mains</span>
              </div>
              <input
                type="checkbox"
                checked={rainwaterAux}
                onChange={(e) => setRainwaterAux(e.target.checked)}
                className="w-4 h-4 text-[#00A6C7] rounded focus:ring-0 cursor-pointer"
              />
            </label>
          </div>

          {/* Dynamic Calculated Outcome Card */}
          <div className={`p-4 rounded-xl border transition-all ${
            isDeficitNeutralized ? 'bg-[#E0F2F1] border-[#18A999]/40' : 'bg-[#FFEBEE] border-[#D64545]/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">Simulated Projected Peak</span>
              <span className={`text-base font-bold tabular-nums ${isDeficitNeutralized ? 'text-[#0D685E]' : 'text-[#D64545]'}`}>
                {simulatedPeak.toLocaleString()} L / day
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5 font-medium">
              <span className="text-[#62748A]">Hydrological Safe Yield Ceiling: 100,000 L</span>
              <span className={`font-bold ${isDeficitNeutralized ? 'text-[#0D685E]' : 'text-[#D64545]'}`}>
                {isDeficitNeutralized ? '✓ Deficit Neutralized' : `⚠️ Shortfall: +${netDeficit.toLocaleString()} L`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 p-4 border-t border-[#DFE7EF] bg-[#FAFCFE]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#62748A] hover:text-[#172B4D] rounded-lg hover:bg-[#F4F8FB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0B3C5D] hover:bg-[#082C44] rounded-lg shadow-xs transition-all"
          >
            <span>Apply Simulation to Budget</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

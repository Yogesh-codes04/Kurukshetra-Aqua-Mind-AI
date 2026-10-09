import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Droplets,
  HardHat,
  Info,
  X,
} from 'lucide-react';
import { MeterReadingRecord } from '../../types/water';

interface RecordReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reading: MeterReadingRecord) => void;
}

export const RecordReadingModal: React.FC<RecordReadingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [zone, setZone] = useState('Green Valley Co-op Society (MTR-GV101)');
  const [volume, setVolume] = useState('24500');
  const [source, setSource] = useState<'manual' | 'sensor'>('manual');
  const [readingType, setReadingType] = useState('24h_cycle');
  const [readingDate, setReadingDate] = useState(() => {
    const now = new Date();
    // format as YYYY-MM-DDTHH:mm
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });
  const [operatorNotes, setOperatorNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVolume = Number(volume);

    if (isNaN(parsedVolume) || parsedVolume < 0) {
      setValidationError('Measured volume must be a non-negative number.');
      return;
    }

    setValidationError(null);
    setIsSubmitted(true);

    const meterIdMatch = zone.match(/MTR-\d+/);
    const meterId = meterIdMatch ? meterIdMatch[0] : 'MTR-100';

    setTimeout(() => {
      const record: MeterReadingRecord = {
        id: `rec-${Date.now()}`,
        zone,
        meterId,
        volume: parsedVolume,
        readingDate,
        source,
        readingType,
        technicianNotes: operatorNotes.trim() || undefined,
        recordedAt: new Date().toISOString(),
      };

      onSuccess(record);
      setIsSubmitted(false);
      onClose();
    }, 400);
  };

  const parsedVolume = Number(volume) || 0;
  const isHigh = parsedVolume > 15000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C5D]/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DFE7EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#DFE7EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E1F5FE] text-[#00677D] flex items-center justify-center">
              <Droplets className="w-5 h-5 text-[#00A6C7]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B3C5D] text-base">Record Water Reading</h3>
              <p className="text-xs text-[#62748A]">
                Log verified meter reading with explicit source attribution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#62748A] hover:text-[#172B4D] hover:bg-[#F4F8FB] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Source Attribution (Explicit distinction between manual and sensor) */}
          <div>
            <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1.5">
              Reading Source Attribution <span className="text-[#D64545]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSource('manual')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  source === 'manual'
                    ? 'border-[#00A6C7] bg-[#E1F5FE]/40 text-[#0B3C5D] ring-2 ring-[#00A6C7]/30'
                    : 'border-[#DFE7EF] bg-white text-[#62748A] hover:bg-[#F4F8FB]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-[#00A6C7]" />
                  <span className="text-xs font-bold">Manual Field Entry</span>
                </div>
                <span className="text-[11px] leading-tight opacity-80">
                  Logged on-site by technician via mechanical dial or inspection
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('sensor')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  source === 'sensor'
                    ? 'border-[#00A6C7] bg-[#E1F5FE]/40 text-[#0B3C5D] ring-2 ring-[#00A6C7]/30'
                    : 'border-[#DFE7EF] bg-white text-[#62748A] hover:bg-[#F4F8FB]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-[#0B3C5D]" />
                  <span className="text-xs font-bold">Sensor Source</span>
                </div>
                <span className="text-[11px] leading-tight opacity-80">
                  Direct pulse / ultrasonic flow meter output
                </span>
              </button>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#62748A]">
              <Info className="w-3.5 h-3.5 text-[#00A6C7] shrink-0" />
              <span>
                {source === 'manual'
                  ? 'Source tagged: Human manual entry. Will not overwrite certified sensor baselines without supervisor sign-off.'
                  : 'Source tagged: Automated sensor reading. Includes electronic verification checksum.'}
              </span>
            </div>
          </div>

          {/* Zone Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
              Select Zone / Sub-Meter
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-medium focus:outline-none focus:border-[#00A6C7]"
            >
              <option value="Green Valley Co-op Society (MTR-GV101)">Green Valley Co-op Society (MTR-GV101 • 542 Units)</option>
              <option value="Silver Oak Heights Society (MTR-SO202)">Silver Oak Heights Society (MTR-SO202 • 380 Units)</option>
              <option value="Palm Meadows Eco-Society (MTR-PM303)">Palm Meadows Eco-Society (MTR-PM303 • 290 Villas)</option>
              <option value="General County Hospital ICU Feeder (MTR-HOSP501)">General County Hospital ICU Feeder (MTR-HOSP501 • Critical)</option>
              <option value="Metro Tech Park & Commercial Co. (MTR-TECH301)">Metro Tech Park & Commercial Co. (MTR-TECH301 • Commercial)</option>
              <option value="District Unified School Main (MTR-SCH204)">District Unified School Main (MTR-SCH204 • Education)</option>
              <option value="Central Municipal Park Turf (MTR-PRK408)">Central Municipal Park Turf (MTR-PRK408 • Recreation)</option>
            </select>
          </div>

          {/* Volume and Reading Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                Measured Volume (Litres)
              </label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                min="0"
                step="50"
                required
                className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-bold tabular-nums focus:outline-none focus:border-[#00A6C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
                Reading Mode
              </label>
              <select
                value={readingType}
                onChange={(e) => setReadingType(e.target.value)}
                className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-sm text-[#172B4D] font-medium focus:outline-none focus:border-[#00A6C7]"
              >
                <option value="24h_cycle">24-Hour Cycle Sum</option>
                <option value="instantaneous">Instantaneous Flow Check</option>
                <option value="calibration">Sensor Calibration Check</option>
              </select>
            </div>
          </div>

          {/* Date & Time of Reading */}
          <div>
            <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
              Reading Timestamp
            </label>
            <input
              type="datetime-local"
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              required
              className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs text-[#172B4D] font-medium focus:outline-none focus:border-[#00A6C7]"
            />
          </div>

          {/* Real-time Validation Feedback */}
          {validationError && (
            <div className="p-3 rounded-xl border border-[#D64545]/40 bg-[#FFF5F5] text-[#D64545] text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              isHigh
                ? 'bg-[#FFF8E1] border-[#F4B942]/40 text-[#875E03]'
                : 'bg-[#E8F5E9] border-[#18A999]/30 text-[#0D685E]'
            }`}
          >
            {isHigh ? (
              <AlertTriangle className="w-4 h-4 text-[#F4B942] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#18A999] shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold">
                {isHigh ? 'High Consumption Alert Threshold' : 'Expected Range Profile'}
              </span>
              <p className="mt-0.5 text-[11px] opacity-90">
                {isHigh
                  ? 'Entered volume exceeds baseline typical 24h threshold for this sub-meter.'
                  : 'Volume falls within the expected municipal operating range.'}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#62748A] uppercase tracking-wider mb-1">
              Field Technician Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., Acoustic leak check clear; static pressure verified at 3.9 bar."
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F8FB] border border-[#DFE7EF] rounded-lg text-xs text-[#172B4D] focus:outline-none focus:border-[#00A6C7]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DFE7EF]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#62748A] hover:text-[#172B4D] rounded-lg hover:bg-[#F4F8FB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitted}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0B3C5D] hover:bg-[#082C44] rounded-lg shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitted ? (
                'Committing...'
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00A6C7]" />
                  <span>Commit to Reading Ledger</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Check, Copy, Download, FileSpreadsheet, FileText, X } from 'lucide-react';
import { julyReportRecords } from '../../data/mockData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportName?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  reportName = 'Aqua Mind AI — July 2025 Hydro-Audit Report',
}) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCsv = () => {
    const headers = 'Day,Date,Metered_Flow_L,Budget_Ceiling_L,Baseline_Normal_L,Variance_Delta_L\n';
    const rows = julyReportRecords
      .map(
        (r) =>
          `${r.day},${r.dateStr},${r.actual},${r.budgetCeiling},${r.baseline30d},${r.actual - r.budgetCeiling}`
      )
      .join('\n');
    return headers + rows;
  };

  const handleDownload = () => {
    const content = format === 'csv' ? generateCsv() : JSON.stringify(julyReportRecords, null, 2);
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const filename = `aquamind_audit_july_2025.${format}`;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const content = format === 'csv' ? generateCsv() : JSON.stringify(julyReportRecords, null, 2);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3C5D]/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-[#DFE7EF] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-[#DFE7EF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E1F5FE] text-[#00677D] flex items-center justify-center">
              <Download className="w-5 h-5 text-[#00A6C7]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B3C5D] text-base">Export Telemetry Dataset</h3>
              <p className="text-xs text-[#62748A]">Audited ground-truth records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#62748A] hover:text-[#172B4D] hover:bg-[#F4F8FB] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-xs font-semibold text-[#62748A] uppercase tracking-wider block mb-1.5">
              Select File Format
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  format === 'csv'
                    ? 'border-[#00A6C7] bg-[#E1F5FE]/40 text-[#00677D] font-bold shadow-xs'
                    : 'border-[#DFE7EF] bg-white text-[#62748A] hover:bg-[#F4F8FB]'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs font-semibold">CSV Format</div>
                  <div className="text-[10px] opacity-80">Excel / Spreadsheet</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  format === 'json'
                    ? 'border-[#00A6C7] bg-[#E1F5FE]/40 text-[#00677D] font-bold shadow-xs'
                    : 'border-[#DFE7EF] bg-white text-[#62748A] hover:bg-[#F4F8FB]'
                }`}
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="text-xs font-semibold">JSON Ledger</div>
                  <div className="text-[10px] opacity-80">Cryptographic Payload</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-[#F4F8FB] p-3 rounded-xl border border-[#DFE7EF] text-xs space-y-1">
            <div className="flex justify-between text-[#62748A]">
              <span>Dataset Scope:</span>
              <span className="font-semibold text-[#172B4D]">31 Days Telemetry (July 2025)</span>
            </div>
            <div className="flex justify-between text-[#62748A]">
              <span>Smart Meter Transmitters:</span>
              <span className="font-semibold text-[#172B4D]">128 Nodes (0 packet loss)</span>
            </div>
            <div className="flex justify-between text-[#62748A]">
              <span>Audit Signature:</span>
              <span className="font-mono text-[#00677D]">ISO 14046 Hash #8F4A2</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-[#DFE7EF] bg-[#FAFCFE]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#62748A] hover:text-[#172B4D] hover:bg-[#F4F8FB] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#18A999]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#62748A] hover:text-[#172B4D] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0B3C5D] hover:bg-[#082C44] rounded-lg shadow-xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

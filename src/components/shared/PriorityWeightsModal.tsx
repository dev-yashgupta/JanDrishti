'use client';
import { useState } from 'react';
import { X, Sliders, Check, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface PriorityWeightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (weights: { severity: number; urgency: number; frequency: number; impact: number; geo: number }) => void;
}

export function PriorityWeightsModal({ isOpen, onClose, onSave }: PriorityWeightsModalProps) {
  const toast = useToast();
  const [severity, setSeverity]   = useState(30);
  const [urgency, setUrgency]     = useState(25);
  const [frequency, setFrequency] = useState(20);
  const [impact, setImpact]       = useState(15);
  const [geo, setGeo]             = useState(10);

  if (!isOpen) return null;

  const total = severity + urgency + frequency + impact + geo;

  function handleReset() {
    setSeverity(30);
    setUrgency(25);
    setFrequency(20);
    setImpact(15);
    setGeo(10);
  }

  function handleSave() {
    if (total !== 100) {
      toast.warning('Weights Must Total 100%', `Current sum is ${total}%. Please adjust the sliders.`);
      return;
    }
    if (onSave) {
      onSave({ severity, urgency, frequency, impact, geo });
    }
    toast.success('Weights Saved', 'Priority ranking engine updated and re-computed.');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-[0_25px_50px_-12px_rgba(7,26,47,0.25)] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E7EC] flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#155EEF] flex items-center justify-center">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Weighting Engine Configuration</h3>
              <p className="text-[11px] text-slate-500">Fine-tune the 5 algorithmic weights used to score civic issues.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="p-6 space-y-4 text-xs">
          
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Severity of Grievance (Safety, hazard, contamination)</span>
              <span className="font-bold text-[#D92D20]">{severity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={severity}
              onChange={e => setSeverity(parseInt(e.target.value))}
              className="w-full accent-[#D92D20] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Urgency & Escalation (SLA countdown risk)</span>
              <span className="font-bold text-[#F79009]">{urgency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={urgency}
              onChange={e => setUrgency(parseInt(e.target.value))}
              className="w-full accent-[#F79009] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Frequency & Re-occurrences (Cluster repeated reports)</span>
              <span className="font-bold text-[#155EEF]">{frequency}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={frequency}
              onChange={e => setFrequency(parseInt(e.target.value))}
              className="w-full accent-[#155EEF] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Community Impact (Population scale affected)</span>
              <span className="font-bold text-[#0E9384]">{impact}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={impact}
              onChange={e => setImpact(parseInt(e.target.value))}
              className="w-full accent-[#0E9384] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Geographic Density (Spatial clustering halo multiplier)</span>
              <span className="font-bold text-purple-600">{geo}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={geo}
              onChange={e => setGeo(parseInt(e.target.value))}
              className="w-full accent-purple-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Sum Validator */}
          <div className={`p-3 rounded-xl border flex items-center justify-between font-semibold ${
            total === 100
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <span>Total Combined Weights:</span>
            <span className="font-bold text-sm">{total}% {total === 100 ? '(Valid)' : '(Must equal 100%)'}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-[#E4E7EC] flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Standard</span>
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E4E7EC] text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-[#155EEF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save & Recalculate</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SampleSpot } from '../types/materials';
import { X, ExternalLink, ShieldCheck, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface SpotDetailDrawerProps {
  spot: SampleSpot | null;
  onClose: () => void;
  onNavigateToTab: (tab: 'matrix' | 'printer' | 'characterization' | 'python' | 'fair') => void;
}

export const SpotDetailDrawer: React.FC<SpotDetailDrawerProps> = ({
  spot,
  onClose,
  onNavigateToTab,
}) => {
  if (!spot) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-slate-900">{spot.id}</span>
                <span className="text-xs text-slate-400 font-mono">·</span>
                <span className="text-xs text-slate-500 font-mono">
                  Row {String.fromCharCode(65 + spot.row)}, Col {spot.col + 1}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Substrate: X={spot.substrateCoordMm.x.toFixed(2)} mm, Y={spot.substrateCoordMm.y.toFixed(2)} mm
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-lg font-mono p-1"
            >
              ✕
            </button>
          </div>

          {/* Realizability & QC Status Badge */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Realizability Verdict</div>
              <div
                className={`text-sm font-bold font-mono mt-0.5 ${
                  spot.realizabilityLabel === 'synthesizable_optimal'
                    ? 'text-emerald-700'
                    : spot.realizabilityLabel.startsWith('partial')
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}
              >
                {spot.realizabilityLabel.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase font-mono text-slate-400">QC Status</div>
              <div className="text-xs font-bold font-mono text-slate-800 uppercase mt-0.5">
                {spot.qcStatus}
              </div>
            </div>
          </div>

          {/* Composition Section */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase font-mono text-slate-700">
              Stoichiometric Composition (Target vs Micro-XRF)
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-sky-800 font-semibold">Platinum (Pt)</span>
                <span>Target: {(spot.targetComposition.pt * 100).toFixed(1)}% · Measured: {(spot.xrf.measuredComposition.pt * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-amber-800 font-semibold">Palladium (Pd)</span>
                <span>Target: {(spot.targetComposition.pd * 100).toFixed(1)}% · Measured: {(spot.xrf.measuredComposition.pd * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-emerald-800 font-semibold">Nickel (Ni)</span>
                <span>Target: {(spot.targetComposition.ni * 100).toFixed(1)}% · Measured: {(spot.xrf.measuredComposition.ni * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-800 font-semibold">Cobalt (Co)</span>
                <span>Target: {(spot.targetComposition.co * 100).toFixed(1)}% · Measured: {(spot.xrf.measuredComposition.co * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-mono pt-1">
              Micro-XRF Stoichiometric Deviation: ±{spot.xrf.compositionDeviationPercent.toFixed(1)}% RMS error
            </div>
          </div>

          {/* Synthesis Deposition Conditions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold uppercase font-mono text-slate-700">
              Nanoparticle Jet Printing Parameters
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Platen Temperature</div>
                <div className="font-bold text-slate-800">{spot.printerRecipe.substrateTemperatureC} °C</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Piezo Voltage</div>
                <div className="font-bold text-slate-800">{spot.printerRecipe.piezoVoltageV} V</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Dispensing Freq</div>
                <div className="font-bold text-slate-800">{spot.printerRecipe.dispensingFreqKhz} kHz</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Sintering Temp</div>
                <div className="font-bold text-slate-800">{spot.printerRecipe.sinteringTempC} °C (180s)</div>
              </div>
            </div>
          </div>

          {/* SEM Morphology Details */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-xs font-bold uppercase font-mono text-slate-700">
              SEM Micrograph Metrics
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Grain Size</div>
                <div className="font-bold text-slate-800">{spot.sem.meanGrainSizeNm} nm</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Porosity</div>
                <div className="font-bold text-slate-800">{spot.sem.porosityPercent}%</div>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <div className="text-slate-400 text-[10px]">Ring Index S</div>
                <div className="font-bold text-slate-800">{spot.sem.radialSegregationIndex.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* QC Notes & Provenance */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-800">Scientist & QC Log:</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">{spot.qcNotes}</p>
            <div className="text-[10px] text-slate-400 font-mono pt-1">
              Provenance Hash: {spot.provenanceHash} · Timestamp: {new Date(spot.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Quick Navigation Footer */}
        <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onNavigateToTab('characterization');
              onClose();
            }}
            className="py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors text-center"
          >
            Open in Micro-XRF & SEM
          </button>
          <button
            onClick={() => {
              onNavigateToTab('python');
              onClose();
            }}
            className="py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors text-center"
          >
            Run Python Pipeline
          </button>
        </div>
      </div>
    </div>
  );
};

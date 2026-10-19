/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialLibrary, SampleSpot, RealizabilityLabel } from '../types/materials';
import { Layers, Activity, AlertTriangle, CheckCircle, Crosshair, Sparkles } from 'lucide-react';

interface LibraryMatrixViewProps {
  library: MaterialLibrary;
  selectedSpot: SampleSpot;
  onSelectSpot: (spot: SampleSpot) => void;
  onOpenSpotDrawer: (spot: SampleSpot) => void;
}

export type HeatmapMode = 'composition' | 'overpotential' | 'xrf_deviation' | 'realizability';

export const LibraryMatrixView: React.FC<LibraryMatrixViewProps> = ({
  library,
  selectedSpot,
  onSelectSpot,
  onOpenSpotDrawer,
}) => {
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('composition');
  const [hoveredSpot, setHoveredSpot] = useState<SampleSpot | null>(null);
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'optimal' | 'partial' | 'negative'>('all');

  // Outcome statistics
  const total = library.spots.length;
  const optimalCount = library.spots.filter((s) => s.realizabilityLabel === 'synthesizable_optimal').length;
  const partialCount = library.spots.filter(
    (s) => s.realizabilityLabel === 'partial_segregated_ring' || s.realizabilityLabel === 'partial_microcracked'
  ).length;
  const negativeCount = library.spots.filter(
    (s) => s.realizabilityLabel === 'negative_dewetted' || s.realizabilityLabel === 'negative_nozzle_clogged'
  ).length;

  // Filtered spots check
  const isSpotVisible = (s: SampleSpot) => {
    if (outcomeFilter === 'all') return true;
    if (outcomeFilter === 'optimal') return s.realizabilityLabel === 'synthesizable_optimal';
    if (outcomeFilter === 'partial')
      return s.realizabilityLabel === 'partial_segregated_ring' || s.realizabilityLabel === 'partial_microcracked';
    if (outcomeFilter === 'negative')
      return s.realizabilityLabel === 'negative_dewetted' || s.realizabilityLabel === 'negative_nozzle_clogged';
    return true;
  };

  // Compute spot background color based on active mode
  const getSpotColor = (spot: SampleSpot) => {
    if (heatmapMode === 'composition') {
      // Composition blend:
      // Pt: Cyan (0, 180, 216), Pd: Amber (245, 158, 11), Ni: Emerald (16, 185, 129), Co: Violet (139, 92, 246)
      const r = Math.round(spot.targetComposition.pd * 245 + spot.targetComposition.co * 139);
      const g = Math.round(spot.targetComposition.pt * 180 + spot.targetComposition.ni * 185 + spot.targetComposition.pd * 158 * 0.6);
      const b = Math.round(spot.targetComposition.pt * 216 + spot.targetComposition.co * 246);
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (heatmapMode === 'overpotential') {
      // Overpotential scale: ~270 mV (best, dark blue) to 480 mV (worst, pale red/orange)
      const norm = Math.min(1, Math.max(0, (spot.predictedOverpotentialMv - 270) / 180));
      // Interpolate from deep indigo (270mV) to crimson (450mV)
      const r = Math.round(30 + norm * 200);
      const g = Math.round(70 + (1 - norm) * 110);
      const b = Math.round(200 * (1 - norm * 0.8));
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (heatmapMode === 'xrf_deviation') {
      // 0% (green) to 15%+ (red)
      const d = Math.min(15, spot.xrf.compositionDeviationPercent);
      if (d <= 3.0) return '#10b981'; // nominal
      if (d <= 6.0) return '#f59e0b'; // mild drift
      return '#ef4444'; // severe drift
    }

    if (heatmapMode === 'realizability') {
      switch (spot.realizabilityLabel) {
        case 'synthesizable_optimal':
          return '#059669'; // Emerald
        case 'partial_segregated_ring':
          return '#d97706'; // Amber
        case 'partial_microcracked':
          return '#e11d48'; // Rose
        case 'negative_dewetted':
          return '#dc2626'; // Red
        case 'negative_nozzle_clogged':
          return '#7f1d1d'; // Dark Red
        default:
          return '#64748b';
      }
    }

    return '#94a3b8';
  };

  const activeHover = hoveredSpot || selectedSpot;

  return (
    <div className="space-y-6">
      {/* Top Metric Strip (Clean Tabular Numbers, Zero-Pill) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border border-slate-200 rounded-lg">
        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Total Library Spots</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">{total}</span>
            <span className="text-xs text-slate-500 font-mono">8×8 array</span>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Synthesizable Optimal</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-700">{optimalCount}</span>
            <span className="text-xs text-slate-500 font-mono">({((optimalCount / total) * 100).toFixed(1)}%)</span>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Partial Outcomes</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-600">{partialCount}</span>
            <span className="text-xs text-slate-500 font-mono">ring / cracked</span>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Negative Outcomes</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">{negativeCount}</span>
            <span className="text-xs text-slate-500 font-mono">dewetted / clogged</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Wafer Grid Stage + Synchronized Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 8x8 Wafer Stage */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            {/* Heatmap Mode Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setHeatmapMode('composition')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  heatmapMode === 'composition' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Composition Blend
              </button>
              <button
                onClick={() => setHeatmapMode('overpotential')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  heatmapMode === 'overpotential' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overpotential
              </button>
              <button
                onClick={() => setHeatmapMode('xrf_deviation')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  heatmapMode === 'xrf_deviation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                XRF Drift
              </button>
              <button
                onClick={() => setHeatmapMode('realizability')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
                  heatmapMode === 'realizability' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Realizability
              </button>
            </div>

            {/* Outcome Filter Buttons */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className="hidden sm:inline">Filter:</span>
              <button
                onClick={() => setOutcomeFilter('all')}
                className={`px-2 py-0.5 rounded transition-colors ${outcomeFilter === 'all' ? 'bg-slate-200 text-slate-900 font-semibold' : 'hover:text-slate-900'}`}
              >
                All
              </button>
              <button
                onClick={() => setOutcomeFilter('optimal')}
                className={`px-2 py-0.5 rounded transition-colors ${outcomeFilter === 'optimal' ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'hover:text-slate-900'}`}
              >
                Optimal
              </button>
              <button
                onClick={() => setOutcomeFilter('partial')}
                className={`px-2 py-0.5 rounded transition-colors ${outcomeFilter === 'partial' ? 'bg-amber-100 text-amber-800 font-semibold' : 'hover:text-slate-900'}`}
              >
                Partial
              </button>
              <button
                onClick={() => setOutcomeFilter('negative')}
                className={`px-2 py-0.5 rounded transition-colors ${outcomeFilter === 'negative' ? 'bg-rose-100 text-rose-800 font-semibold' : 'hover:text-slate-900'}`}
              >
                Negative
              </button>
            </div>
          </div>

          {/* Wafer Platen Container */}
          <div className="relative p-6 bg-slate-950 rounded-lg flex flex-col items-center justify-center overflow-hidden border border-slate-800 shadow-inner">
            {/* Wafer substrate frame with millimeter ticks */}
            <div className="relative w-full max-w-[480px] aspect-square rounded-full border-2 border-slate-700 bg-slate-900/90 flex items-center justify-center p-8 shadow-2xl">
              {/* Glassy Carbon Chip Outline (Square inside round platen) */}
              <div className="relative w-full h-full bg-[#141923] border border-slate-600/70 rounded-md p-3.5 flex flex-col justify-between">
                {/* Substrate Header Marker */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-widest px-1">
                  <span>70×70mm GLASSY CARBON</span>
                  <span>FIDUCIAL (0,0)</span>
                </div>

                {/* 8x8 Matrix Grid */}
                <div className="grid grid-cols-8 gap-1.5 my-auto">
                  {library.spots.map((spot) => {
                    const isSelected = selectedSpot.id === spot.id;
                    const isHovered = hoveredSpot?.id === spot.id;
                    const visible = isSpotVisible(spot);
                    const spotBg = getSpotColor(spot);

                    return (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => {
                          onSelectSpot(spot);
                          onOpenSpotDrawer(spot);
                        }}
                        onMouseEnter={() => setHoveredSpot(spot)}
                        onMouseLeave={() => setHoveredSpot(null)}
                        className={`group relative aspect-square rounded-full flex items-center justify-center transition-all ${
                          !visible ? 'opacity-15 pointer-events-none' : 'opacity-100'
                        } ${
                          isSelected
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110 z-10'
                            : isHovered
                            ? 'scale-115 ring-1 ring-sky-400 z-10'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: spotBg }}
                        title={`${spot.id}: Pt${Math.round(spot.targetComposition.pt*100)}Pd${Math.round(spot.targetComposition.pd*100)}Ni${Math.round(spot.targetComposition.ni*100)}Co${Math.round(spot.targetComposition.co*100)}`}
                      >
                        {/* Micro-defect visualizer flags inside spot */}
                        {spot.realizabilityLabel === 'partial_segregated_ring' && (
                          <div className="w-1.5 h-1.5 rounded-full border border-amber-300 bg-amber-950/50" />
                        )}
                        {spot.realizabilityLabel === 'partial_microcracked' && (
                          <div className="w-2 h-0.5 bg-rose-200 rotate-45 transform" />
                        )}
                        {spot.realizabilityLabel === 'negative_dewetted' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white ring-1 ring-rose-500" />
                        )}
                        {spot.realizabilityLabel === 'negative_nozzle_clogged' && (
                          <div className="text-[7px] text-white font-mono font-bold leading-none">×</div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Substrate Footer Marker */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tracking-widest px-1">
                  <span>ROW A-H</span>
                  <span>COL 1-8</span>
                </div>
              </div>
            </div>

            {/* Stage HUD Legend */}
            <div className="mt-3 w-full flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono px-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Optimal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial (Ring/Crack)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Negative (Failed)
                </span>
              </div>
              <span>Click spot to inspect telemetry</span>
            </div>
          </div>
        </div>

        {/* Right: Synchronized Spot Telemetry Inspector */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 flex flex-col justify-between space-y-5">
          <div>
            {/* Spot Header with Realizability Callout */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-slate-900">{activeHover.id}</span>
                  <span className="text-xs text-slate-400 font-mono">·</span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({activeHover.substrateCoordMm.x.toFixed(1)}, {activeHover.substrateCoordMm.y.toFixed(1)} mm)
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Row {String.fromCharCode(65 + activeHover.row)}, Column {activeHover.col + 1}
                </div>
              </div>

              <div className="text-right">
                <div
                  className={`text-xs font-semibold uppercase tracking-wider font-mono ${
                    activeHover.realizabilityLabel === 'synthesizable_optimal'
                      ? 'text-emerald-700'
                      : activeHover.realizabilityLabel.startsWith('partial')
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}
                >
                  {activeHover.realizabilityLabel.replace(/_/g, ' ')}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">QC: {activeHover.qcStatus.toUpperCase()}</div>
              </div>
            </div>

            {/* Elemental Composition Breakdown (Target vs Measured XRF) */}
            <div className="mt-4 space-y-3">
              <div className="text-xs uppercase font-mono tracking-wider text-slate-400 flex justify-between">
                <span>Elemental Stoichiometry</span>
                <span>Target vs Micro-XRF</span>
              </div>

              {/* Pt */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-sky-800">Pt (Platinum)</span>
                  <span className="tabular-nums">
                    Target: {(activeHover.targetComposition.pt * 100).toFixed(1)}% · XRF: {(activeHover.xrf.measuredComposition.pt * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full"
                    style={{ width: `${activeHover.targetComposition.pt * 100}%` }}
                  />
                </div>
              </div>

              {/* Pd */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-amber-800">Pd (Palladium)</span>
                  <span className="tabular-nums">
                    Target: {(activeHover.targetComposition.pd * 100).toFixed(1)}% · XRF: {(activeHover.xrf.measuredComposition.pd * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${activeHover.targetComposition.pd * 100}%` }}
                  />
                </div>
              </div>

              {/* Ni */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-emerald-800">Ni (Nickel)</span>
                  <span className="tabular-nums">
                    Target: {(activeHover.targetComposition.ni * 100).toFixed(1)}% · XRF: {(activeHover.xrf.measuredComposition.ni * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${activeHover.targetComposition.ni * 100}%` }}
                  />
                </div>
              </div>

              {/* Co */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-purple-800">Co (Cobalt)</span>
                  <span className="tabular-nums">
                    Target: {(activeHover.targetComposition.co * 100).toFixed(1)}% · XRF: {(activeHover.xrf.measuredComposition.co * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${activeHover.targetComposition.co * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Performance & Quality Metrics Grid */}
            <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-slate-400 font-mono text-[11px] uppercase">Catalytic Overpotential</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  {activeHover.predictedOverpotentialMv} <span className="text-xs font-normal text-slate-500">mV</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">@ 10 mA/cm² ORR</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-slate-400 font-mono text-[11px] uppercase">XRF Stoichiometry Drift</div>
                <div className={`text-lg font-bold font-mono mt-0.5 ${activeHover.xrf.compositionDeviationPercent > 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                  ±{activeHover.xrf.compositionDeviationPercent.toFixed(1)} <span className="text-xs font-normal text-slate-500">%</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">RMS error vs Target</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-slate-400 font-mono text-[11px] uppercase">SEM Radial Segregation</div>
                <div className={`text-lg font-bold font-mono mt-0.5 ${activeHover.sem.radialSegregationIndex > 0.4 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {activeHover.sem.radialSegregationIndex.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Coffee-Ring Index S</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                <div className="text-slate-400 font-mono text-[11px] uppercase">Estimated Raw Cost</div>
                <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                  ${activeHover.predictedCostPerGramUsd.toFixed(2)} <span className="text-xs font-normal text-slate-500">/g</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Precious metal basis</div>
              </div>
            </div>

            {/* QC Assessment & Agent Note */}
            <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>AI Agent Diagnostic</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {activeHover.qcNotes}
              </p>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={() => onOpenSpotDrawer(activeHover)}
              className="w-full py-2 px-4 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <Crosshair className="w-3.5 h-3.5 text-sky-600" />
              <span>Open Detailed Metrology & G-Code Inspector</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

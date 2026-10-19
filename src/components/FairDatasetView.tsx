/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialLibrary, SampleSpot, RealizabilityLabel } from '../types/materials';
import { Download, Search, CheckCircle, AlertTriangle, AlertOctagon, GitCommit, FileJson, ArrowRight } from 'lucide-react';
import { generateFAIRJsonLd, generateCSVDataset, downloadTextFile } from '../services/fairExporter';

interface FairDatasetViewProps {
  library: MaterialLibrary;
  selectedSpot: SampleSpot;
  onSelectSpot: (spot: SampleSpot) => void;
  onOpenSpotDrawer: (spot: SampleSpot) => void;
}

export const FairDatasetView: React.FC<FairDatasetViewProps> = ({
  library,
  selectedSpot,
  onSelectSpot,
  onOpenSpotDrawer,
}) => {
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'optimal' | 'partial' | 'negative'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJsonLdModal, setShowJsonLdModal] = useState(false);
  const [lineageSpot, setLineageSpot] = useState<SampleSpot>(selectedSpot);

  // Statistics
  const total = library.spots.length;
  const optimalSpots = library.spots.filter((s) => s.realizabilityLabel === 'synthesizable_optimal');
  const partialSpots = library.spots.filter(
    (s) => s.realizabilityLabel === 'partial_segregated_ring' || s.realizabilityLabel === 'partial_microcracked'
  );
  const negativeSpots = library.spots.filter(
    (s) => s.realizabilityLabel === 'negative_dewetted' || s.realizabilityLabel === 'negative_nozzle_clogged'
  );

  // Filtered rows
  const filteredSpots = library.spots.filter((s) => {
    if (filterOutcome === 'optimal' && s.realizabilityLabel !== 'synthesizable_optimal') return false;
    if (
      filterOutcome === 'partial' &&
      s.realizabilityLabel !== 'partial_segregated_ring' &&
      s.realizabilityLabel !== 'partial_microcracked'
    )
      return false;
    if (
      filterOutcome === 'negative' &&
      s.realizabilityLabel !== 'negative_dewetted' &&
      s.realizabilityLabel !== 'negative_nozzle_clogged'
    )
      return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = s.id.toLowerCase().includes(q);
      const matchComp = `pt${Math.round(s.targetComposition.pt*100)}pd${Math.round(s.targetComposition.pd*100)}`.includes(q);
      const matchLabel = s.realizabilityLabel.toLowerCase().includes(q);
      return matchId || matchComp || matchLabel;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              FAIR-Aligned Dataset & Realizability Knowledge Base
            </h3>
            <p className="text-xs text-slate-500">
              Structured catalogue capturing positive, partial, and negative synthesis outcomes with full provenance for AI model development
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonLdModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
            >
              <FileJson className="w-3.5 h-3.5 text-sky-600" />
              <span>Inspect Schema.org JSON-LD</span>
            </button>

            <button
              onClick={() => downloadTextFile(`${library.id}_measurements.csv`, generateCSVDataset(library), 'text/csv')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full CSV Dataset</span>
            </button>
          </div>
        </div>

        {/* Realizability Yield Ratio Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="font-semibold text-slate-700">Realizability Outcome Distribution</span>
            <span className="text-slate-500">
              Optimal: {optimalSpots.length} ({((optimalSpots.length / total) * 100).toFixed(1)}%) · Partial: {partialSpots.length} · Negative: {negativeSpots.length}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${(optimalSpots.length / total) * 100}%` }}
              title={`Synthesizable Optimal: ${optimalSpots.length}`}
            />
            <div
              className="bg-amber-500 h-full transition-all"
              style={{ width: `${(partialSpots.length / total) * 100}%` }}
              title={`Partial (Segregated / Cracked): ${partialSpots.length}`}
            />
            <div
              className="bg-rose-600 h-full transition-all"
              style={{ width: `${(negativeSpots.length / total) * 100}%` }}
              title={`Negative (Dewetted / Clogged): ${negativeSpots.length}`}
            />
          </div>
        </div>
      </div>

      {/* Main Table + Lineage Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Filterable FAIR Samples Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setFilterOutcome('all')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterOutcome === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Outcomes ({total})
              </button>
              <button
                onClick={() => setFilterOutcome('optimal')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterOutcome === 'optimal' ? 'bg-white text-emerald-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Optimal ({optimalSpots.length})
              </button>
              <button
                onClick={() => setFilterOutcome('partial')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterOutcome === 'partial' ? 'bg-white text-amber-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Partial ({partialSpots.length})
              </button>
              <button
                onClick={() => setFilterOutcome('negative')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  filterOutcome === 'negative' ? 'bg-white text-rose-800 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Negative ({negativeSpots.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search spot ID or label..."
                className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:border-sky-600"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 font-mono">
                <tr>
                  <th className="px-3 py-2 text-left">Spot ID</th>
                  <th className="px-3 py-2 text-left">Target Composition</th>
                  <th className="px-3 py-2 text-right">XRF Drift</th>
                  <th className="px-3 py-2 text-right">Overpotential</th>
                  <th className="px-3 py-2 text-right">Segregation S</th>
                  <th className="px-3 py-2 text-left">Realizability Label</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {filteredSpots.map((spot) => {
                  const isSelected = spot.id === lineageSpot.id;

                  return (
                    <tr
                      key={spot.id}
                      onClick={() => setLineageSpot(spot)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3 py-2.5 font-bold text-slate-900">{spot.id}</td>
                      <td className="px-3 py-2.5 text-slate-700">
                        Pt{Math.round(spot.targetComposition.pt*100)}Pd{Math.round(spot.targetComposition.pd*100)}Ni{Math.round(spot.targetComposition.ni*100)}Co{Math.round(spot.targetComposition.co*100)}
                      </td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${spot.xrf.compositionDeviationPercent > 5 ? 'text-rose-600' : 'text-slate-800'}`}>
                        ±{spot.xrf.compositionDeviationPercent.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2.5 text-right">{spot.predictedOverpotentialMv} mV</td>
                      <td className={`px-3 py-2.5 text-right ${spot.sem.radialSegregationIndex > 0.4 ? 'text-amber-600 font-semibold' : 'text-slate-700'}`}>
                        {spot.sem.radialSegregationIndex.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`font-semibold text-[11px] ${
                            spot.realizabilityLabel === 'synthesizable_optimal'
                              ? 'text-emerald-700'
                              : spot.realizabilityLabel.startsWith('partial')
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {spot.realizabilityLabel.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSpot(spot);
                            onOpenSpotDrawer(spot);
                          }}
                          className="text-[11px] font-sans font-medium text-sky-700 hover:text-sky-900 hover:underline"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: End-to-End Provenance Lineage Graph (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">Provenance Lineage</h4>
            </div>
            <span className="text-xs text-slate-500 font-mono">{lineageSpot.id}</span>
          </div>

          <div className="space-y-3 relative pl-6 border-l-2 border-slate-200 ml-2">
            {/* Step 1: AI Proposal */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />
              <div className="text-xs font-bold text-slate-900">01. AI Composition Proposal</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Target: Pt{Math.round(lineageSpot.targetComposition.pt*100)}Pd{Math.round(lineageSpot.targetComposition.pd*100)}Ni{Math.round(lineageSpot.targetComposition.ni*100)}Co{Math.round(lineageSpot.targetComposition.co*100)}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Predicted overpotential: {lineageSpot.predictedOverpotentialMv} mV
              </div>
            </div>

            {/* Step 2: Printer Synthesis */}
            <div className="relative pt-2">
              <div className="absolute -left-[31px] top-2.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />
              <div className="text-xs font-bold text-slate-900">02. Nanoparticle Jet Printing</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Platen: {lineageSpot.printerRecipe.substrateTemperatureC}°C · Sinter: {lineageSpot.printerRecipe.sinteringTempC}°C
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Toolpath hash: {lineageSpot.provenanceHash}
              </div>
            </div>

            {/* Step 3: Micro-XRF Mapping */}
            <div className="relative pt-2">
              <div className="absolute -left-[31px] top-2.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />
              <div className="text-xs font-bold text-slate-900">03. Micro-XRF Metrology</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Deviation: ±{lineageSpot.xrf.compositionDeviationPercent.toFixed(1)}% · SNR: {lineageSpot.xrf.snrDb} dB
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Measured: Pt{Math.round(lineageSpot.xrf.measuredComposition.pt*100)}Pd{Math.round(lineageSpot.xrf.measuredComposition.pd*100)}Ni{Math.round(lineageSpot.xrf.measuredComposition.ni*100)}Co{Math.round(lineageSpot.xrf.measuredComposition.co*100)}
              </div>
            </div>

            {/* Step 4: SEM Micrograph */}
            <div className="relative pt-2">
              <div className="absolute -left-[31px] top-2.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />
              <div className="text-xs font-bold text-slate-900">04. SEM Morphology</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                Grain Size: {lineageSpot.sem.meanGrainSizeNm} nm · S Index: {lineageSpot.sem.radialSegregationIndex.toFixed(2)}
              </div>
            </div>

            {/* Step 5: FAIR Commit */}
            <div className="relative pt-2">
              <div
                className={`absolute -left-[31px] top-2.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                  lineageSpot.realizabilityLabel === 'synthesizable_optimal'
                    ? 'bg-emerald-600'
                    : lineageSpot.realizabilityLabel.startsWith('partial')
                    ? 'bg-amber-600'
                    : 'bg-rose-600'
                }`}
              />
              <div className="text-xs font-bold text-slate-900">05. Realizability Label Commit</div>
              <div className="text-[11px] font-mono font-semibold mt-0.5 text-slate-800">
                {lineageSpot.realizabilityLabel}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Inspector: {lineageSpot.inspector}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Schema.org Modal */}
      {showJsonLdModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">FAIR Schema.org Dataset (JSON-LD)</h4>
                <p className="text-xs text-slate-500">Materials Data Facility (MDF) semantic interoperability format</p>
              </div>
              <button
                onClick={() => setShowJsonLdModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg max-h-[380px] overflow-y-auto leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap">{generateFAIRJsonLd(library)}</pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateFAIRJsonLd(library));
                  alert('JSON-LD copied to clipboard!');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => downloadTextFile(`${library.id}_fair.jsonld`, generateFAIRJsonLd(library), 'application/ld+json')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors shadow-xs"
              >
                Download .jsonld
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

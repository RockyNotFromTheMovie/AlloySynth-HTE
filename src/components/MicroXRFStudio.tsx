/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialLibrary, SampleSpot } from '../types/materials';
import { Layers, Crosshair, ZoomIn, ZoomOut, CheckCircle, AlertTriangle } from 'lucide-react';

interface MicroXRFStudioProps {
  library: MaterialLibrary;
  selectedSpot: SampleSpot;
  onSelectSpot: (spot: SampleSpot) => void;
}

export const MicroXRFStudio: React.FC<MicroXRFStudioProps> = ({
  library,
  selectedSpot,
  onSelectSpot,
}) => {
  const [activeChannel, setActiveChannel] = useState<'composite' | 'pt' | 'pd' | 'ni' | 'co'>('composite');
  const [hoveredEnergy, setHoveredEnergy] = useState<{ kev: number; counts: number } | null>(null);

  const spectrum = selectedSpot.xrf.spectralData;

  // Max count for SVG spectrum normalization
  const maxCount = Math.max(...spectrum.intensityCounts, 100);

  // Compute spot channel intensity color for micro-XRF raster map
  const getXrfSpotColor = (spot: SampleSpot) => {
    const comp = spot.xrf.measuredComposition;

    if (activeChannel === 'pt') {
      const v = Math.round(comp.pt * 255);
      return `rgb(0, ${Math.round(v * 0.7)}, ${v})`;
    }
    if (activeChannel === 'pd') {
      const v = Math.round(comp.pd * 255);
      return `rgb(${v}, ${Math.round(v * 0.6)}, 10)`;
    }
    if (activeChannel === 'ni') {
      const v = Math.round(comp.ni * 255);
      return `rgb(10, ${v}, ${Math.round(v * 0.5)})`;
    }
    if (activeChannel === 'co') {
      const v = Math.round(comp.co * 255);
      return `rgb(${Math.round(v * 0.6)}, 20, ${v})`;
    }

    // Composite overlay
    const r = Math.round(comp.pd * 245 + comp.co * 139);
    const g = Math.round(comp.pt * 180 + comp.ni * 185 + comp.pd * 100);
    const b = Math.round(comp.pt * 220 + comp.co * 245);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="space-y-6">
      {/* Top Instrument Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 relative rounded-lg overflow-hidden border border-slate-200 aspect-video">
            <img
              src="/src/assets/images/micro_xrf_chamber_1792126216889.jpg"
              alt="Micro-X-ray Fluorescence Spectrometer Chamber"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3.5">
              <div className="text-white text-xs font-semibold">
                Micro-XRF Polycapillary Spectrometer
              </div>
              <div className="text-slate-300 text-[11px] font-mono">
                Spot Size: 25 µm FWHM · Mo Target 50 kV · SDD Detector
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  High-Throughput Micro-XRF Composition Mapping
                </h3>
                <p className="text-xs text-slate-500">
                  Quantitative elemental distribution across Pt, Pd, Ni, Co libraries with spectral deconvolution
                </p>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setActiveChannel('composite')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeChannel === 'composite' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Composite RGB
                </button>
                <button
                  onClick={() => setActiveChannel('pt')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeChannel === 'pt' ? 'bg-white text-sky-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pt Lα (9.44 keV)
                </button>
                <button
                  onClick={() => setActiveChannel('pd')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeChannel === 'pd' ? 'bg-white text-amber-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pd Lα (2.84 keV)
                </button>
                <button
                  onClick={() => setActiveChannel('ni')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeChannel === 'ni' ? 'bg-white text-emerald-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ni Kα (7.48 keV)
                </button>
                <button
                  onClick={() => setActiveChannel('co')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    activeChannel === 'co' ? 'bg-white text-purple-800 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Co Kα (6.93 keV)
                </button>
              </div>
            </div>

            {/* Micro-XRF Metrology Key Figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
                <div className="text-[11px] uppercase font-mono text-slate-400">Selected Spot</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{selectedSpot.id}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">X: {selectedSpot.substrateCoordMm.x.toFixed(1)}mm · Y: {selectedSpot.substrateCoordMm.y.toFixed(1)}mm</div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
                <div className="text-[11px] uppercase font-mono text-slate-400">Stoichiometry Drift</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${selectedSpot.xrf.compositionDeviationPercent > 5 ? 'text-rose-600' : 'text-slate-900'}`}>
                  ±{selectedSpot.xrf.compositionDeviationPercent.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Tolerance: &lt;5.0%</div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
                <div className="text-[11px] uppercase font-mono text-slate-400">Signal-to-Noise Ratio</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{selectedSpot.xrf.snrDb} dB</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Integration: {selectedSpot.xrf.acquisitionTimeSec}s</div>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
                <div className="text-[11px] uppercase font-mono text-slate-400">QC Metrology Verdict</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${selectedSpot.xrf.compositionDeviationPercent <= 5 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {selectedSpot.xrf.compositionDeviationPercent <= 5 ? 'VERIFIED' : 'DEVIATING'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">k-ratio matrix fit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane: Spatial Micro-XRF Heatmap + Point-Probe Energy Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Spatial 8x8 Micro-XRF Raster Map */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">Spatial Fluorescence Map</h4>
            <span className="text-xs text-slate-500 font-mono">Channel: {activeChannel.toUpperCase()}</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
            <div className="grid grid-cols-8 gap-2 aspect-square p-2">
              {library.spots.map((spot) => {
                const isSelected = spot.id === selectedSpot.id;
                const spotBg = getXrfSpotColor(spot);

                return (
                  <button
                    key={spot.id}
                    onClick={() => onSelectSpot(spot)}
                    className={`aspect-square rounded-full transition-transform ${
                      isSelected
                        ? 'ring-2 ring-white scale-125 z-10'
                        : 'hover:scale-115 opacity-90 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: spotBg }}
                    title={`${spot.id}: Pt${Math.round(spot.xrf.measuredComposition.pt*100)}Pd${Math.round(spot.xrf.measuredComposition.pd*100)}Ni${Math.round(spot.xrf.measuredComposition.ni*100)}Co${Math.round(spot.xrf.measuredComposition.co*100)}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Pt (Cyan) · Pd (Amber) · Ni (Emerald) · Co (Violet)</span>
              <span>Click spot to probe spectrum</span>
            </div>
          </div>
        </div>

        {/* Right: Point-Probe 2048-Channel EDS Spectrum Graph */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Point Probe Energy-Dispersive Spectrum (EDS)
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {hoveredEnergy ? `${hoveredEnergy.kev.toFixed(2)} keV · ${hoveredEnergy.counts} counts` : 'Hover chart to inspect'}
            </span>
          </div>

          {/* Interactive SVG Spectrum Chart */}
          <div className="relative bg-slate-950 rounded-lg border border-slate-800 p-4 h-[280px]">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 600 220"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoveredEnergy(null)}
            >
              {/* Grid Lines */}
              {[0, 2, 4, 6, 8, 10, 12, 14].map((kev) => {
                const x = (kev / 14) * 580 + 10;
                return (
                  <g key={kev}>
                    <line x1={x} y1="10" x2={x} y2="190" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                    <text x={x} y="208" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      {kev} keV
                    </text>
                  </g>
                );
              })}

              {/* Spectral Intensity Curve */}
              {(() => {
                const points = spectrum.energyKev.map((kev, idx) => {
                  const x = (kev / 14) * 580 + 10;
                  const counts = spectrum.intensityCounts[idx] || 0;
                  const y = 190 - (counts / maxCount) * 170;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });

                return (
                  <>
                    {/* Fill */}
                    <polygon
                      points={`10,190 ${points.join(' ')} 590,190`}
                      fill="rgba(2, 132, 199, 0.18)"
                    />
                    {/* Stroke */}
                    <polyline
                      points={points.join(' ')}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="1.8"
                    />
                  </>
                );
              })()}

              {/* Peak Centroid Labels */}
              {spectrum.fittedPeaks.map((peak) => {
                const x = (peak.centroidKev / 14) * 580 + 10;
                const idx = spectrum.energyKev.findIndex((k) => Math.abs(k - peak.centroidKev) < 0.15);
                const counts = spectrum.intensityCounts[idx] || 1500;
                const y = Math.max(25, 190 - (counts / maxCount) * 170);

                let badgeColor = '#0284c7';
                if (peak.element === 'Pd') badgeColor = '#d97706';
                if (peak.element === 'Ni') badgeColor = '#059669';
                if (peak.element === 'Co') badgeColor = '#7c3aed';

                return (
                  <g key={peak.element}>
                    <line x1={x} y1={y - 6} x2={x} y2={y - 20} stroke={badgeColor} strokeWidth="1.2" />
                    <circle cx={x} cy={y} r="3" fill={badgeColor} />
                    <text
                      x={x}
                      y={y - 24}
                      fill={badgeColor}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {peak.element} {peak.line}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Stoichiometric Quantification Comparison Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg text-xs">
            <table className="w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-500 font-mono">
                <tr>
                  <th className="px-3 py-2 text-left">Element</th>
                  <th className="px-3 py-2 text-left">Characteristic Line</th>
                  <th className="px-3 py-2 text-right">Net Peak Area</th>
                  <th className="px-3 py-2 text-right">Target At%</th>
                  <th className="px-3 py-2 text-right">Measured At%</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {/* Pt */}
                <tr>
                  <td className="px-3 py-2 font-bold text-sky-800">Platinum (Pt)</td>
                  <td className="px-3 py-2 text-slate-500">Lα (9.44 keV)</td>
                  <td className="px-3 py-2 text-right">{spectrum.fittedPeaks[3]?.netArea.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{(selectedSpot.targetComposition.pt * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-semibold">{(selectedSpot.xrf.measuredComposition.pt * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-semibold">Within Spec</td>
                </tr>

                {/* Pd */}
                <tr>
                  <td className="px-3 py-2 font-bold text-amber-800">Palladium (Pd)</td>
                  <td className="px-3 py-2 text-slate-500">Lα (2.84 keV)</td>
                  <td className="px-3 py-2 text-right">{spectrum.fittedPeaks[0]?.netArea.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{(selectedSpot.targetComposition.pd * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-semibold">{(selectedSpot.xrf.measuredComposition.pd * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-semibold">Within Spec</td>
                </tr>

                {/* Ni */}
                <tr>
                  <td className="px-3 py-2 font-bold text-emerald-800">Nickel (Ni)</td>
                  <td className="px-3 py-2 text-slate-500">Kα (7.48 keV)</td>
                  <td className="px-3 py-2 text-right">{spectrum.fittedPeaks[2]?.netArea.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{(selectedSpot.targetComposition.ni * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-semibold">{(selectedSpot.xrf.measuredComposition.ni * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-semibold">Within Spec</td>
                </tr>

                {/* Co */}
                <tr>
                  <td className="px-3 py-2 font-bold text-purple-800">Cobalt (Co)</td>
                  <td className="px-3 py-2 text-slate-500">Kα (6.93 keV)</td>
                  <td className="px-3 py-2 text-right">{spectrum.fittedPeaks[1]?.netArea.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right">{(selectedSpot.targetComposition.co * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-semibold">{(selectedSpot.xrf.measuredComposition.co * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right text-emerald-600 font-semibold">Within Spec</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

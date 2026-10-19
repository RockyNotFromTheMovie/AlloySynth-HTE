/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialLibrary, SampleSpot } from '../types/materials';
import { Eye, Sliders, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface SEMStudioProps {
  library: MaterialLibrary;
  selectedSpot: SampleSpot;
  onSelectSpot: (spot: SampleSpot) => void;
}

export const SEMStudio: React.FC<SEMStudioProps> = ({
  library,
  selectedSpot,
  onSelectSpot,
}) => {
  const [showSegmentation, setShowSegmentation] = useState(false);
  const [magnification, setMagnification] = useState<'50k' | '100k' | '150k'>('150k');

  const sem = selectedSpot.sem;
  const isCoffeeRing = sem.radialSegregationIndex > 0.40;
  const isCracked = sem.crackCount > 0;
  const isDewetted = sem.hasDelamination;

  // Generate synthetic radial profile data points (center r=0 to perimeter r=1)
  const radialPoints = Array.from({ length: 12 }, (_, i) => {
    const r = i / 11;
    let base = 120;
    if (isCoffeeRing) {
      // Exponential rise at perimeter
      base = 100 + Math.pow(r, 2.5) * 220;
    } else if (isDewetted) {
      // Discontinuous droplet bead
      base = r < 0.5 ? 260 : 40;
    } else {
      // Nominal flat profile with mild natural noise
      base = 140 + (Math.sin(i * 1.5) * 8);
    }
    return { r: r.toFixed(2), intensity: Math.round(base) };
  });

  return (
    <div className="space-y-6">
      {/* Top SEM Overview Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Scanning Electron Microscopy (SEM) Morphology Metrology
            </h3>
            <p className="text-xs text-slate-500">
              High-resolution secondary electron imaging, grain size distribution, and coffee-ring radial segregation analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmentation Toggle */}
            <button
              onClick={() => setShowSegmentation(!showSegmentation)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                showSegmentation
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{showSegmentation ? 'Hide Grain Segmentation' : 'Show AI Segmentation'}</span>
            </button>

            {/* Magnification Selector */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              {(['50k', '100k', '150k'] as const).map((mag) => (
                <button
                  key={mag}
                  onClick={() => setMagnification(mag)}
                  className={`px-2 py-0.5 rounded font-mono ${
                    magnification === mag ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mag.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Morphological Metrics Strip */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
            <div className="text-[11px] uppercase font-mono text-slate-400">Mean Grain Size</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {sem.meanGrainSizeNm} <span className="text-xs font-normal text-slate-500">nm</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Scherrer / SEM XRD</div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
            <div className="text-[11px] uppercase font-mono text-slate-400">Surface Porosity</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {sem.porosityPercent}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">High active area</div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
            <div className="text-[11px] uppercase font-mono text-slate-400">Coffee-Ring Index S</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${isCoffeeRing ? 'text-amber-600' : 'text-slate-900'}`}>
              {sem.radialSegregationIndex.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Threshold: 0.40</div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
            <div className="text-[11px] uppercase font-mono text-slate-400">Micro-Cracks</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${isCracked ? 'text-rose-600' : 'text-slate-900'}`}>
              {sem.crackCount}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Thermal stress</div>
          </div>

          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded">
            <div className="text-[11px] uppercase font-mono text-slate-400">Delamination Flag</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${isDewetted ? 'text-rose-600' : 'text-emerald-700'}`}>
              {isDewetted ? 'YES (Dewetted)' : 'NOMINAL'}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Adhesion intact</div>
          </div>
        </div>
      </div>

      {/* Main Dual Stage: High-Resolution Micrograph Stage + Radial Profile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Secondary Electron Micrograph Viewer */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 font-mono">{selectedSpot.id}</span>
              <span className="text-xs text-slate-400 font-mono">·</span>
              <span className="text-xs text-slate-600">Secondary Electron Micrograph</span>
            </div>
            <span className="text-xs font-mono text-slate-500">HV: 15.0 kV · WD: 4.8 mm</span>
          </div>

          {/* Micrograph Canvas with Authentic Scale Bar and False Color Segmentation */}
          <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group">
            <img
              src="/src/assets/images/sem_micrograph_sample_1792126217374.jpg"
              alt="SEM secondary electron micrograph of nano-porous alloy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300"
            />

            {/* AI Grain Boundary / Pore Segmentation False-Color Layer */}
            {showSegmentation && (
              <div className="absolute inset-0 bg-sky-500/20 mix-blend-color-dodge pointer-events-none flex items-center justify-center">
                <svg className="w-full h-full opacity-60">
                  <defs>
                    <pattern id="grainPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="20" cy="20" r="2" fill="#38bdf8" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grainPattern)" />
                </svg>
              </div>
            )}

            {/* Defect Alert Watermark banner if negative or partial */}
            {isCoffeeRing && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-amber-950/80 border border-amber-600/80 rounded text-amber-200 text-xs font-mono flex items-center gap-1.5 shadow-md">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Marangoni Coffee-Ring Segregation (S = {sem.radialSegregationIndex.toFixed(2)})</span>
              </div>
            )}

            {isCracked && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-rose-950/80 border border-rose-600/80 rounded text-rose-200 text-xs font-mono flex items-center gap-1.5 shadow-md">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Thermal Expansion Micro-Cracks Detected ({sem.crackCount})</span>
              </div>
            )}

            {isDewetted && (
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-950/90 border border-red-600 rounded text-red-200 text-xs font-mono flex items-center gap-1.5 shadow-md">
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                <span>Substrate Dewetting & Film Discontinuity</span>
              </div>
            )}

            {/* Authentic Scientific Detector Metadata Bar at Bottom */}
            <div className="absolute bottom-0 inset-x-0 bg-black/85 text-slate-200 font-mono text-[11px] px-3.5 py-1.5 flex items-center justify-between border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span>MAG: {magnification.toUpperCase()}</span>
                <span>HV: 15.0 kV</span>
                <span>WD: 4.8 mm</span>
                <span>DET: SEI</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 bg-white" />
                <span>500 nm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Radial Mass Distribution & Homogeneity Curve */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900">
              Radial Mass Profile $I(r)$
            </h4>
            <span className="text-xs text-slate-500 font-mono">Center $\to$ Perimeter</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Evaluates solute mass distribution across the droplet radius. A steep surge at $r \to 1.0$ indicates capillary solvent evaporation causing the classical coffee-ring defect.
          </p>

          {/* SVG Radial Line Scan Chart */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 h-[190px]">
            <svg className="w-full h-full" viewBox="0 0 320 150">
              {/* Axes */}
              <line x1="30" y1="125" x2="300" y2="125" stroke="#334155" strokeWidth="1" />
              <line x1="30" y1="15" x2="30" y2="125" stroke="#334155" strokeWidth="1" />

              {/* Ticks */}
              <text x="30" y="140" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                r=0 (Center)
              </text>
              <text x="300" y="140" fill="#64748b" fontSize="9" fontFamily="monospace" textAnchor="middle">
                r=1 (Rim)
              </text>

              {/* Curve */}
              {(() => {
                const pts = radialPoints.map((pt, idx) => {
                  const x = 30 + (idx / (radialPoints.length - 1)) * 270;
                  const y = 125 - ((pt.intensity - 40) / 280) * 110;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });

                return (
                  <>
                    <polyline
                      points={pts.join(' ')}
                      fill="none"
                      stroke={isCoffeeRing ? '#f59e0b' : '#0284c7'}
                      strokeWidth="2"
                    />
                    {radialPoints.map((pt, idx) => {
                      const x = 30 + (idx / (radialPoints.length - 1)) * 270;
                      const y = 125 - ((pt.intensity - 40) / 280) * 110;
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={isCoffeeRing ? '#f59e0b' : '#0284c7'}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Diagnostic Takeaways */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1.5">
            <div className="font-semibold text-slate-800">
              Morphology & Realizability Verdict:
            </div>
            <div className="text-slate-600 leading-relaxed font-mono text-[11px]">
              {isCoffeeRing && (
                <span className="text-amber-700">
                  ⚠️ Coffee-ring segregation index S = {sem.radialSegregationIndex.toFixed(2)} exceeds 0.40. Active elements segregated to perimeter.
                </span>
              )}
              {isCracked && (
                <span className="text-rose-700">
                  ⚠️ Film micro-cracking detected ({sem.crackCount} fissures). Susceptibility to premature peel during electrocatalytic cycling.
                </span>
              )}
              {isDewetted && (
                <span className="text-red-700">
                  ❌ Substrate dewetting observed. Droplets did not achieve continuous thin-film coverage.
                </span>
              )}
              {!isCoffeeRing && !isCracked && !isDewetted && (
                <span className="text-emerald-700">
                  ✅ Homogeneous nano-porous morphology. Uniform crystallite distribution across entire droplet area.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MaterialLibrary, SampleSpot } from '../types/materials';
import { generateGcodeForLibrary, downloadGcodeFile } from '../services/gcodeCompiler';
import { Play, Pause, RotateCcw, Download, Terminal, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface PrinterStudioProps {
  library: MaterialLibrary;
  selectedSpot: SampleSpot;
  onSelectSpot: (spot: SampleSpot) => void;
}

export const PrinterStudio: React.FC<PrinterStudioProps> = ({
  library,
  selectedSpot,
  onSelectSpot,
}) => {
  // Printing simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedProgressIndex, setSimulatedProgressIndex] = useState(0);
  const [substrateTemp, setSubstrateTemp] = useState(selectedSpot.printerRecipe.substrateTemperatureC || 65);
  const [piezoVoltage, setPiezoVoltage] = useState(selectedSpot.printerRecipe.piezoVoltageV || 28.5);
  const [dispenseFreq, setDispenseFreq] = useState(selectedSpot.printerRecipe.dispensingFreqKhz || 4.5);
  const [sinteringTemp, setSinteringTemp] = useState(selectedSpot.printerRecipe.sinteringTempC || 380);
  const [activeTab, setActiveTab] = useState<'twin' | 'gcode'>('twin');

  // G-code text
  const gcodeContent = generateGcodeForLibrary(library);

  // Animated print cycle
  useEffect(() => {
    let timer: any;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimulatedProgressIndex((prev) => {
          if (prev >= library.spots.length - 1) {
            setIsSimulating(false);
            return prev;
          }
          return prev + 1;
        });
      }, 120);
    }
    return () => clearInterval(timer);
  }, [isSimulating, library.spots.length]);

  const currentSimSpot = library.spots[simulatedProgressIndex] || library.spots[0];

  return (
    <div className="space-y-6">
      {/* Top Banner with Real Instrument Visual & Telemetry */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Instrument Photo Card */}
          <div className="lg:col-span-5 relative rounded-lg overflow-hidden border border-slate-200 aspect-video group">
            <img
              src="/src/assets/images/printer_apparatus_1792126217394.jpg"
              alt="Industrial Piezoelectric Nanoparticle Jet Printer"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3.5">
              <div className="text-white text-xs font-semibold">
                Nanoparticle Jet Printer Digital Twin
              </div>
              <div className="text-slate-300 text-[11px] font-mono">
                Model: Ceradrop F-Series Multi-Nozzle Array · 4 Inks
              </div>
            </div>
          </div>

          {/* Instrument Status & Key Controls */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Automated Deposition & Platen Environment
                </h3>
                <p className="text-xs text-slate-500">
                  Control drop-on-demand parameters, substrate heating, and CNC motion paths
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (isSimulating) {
                      setIsSimulating(false);
                    } else {
                      if (simulatedProgressIndex >= library.spots.length - 1) {
                        setSimulatedProgressIndex(0);
                      }
                      setIsSimulating(true);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                    isSimulating
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? 'Pause Print' : 'Run Simulation'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsSimulating(false);
                    setSimulatedProgressIndex(0);
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  title="Reset Toolpath"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => downloadGcodeFile(library.id, gcodeContent)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .gcode</span>
                </button>
              </div>
            </div>

            {/* Dispenser Ink Reservoirs Status Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-sky-50/60 border border-sky-100 rounded">
                <div className="flex justify-between text-[11px] font-mono text-sky-900 font-semibold">
                  <span>Ch A: Pt Ink</span>
                  <span>92%</span>
                </div>
                <div className="h-1.5 w-full bg-sky-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-sky-600 rounded-full w-[92%]" />
                </div>
                <div className="text-[10px] text-sky-700 font-mono mt-1">4.2 cP · 32 mN/m</div>
              </div>

              <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded">
                <div className="flex justify-between text-[11px] font-mono text-amber-900 font-semibold">
                  <span>Ch B: Pd Ink</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-amber-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-amber-600 rounded-full w-[88%]" />
                </div>
                <div className="text-[10px] text-amber-700 font-mono mt-1">3.9 cP · 30 mN/m</div>
              </div>

              <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded">
                <div className="flex justify-between text-[11px] font-mono text-emerald-900 font-semibold">
                  <span>Ch C: Ni Ink</span>
                  <span>95%</span>
                </div>
                <div className="h-1.5 w-full bg-emerald-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[95%]" />
                </div>
                <div className="text-[10px] text-emerald-700 font-mono mt-1">4.5 cP · 34 mN/m</div>
              </div>

              <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded">
                <div className="flex justify-between text-[11px] font-mono text-purple-900 font-semibold">
                  <span>Ch D: Co Ink</span>
                  <span>84%</span>
                </div>
                <div className="h-1.5 w-full bg-purple-100 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full w-[84%]" />
                </div>
                <div className="text-[10px] text-purple-700 font-mono mt-1">4.1 cP · 31 mN/m</div>
              </div>
            </div>

            {/* Interactive Progress Ribbon */}
            <div className="flex items-center gap-3 pt-1 text-xs font-mono text-slate-500">
              <span className="shrink-0">
                Printed: {simulatedProgressIndex + 1} / {library.spots.length} spots
              </span>
              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-600 transition-all duration-100 rounded-full"
                  style={{ width: `${((simulatedProgressIndex + 1) / library.spots.length) * 100}%` }}
                />
              </div>
              <span className="shrink-0 font-bold text-slate-800">
                {currentSimSpot.id} (X: {currentSimSpot.substrateCoordMm.x.toFixed(1)} mm, Y: {currentSimSpot.substrateCoordMm.y.toFixed(1)} mm)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Workspace: Digital Twin Simulator & G-Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Deposition Parameters & Thermal Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-sky-600" />
              <span>Deposition Recipe Parameters</span>
            </h4>
            <span className="text-xs text-slate-500 font-mono">Spot: {selectedSpot.id}</span>
          </div>

          {/* Substrate Temperature Scrubber (Critical to Coffee-Ring Marangoni Control) */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700">Substrate Platen Temperature</label>
              <span className="font-mono font-bold text-sky-700 tabular-nums">{substrateTemp} °C</span>
            </div>
            <input
              type="range"
              min="25"
              max="110"
              value={substrateTemp}
              onChange={(e) => setSubstrateTemp(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>25°C (Ambient, High Ring Risk)</span>
              <span>65°C (Nominal)</span>
              <span>110°C (Flash Dry)</span>
            </div>
          </div>

          {/* Piezoelectric Drive Voltage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700">Piezo Drive Voltage</label>
              <span className="font-mono font-bold text-sky-700 tabular-nums">{piezoVoltage.toFixed(1)} V</span>
            </div>
            <input
              type="range"
              min="18.0"
              max="42.0"
              step="0.5"
              value={piezoVoltage}
              onChange={(e) => setPiezoVoltage(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>18.0 V (Satellite-free)</span>
              <span>28.5 V (Calibrated)</span>
              <span>42.0 V (Max Jet Energy)</span>
            </div>
          </div>

          {/* Dispense Pulse Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700">Drop-on-Demand Frequency</label>
              <span className="font-mono font-bold text-sky-700 tabular-nums">{dispenseFreq.toFixed(1)} kHz</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={dispenseFreq}
              onChange={(e) => setDispenseFreq(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0 kHz</span>
              <span>4.5 kHz (Optimal)</span>
              <span>10.0 kHz</span>
            </div>
          </div>

          {/* Post-Deposition Sintering Temperature */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <label className="font-medium text-slate-700">Post-Print Sintering & Reduction</label>
              <span className="font-mono font-bold text-sky-700 tabular-nums">{sinteringTemp} °C</span>
            </div>
            <input
              type="range"
              min="200"
              max="520"
              step="10"
              value={sinteringTemp}
              onChange={(e) => setSinteringTemp(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>200°C (Incomplete Alloy)</span>
              <span>380°C (Optimal Alloy)</span>
              <span>520°C (Crack Risk)</span>
            </div>
          </div>

          {/* Agent Recommendation Box */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Print Planner Agent Optimization:</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              At {substrateTemp}°C platen temperature, Peclet number $Pe \approx 0.62$, suppressing radial capillary flow.
              Recommended Marangoni circulating velocity is sustained with 4.5 kHz pulse trains.
            </p>
          </div>
        </div>

        {/* Right Column: Visual Stage Twin / G-code Terminal View */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5">
          {/* Sub-tab switcher */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('twin')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeTab === 'twin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Interactive Toolpath Twin
              </button>
              <button
                onClick={() => setActiveTab('gcode')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  activeTab === 'gcode' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Compiled G-Code Script
              </button>
            </div>

            <span className="text-xs text-slate-500 font-mono">
              Current Head: ({currentSimSpot.substrateCoordMm.x.toFixed(2)}, {currentSimSpot.substrateCoordMm.y.toFixed(2)} mm)
            </span>
          </div>

          {activeTab === 'twin' ? (
            /* Digital Twin Visual Canvas */
            <div className="relative aspect-4/3 w-full bg-slate-950 rounded-lg border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
              {/* Millimeter Coordinate Grid Lines */}
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Substrate platen representation */}
              <div className="relative w-full h-full border border-slate-700/80 rounded bg-slate-900/60 p-4 flex flex-col justify-between">
                {/* 8x8 Droplet Grid */}
                <div className="grid grid-cols-8 gap-2 my-auto">
                  {library.spots.map((spot, idx) => {
                    const isCurrent = idx === simulatedProgressIndex;
                    const isDeposited = idx <= simulatedProgressIndex;

                    return (
                      <button
                        key={spot.id}
                        onClick={() => {
                          onSelectSpot(spot);
                          setSimulatedProgressIndex(idx);
                        }}
                        className={`relative aspect-square rounded-full flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950 scale-125 z-10 bg-sky-400'
                            : isDeposited
                            ? 'bg-slate-300 opacity-90'
                            : 'bg-slate-800/80 opacity-40 hover:opacity-75'
                        }`}
                        title={`${spot.id}: (${spot.substrateCoordMm.x}, ${spot.substrateCoordMm.y}) mm`}
                      >
                        {isCurrent && (
                          <div className="absolute -top-3 w-1.5 h-3 bg-red-500 rounded-b animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Traversal Head Coordinate Indicator */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono z-10 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    NOZZLE ARRAY ACTIVE: {currentSimSpot.id}
                  </span>
                  <span>FEEDRATE: 3600 mm/min</span>
                </div>
              </div>
            </div>
          ) : (
            /* G-code Editor & Code Viewer */
            <div className="relative font-mono text-xs bg-slate-950 text-slate-200 p-4 rounded-lg border border-slate-800 h-[380px] overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">{gcodeContent}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

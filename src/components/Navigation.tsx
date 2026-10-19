/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MaterialLibrary } from '../types/materials';
import { Download, Sliders, CheckCircle, RefreshCw } from 'lucide-react';
import { downloadTextFile, generateCSVDataset, generateFAIRJsonLd } from '../services/fairExporter';

interface NavigationProps {
  currentTab: 'matrix' | 'printer' | 'characterization' | 'python' | 'fair';
  onSelectTab: (tab: 'matrix' | 'printer' | 'characterization' | 'python' | 'fair') => void;
  library: MaterialLibrary;
  onOpenExportModal: () => void;
  onRunGlobalQC: () => void;
  isQCRunning: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  library,
  onOpenExportModal,
  onRunGlobalQC,
  isQCRunning,
}) => {
  const tabs = [
    { id: 'matrix', label: 'Library Grid' },
    { id: 'printer', label: 'Nanoparticle Printer' },
    { id: 'characterization', label: 'Micro-XRF & SEM' },
    { id: 'python', label: 'Python Pipelines' },
    { id: 'fair', label: 'FAIR Dataset' },
  ] as const;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('matrix');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:text-sky-700 transition-colors"
        >
          AlloySynth HTE
        </a>
        <span className="text-xs text-slate-400 font-mono hidden sm:inline" aria-hidden="true">
          ·
        </span>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline truncate max-w-xs">
          Pt-Pd-Ni-Co Quaternary Library ({library.spots.length} spots)
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`whitespace-nowrap shrink-0 text-sm transition-colors py-1 relative ${
                isActive
                  ? 'text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary action button + QC Trigger */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onRunGlobalQC}
          disabled={isQCRunning}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
          title="Run automated multi-agent QC rule evaluation on all 64 spots"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isQCRunning ? 'animate-spin text-sky-600' : 'text-slate-500'}`} />
          <span>{isQCRunning ? 'Analyzing Library...' : 'Agent QC Scan'}</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export FAIR Bundle</span>
        </button>
      </div>
    </header>
  );
};

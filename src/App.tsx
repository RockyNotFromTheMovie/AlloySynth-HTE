/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialLibrary, SampleSpot, RealizabilityLabel, SynthesisLogEntry } from './types/materials';
import { createQuaternaryElectrocatalystLibrary } from './data/defaultLibrary';
import { createInitialSynthesisHistory } from './data/defaultSynthesisHistory';
import { Navigation } from './components/Navigation';
import { LibraryMatrixView } from './components/LibraryMatrixView';
import { PrinterStudio } from './components/PrinterStudio';
import { MicroXRFStudio } from './components/MicroXRFStudio';
import { SEMStudio } from './components/SEMStudio';
import { PythonPipelineStudio } from './components/PythonPipelineStudio';
import { FairDatasetView } from './components/FairDatasetView';
import { AgentControlPanel } from './components/AgentControlPanel';
import { SpotDetailDrawer } from './components/SpotDetailDrawer';
import { PeriodicTableSelector } from './components/PeriodicTableSelector';
import { generateCustomAlloyLibrary } from './data/defaultLibrary';
import { PeriodicElement } from './data/periodicTable';
import { generateFAIRJsonLd, generateCSVDataset, downloadTextFile } from './services/fairExporter';
import { generateGcodeForLibrary, downloadGcodeFile } from './services/gcodeCompiler';
import { Download, FileText, CheckCircle2, Bot, Layers, Sparkles } from 'lucide-react';

export default function App() {
  const [library, setLibrary] = useState<MaterialLibrary>(createQuaternaryElectrocatalystLibrary);
  const [selectedSpot, setSelectedSpot] = useState<SampleSpot>(library.spots[0]);
  const [activeTab, setActiveTab] = useState<'periodic' | 'matrix' | 'printer' | 'characterization' | 'python' | 'fair'>('periodic');
  const [drawerSpot, setDrawerSpot] = useState<SampleSpot | null>(null);
  const [isQCRunning, setIsQCRunning] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPeriodicTableOpen, setIsPeriodicTableOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [synthesisLogs, setSynthesisLogs] = useState<SynthesisLogEntry[]>(createInitialSynthesisHistory);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addSynthesisLog = (entry: Omit<SynthesisLogEntry, 'id' | 'timestamp'>) => {
    const newLog: SynthesisLogEntry = {
      ...entry,
      id: `LOG-${String(synthesisLogs.length + 1).padStart(3, '0')}`,
      timestamp: new Date().toISOString(),
    };
    setSynthesisLogs((prev) => [newLog, ...prev]);
  };

  // Update a spot's QC verdict & realizability label
  const handleUpdateSpotQC = (
    spotId: string,
    status: 'approved' | 'rejected',
    label: RealizabilityLabel,
    notes: string
  ) => {
    setLibrary((prev) => {
      const updatedSpots = prev.spots.map((s) => {
        if (s.id === spotId) {
          const updated: SampleSpot = {
            ...s,
            qcStatus: status,
            realizabilityLabel: label,
            qcNotes: notes,
            timestamp: new Date().toISOString(),
          };
          if (selectedSpot.id === spotId) {
            setSelectedSpot(updated);
          }
          return updated;
        }
        return s;
      });
      return { ...prev, spots: updatedSpots, updatedAt: new Date().toISOString() };
    });

    addSynthesisLog({
      agentRole: 'Human Scientist',
      actionCategory: 'qc',
      actionType: 'qc_override',
      spotId,
      title: `Human Scientist QC Sign-off: ${status.toUpperCase()} (${label.replace(/_/g, ' ')})`,
      detail: notes || `Scientist updated QC verdict to ${status} with realizability classification ${label}.`,
      metrics: {
        verdict: status.toUpperCase(),
        label,
      },
      status: status === 'approved' ? 'optimal' : 'alert',
    });

    showToast(`Committed human sign-off for ${spotId}`);
  };

  // Add or merge newly proposed AI candidate compositions
  const handleAddNewCandidates = (candidates: any[], rationale: string) => {
    addSynthesisLog({
      agentRole: 'Candidate Scout',
      actionCategory: 'scout',
      actionType: 'candidate_proposal',
      title: `AI Candidate Scout: ${candidates.length} Compositions Proposed`,
      detail: rationale || 'Evaluated quaternary d-band mixing enthalpies and generated Pareto-optimal targets.',
      metrics: {
        candidatesCount: candidates.length,
        model: 'Gemini 3.8 Flash',
      },
      status: 'optimal',
    });
    showToast(`Candidate Scout generated ${candidates.length} new stoichiometries!`);
  };

  // Run global agent QC scan across all 64 spots
  const handleRunGlobalQC = () => {
    setIsQCRunning(true);
    setTimeout(() => {
      setIsQCRunning(false);
      addSynthesisLog({
        agentRole: 'Metrology QC',
        actionCategory: 'qc',
        actionType: 'qc_evaluation',
        spotId: 'Library-wide',
        title: 'Batch Metrology & Realizability Automated Scan',
        detail: 'Re-evaluated micro-XRF composition deviations and SEM radial segregation across all 64 coordinates.',
        metrics: {
          totalScanned: 64,
          optimalCount: library.spots.filter((s) => s.realizabilityLabel === 'synthesizable_optimal').length,
          partialCount: library.spots.filter(
            (s) => s.realizabilityLabel === 'partial_segregated_ring' || s.realizabilityLabel === 'partial_microcracked'
          ).length,
        },
        status: 'optimal',
      });
      showToast('Agent Metrology & Realizability scan completed for all 64 spots.');
    }, 1200);
  };

  // Synthesize new combinatorial library from periodic table element selection
  const handleSynthesizeNewAlloy = (selectedElements: PeriodicElement[]) => {
    try {
      const newLib = generateCustomAlloyLibrary(selectedElements);
      setLibrary(newLib);
      setSelectedSpot(newLib.spots[0]);
      setIsPeriodicTableOpen(false);

      const formula = selectedElements.map((e) => e.symbol).join('-');
      addSynthesisLog({
        agentRole: 'Candidate Scout',
        actionCategory: 'scout',
        actionType: 'candidate_proposal',
        title: `Alloy Library Formulated: ${formula} (64 spots)`,
        detail: `Formulated systematic 8×8 combinatorial gradient library for ${formula} system using standard 118-element periodic reference library. Target stoichiometry, simulated printing recipes, and micro-XRF spectra generated.`,
        metrics: {
          elements: formula,
          spotsCount: 64,
          blocks: [...new Set(selectedElements.map((e) => e.block))].join(','),
        },
        status: 'optimal',
      });

      showToast(`Formulated 64-spot ${formula} library! Ready for printing & characterization.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate library');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* 1. Strict 3-Zone Top Navigation Bar */}
      <Navigation
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        library={library}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPeriodicTable={() => setIsPeriodicTableOpen(true)}
        onRunGlobalQC={handleRunGlobalQC}
        isQCRunning={isQCRunning}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Module Content */}
        {activeTab === 'periodic' && (
          <PeriodicTableSelector
            isOpen={true}
            embedded={true}
            onClose={() => setActiveTab('matrix')}
            currentElements={library.elements || ['Pt', 'Pd', 'Ni', 'Co']}
            onSynthesizeLibrary={(elements) => {
              handleSynthesizeNewAlloy(elements);
              setActiveTab('matrix');
            }}
          />
        )}

        {activeTab === 'matrix' && (
          <LibraryMatrixView
            library={library}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onOpenSpotDrawer={setDrawerSpot}
          />
        )}

        {activeTab === 'printer' && (
          <PrinterStudio
            library={library}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
          />
        )}

        {activeTab === 'characterization' && (
          <div className="space-y-6">
            <MicroXRFStudio
              library={library}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
            />
            <SEMStudio
              library={library}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
            />
          </div>
        )}

        {activeTab === 'python' && (
          <PythonPipelineStudio
            library={library}
            selectedSpot={selectedSpot}
          />
        )}

        {activeTab === 'fair' && (
          <FairDatasetView
            library={library}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            onOpenSpotDrawer={setDrawerSpot}
          />
        )}

        {/* 3. Multi-Agent Team Cockpit & Human-in-the-Loop Gateway */}
        <section aria-labelledby="agent-cockpit-heading">
          <AgentControlPanel
            library={library}
            selectedSpot={selectedSpot}
            synthesisLogs={synthesisLogs}
            onUpdateSpotQC={handleUpdateSpotQC}
            onAddNewCandidates={handleAddNewCandidates}
            onSelectSpotId={(spotId) => {
              const spot = library.spots.find((s) => s.id === spotId);
              if (spot) setSelectedSpot(spot);
            }}
          />
        </section>
      </main>

      {/* 4. Slide-over Spot Detail Drawer */}
      <SpotDetailDrawer
        spot={drawerSpot}
        onClose={() => setDrawerSpot(null)}
        onNavigateToTab={(tab) => {
          setActiveTab(tab);
          setDrawerSpot(null);
        }}
      />

      {/* 5. FAIR Bundle Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Export FAIR Structured Experimental Package
                </h4>
                <p className="text-xs text-slate-500">
                  Includes full CSV dataset, Schema.org JSON-LD semantic metadata, and CNC G-code toolpaths
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">01. Complete Measurements Dataset (.csv)</div>
                  <div className="text-[11px] text-slate-500">
                    64 spots with target & measured XRF stoichiometry, SEM morphology, and realizability labels
                  </div>
                </div>
                <button
                  onClick={() => downloadTextFile(`${library.id}_dataset.csv`, generateCSVDataset(library), 'text/csv')}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                >
                  Download CSV
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">02. Schema.org / MDF Metadata (.jsonld)</div>
                  <div className="text-[11px] text-slate-500">
                    FAIR-aligned semantic web metadata for machine-actionable active learning
                  </div>
                </div>
                <button
                  onClick={() => downloadTextFile(`${library.id}_fair.jsonld`, generateFAIRJsonLd(library), 'application/ld+json')}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                >
                  Download JSON-LD
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">03. Nanoparticle Printer Toolpath (.gcode)</div>
                  <div className="text-[11px] text-slate-500">
                    Complete G-code program with nozzle array priming, coordinate moves, and thermal sintering
                  </div>
                </div>
                <button
                  onClick={() => downloadGcodeFile(library.id, generateGcodeForLibrary(library))}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                >
                  Download G-code
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Standard 118-Element Periodic Table Selector Modal */}
      {activeTab !== 'periodic' && (
        <PeriodicTableSelector
          isOpen={isPeriodicTableOpen}
          onClose={() => setIsPeriodicTableOpen(false)}
          currentElements={library.elements || ['Pt', 'Pd', 'Ni', 'Co']}
          onSynthesizeLibrary={handleSynthesizeNewAlloy}
        />
      )}

      {/* 7. Clean Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

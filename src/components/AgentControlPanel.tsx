/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MaterialLibrary, SampleSpot, RealizabilityLabel } from '../types/materials';
import { scoutCandidateCompositions, inspectSampleWithAgents, AgentRecommendation } from '../services/geminiAgents';
import { Sparkles, Bot, CheckCircle, AlertTriangle, Send, ShieldCheck, UserCheck } from 'lucide-react';

interface AgentControlPanelProps {
  library: MaterialLibrary;
  selectedSpot: SampleSpot;
  onUpdateSpotQC: (spotId: string, status: 'approved' | 'rejected', label: RealizabilityLabel, notes: string) => void;
  onAddNewCandidates: (candidates: any[], rationale: string) => void;
}

export const AgentControlPanel: React.FC<AgentControlPanelProps> = ({
  library,
  selectedSpot,
  onUpdateSpotQC,
  onAddNewCandidates,
}) => {
  const [objectivePrompt, setObjectivePrompt] = useState('Explore quaternary high-entropy compositions with Pt < 30% and enhanced Ni-Co synergy for acidic ORR');
  const [isScouting, setIsScouting] = useState(false);
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  // Manual override state
  const [manualStatus, setManualStatus] = useState<'approved' | 'rejected'>(
    selectedSpot.qcStatus === 'rejected' ? 'rejected' : 'approved'
  );
  const [manualLabel, setManualLabel] = useState<RealizabilityLabel>(selectedSpot.realizabilityLabel);
  const [manualNotes, setManualNotes] = useState(selectedSpot.qcNotes);

  const handleProposeCandidates = async () => {
    setIsScouting(true);
    try {
      const res = await scoutCandidateCompositions(objectivePrompt, library);
      onAddNewCandidates(res.candidates, res.rationale);
    } finally {
      setIsScouting(false);
    }
  };

  const handleInspectActiveSpot = async () => {
    setIsLoadingRecs(true);
    try {
      const recs = await inspectSampleWithAgents(selectedSpot, library);
      setRecommendations(recs);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleApplyQCSignoff = () => {
    onUpdateSpotQC(selectedSpot.id, manualStatus, manualLabel, manualNotes);
    alert(`Human-in-the-loop signoff committed for ${selectedSpot.id}!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-6">
      {/* Cockpit Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-sky-600" />
            <span>Autonomous Agent Team & Human-in-the-Loop Gates</span>
          </h3>
          <p className="text-xs text-slate-500">
            Coordinated multi-agent workflow governing candidate proposal, print planning, metrology QC, and FAIR curation
          </p>
        </div>

        {/* 4 Agent Status Indicators (Text-first, zero decorative dots) */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-600">
          <span className="text-sky-700 font-semibold">Agent 1: Scout · Ready</span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-sky-700 font-semibold">Agent 2: Planner · Active</span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-sky-700 font-semibold">Agent 3: Metrology · Online</span>
          <span className="text-slate-300" aria-hidden="true">/</span>
          <span className="text-sky-700 font-semibold">Agent 4: Curator · Synced</span>
        </div>
      </div>

      {/* Two Column Cockpit: Candidate Generator Prompt + Human Inspection Gate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: AI Candidate Composition Scout (6 cols) */}
        <div className="lg:col-span-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Agent 1: Composition Scout Objective</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">Gemini 3.8 Flash</span>
          </div>

          <textarea
            value={objectivePrompt}
            onChange={(e) => setObjectivePrompt(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-sky-600 font-sans"
            placeholder="Specify synthesis objectives, e.g. minimize platinum group metals, target ternary spinels, or maximize HER current density..."
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 font-mono">
              Evaluates mixing enthalpy & d-band center
            </span>

            <button
              onClick={handleProposeCandidates}
              disabled={isScouting}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-sky-300 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Send className={`w-3.5 h-3.5 ${isScouting ? 'animate-spin' : ''}`} />
              <span>{isScouting ? 'Scouting Candidates...' : 'Propose Compositions'}</span>
            </button>
          </div>
        </div>

        {/* Right: Human-in-the-Loop Gate for Selected Spot (6 cols) */}
        <div className="lg:col-span-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Human-in-the-Loop Gate · {selectedSpot.id}</span>
            </div>
            <button
              onClick={handleInspectActiveSpot}
              disabled={isLoadingRecs}
              className="text-[11px] font-mono text-sky-700 hover:text-sky-900 underline"
            >
              {isLoadingRecs ? 'Running diagnostics...' : 'Run Multi-Agent Review'}
            </button>
          </div>

          {/* Form Controls */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] font-mono text-slate-500 block mb-1">Approval Verdict</label>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as any)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-500 block mb-1">Realizability Label</label>
              <select
                value={manualLabel}
                onChange={(e) => setManualLabel(e.target.value as any)}
                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
              >
                <option value="synthesizable_optimal">Synthesizable Optimal</option>
                <option value="partial_segregated_ring">Partial: Segregated Ring</option>
                <option value="partial_microcracked">Partial: Micro-Cracked</option>
                <option value="negative_dewetted">Negative: Dewetted</option>
                <option value="negative_nozzle_clogged">Negative: Clogged Nozzle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-500 block mb-1">Scientist Review Notes</label>
            <input
              type="text"
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded-md focus:outline-hidden"
              placeholder="e.g. Approved for rotating disk electrode testing..."
            />
          </div>

          <button
            onClick={handleApplyQCSignoff}
            className="w-full py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Commit Human Scientist Sign-Off</span>
          </button>
        </div>
      </div>

      {/* Multi-Agent Recommendations Accordion / List */}
      {recommendations.length > 0 && (
        <div className="pt-2 space-y-2 border-t border-slate-100">
          <div className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">
            Agent Diagnostic Recommendations for {selectedSpot.id}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="p-3 bg-white border border-slate-200 rounded text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">{rec.role}</span>
                  <span
                    className={`text-[10px] uppercase font-mono font-bold ${
                      rec.status === 'optimal'
                        ? 'text-emerald-700'
                        : rec.status === 'warning'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{rec.headline}</div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{rec.analysis}</p>
                <div className="text-[11px] text-sky-800 font-medium pt-0.5">
                  Action: {rec.suggestedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

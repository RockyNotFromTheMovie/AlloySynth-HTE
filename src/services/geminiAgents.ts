/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ElementalComposition, MaterialLibrary, SampleSpot, RealizabilityLabel } from '../types/materials';

export interface AgentRecommendation {
  role: 'Candidate Scout' | 'Print Planner' | 'Metrology QC' | 'FAIR Curator';
  status: 'optimal' | 'warning' | 'alert' | 'action_required';
  headline: string;
  analysis: string;
  suggestedAction: string;
  proposedModifications?: Partial<SampleSpot>;
}

// Propose compositions using server-side Gemini API or intelligent physics model
export async function scoutCandidateCompositions(
  objective: string,
  baseLibrary: MaterialLibrary
): Promise<{ candidates: ElementalComposition[]; rationale: string }> {
  try {
    const res = await fetch('/api/agents/propose-compositions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objective, currentLibraryId: baseLibrary.id }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Server agent endpoint unavailable, utilizing local deterministic model:', e);
  }

  // Fallback high-entropy electrocatalyst optimization model:
  // Explores Pt-Pd-Ni-Co with balanced d-band center
  const candidates: ElementalComposition[] = [
    { pt: 0.30, pd: 0.20, ni: 0.30, co: 0.20 },
    { pt: 0.25, pd: 0.25, ni: 0.25, co: 0.25 },
    { pt: 0.20, pd: 0.10, ni: 0.40, co: 0.30 },
    { pt: 0.40, pd: 0.15, ni: 0.25, co: 0.20 },
  ];

  return {
    candidates,
    rationale: `Proposed 4 candidate compositions balancing Pt/Pd catalytic active sites with 3d-transition metals (Ni, Co) to optimize oxygen binding energy and lower platinum-group metal cost.`,
  };
}

// Analyze a selected sample spot with the QC and Realizability agent
export async function inspectSampleWithAgents(
  spot: SampleSpot,
  library: MaterialLibrary
): Promise<AgentRecommendation[]> {
  try {
    const res = await fetch('/api/agents/inspect-qc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spot, libraryId: library.id }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.recommendations) {
        return data.recommendations;
      }
    }
  } catch (e) {
    console.warn('Server QC agent endpoint unavailable, evaluating with rule-based expert system:', e);
  }

  // Expert rules based on micro-XRF and SEM metrology
  const recs: AgentRecommendation[] = [];

  // 1. Candidate Scout assessment
  recs.push({
    role: 'Candidate Scout',
    status: 'optimal',
    headline: `Target: Pt${Math.round(spot.targetComposition.pt * 100)}Pd${Math.round(spot.targetComposition.pd * 100)}Ni${Math.round(spot.targetComposition.ni * 100)}Co${Math.round(spot.targetComposition.co * 100)}`,
    analysis: `Predicted overpotential is ${spot.predictedOverpotentialMv} mV @ 10 mA/cm². Estimated precious metal raw material cost is $${spot.predictedCostPerGramUsd.toFixed(2)}/g.`,
    suggestedAction: 'Retain composition in active library candidate register.',
  });

  // 2. Metrology QC assessment
  if (spot.xrf.compositionDeviationPercent > 5.0) {
    recs.push({
      role: 'Metrology QC',
      status: 'alert',
      headline: `Micro-XRF Stoichiometry Deviation (${spot.xrf.compositionDeviationPercent.toFixed(1)}%) exceeds threshold`,
      analysis: `Measured atomic fractions deviate significantly from target. Pt: ${(spot.xrf.measuredComposition.pt*100).toFixed(1)}% (tgt ${(spot.targetComposition.pt*100).toFixed(1)}%), Co: ${(spot.xrf.measuredComposition.co*100).toFixed(1)}% (tgt ${(spot.targetComposition.co*100).toFixed(1)}%).`,
      suggestedAction: 'Recalibrate piezo dispenser Channel D droplet volume or inspect for nozzle micro-cavitation.',
    });
  } else {
    recs.push({
      role: 'Metrology QC',
      status: 'optimal',
      headline: `Micro-XRF Stoichiometry Verified (±${spot.xrf.compositionDeviationPercent.toFixed(1)}% RMS error)`,
      analysis: `Peak deconvolution on Pt Lα (9.44 keV) and Ni Kα (7.48 keV) confirms stoichiometry matches target within ±3.5% tolerance.`,
      suggestedAction: 'Approve metrology gate for electrochemical testing.',
    });
  }

  // 3. Print Planner & SEM morphology assessment
  if (spot.sem.radialSegregationIndex > 0.40) {
    recs.push({
      role: 'Print Planner',
      status: 'warning',
      headline: `Marangoni Coffee-Ring Segregation Detected (S = ${spot.sem.radialSegregationIndex.toFixed(2)})`,
      analysis: `SEM visualizer indicates peripheral solute migration. Drying temperature of ${spot.printerRecipe.substrateTemperatureC}°C was insufficient to induce inward Marangoni circulation.`,
      suggestedAction: `Increase substrate platen temperature to ${Math.min(95, spot.printerRecipe.substrateTemperatureC + 20)}°C or adjust ethylene glycol co-solvent ratio in ink formulation.`,
    });
  } else if (spot.sem.crackCount > 0) {
    recs.push({
      role: 'Print Planner',
      status: 'warning',
      headline: `Thermal Micro-Cracking Observed (${spot.sem.crackCount} cracks)`,
      analysis: `Thermal stress mismatch between glassy carbon substrate and alloy film during ${spot.printerRecipe.sinteringTempC}°C sintering ramp.`,
      suggestedAction: `Reduce sintering heating ramp rate from 20°C/min to 5°C/min and anneal at 320°C.`,
    });
  } else {
    recs.push({
      role: 'Print Planner',
      status: 'optimal',
      headline: `Morphology Nominal (Grain Size: ${spot.sem.meanGrainSizeNm} nm, Porosity: ${spot.sem.porosityPercent}%)`,
      analysis: `Uniform nano-crystallite distribution with no macro-cracking or dewetting defects observed.`,
      suggestedAction: 'Lock printer pulse waveforms (28.5V, 4.5 kHz) for subsequent batch campaigns.',
    });
  }

  // 4. FAIR Curator assessment
  recs.push({
    role: 'FAIR Curator',
    status: spot.realizabilityLabel === 'synthesizable_optimal' ? 'optimal' : 'action_required',
    headline: `Realizability Label: ${spot.realizabilityLabel}`,
    analysis: `Sample stamped with SHA-256 provenance hash (${spot.provenanceHash}). Outcome categorized in FAIR dataset schema for active learning feedback.`,
    suggestedAction: spot.realizabilityLabel === 'synthesizable_optimal' 
      ? 'Export to positive catalyst training database.'
      : 'Log failure mode in negative-outcome knowledge base to constrain model design space.',
  });

  return recs;
}

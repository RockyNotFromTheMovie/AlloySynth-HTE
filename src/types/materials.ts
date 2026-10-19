/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ElementalComposition {
  pt: number; // 0.0 to 1.0 (atomic fraction)
  pd: number;
  ni: number;
  co: number;
  [elementSymbol: string]: number;
}

export type RealizabilityLabel =
  | 'synthesizable_optimal'
  | 'partial_segregated_ring'
  | 'partial_microcracked'
  | 'negative_dewetted'
  | 'negative_nozzle_clogged';

export type QualityControlStatus = 'pending_review' | 'approved' | 'rejected';

export interface PrinterParameters {
  inkMixRatios: ElementalComposition; // Nanoparticle ink dispensing ratio
  totalDroplets: number;              // Typically 10 to 80 droplets per spot
  dropletVolumePl: number;            // 20 - 60 picoliters
  piezoVoltageV: number;              // 18 - 45 Volts
  dispensingFreqKhz: number;          // 1.0 - 15.0 kHz
  substrateTemperatureC: number;      // 25 - 120 °C
  sinteringTempC: number;             // 200 - 550 °C
  sinteringDurationSec: number;       // 60 - 600 s
  toolpathCoordinate: { xMm: number; yMm: number };
}

export interface MicroXRFChannelData {
  energyKev: number[];
  intensityCounts: number[];
  fittedPeaks: {
    element: string;
    line: string;
    centroidKev: number;
    netArea: number;
  }[];
}

export interface MicroXRFData {
  measuredComposition: ElementalComposition;
  compositionDeviationPercent: number; // Root-mean-square error from target
  spectralData: MicroXRFChannelData;
  snrDb: number;
  acquisitionTimeSec: number;
}

export interface SEMData {
  meanGrainSizeNm: number;
  porosityPercent: number;
  radialSegregationIndex: number; // 0.0 (perfectly homogeneous) to 1.0 (heavy coffee-ring)
  crackCount: number;
  hasDelamination: boolean;
  roughnessRaNm: number;
  micrographUrl?: string;
  simulatedTextureType: 'fine_grained' | 'dendritic' | 'segregated_ring' | 'cracked' | 'dewetted_droplet';
}

export interface SampleSpot {
  id: string; // e.g. "LIB-001-A01"
  row: number; // 0 to 7
  col: number; // 0 to 7
  substrateCoordMm: { x: number; y: number };
  
  // 1. AI Proposal Stage
  targetComposition: ElementalComposition;
  predictedOverpotentialMv: number; // mV @ 10 mA/cm2 (lower is better)
  predictedCostPerGramUsd: number;
  agentRationale: string;

  // 2. Nanoparticle Printing Stage
  printerRecipe: PrinterParameters;
  printStatus: 'planned' | 'in_progress' | 'completed' | 'failed';

  // 3. Metrology & Characterization Stage
  xrf: MicroXRFData;
  sem: SEMData;

  // 4. Quality Control & Realizability
  qcStatus: QualityControlStatus;
  realizabilityLabel: RealizabilityLabel;
  qcNotes: string;
  inspector: string;
  timestamp: string;

  // Provenance
  provenanceHash: string;
}

export interface MaterialLibrary {
  id: string;
  name: string;
  description: string;
  substrateType: 'Glassy Carbon' | 'Silicon Wafer' | 'FTO Coated Glass';
  substrateDimensionsMm: { width: number; height: number };
  rows: number;
  cols: number;
  spots: SampleSpot[];
  elements?: string[];
  createdAt: string;
  updatedAt: string;
  gcodeScript?: string;
  campaignStatus: 'design' | 'synthesis' | 'characterization' | 'qc_complete';
}

export interface AgentActionLog {
  id: string;
  agentRole: 'Candidate Scout' | 'Print Planner' | 'Metrology QC' | 'FAIR Curator';
  title: string;
  detail: string;
  timestamp: string;
  type: 'info' | 'decision' | 'warning' | 'success';
}

export interface PythonPipelineScript {
  id: string;
  name: string;
  description: string;
  filename: string;
  code: string;
  lastRunOutput?: string;
  lastRunStatus?: 'idle' | 'running' | 'success' | 'error';
  lastRunMetrics?: Record<string, number | string>;
}

export interface SynthesisLogEntry {
  id: string;
  timestamp: string;
  agentRole: 'Candidate Scout' | 'Print Planner' | 'Metrology QC' | 'FAIR Curator' | 'Human Scientist';
  actionCategory: 'printing' | 'qc' | 'scout' | 'fair';
  actionType: string;
  spotId?: string;
  title: string;
  detail: string;
  metrics?: Record<string, string | number>;
  status: 'optimal' | 'warning' | 'alert' | 'info';
}


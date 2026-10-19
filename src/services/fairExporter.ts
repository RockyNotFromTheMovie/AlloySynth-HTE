/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaterialLibrary, SampleSpot } from '../types/materials';

export interface FAIRSchemaDataset {
  '@context': string;
  '@type': string;
  identifier: string;
  name: string;
  description: string;
  creator: {
    '@type': string;
    name: string;
    affiliation: string;
  };
  datePublished: string;
  license: string;
  keywords: string[];
  variableMeasured: {
    '@type': string;
    name: string;
    unitText: string;
  }[];
  distribution: {
    '@type': string;
    encodingFormat: string;
    contentUrl: string;
  }[];
  sampleData: any[];
}

export function generateFAIRJsonLd(library: MaterialLibrary): string {
  const schema: FAIRSchemaDataset = {
    '@context': 'https://schema.org/',
    '@type': 'Dataset',
    identifier: `doi:10.5281/alloysynth.${library.id.toLowerCase()}`,
    name: library.name,
    description: library.description,
    creator: {
      '@type': 'Person',
      name: 'Dr. Ismail Hanafi & Autonomous AI Agent Team',
      affiliation: 'Autonomous Materials Discovery & Characterization Facility',
    },
    datePublished: library.createdAt,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    keywords: [
      'High-Throughput Experimentation',
      'Electrocatalysts',
      'Nanoparticle Jet Printing',
      'Micro-XRF Mapping',
      'Scanning Electron Microscopy',
      'High-Entropy Alloys',
      'Pt-Pd-Ni-Co',
      'Negative Outcomes',
      'FAIR Data',
    ],
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'Pt Atomic Fraction', unitText: 'fraction' },
      { '@type': 'PropertyValue', name: 'Pd Atomic Fraction', unitText: 'fraction' },
      { '@type': 'PropertyValue', name: 'Ni Atomic Fraction', unitText: 'fraction' },
      { '@type': 'PropertyValue', name: 'Co Atomic Fraction', unitText: 'fraction' },
      { '@type': 'PropertyValue', name: 'Predicted Overpotential @ 10mA/cm2', unitText: 'mV' },
      { '@type': 'PropertyValue', name: 'Micro-XRF Composition Deviation', unitText: '%' },
      { '@type': 'PropertyValue', name: 'SEM Mean Grain Size', unitText: 'nm' },
      { '@type': 'PropertyValue', name: 'SEM Radial Segregation Index', unitText: '0-1 scale' },
      { '@type': 'PropertyValue', name: 'Realizability Classification Label', unitText: 'categorical' },
    ],
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'text/csv',
        contentUrl: `${library.id}_measurements.csv`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/ld+json',
        contentUrl: `${library.id}_fair_metadata.json`,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/x-gcode',
        contentUrl: `${library.id}_printer_toolpath.gcode`,
      },
    ],
    sampleData: library.spots.map((spot) => ({
      spotId: spot.id,
      gridIndex: { row: spot.row, col: spot.col },
      coordinatesMm: spot.substrateCoordMm,
      targetComposition: spot.targetComposition,
      measuredComposition: spot.xrf.measuredComposition,
      compositionDeviationPercent: spot.xrf.compositionDeviationPercent,
      semMetrics: spot.sem,
      qcStatus: spot.qcStatus,
      realizabilityLabel: spot.realizabilityLabel,
      provenanceHash: spot.provenanceHash,
    })),
  };

  return JSON.stringify(schema, null, 2);
}

export function generateCSVDataset(library: MaterialLibrary): string {
  const headers = [
    'spot_id',
    'row',
    'col',
    'coord_x_mm',
    'coord_y_mm',
    'target_pt_frac',
    'target_pd_frac',
    'target_ni_frac',
    'target_co_frac',
    'measured_pt_frac',
    'measured_pd_frac',
    'measured_ni_frac',
    'measured_co_frac',
    'deviation_percent',
    'pred_overpotential_mv',
    'pred_cost_usd_g',
    'droplet_count',
    'substrate_temp_c',
    'sinter_temp_c',
    'sem_grain_size_nm',
    'sem_porosity_pct',
    'sem_radial_segregation_idx',
    'sem_crack_count',
    'sem_delamination',
    'qc_status',
    'realizability_label',
    'qc_notes',
    'provenance_hash',
    'timestamp',
  ];

  const rows = library.spots.map((s) => [
    s.id,
    s.row,
    s.col,
    s.substrateCoordMm.x,
    s.substrateCoordMm.y,
    s.targetComposition.pt,
    s.targetComposition.pd,
    s.targetComposition.ni,
    s.targetComposition.co,
    s.xrf.measuredComposition.pt,
    s.xrf.measuredComposition.pd,
    s.xrf.measuredComposition.ni,
    s.xrf.measuredComposition.co,
    s.xrf.compositionDeviationPercent,
    s.predictedOverpotentialMv,
    s.predictedCostPerGramUsd,
    s.printerRecipe.totalDroplets,
    s.printerRecipe.substrateTemperatureC,
    s.printerRecipe.sinteringTempC,
    s.sem.meanGrainSizeNm,
    s.sem.porosityPercent,
    s.sem.radialSegregationIndex,
    s.sem.crackCount,
    s.sem.hasDelamination ? 1 : 0,
    s.qcStatus,
    s.realizabilityLabel,
    `"${s.qcNotes.replace(/"/g, '""')}"`,
    s.provenanceHash,
    s.timestamp,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

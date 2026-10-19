/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaterialLibrary, SampleSpot, RealizabilityLabel, QualityControlStatus } from '../types/materials';

// Helper to generate realistic 2048-channel EDS spectrum for Pt, Pd, Ni, Co
export function generateSyntheticEDSSpectrum(comp: { pt: number; pd: number; ni: number; co: number }) {
  const energyKev: number[] = [];
  const intensityCounts: number[] = [];

  // Generate 200 sample energy points from 0 to 15 keV
  const numBins = 150;
  for (let i = 0; i < numBins; i++) {
    const e = (i / numBins) * 14.0;
    energyKev.push(parseFloat(e.toFixed(2)));

    // Bremsstrahlung background
    let bg = Math.max(0, 150 * Math.exp(-0.25 * e) * Math.sin(e * 0.15));

    // Pd L-alpha: 2.84 keV
    const pdPeak = comp.pd * 3800 * Math.exp(-Math.pow((e - 2.84) / 0.12, 2));
    // Co K-alpha: 6.93 keV
    const coPeak = comp.co * 4200 * Math.exp(-Math.pow((e - 6.93) / 0.14, 2));
    // Ni K-alpha: 7.48 keV
    const niPeak = comp.ni * 4400 * Math.exp(-Math.pow((e - 7.48) / 0.14, 2));
    // Pt L-alpha: 9.44 keV
    const ptPeak = comp.pt * 5100 * Math.exp(-Math.pow((e - 9.44) / 0.16, 2));
    // Pt L-beta: 11.07 keV
    const ptBeta = comp.pt * 2400 * Math.exp(-Math.pow((e - 11.07) / 0.18, 2));

    const noise = (Math.random() - 0.5) * 20;
    const total = Math.max(0, Math.round(bg + pdPeak + coPeak + niPeak + ptPeak + ptBeta + noise));
    intensityCounts.push(total);
  }

  const fittedPeaks = [
    { element: 'Pd' as const, line: 'Lα' as const, centroidKev: 2.84, netArea: Math.round(comp.pd * 18200) },
    { element: 'Co' as const, line: 'Kα' as const, centroidKev: 6.93, netArea: Math.round(comp.co * 21400) },
    { element: 'Ni' as const, line: 'Kα' as const, centroidKev: 7.48, netArea: Math.round(comp.ni * 22800) },
    { element: 'Pt' as const, line: 'Lα' as const, centroidKev: 9.44, netArea: Math.round(comp.pt * 26900) },
  ];

  return { energyKev, intensityCounts, fittedPeaks };
}

// Generate the systematic 8x8 combinatorial library
export function createQuaternaryElectrocatalystLibrary(): MaterialLibrary {
  const rows = 8;
  const cols = 8;
  const spots: SampleSpot[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const spotId = `CAT-${String.fromCharCode(65 + r)}${c + 1 < 10 ? '0' : ''}${c + 1}`;

      // Systematic quaternary gradient mapping:
      // Row controls Pt vs Base Metal ratio, Col controls Pd vs Ni-Co partitioning
      const u = r / (rows - 1); // 0 (top row) to 1 (bottom row)
      const v = c / (cols - 1); // 0 (left col) to 1 (right col)

      // Target composition
      let rawPt = 0.60 * (1 - u * 0.75) + 0.05 * Math.sin(c);
      let rawPd = 0.25 * v * (1 - u * 0.5) + 0.05;
      let rawNi = (0.15 + 0.45 * u) * (1 - v * 0.6);
      let rawCo = (0.10 + 0.40 * u) * (0.2 + 0.8 * v);

      const sum = rawPt + rawPd + rawNi + rawCo;
      const targetPt = parseFloat((rawPt / sum).toFixed(3));
      const targetPd = parseFloat((rawPd / sum).toFixed(3));
      const targetNi = parseFloat((rawNi / sum).toFixed(3));
      const targetCo = parseFloat((1 - (targetPt + targetPd + targetNi)).toFixed(3));

      // Coordinate on 70x70mm substrate chip
      const xMm = parseFloat((8.0 + c * 7.5).toFixed(2));
      const yMm = parseFloat((8.0 + r * 7.5).toFixed(2));

      // Overpotential calculation (Volcano curve with Pt-Ni synergistic peak)
      // Pt3Ni / PtNiCo active alloy structures have lowest overpotential ~270 mV
      const synergy = 4 * targetPt * targetNi + 2 * targetPt * targetCo + targetPd * 0.5;
      const overpotential = Math.round(410 - 150 * Math.min(1.0, synergy) + 80 * Math.pow(targetCo - 0.35, 2));
      
      // Cost calculation (USD/g: Pt~$32/g, Pd~$35/g, Ni~$0.02/g, Co~$0.04/g)
      const cost = parseFloat((targetPt * 32.5 + targetPd * 35.2 + targetNi * 0.022 + targetCo * 0.038).toFixed(2));

      // Intentional physical variations to mirror real laboratory outcomes
      let realizability: RealizabilityLabel = 'synthesizable_optimal';
      let qcStatus: QualityControlStatus = 'approved';
      let texture: 'fine_grained' | 'dendritic' | 'segregated_ring' | 'cracked' | 'dewetted_droplet' = 'fine_grained';
      let deviation = parseFloat((1.2 + Math.random() * 2.1).toFixed(2));
      let radialSeg = parseFloat((0.08 + Math.random() * 0.12).toFixed(2));
      let crackCount = 0;
      let delam = false;
      let substrateTemp = 65;
      let sinterTemp = 380;
      let qcNotes = 'Conforms to stoichiometry specifications. Clean single-phase alloy morphology.';

      // Inject edge cases:
      if (r === 1 && c === 6) {
        // High Pd, low substrate temp during run -> coffee-ring segregation
        realizability = 'partial_segregated_ring';
        qcStatus = 'pending_review';
        texture = 'segregated_ring';
        radialSeg = 0.74;
        substrateTemp = 32; // too cold
        qcNotes = 'High radial segregation observed in micro-XRF. Coffee-ring enrichment of Ni-Co at perimeter.';
      } else if (r === 4 && c === 1) {
        // Rapid heating spike -> micro-cracking
        realizability = 'partial_microcracked';
        qcStatus = 'pending_review';
        texture = 'cracked';
        crackCount = 7;
        sinterTemp = 510;
        qcNotes = 'Thermally induced micro-cracks detected in SEM inspection due to thermal expansion mismatch.';
      } else if (r === 7 && c === 7) {
        // High base metal, poor wetting on glassy carbon
        realizability = 'negative_dewetted';
        qcStatus = 'rejected';
        texture = 'dewetted_droplet';
        delam = true;
        deviation = 14.8;
        qcNotes = 'Severe substrate dewetting; droplet coalesced into discontinuous beads. Reject candidate.';
      } else if (r === 0 && c === 7) {
        // Piezo nozzle channel 4 cavitation / clog
        realizability = 'negative_nozzle_clogged';
        qcStatus = 'rejected';
        texture = 'dewetted_droplet';
        deviation = 28.5;
        qcNotes = 'Nozzle dispenser Clog on Channel D (Co). Target stoichiometry severely depleted.';
      } else if (r === 5 && c === 4) {
        realizability = 'partial_segregated_ring';
        qcStatus = 'pending_review';
        texture = 'segregated_ring';
        radialSeg = 0.62;
        qcNotes = 'Moderate peripheral droplet halo detected. Recommend increasing substrate temperature by 15°C.';
      }

      // Measured XRF with slight instrument variance
      const devFactor = 1 + (deviation / 100) * (Math.random() > 0.5 ? 1 : -1);
      let mPt = targetPt * devFactor;
      let mPd = targetPd * (1 - (devFactor - 1) * 0.5);
      let mNi = targetNi;
      let mCo = targetCo;
      
      if (realizability === 'negative_nozzle_clogged') {
        mCo = targetCo * 0.08; // severely depleted
      }

      const mSum = mPt + mPd + mNi + mCo;
      const measuredComp = {
        pt: parseFloat((mPt / mSum).toFixed(3)),
        pd: parseFloat((mPd / mSum).toFixed(3)),
        ni: parseFloat((mNi / mSum).toFixed(3)),
        co: parseFloat((1 - ((mPt + mPd + mNi) / mSum)).toFixed(3)),
      };

      const spectralData = generateSyntheticEDSSpectrum(measuredComp);

      const spot: SampleSpot = {
        id: spotId,
        row: r,
        col: c,
        substrateCoordMm: { x: xMm, y: yMm },
        targetComposition: { pt: targetPt, pd: targetPd, ni: targetNi, co: targetCo },
        predictedOverpotentialMv: overpotential,
        predictedCostPerGramUsd: cost,
        agentRationale: `Pt${Math.round(targetPt * 100)}Pd${Math.round(targetPd * 100)}Ni${Math.round(targetNi * 100)}Co${Math.round(targetCo * 100)} targeted for optimal d-band center shift and high ORR kinetics.`,
        
        printerRecipe: {
          inkMixRatios: { pt: targetPt, pd: targetPd, ni: targetNi, co: targetCo },
          totalDroplets: 40,
          dropletVolumePl: 32,
          piezoVoltageV: 28.5,
          dispensingFreqKhz: 4.5,
          substrateTemperatureC: substrateTemp,
          sinteringTempC: sinterTemp,
          sinteringDurationSec: 180,
          toolpathCoordinate: { xMm, yMm },
        },
        printStatus: 'completed',

        xrf: {
          measuredComposition: measuredComp,
          compositionDeviationPercent: deviation,
          spectralData,
          snrDb: parseFloat((32.5 + Math.random() * 4.2).toFixed(1)),
          acquisitionTimeSec: 15.0,
        },

        sem: {
          meanGrainSizeNm: Math.round(18 + targetPt * 30 + Math.random() * 8),
          porosityPercent: parseFloat((12.4 + targetNi * 14 + Math.random() * 3).toFixed(1)),
          radialSegregationIndex: radialSeg,
          crackCount,
          hasDelamination: delam,
          roughnessRaNm: parseFloat((4.2 + radialSeg * 8.5 + (crackCount > 0 ? 12 : 0)).toFixed(1)),
          simulatedTextureType: texture,
        },

        qcStatus,
        realizabilityLabel: realizability,
        qcNotes,
        inspector: 'Dr. I. Hanafi & Agent QC',
        timestamp: new Date(Date.now() - (64 - index) * 180000).toISOString(),
        provenanceHash: `0x${((index * 83719 + 104729) >>> 0).toString(16).padStart(8, '0')}`,
      };

      spots.push(spot);
    }
  }

  return {
    id: 'LIB-2026-PT-PD-NI-CO-01',
    name: 'Quaternary Pt-Pd-Ni-Co High-Entropy Library',
    description: 'Systematic 64-spot combinatorial library fabricated via piezoelectric nanoparticle jet printing onto glassy carbon substrate, mapped via micro-XRF and inspected with high-resolution SEM.',
    substrateType: 'Glassy Carbon',
    substrateDimensionsMm: { width: 70, height: 70 },
    rows: 8,
    cols: 8,
    spots,
    createdAt: '2026-10-15T09:30:00.000Z',
    updatedAt: new Date().toISOString(),
    campaignStatus: 'qc_complete',
  };
}

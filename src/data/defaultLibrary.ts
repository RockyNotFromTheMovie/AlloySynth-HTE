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
    elements: ['Pt', 'Pd', 'Ni', 'Co'],
    createdAt: '2026-10-15T09:30:00.000Z',
    updatedAt: new Date().toISOString(),
    campaignStatus: 'qc_complete',
  };
}

import { PeriodicElement } from './periodicTable';

// Dynamic generator for any 2 to 5 selected elements from the Periodic Table
export function generateCustomAlloyLibrary(selectedElements: PeriodicElement[]): MaterialLibrary {
  if (selectedElements.length < 2 || selectedElements.length > 5) {
    throw new Error('Alloy synthesis requires between 2 and 5 elements.');
  }

  const rows = 8;
  const cols = 8;
  const spots: SampleSpot[] = [];
  const numElements = selectedElements.length;
  const symbols = selectedElements.map((e) => e.symbol);
  const formulaPrefix = symbols.join('-');

  // Elemental peak definitions for micro-XRF
  const elementLines = selectedElements.map((el) => {
    const energy = el.xrfKalphaKev || el.xrfLalphaKev || parseFloat((1.2 + el.atomicNumber * 0.12).toFixed(2));
    const line = el.xrfKalphaKev ? 'Kα' : 'Lα';
    return {
      symbol: el.symbol,
      energy,
      line,
      weightFactor: Math.max(10, Math.min(100, el.densityGcm3 * 4 + el.atomicMass * 0.2)),
    };
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const index = r * cols + c;
      const spotId = `${symbols[0].toUpperCase()}${symbols[1].toUpperCase()}-${String.fromCharCode(65 + r)}${c + 1 < 10 ? '0' : ''}${c + 1}`;

      const u = r / (rows - 1); // 0 to 1
      const v = c / (cols - 1); // 0 to 1

      // Compute normalized fractions for the selected 2-5 elements
      const rawWeights: number[] = [];
      if (numElements === 2) {
        // Binary gradient: u & v diagonal
        const w0 = 0.10 + 0.80 * (1 - (u * 0.6 + v * 0.4));
        const w1 = 0.10 + 0.80 * (u * 0.6 + v * 0.4);
        rawWeights.push(w0, w1);
      } else if (numElements === 3) {
        // Ternary simplex gradient
        const w0 = 0.10 + 0.80 * (1 - u);
        const w1 = 0.10 + 0.80 * u * (1 - v);
        const w2 = 0.10 + 0.80 * u * v;
        rawWeights.push(w0, w1, w2);
      } else if (numElements === 4) {
        // Quaternary gradient
        const w0 = 0.10 + 0.70 * (1 - u * 0.75);
        const w1 = 0.10 + 0.40 * v * (1 - u * 0.5);
        const w2 = (0.15 + 0.45 * u) * (1 - v * 0.6);
        const w3 = (0.10 + 0.40 * u) * (0.2 + 0.8 * v);
        rawWeights.push(w0, w1, w2, w3);
      } else {
        // 5 elements (Quinary high-entropy alloy, e.g. Cantor Fe-Co-Ni-Cr-Mn)
        const w0 = 0.10 + 0.40 * (1 - u);
        const w1 = 0.10 + 0.40 * u;
        const w2 = 0.10 + 0.40 * (1 - v);
        const w3 = 0.10 + 0.40 * v;
        const w4 = 0.15 + 0.30 * Math.sin(u * Math.PI) * Math.sin(v * Math.PI);
        rawWeights.push(w0, w1, w2, w3, w4);
      }

      const sumWeights = rawWeights.reduce((a, b) => a + b, 0);
      const normalizedFractions = rawWeights.map((w) => parseFloat((w / sumWeights).toFixed(3)));

      // Construct targetComposition dictionary
      const targetComposition: any = {
        pt: 0,
        pd: 0,
        ni: 0,
        co: 0,
      };

      selectedElements.forEach((el, i) => {
        const frac = normalizedFractions[i];
        targetComposition[el.symbol.toLowerCase()] = frac;
        // Also map to standard keys if element matches
        if (el.symbol === 'Pt') targetComposition.pt = frac;
        if (el.symbol === 'Pd') targetComposition.pd = frac;
        if (el.symbol === 'Ni') targetComposition.ni = frac;
        if (el.symbol === 'Co') targetComposition.co = frac;
      });

      // Coordinate on substrate
      const xMm = parseFloat((8.0 + c * 7.5).toFixed(2));
      const yMm = parseFloat((8.0 + r * 7.5).toFixed(2));

      // Overpotential / Activity model: High-entropy mixing penalty + density synergy
      const mixingEntropy = -normalizedFractions.reduce((acc, f) => (f > 0 ? acc + f * Math.log(f) : acc), 0);
      const overpotential = Math.round(420 - mixingEntropy * 120 + 30 * Math.cos(r + c));
      const costPerGram = parseFloat((selectedElements.reduce((acc, el, i) => acc + normalizedFractions[i] * (el.densityGcm3 > 15 ? 30.0 : 0.08), 0)).toFixed(2));

      // Defect injection for authentic realizability data
      let realizability: RealizabilityLabel = 'synthesizable_optimal';
      let qcStatus: QualityControlStatus = 'approved';
      let texture: 'fine_grained' | 'dendritic' | 'segregated_ring' | 'cracked' | 'dewetted_droplet' = 'fine_grained';
      let deviation = parseFloat((1.1 + Math.random() * 2.2).toFixed(2));
      let radialSeg = parseFloat((0.07 + Math.random() * 0.14).toFixed(2));
      let crackCount = 0;
      let delam = false;
      let substrateTemp = 65;
      let sinterTemp = 380;
      let qcNotes = `Conforms to ${formulaPrefix} stoichiometric target. Homogeneous single-phase structure.`;

      if (r === 1 && c === 6) {
        realizability = 'partial_segregated_ring';
        qcStatus = 'pending_review';
        texture = 'segregated_ring';
        radialSeg = 0.72;
        substrateTemp = 32;
        qcNotes = `Marangoni coffee-ring segregation observed in ${symbols[0]}-${symbols[1]} ratio at droplet perimeter.`;
      } else if (r === 4 && c === 1) {
        realizability = 'partial_microcracked';
        qcStatus = 'pending_review';
        texture = 'cracked';
        crackCount = 6;
        sinterTemp = 490;
        qcNotes = `Thermal expansion coefficient mismatch induced micro-cracks during rapid sintering ramp.`;
      } else if (r === 7 && c === 7) {
        realizability = 'negative_dewetted';
        qcStatus = 'rejected';
        texture = 'dewetted_droplet';
        delam = true;
        deviation = 15.2;
        qcNotes = `Severe substrate dewetting; poor surface energy wetting on glassy carbon platen.`;
      } else if (r === 0 && c === 7) {
        realizability = 'negative_nozzle_clogged';
        qcStatus = 'rejected';
        texture = 'dewetted_droplet';
        deviation = 26.4;
        qcNotes = `Piezoelectric nozzle Channel ${String.fromCharCode(65 + numElements - 1)} micro-clogged. Depleted ${symbols[numElements - 1]}.`;
      }

      // Measured XRF composition
      const measuredComposition: any = { ...targetComposition };
      const devScale = 1 + (deviation / 100) * (Math.random() > 0.5 ? 1 : -1);
      selectedElements.forEach((el, i) => {
        let val = normalizedFractions[i];
        if (i === 0) val = val * devScale;
        if (realizability === 'negative_nozzle_clogged' && i === numElements - 1) {
          val = val * 0.12; // severe drop
        }
        measuredComposition[el.symbol.toLowerCase()] = parseFloat(val.toFixed(3));
        if (el.symbol === 'Pt') measuredComposition.pt = parseFloat(val.toFixed(3));
        if (el.symbol === 'Pd') measuredComposition.pd = parseFloat(val.toFixed(3));
        if (el.symbol === 'Ni') measuredComposition.ni = parseFloat(val.toFixed(3));
        if (el.symbol === 'Co') measuredComposition.co = parseFloat(val.toFixed(3));
      });

      // Synthetic EDS spectrum for chosen elements
      const numBins = 150;
      const energyKev: number[] = [];
      const intensityCounts: number[] = [];
      for (let i = 0; i < numBins; i++) {
        const e = (i / numBins) * 14.0;
        energyKev.push(parseFloat(e.toFixed(2)));
        let bg = Math.max(0, 150 * Math.exp(-0.25 * e) * Math.sin(e * 0.15));

        let peakSum = 0;
        elementLines.forEach((line, idx) => {
          const frac = normalizedFractions[idx];
          const amp = frac * 4500;
          peakSum += amp * Math.exp(-Math.pow((e - line.energy) / 0.14, 2));
        });

        const noise = (Math.random() - 0.5) * 18;
        intensityCounts.push(Math.max(0, Math.round(bg + peakSum + noise)));
      }

      const fittedPeaks = elementLines.map((line, idx) => ({
        element: line.symbol,
        line: line.line,
        centroidKev: line.energy,
        netArea: Math.round(normalizedFractions[idx] * 22000),
      }));

      const spot: SampleSpot = {
        id: spotId,
        row: r,
        col: c,
        substrateCoordMm: { x: xMm, y: yMm },
        targetComposition,
        predictedOverpotentialMv: overpotential,
        predictedCostPerGramUsd: costPerGram,
        agentRationale: `${symbols.map((s, idx) => `${s}${Math.round(normalizedFractions[idx] * 100)}`).join('')} formulated for multi-principal element synergy and high realizability.`,
        printerRecipe: {
          inkMixRatios: targetComposition,
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
          measuredComposition,
          compositionDeviationPercent: deviation,
          spectralData: { energyKev, intensityCounts, fittedPeaks },
          snrDb: parseFloat((33.2 + Math.random() * 3.8).toFixed(1)),
          acquisitionTimeSec: 15.0,
        },
        sem: {
          meanGrainSizeNm: Math.round(20 + Math.random() * 15),
          porosityPercent: parseFloat((14.0 + Math.random() * 4).toFixed(1)),
          radialSegregationIndex: radialSeg,
          crackCount,
          hasDelamination: delam,
          roughnessRaNm: parseFloat((4.0 + radialSeg * 9.0 + (crackCount > 0 ? 10 : 0)).toFixed(1)),
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
    id: `LIB-2026-${symbols.join('-').toUpperCase()}-01`,
    name: `${symbols.join('-')} High-Entropy Combinatorial Library`,
    description: `Standard reference 64-spot combinatorial library formulated with ${symbols.join(', ')} via drop-on-demand nanoparticle jet printing on glassy carbon, characterized via micro-XRF mapping and SEM.`,
    substrateType: 'Glassy Carbon',
    substrateDimensionsMm: { width: 70, height: 70 },
    rows: 8,
    cols: 8,
    spots,
    elements: symbols,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    campaignStatus: 'qc_complete',
  };
}


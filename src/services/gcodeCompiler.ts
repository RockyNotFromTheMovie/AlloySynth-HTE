/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MaterialLibrary, SampleSpot } from '../types/materials';

export function generateGcodeForLibrary(library: MaterialLibrary): string {
  const lines: string[] = [];

  // Header & Provenance
  lines.push('; ========================================================');
  lines.push(`; ALLOY-SYNTH HTE NANOPARTICLE JET PRINTER TOOLPATH`);
  lines.push(`; Library ID: ${library.id}`);
  lines.push(`; Substrate: ${library.substrateType} (${library.substrateDimensionsMm.width}x${library.substrateDimensionsMm.height} mm)`);
  lines.push(`; Total Spots: ${library.spots.length}`);
  lines.push(`; Generated: ${new Date().toISOString()}`);
  lines.push('; Target System: Pt-Pd-Ni-Co Quaternary Catalyst');
  lines.push('; ========================================================');
  lines.push('');

  // Initial G-code Setup
  lines.push('G21 ; Set units to millimeters');
  lines.push('G90 ; Absolute positioning mode');
  lines.push('M82 ; Absolute extrusion / dispensing mode');
  lines.push('G28 X0 Y0 Z0 ; Home all axes to optical fiducials');
  lines.push('G0 Z15.000 F1800 ; Lift nozzle array to safe clearance');
  lines.push('');

  // Substrate Preheating
  const targetSubstrateTemp = library.spots[0]?.printerRecipe.substrateTemperatureC || 65;
  lines.push(`; --- Substrate Temperature Stabilization ---`);
  lines.push(`M140 S${targetSubstrateTemp} ; Set substrate platen target temperature`);
  lines.push(`M190 S${targetSubstrateTemp} ; Wait for platen to reach ${targetSubstrateTemp}C`);
  lines.push('');

  // Dispenser Primer Cycle
  lines.push('; --- Automated Piezo Array De-gas & Prime Cycle ---');
  lines.push('G0 X2.00 Y2.00 F3000 ; Move to purge pad');
  lines.push('G0 Z2.00 F600 ; Lower to purge height');
  lines.push('M300 P500 ; Ultrasonic transducer degassing pulse (500ms)');
  lines.push('T0 ; Select Channel A (Pt Nanoparticle Ink)');
  lines.push('M204 P28.0 F5000 D10 ; Test fire 10 droplets');
  lines.push('T1 ; Select Channel B (Pd Nanoparticle Ink)');
  lines.push('M204 P28.0 F5000 D10 ; Test fire 10 droplets');
  lines.push('T2 ; Select Channel C (Ni Nanoparticle Ink)');
  lines.push('M204 P28.0 F5000 D10 ; Test fire 10 droplets');
  lines.push('T3 ; Select Channel D (Co Nanoparticle Ink)');
  lines.push('M204 P28.0 F5000 D10 ; Test fire 10 droplets');
  lines.push('G0 Z15.000 F1800 ; Retract');
  lines.push('');

  // Traversal and Deposition Loop
  lines.push('; --- Begin Combinatorial Library Deposition ---');
  library.spots.forEach((spot, idx) => {
    const { x, y } = spot.substrateCoordMm;
    const recipe = spot.printerRecipe;
    const totalDrops = recipe.totalDroplets || 40;

    const ptDrops = Math.round(totalDrops * spot.targetComposition.pt);
    const pdDrops = Math.round(totalDrops * spot.targetComposition.pd);
    const niDrops = Math.round(totalDrops * spot.targetComposition.ni);
    const coDrops = Math.max(0, totalDrops - (ptDrops + pdDrops + niDrops));

    lines.push(`; Spot [${spot.id}] (Row ${spot.row}, Col ${spot.col}) Pt${Math.round(spot.targetComposition.pt*100)}Pd${Math.round(spot.targetComposition.pd*100)}Ni${Math.round(spot.targetComposition.ni*100)}Co${Math.round(spot.targetComposition.co*100)}`);
    lines.push(`G0 X${x.toFixed(3)} Y${y.toFixed(3)} F3600 ; Rapid traverse to coordinate`);
    lines.push(`G0 Z0.800 F900 ; Approach standoff distance (0.80 mm)`);

    // Dispense each active element
    if (ptDrops > 0) {
      lines.push(`  T0 ; Pt Ink`);
      lines.push(`  M204 P${recipe.piezoVoltageV.toFixed(1)} F${Math.round(recipe.dispensingFreqKhz * 1000)} D${ptDrops} ; Dispense ${ptDrops} drops`);
    }
    if (pdDrops > 0) {
      lines.push(`  T1 ; Pd Ink`);
      lines.push(`  M204 P${recipe.piezoVoltageV.toFixed(1)} F${Math.round(recipe.dispensingFreqKhz * 1000)} D${pdDrops} ; Dispense ${pdDrops} drops`);
    }
    if (niDrops > 0) {
      lines.push(`  T2 ; Ni Ink`);
      lines.push(`  M204 P${recipe.piezoVoltageV.toFixed(1)} F${Math.round(recipe.dispensingFreqKhz * 1000)} D${niDrops} ; Dispense ${niDrops} drops`);
    }
    if (coDrops > 0) {
      lines.push(`  T3 ; Co Ink`);
      lines.push(`  M204 P${recipe.piezoVoltageV.toFixed(1)} F${Math.round(recipe.dispensingFreqKhz * 1000)} D${coDrops} ; Dispense ${coDrops} drops`);
    }

    lines.push(`G4 P150 ; Dwell 150ms for droplet coalescence`);
    lines.push(`G0 Z3.000 F1200 ; Standoff retreat`);
    lines.push('');
  });

  // End of Routine
  lines.push('; --- Deposition Complete: Sintering Stage ---');
  lines.push('G0 Z25.000 F1800 ; Lift head');
  lines.push('G0 X0.00 Y65.00 F3000 ; Move stage to optical inspection zone');
  lines.push('M140 S380 ; Ramp substrate heater to 380C for in-situ reduction & sintering');
  lines.push('G4 S180 ; Hold sintering temperature for 180 seconds');
  lines.push('M140 S0 ; Heater shutdown');
  lines.push('M84 ; Stepper motors disable');
  lines.push('; --- End of Toolpath ---');

  return lines.join('\n');
}

export function downloadGcodeFile(filename: string, gcodeContent: string) {
  const blob = new Blob([gcodeContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.gcode') ? filename : `${filename}.gcode`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

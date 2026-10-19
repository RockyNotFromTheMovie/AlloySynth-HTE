/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PeriodicBlock = 's' | 'p' | 'd' | 'f';

export type ElementCategory =
  | 'alkali'
  | 'alkaline_earth'
  | 'transition_metal'
  | 'post_transition'
  | 'metalloid'
  | 'reactive_nonmetal'
  | 'noble_gas'
  | 'lanthanide'
  | 'actinide';

export interface PeriodicElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  period: number;
  group: number; // 1-18; for lanthanides/actinides set to 3
  block: PeriodicBlock;
  category: ElementCategory;
  densityGcm3: number;
  electronegativity: number | null;
  xrfKalphaKev: number | null;
  xrfLalphaKev: number | null;
  isCommonAlloyElement?: boolean;
}

// Complete authoritative standard 118-element periodic reference library
export const PERIODIC_TABLE: PeriodicElement[] = [
  // Period 1
  { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, period: 1, group: 1, block: 's', category: 'reactive_nonmetal', densityGcm3: 0.00008988, electronegativity: 2.20, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026, period: 1, group: 18, block: 's', category: 'noble_gas', densityGcm3: 0.0001785, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },

  // Period 2
  { atomicNumber: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, period: 2, group: 1, block: 's', category: 'alkali', densityGcm3: 0.534, electronegativity: 0.98, xrfKalphaKev: 0.054, xrfLalphaKev: null },
  { atomicNumber: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.0122, period: 2, group: 2, block: 's', category: 'alkaline_earth', densityGcm3: 1.85, electronegativity: 1.57, xrfKalphaKev: 0.108, xrfLalphaKev: null },
  { atomicNumber: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, period: 2, group: 13, block: 'p', category: 'metalloid', densityGcm3: 2.34, electronegativity: 2.04, xrfKalphaKev: 0.183, xrfLalphaKev: null },
  { atomicNumber: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, period: 2, group: 14, block: 'p', category: 'reactive_nonmetal', densityGcm3: 2.267, electronegativity: 2.55, xrfKalphaKev: 0.277, xrfLalphaKev: null },
  { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, period: 2, group: 15, block: 'p', category: 'reactive_nonmetal', densityGcm3: 0.00125, electronegativity: 3.04, xrfKalphaKev: 0.392, xrfLalphaKev: null },
  { atomicNumber: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, period: 2, group: 16, block: 'p', category: 'reactive_nonmetal', densityGcm3: 0.001429, electronegativity: 3.44, xrfKalphaKev: 0.525, xrfLalphaKev: null },
  { atomicNumber: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.998, period: 2, group: 17, block: 'p', category: 'reactive_nonmetal', densityGcm3: 0.001696, electronegativity: 3.98, xrfKalphaKev: 0.677, xrfLalphaKev: null },
  { atomicNumber: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.180, period: 2, group: 18, block: 'p', category: 'noble_gas', densityGcm3: 0.00090, electronegativity: null, xrfKalphaKev: 0.849, xrfLalphaKev: null },

  // Period 3
  { atomicNumber: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.990, period: 3, group: 1, block: 's', category: 'alkali', densityGcm3: 0.968, electronegativity: 0.93, xrfKalphaKev: 1.041, xrfLalphaKev: null },
  { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305, period: 3, group: 2, block: 's', category: 'alkaline_earth', densityGcm3: 1.738, electronegativity: 1.31, xrfKalphaKev: 1.254, xrfLalphaKev: null },
  { atomicNumber: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.982, period: 3, group: 13, block: 'p', category: 'post_transition', densityGcm3: 2.70, electronegativity: 1.61, xrfKalphaKev: 1.486, xrfLalphaKev: null },
  { atomicNumber: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, period: 3, group: 14, block: 'p', category: 'metalloid', densityGcm3: 2.329, electronegativity: 1.90, xrfKalphaKev: 1.740, xrfLalphaKev: null },
  { atomicNumber: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.974, period: 3, group: 15, block: 'p', category: 'reactive_nonmetal', densityGcm3: 1.823, electronegativity: 2.19, xrfKalphaKev: 2.013, xrfLalphaKev: null },
  { atomicNumber: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06, period: 3, group: 16, block: 'p', category: 'reactive_nonmetal', densityGcm3: 2.07, electronegativity: 2.58, xrfKalphaKev: 2.307, xrfLalphaKev: null },
  { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, period: 3, group: 17, block: 'p', category: 'reactive_nonmetal', densityGcm3: 0.0032, electronegativity: 3.16, xrfKalphaKev: 2.621, xrfLalphaKev: null },
  { atomicNumber: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.95, period: 3, group: 18, block: 'p', category: 'noble_gas', densityGcm3: 0.00178, electronegativity: null, xrfKalphaKev: 2.957, xrfLalphaKev: null },

  // Period 4
  { atomicNumber: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.098, period: 4, group: 1, block: 's', category: 'alkali', densityGcm3: 0.862, electronegativity: 0.82, xrfKalphaKev: 3.313, xrfLalphaKev: null },
  { atomicNumber: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.078, period: 4, group: 2, block: 's', category: 'alkaline_earth', densityGcm3: 1.55, electronegativity: 1.00, xrfKalphaKev: 3.691, xrfLalphaKev: 0.341 },
  { atomicNumber: 21, symbol: 'Sc', name: 'Scandium', atomicMass: 44.956, period: 4, group: 3, block: 'd', category: 'transition_metal', densityGcm3: 2.985, electronegativity: 1.36, xrfKalphaKev: 4.090, xrfLalphaKev: 0.395 },
  { atomicNumber: 22, symbol: 'Ti', name: 'Titanium', atomicMass: 47.867, period: 4, group: 4, block: 'd', category: 'transition_metal', densityGcm3: 4.506, electronegativity: 1.54, xrfKalphaKev: 4.510, xrfLalphaKev: 0.452, isCommonElectrocatalyst: true },
  { atomicNumber: 23, symbol: 'V', name: 'Vanadium', atomicMass: 50.942, period: 4, group: 5, block: 'd', category: 'transition_metal', densityGcm3: 6.11, electronegativity: 1.63, xrfKalphaKev: 4.952, xrfLalphaKev: 0.510, isCommonElectrocatalyst: true },
  { atomicNumber: 24, symbol: 'Cr', name: 'Chromium', atomicMass: 51.996, period: 4, group: 6, block: 'd', category: 'transition_metal', densityGcm3: 7.19, electronegativity: 1.66, xrfKalphaKev: 5.414, xrfLalphaKev: 0.573, isCommonElectrocatalyst: true },
  { atomicNumber: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.938, period: 4, group: 7, block: 'd', category: 'transition_metal', densityGcm3: 7.21, electronegativity: 1.55, xrfKalphaKev: 5.898, xrfLalphaKev: 0.637, isCommonElectrocatalyst: true },
  { atomicNumber: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.845, period: 4, group: 8, block: 'd', category: 'transition_metal', densityGcm3: 7.874, electronegativity: 1.83, xrfKalphaKev: 6.403, xrfLalphaKev: 0.705, isCommonElectrocatalyst: true },
  { atomicNumber: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.933, period: 4, group: 9, block: 'd', category: 'transition_metal', densityGcm3: 8.90, electronegativity: 1.88, xrfKalphaKev: 6.930, xrfLalphaKev: 0.776, isCommonElectrocatalyst: true },
  { atomicNumber: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.693, period: 4, group: 10, block: 'd', category: 'transition_metal', densityGcm3: 8.908, electronegativity: 1.91, xrfKalphaKev: 7.478, xrfLalphaKev: 0.851, isCommonElectrocatalyst: true },
  { atomicNumber: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.546, period: 4, group: 11, block: 'd', category: 'transition_metal', densityGcm3: 8.96, electronegativity: 1.90, xrfKalphaKev: 8.047, xrfLalphaKev: 0.930, isCommonElectrocatalyst: true },
  { atomicNumber: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.38, period: 4, group: 12, block: 'd', category: 'transition_metal', densityGcm3: 7.14, electronegativity: 1.65, xrfKalphaKev: 8.638, xrfLalphaKev: 1.012, isCommonElectrocatalyst: true },
  { atomicNumber: 31, symbol: 'Ga', name: 'Gallium', atomicMass: 69.723, period: 4, group: 13, block: 'p', category: 'post_transition', densityGcm3: 5.91, electronegativity: 1.81, xrfKalphaKev: 9.251, xrfLalphaKev: 1.098 },
  { atomicNumber: 32, symbol: 'Ge', name: 'Germanium', atomicMass: 72.630, period: 4, group: 14, block: 'p', category: 'metalloid', densityGcm3: 5.323, electronegativity: 2.01, xrfKalphaKev: 9.886, xrfLalphaKev: 1.188 },
  { atomicNumber: 33, symbol: 'As', name: 'Arsenic', atomicMass: 74.922, period: 4, group: 15, block: 'p', category: 'metalloid', densityGcm3: 5.727, electronegativity: 2.18, xrfKalphaKev: 10.543, xrfLalphaKev: 1.282 },
  { atomicNumber: 34, symbol: 'Se', name: 'Selenium', atomicMass: 78.971, period: 4, group: 16, block: 'p', category: 'reactive_nonmetal', densityGcm3: 4.81, electronegativity: 2.55, xrfKalphaKev: 11.222, xrfLalphaKev: 1.379 },
  { atomicNumber: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904, period: 4, group: 17, block: 'p', category: 'reactive_nonmetal', densityGcm3: 3.1028, electronegativity: 2.96, xrfKalphaKev: 11.924, xrfLalphaKev: 1.480 },
  { atomicNumber: 36, symbol: 'Kr', name: 'Krypton', atomicMass: 83.798, period: 4, group: 18, block: 'p', category: 'noble_gas', densityGcm3: 0.00375, electronegativity: 3.00, xrfKalphaKev: 12.649, xrfLalphaKev: 1.586 },

  // Period 5
  { atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: 85.468, period: 5, group: 1, block: 's', category: 'alkali', densityGcm3: 1.532, electronegativity: 0.82, xrfKalphaKev: 13.395, xrfLalphaKev: 1.694 },
  { atomicNumber: 38, symbol: 'Sr', name: 'Strontium', atomicMass: 87.62, period: 5, group: 2, block: 's', category: 'alkaline_earth', densityGcm3: 2.64, electronegativity: 0.95, xrfKalphaKev: 14.165, xrfLalphaKev: 1.806 },
  { atomicNumber: 39, symbol: 'Y', name: 'Yttrium', atomicMass: 88.906, period: 5, group: 3, block: 'd', category: 'transition_metal', densityGcm3: 4.472, electronegativity: 1.22, xrfKalphaKev: 14.958, xrfLalphaKev: 1.922, isCommonElectrocatalyst: true },
  { atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: 91.224, period: 5, group: 4, block: 'd', category: 'transition_metal', densityGcm3: 6.52, electronegativity: 1.33, xrfKalphaKev: 15.775, xrfLalphaKev: 2.042, isCommonElectrocatalyst: true },
  { atomicNumber: 41, symbol: 'Nb', name: 'Niobium', atomicMass: 92.906, period: 5, group: 5, block: 'd', category: 'transition_metal', densityGcm3: 8.57, electronegativity: 1.60, xrfKalphaKev: 16.615, xrfLalphaKev: 2.166, isCommonElectrocatalyst: true },
  { atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: 95.95, period: 5, group: 6, block: 'd', category: 'transition_metal', densityGcm3: 10.28, electronegativity: 2.16, xrfKalphaKev: 17.479, xrfLalphaKev: 2.293, isCommonElectrocatalyst: true },
  { atomicNumber: 43, symbol: 'Tc', name: 'Technetium', atomicMass: 98, period: 5, group: 7, block: 'd', category: 'transition_metal', densityGcm3: 11.5, electronegativity: 1.90, xrfKalphaKev: 18.367, xrfLalphaKev: 2.424 },
  { atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: 101.07, period: 5, group: 8, block: 'd', category: 'transition_metal', densityGcm3: 12.45, electronegativity: 2.20, xrfKalphaKev: 19.279, xrfLalphaKev: 2.558, isCommonElectrocatalyst: true },
  { atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: 102.91, period: 5, group: 9, block: 'd', category: 'transition_metal', densityGcm3: 12.41, electronegativity: 2.28, xrfKalphaKev: 20.216, xrfLalphaKev: 2.696, isCommonElectrocatalyst: true },
  { atomicNumber: 46, symbol: 'Pd', name: 'Palladium', atomicMass: 106.42, period: 5, group: 10, block: 'd', category: 'transition_metal', densityGcm3: 12.023, electronegativity: 2.20, xrfKalphaKev: 21.177, xrfLalphaKev: 2.838, isCommonElectrocatalyst: true },
  { atomicNumber: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.87, period: 5, group: 11, block: 'd', category: 'transition_metal', densityGcm3: 10.49, electronegativity: 1.93, xrfKalphaKev: 22.163, xrfLalphaKev: 2.984, isCommonElectrocatalyst: true },
  { atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: 112.41, period: 5, group: 12, block: 'd', category: 'transition_metal', densityGcm3: 8.65, electronegativity: 1.69, xrfKalphaKev: 23.173, xrfLalphaKev: 3.133 },
  { atomicNumber: 49, symbol: 'In', name: 'Indium', atomicMass: 114.82, period: 5, group: 13, block: 'p', category: 'post_transition', densityGcm3: 7.31, electronegativity: 1.78, xrfKalphaKev: 24.209, xrfLalphaKev: 3.287, isCommonElectrocatalyst: true },
  { atomicNumber: 50, symbol: 'Sn', name: 'Tin', atomicMass: 118.71, period: 5, group: 14, block: 'p', category: 'post_transition', densityGcm3: 7.31, electronegativity: 1.96, xrfKalphaKev: 25.271, xrfLalphaKev: 3.444, isCommonElectrocatalyst: true },
  { atomicNumber: 51, symbol: 'Sb', name: 'Antimony', atomicMass: 121.76, period: 5, group: 15, block: 'p', category: 'metalloid', densityGcm3: 6.697, electronegativity: 2.05, xrfKalphaKev: 26.359, xrfLalphaKev: 3.604 },
  { atomicNumber: 52, symbol: 'Te', name: 'Tellurium', atomicMass: 127.60, period: 5, group: 16, block: 'p', category: 'metalloid', densityGcm3: 6.24, electronegativity: 2.10, xrfKalphaKev: 27.472, xrfLalphaKev: 3.769 },
  { atomicNumber: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.90, period: 5, group: 17, block: 'p', category: 'reactive_nonmetal', densityGcm3: 4.933, electronegativity: 2.66, xrfKalphaKev: 28.612, xrfLalphaKev: 3.938 },
  { atomicNumber: 54, symbol: 'Xe', name: 'Xenon', atomicMass: 131.29, period: 5, group: 18, block: 'p', category: 'noble_gas', densityGcm3: 0.005887, electronegativity: 2.60, xrfKalphaKev: 29.779, xrfLalphaKev: 4.111 },

  // Period 6
  { atomicNumber: 55, symbol: 'Cs', name: 'Caesium', atomicMass: 132.91, period: 6, group: 1, block: 's', category: 'alkali', densityGcm3: 1.93, electronegativity: 0.79, xrfKalphaKev: 30.973, xrfLalphaKev: 4.286 },
  { atomicNumber: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.33, period: 6, group: 2, block: 's', category: 'alkaline_earth', densityGcm3: 3.51, electronegativity: 0.89, xrfKalphaKev: 32.194, xrfLalphaKev: 4.466 },

  // Lanthanides (57-71, block f)
  { atomicNumber: 57, symbol: 'La', name: 'Lanthanum', atomicMass: 138.91, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 6.162, electronegativity: 1.10, xrfKalphaKev: 33.442, xrfLalphaKev: 4.651, isCommonElectrocatalyst: true },
  { atomicNumber: 58, symbol: 'Ce', name: 'Cerium', atomicMass: 140.12, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 6.77, electronegativity: 1.12, xrfKalphaKev: 34.720, xrfLalphaKev: 4.840, isCommonElectrocatalyst: true },
  { atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: 140.91, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 6.77, electronegativity: 1.13, xrfKalphaKev: 36.026, xrfLalphaKev: 5.034 },
  { atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: 144.24, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 7.01, electronegativity: 1.14, xrfKalphaKev: 37.361, xrfLalphaKev: 5.230 },
  { atomicNumber: 61, symbol: 'Pm', name: 'Promethium', atomicMass: 145, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 7.26, electronegativity: 1.13, xrfKalphaKev: 38.725, xrfLalphaKev: 5.432 },
  { atomicNumber: 62, symbol: 'Sm', name: 'Samarium', atomicMass: 150.36, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 7.52, electronegativity: 1.17, xrfKalphaKev: 40.118, xrfLalphaKev: 5.636 },
  { atomicNumber: 63, symbol: 'Eu', name: 'Europium', atomicMass: 151.96, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 5.244, electronegativity: 1.20, xrfKalphaKev: 41.542, xrfLalphaKev: 5.846 },
  { atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: 157.25, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 7.90, electronegativity: 1.20, xrfKalphaKev: 42.996, xrfLalphaKev: 6.057 },
  { atomicNumber: 65, symbol: 'Tb', name: 'Terbium', atomicMass: 158.93, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 8.23, electronegativity: 1.22, xrfKalphaKev: 44.482, xrfLalphaKev: 6.273 },
  { atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: 162.50, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 8.54, electronegativity: 1.23, xrfKalphaKev: 45.998, xrfLalphaKev: 6.495 },
  { atomicNumber: 67, symbol: 'Ho', name: 'Holmium', atomicMass: 164.93, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 8.79, electronegativity: 1.24, xrfKalphaKev: 47.547, xrfLalphaKev: 6.720 },
  { atomicNumber: 68, symbol: 'Er', name: 'Erbium', atomicMass: 167.26, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 9.066, electronegativity: 1.24, xrfKalphaKev: 49.128, xrfLalphaKev: 6.949 },
  { atomicNumber: 69, symbol: 'Tm', name: 'Thulium', atomicMass: 168.93, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 9.32, electronegativity: 1.25, xrfKalphaKev: 50.742, xrfLalphaKev: 7.180 },
  { atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: 173.05, period: 6, group: 3, block: 'f', category: 'lanthanide', densityGcm3: 6.90, electronegativity: 1.10, xrfKalphaKev: 52.389, xrfLalphaKev: 7.416 },
  { atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: 174.97, period: 6, group: 3, block: 'd', category: 'lanthanide', densityGcm3: 9.841, electronegativity: 1.27, xrfKalphaKev: 54.070, xrfLalphaKev: 7.655 },

  // Transition metals 72-80
  { atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: 178.49, period: 6, group: 4, block: 'd', category: 'transition_metal', densityGcm3: 13.31, electronegativity: 1.30, xrfKalphaKev: 55.790, xrfLalphaKev: 7.899, isCommonElectrocatalyst: true },
  { atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: 180.95, period: 6, group: 5, block: 'd', category: 'transition_metal', densityGcm3: 16.69, electronegativity: 1.50, xrfKalphaKev: 57.532, xrfLalphaKev: 8.146, isCommonElectrocatalyst: true },
  { atomicNumber: 74, symbol: 'W', name: 'Tungsten', atomicMass: 183.84, period: 6, group: 6, block: 'd', category: 'transition_metal', densityGcm3: 19.25, electronegativity: 2.36, xrfKalphaKev: 59.318, xrfLalphaKev: 8.398, isCommonElectrocatalyst: true },
  { atomicNumber: 75, symbol: 'Re', name: 'Rhenium', atomicMass: 186.21, period: 6, group: 7, block: 'd', category: 'transition_metal', densityGcm3: 21.02, electronegativity: 1.90, xrfKalphaKev: 61.141, xrfLalphaKev: 8.653, isCommonElectrocatalyst: true },
  { atomicNumber: 76, symbol: 'Os', name: 'Osmium', atomicMass: 190.23, period: 6, group: 8, block: 'd', category: 'transition_metal', densityGcm3: 22.59, electronegativity: 2.20, xrfKalphaKev: 63.001, xrfLalphaKev: 8.912, isCommonElectrocatalyst: true },
  { atomicNumber: 77, symbol: 'Ir', name: 'Iridium', atomicMass: 192.22, period: 6, group: 9, block: 'd', category: 'transition_metal', densityGcm3: 22.56, electronegativity: 2.20, xrfKalphaKev: 64.896, xrfLalphaKev: 9.175, isCommonElectrocatalyst: true },
  { atomicNumber: 78, symbol: 'Pt', name: 'Platinum', atomicMass: 195.08, period: 6, group: 10, block: 'd', category: 'transition_metal', densityGcm3: 21.45, electronegativity: 2.28, xrfKalphaKev: 66.832, xrfLalphaKev: 9.442, isCommonElectrocatalyst: true },
  { atomicNumber: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.97, period: 6, group: 11, block: 'd', category: 'transition_metal', densityGcm3: 19.30, electronegativity: 2.54, xrfKalphaKev: 68.806, xrfLalphaKev: 9.713, isCommonElectrocatalyst: true },
  { atomicNumber: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.59, period: 6, group: 12, block: 'd', category: 'transition_metal', densityGcm3: 13.534, electronegativity: 2.00, xrfKalphaKev: 70.819, xrfLalphaKev: 9.989 },
  { atomicNumber: 81, symbol: 'Tl', name: 'Thallium', atomicMass: 204.38, period: 6, group: 13, block: 'p', category: 'post_transition', densityGcm3: 11.85, electronegativity: 1.62, xrfKalphaKev: 72.872, xrfLalphaKev: 10.269 },
  { atomicNumber: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.2, period: 6, group: 14, block: 'p', category: 'post_transition', densityGcm3: 11.34, electronegativity: 1.87, xrfKalphaKev: 74.969, xrfLalphaKev: 10.552 },
  { atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: 208.98, period: 6, group: 15, block: 'p', category: 'post_transition', densityGcm3: 9.78, electronegativity: 2.02, xrfKalphaKev: 77.108, xrfLalphaKev: 10.839, isCommonElectrocatalyst: true },
  { atomicNumber: 84, symbol: 'Po', name: 'Polonium', atomicMass: 209, period: 6, group: 16, block: 'p', category: 'post_transition', densityGcm3: 9.196, electronegativity: 2.00, xrfKalphaKev: 79.290, xrfLalphaKev: 11.131 },
  { atomicNumber: 85, symbol: 'At', name: 'Astatine', atomicMass: 210, period: 6, group: 17, block: 'p', category: 'metalloid', densityGcm3: 6.35, electronegativity: 2.20, xrfKalphaKev: 81.520, xrfLalphaKev: 11.427 },
  { atomicNumber: 86, symbol: 'Rn', name: 'Radon', atomicMass: 222, period: 6, group: 18, block: 'p', category: 'noble_gas', densityGcm3: 0.00973, electronegativity: 2.20, xrfKalphaKev: 83.780, xrfLalphaKev: 11.727 },

  // Period 7
  { atomicNumber: 87, symbol: 'Fr', name: 'Francium', atomicMass: 223, period: 7, group: 1, block: 's', category: 'alkali', densityGcm3: 2.48, electronegativity: 0.70, xrfKalphaKev: 86.10, xrfLalphaKev: 12.032 },
  { atomicNumber: 88, symbol: 'Ra', name: 'Radium', atomicMass: 226, period: 7, group: 2, block: 's', category: 'alkaline_earth', densityGcm3: 5.5, electronegativity: 0.90, xrfKalphaKev: 88.47, xrfLalphaKev: 12.340 },

  // Actinides (89-103, block f)
  { atomicNumber: 89, symbol: 'Ac', name: 'Actinium', atomicMass: 227, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 10.07, electronegativity: 1.10, xrfKalphaKev: 90.88, xrfLalphaKev: 12.652 },
  { atomicNumber: 90, symbol: 'Th', name: 'Thorium', atomicMass: 232.04, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 11.72, electronegativity: 1.30, xrfKalphaKev: 93.35, xrfLalphaKev: 12.969 },
  { atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: 231.04, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 15.37, electronegativity: 1.50, xrfKalphaKev: 95.87, xrfLalphaKev: 13.291 },
  { atomicNumber: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.03, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 19.1, electronegativity: 1.38, xrfKalphaKev: 98.44, xrfLalphaKev: 13.614 },
  { atomicNumber: 93, symbol: 'Np', name: 'Neptunium', atomicMass: 237, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 20.45, electronegativity: 1.36, xrfKalphaKev: 101.07, xrfLalphaKev: 13.946 },
  { atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: 244, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 19.84, electronegativity: 1.28, xrfKalphaKev: 103.75, xrfLalphaKev: 14.282 },
  { atomicNumber: 95, symbol: 'Am', name: 'Americium', atomicMass: 243, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 12.0, electronegativity: 1.13, xrfKalphaKev: 106.49, xrfLalphaKev: 14.622 },
  { atomicNumber: 96, symbol: 'Cm', name: 'Curium', atomicMass: 247, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 13.51, electronegativity: 1.28, xrfKalphaKev: 109.29, xrfLalphaKev: 14.970 },
  { atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: 247, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 14.78, electronegativity: 1.30, xrfKalphaKev: 112.14, xrfLalphaKev: 15.321 },
  { atomicNumber: 98, symbol: 'Cf', name: 'Californium', atomicMass: 251, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 15.1, electronegativity: 1.30, xrfKalphaKev: 115.06, xrfLalphaKev: 15.680 },
  { atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: 252, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 8.84, electronegativity: 1.30, xrfKalphaKev: 118.04, xrfLalphaKev: 16.040 },
  { atomicNumber: 100, symbol: 'Fm', name: 'Fermium', atomicMass: 257, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 9.7, electronegativity: 1.30, xrfKalphaKev: 121.08, xrfLalphaKev: 16.410 },
  { atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: 258, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 10.3, electronegativity: 1.30, xrfKalphaKev: 124.19, xrfLalphaKev: 16.780 },
  { atomicNumber: 102, symbol: 'No', name: 'Nobelium', atomicMass: 259, period: 7, group: 3, block: 'f', category: 'actinide', densityGcm3: 9.9, electronegativity: 1.30, xrfKalphaKev: 127.37, xrfLalphaKev: 17.160 },
  { atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: 266, period: 7, group: 3, block: 'd', category: 'actinide', densityGcm3: 15.6, electronegativity: 1.30, xrfKalphaKev: 130.61, xrfLalphaKev: 17.550 },

  // Superheavy transition metals 104-118
  { atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: 267, period: 7, group: 4, block: 'd', category: 'transition_metal', densityGcm3: 23.2, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 105, symbol: 'Db', name: 'Dubnium', atomicMass: 268, period: 7, group: 5, block: 'd', category: 'transition_metal', densityGcm3: 29.3, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: 269, period: 7, group: 6, block: 'd', category: 'transition_metal', densityGcm3: 35.0, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: 270, period: 7, group: 7, block: 'd', category: 'transition_metal', densityGcm3: 37.1, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 108, symbol: 'Hs', name: 'Hassium', atomicMass: 277, period: 7, group: 8, block: 'd', category: 'transition_metal', densityGcm3: 40.7, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: 278, period: 7, group: 9, block: 'd', category: 'transition_metal', densityGcm3: 37.4, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: 281, period: 7, group: 10, block: 'd', category: 'transition_metal', densityGcm3: 34.8, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: 282, period: 7, group: 11, block: 'd', category: 'transition_metal', densityGcm3: 28.7, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: 285, period: 7, group: 12, block: 'd', category: 'transition_metal', densityGcm3: 14.0, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: 286, period: 7, group: 13, block: 'p', category: 'post_transition', densityGcm3: 16.0, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: 289, period: 7, group: 14, block: 'p', category: 'post_transition', densityGcm3: 14.0, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: 290, period: 7, group: 15, block: 'p', category: 'post_transition', densityGcm3: 13.5, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: 293, period: 7, group: 16, block: 'p', category: 'post_transition', densityGcm3: 12.9, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: 294, period: 7, group: 17, block: 'p', category: 'post_transition', densityGcm3: 7.2, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
  { atomicNumber: 118, symbol: 'Og', name: 'Oganesson', atomicMass: 294, period: 7, group: 18, block: 'p', category: 'noble_gas', densityGcm3: 5.0, electronegativity: null, xrfKalphaKev: null, xrfLalphaKev: null },
];

export const ALLOY_PRESETS = [
  {
    name: 'Cantor High-Entropy Alloy (Fe-Co-Ni-Cr-Mn)',
    description: 'Canonical equimolar face-centered cubic high-entropy alloy with outstanding cryogenic fracture toughness',
    symbols: ['Fe', 'Co', 'Ni', 'Cr', 'Mn'],
  },
  {
    name: 'Titanium Aerospace Alloy (Ti-Al-V-Fe)',
    description: 'Lightweight high-strength structural alpha-beta titanium alloy for aerospace structures',
    symbols: ['Ti', 'Al', 'V', 'Fe'],
  },
  {
    name: 'Refractory High-Entropy Alloy (Nb-Mo-Ta-W)',
    description: 'Ultra-high-temperature body-centered cubic solid solution for extreme thermal environments',
    symbols: ['Nb', 'Mo', 'Ta', 'W'],
  },
  {
    name: 'Corrosion-Resistant Cupronickel (Cu-Ni-Zn)',
    description: 'Marine-grade anti-biofouling high thermal conductivity structural alloy',
    symbols: ['Cu', 'Ni', 'Zn'],
  },
  {
    name: 'Magnetic Soft Permalloy (Fe-Si-Al-Ni)',
    description: 'Sendust-type low-coercivity ferromagnetic alloy for high-frequency inductive cores',
    symbols: ['Fe', 'Si', 'Al', 'Ni'],
  },
];

# Agentic Materials Synthesis & Characterization Workflow Platform

An end-to-end autonomous and human-in-the-loop laboratory acceleration platform that translates AI-proposed multi-metal alloy compositions (Pt-Pd-Ni-Co) into nanoparticle jet printing recipes, operates interactive micro-XRF and SEM characterization digital twins, extracts reproducible quantitative metrics via Python pipelines, and curates FAIR-aligned datasets with realizability labels for closed-loop AI model development.

## User Review & Critical Decisions

> [!IMPORTANT]
> The platform is configured according to your confirmed requirements from Phase 1:
> - **Material System**: Multi-metal alloys and electrocatalysts, featuring the quaternary Pt-Pd-Ni-Co combinatorial space for clean-energy oxygen reduction / hydrogen evolution catalysis.
> - **Execution Mode**: Hybrid workflow featuring an interactive hardware digital twin, real-time micro-XRF/SEM analytical maps, and direct hardware script generation (G-code, droplet dispensing protocols, instrument configuration files).
> - **Agent Orchestration**: Collaborative multi-agent team (Candidate Generator, Print Recipe Planner, Metrology & Characterization QC Inspector, FAIR Data Curator) with interactive human-in-the-loop stage gates and manual override controls.

- **Confirmed Decision 1**: Multi-metal combinatorial library (Pt-Pd-Ni-Co) with systematic quaternary gradient deposition on a 10×10 (100-spot) or 8×8 (64-spot) substrate matrix.
- **Confirmed Decision 2**: Interactive digital twin paired with reproducible Python data pipeline runner and hardware script export (G-code, stage toolpaths, micro-XRF raster grid scripts).
- **Confirmed Decision 3**: Explicit inspection gates between composition proposal, print synthesis, characterization metrology, and dataset commit.

---

## 1. Overview & Core Concept

### What It Does
The platform automates the materials discovery lifecycle for high-throughput combinatorial libraries:
1. **AI Composition Proposal**: AI agents generate candidate stoichiometries across the Pt-Pd-Ni-Co space targeting high catalytic activity, cost minimization, and phase stability.
2. **Nanoparticle Jet Printer Synthesis & Toolpath Generation**: Translates composition targets into physical deposition instructions: nanoparticle ink mixing ratios, piezoelectric pulse voltages, drop-on-demand frequencies, substrate heating, and CNC/G-code toolpaths.
3. **High-Throughput Metrology (micro-XRF & SEM)**: Provides spatial elemental mapping (Pt Lα, Pd Lα, Ni Kα, Co Kα) and SEM morphological image analysis (grain size distribution, crack/delamination detection, porosity, and uniformity indices).
4. **Reproducible Python Pipelines**: Embeds verifiable, executable Python scripts (using Pyodide and reproducible data science pipelines) that process raw spectral and micrograph data into standardized metrics.
5. **FAIR-Aligned Dataset & Realizability Knowledge Base**: Catalogs every sample run—including successful, partial, and negative outcomes—with standardized schema (JSON-LD, CSV, HDF5-compatible schema), provenance tracking, and realizability labels (e.g., *Phase-Pure Alloy*, *Severe Coffee-Ring Segregation*, *Substrate Dewetting*, *Nozzle Clogging*).

### Target Audience & Persona
- **Materials Discovery Scientists & Electrochemistry Researchers**: Exploring multi-principal element alloys and fuel cell / electrolyzer catalyst libraries.
- **High-Throughput Laboratory Automation Engineers**: Managing robotic nanoparticle jet printers, automated stages, and micro-beam analytical instrumentation.
- **Data Engineers & AI Model Developers**: Requiring structured, negative-inclusive datasets to train active-learning and Bayesian optimization discovery loops.

### Key Value
Bridges the gap between computational composition proposals and physical laboratory realities, ensuring 100% data traceability from raw ink dispensing to published FAIR records, preventing unfeasible candidate repeats through negative outcome labeling.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 01. Candidate   │ ──> │ 02. Print       │ ──> │ 03. Metrology   │ ──> │ 04. FAIR Data   │
│ Composition Gen │     │ Recipe & G-code │     │ micro-XRF & SEM │     │ & Realizability │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
  [AI Agent / Gate]       [Twin & G-Code]         [Python Engine]         [Graph & Export]
```

1. **Composition Candidate Scout (Agent 1)**:
   - Interactive quaternary phase tetrahedron and ternary slice selector.
   - AI agent proposes candidate libraries based on electrocatalytic optimization objectives (ORR/HER activity index, platinum-group metal minimization, entropy stabilization).
   - Candidate review table with composition percentages, predicted enthalpy of mixing, and inspection approval gate.
2. **Printer Digital Twin & Recipe Compiler (Agent 2)**:
   - Visual 2D/3D substrate layout grid (e.g., 8×8 or 10×10 glass/glassy carbon chip).
   - Multi-channel nanoparticle ink dispenser configuration (Ink A: Pt, Ink B: Pd, Ink C: Ni, Ink D: Co; viscosity, surface tension, sonic bath status).
   - Deposition parameter editor: print speed (mm/s), substrate temperature (°C), curing UV/thermal profile, droplet volume (pL).
   - G-code and robot motion toolpath generator with direct syntax preview and export.
   - Interactive print simulation displaying real-time nozzle traversal and droplet deposition.
3. **Characterization Studio (Agent 3 & Python Pipeline)**:
   - **Micro-XRF Mapping Stage**: Raster heatmap showing individual elemental counts and calculated atomic fractions across library spots. Crosshair point-probe reveals full energy-dispersive X-ray spectra with peak deconvolution.
   - **SEM Morphology Inspector**: High-resolution micrograph viewer with false-color grain/pore segmentation, crack detection, and radial uniformity profiles.
   - **Reproducible Python Pipeline**: Built-in interactive code editor with pre-loaded Python pipelines (`scipy`, `numpy`, `matplotlib`) calculating composition deviation from target, radial segregation index (coffee-ring metric), and surface roughness.
4. **Quality Control & Human-in-the-Loop Inspection Gate**:
   - Automated QC rule evaluator flagging synthesis anomalies (delamination, composition drift >5%, uneven thickness, splash satellite droplets).
   - Approval/Rejection interface with scientist sign-off and annotation override.
5. **FAIR Data Repository & Realizability Analytics (Agent 4)**:
   - Dataset explorer with comprehensive outcome labeling: *Positive (Target Phase Formed)*, *Partial (Segregated / Coffee-Ring)*, *Negative (Delaminated / Failed Deposition)*.
   - Traceability graph displaying full lineage: AI Prompt → Candidate ID → Toolpath Hash → Synthesis Run → Characterization Map → Realizability Label.
   - Direct export in FAIR-standard formats: JSON-LD (Schema.org / Materials Data Facility compliant), CSV tables, and laboratory run logs.

### Visual Identity & Theme (Clinical Lab Workbench)
- **Palette**: Pristine laboratory aesthetic adhering to the Science & Biotech Design Reference:
  - Canvas: Pristine clinical light `#F8FAFC` and crisp white `#FFFFFF` panels.
  - Hairline Borders: 1px subtle slate borders (`#E2E8F0` / `#CBD5E1`).
  - Calibrated Phosphor Accents: Cobalt `#0284C7` and Deep Marine `#0369A1` for primary interactive states.
  - Elemental Color Tokens: Pt (Silver-Cyan `#38BDF8`), Pd (Warm Amber `#F59E0B`), Ni (Emerald `#10B981`), Co (Violet `#8B5CF6`).
  - Semantic Outcomes: Green `#059669` (Success), Amber `#D97706` (Partial), Crimson `#DC2626` (Negative/Failed).
- **Typography**: Clean neo-grotesque sans (`Plus Jakarta Sans` / `Inter`) for interface chrome, paired strictly with monospace tabular numerals (`font-mono tabular-nums`, `JetBrains Mono`) for atomic percentages, coordinate axes, and spectral keV energy values.
- **Anti-Slop Discipline**: No arbitrary pill badges or capsule headers; clean unboxed text with typographic dot separators (`·`); single-elevation surfaces; 100% interactive controls with live handlers.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Hybrid Interactive Digital Twin + Real Hardware Script Exporter
- **Chosen Approach**: Build a fully interactive digital twin simulator that renders realistic deposition physics, micro-XRF spectra, and SEM images in the browser, while generating valid, production-ready G-code (`.gcode`) and instrument recipe files (`.json`, `.csv`) for physical hardware.
- **Why**: Allows immediate interactive exploration, verification, and testing in the web sandbox without requiring live physical lab hardware connected to the browser, while maintaining real-world experimental utility.

### Decision 2: In-Browser Executable Python Pipeline
- **Chosen Approach**: Integrate lightweight in-browser Python pipeline execution (via Pyodide WASM or synchronized client-server Python runtime) allowing users to run and modify the exact Python scripts used to process micro-XRF intensity matrices and SEM morphology metrics.
- **Why**: Guarantees reproducibility (FAIR principle: Accessible & Reusable). Scientists can inspect, verify, and run the math directly in the platform.

### Decision 3: Comprehensive Negative & Partial Outcome Taxonomy
- **Chosen Approach**: Treat negative and partial outcomes as first-class citizens in the data model with structured realizability labels (*Formulation Incompatible*, *Thermally Degraded*, *Coffee-Ring Segregated*, *Micro-Cracked*, *Target Verified*).
- **Why**: AI active learning models fail if trained only on positive survival-bias data. Machine learning requires clear realizability boundaries to learn true synthesis windows.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   App Workspace Chrome                                 │
│  [Top Navigation Bar: Wordmark · Module Tabs · Export Run · Active Library Switcher]   │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
┌──────────────────────────────────┐            ┌──────────────────────────────────┐
│        AI Agent Pipeline         │            │    Experimental Digital Twin     │
│  - Candidate Generator Agent     │            │  - Nanoparticle Printer Simulator│
│  - Print Toolpath Planner        │ <────────> │  - 64/100 Spot Substrate Stage   │
│  - Characterization QC Inspector │            │  - Micro-XRF Raster Map Engine   │
│  - FAIR Data Labeller Agent      │            │  - SEM Micrograph Surface Viewer │
└────────────────┬─────────────────┘            └────────────────┬─────────────────┘
                 │                                               │
                 ▼                                               ▼
┌──────────────────────────────────┐            ┌──────────────────────────────────┐
│   Reproducible Python Sandbox    │            │     FAIR Dataset & Provenance    │
│  - Micro-XRF Stoichiometry Calc  │            │  - Sample Lineage Graph          │
│  - Homogeneity / Radial Gradient │ <────────> │  - Realizability Taxonomy (3-Way)│
│  - SEM Grain & Porosity Metric   │            │  - JSON-LD & CSV Exporter        │
└──────────────────────────────────┘            └──────────────────────────────────┘
```

### Data Model & TypeScript Entities

```typescript
// Core Data Schema for Combinatorial Library Spot
export interface LibrarySampleSpot {
  id: string;                      // e.g. "SMP-2026-004-A1"
  row: number;                     // 0..7 or 0..9
  col: number;                     // 0..7 or 0..9
  coordinateMm: { x: number; y: number };
  
  // AI Candidate Proposal
  targetComposition: {
    pt: number;                    // atomic fraction (0.00 - 1.00)
    pd: number;
    ni: number;
    co: number;
  };
  predictedOverpotentialMv: number;
  predictedCostPerGram: number;

  // Synthesis Execution (Nanoparticle Printer)
  printerRecipe: {
    dispenserMixRatios: { pt: number; pd: number; ni: number; co: number };
    dropletCount: number;
    dropletVolumePl: number;
    nozzleFrequencyKhz: number;
    substrateTempC: number;
    sinteringTempC: number;
    sinteringDurationSec: number;
  };

  // Characterization Results (Micro-XRF)
  measuredXrfComposition: {
    pt: number;
    pd: number;
    ni: number;
    co: number;
    deviationFromTargetPercent: number;
  };
  xrfSpectraChannels: number[];     // 2048-channel EDS energy spectrum

  // Characterization Results (SEM Morphology)
  semMetrics: {
    meanGrainSizeNm: number;
    porosityPercent: number;
    radialSegregationIndex: number; // 0 (homogeneous) to 1 (heavy coffee ring)
    crackingDetected: boolean;
    delaminationDetected: boolean;
  };

  // Quality Control & Realizability
  qcStatus: 'approved' | 'rejected' | 'pending_review';
  realizabilityLabel: 
    | 'synthesizable_optimal'
    | 'partial_segregated_ring'
    | 'partial_cracked_film'
    | 'negative_dewetted'
    | 'negative_clogged_nozzle';
  qcNotes: string;
  inspectorId: string;
  timestamp: string;
}
```

### Interactive Components & Modules
1. **Header & Library Toolbar**: Clean 3-zone Top Bar Contract (`AlloySynth HTE`, Module Nav, `Export Campaign Package`).
2. **Library Matrix Stage**: Interactive SVG/Canvas wafer grid with spot hover tooltips, multi-element false-color rendering, and selection crosshair.
3. **Synthesis & Deposition Console**: Real-time slider controls for printing parameters, animated printer nozzle traversal, and live G-code generator.
4. **Micro-XRF & SEM Analytical Workspace**: Dual-pane visualizer with elemental channel toggles (Pt, Pd, Ni, Co overlays), spectrum inspector with characteristic emission lines (Kα, Lα), and micrograph texture visualizer.
5. **Python Pipeline Terminal**: Tabbed reproducible scripts (`xrf_quant.py`, `morphology_analyzer.py`, `fair_export.py`) with runnable outputs and visual metric graphs.
6. **FAIR Data & Realizability Catalog**: Filterable table showing all outcomes with direct JSON-LD schema inspection, full provenance graph, and download options.

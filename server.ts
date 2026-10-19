/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;

// Initialize server-side Gemini client as per @google/genai guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Propose candidate compositions
app.post('/api/agents/propose-compositions', async (req, res) => {
  const { objective, currentLibraryId } = req.body;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert Materials Science AI Agent specializing in high-entropy alloys and electrocatalysts (Pt-Pd-Ni-Co quaternary system) for oxygen reduction and hydrogen evolution reactions.
Objective: "${objective || 'Maximize catalytic activity while minimizing platinum group metal cost'}"
Return a JSON array of 4 distinct candidate stoichiometries (fractions for pt, pd, ni, co that sum exactly to 1.0) along with a scientific rationale.
Output strictly JSON:
{
  "candidates": [
    { "pt": 0.25, "pd": 0.25, "ni": 0.25, "co": 0.25 }, ...
  ],
  "rationale": "Scientific rationale explaining d-band center, strain effects, and cost savings"
}`,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic materials model:', err);
    }
  }

  // Fallback high-entropy electrocatalyst candidates
  return res.json({
    candidates: [
      { pt: 0.30, pd: 0.15, ni: 0.35, co: 0.20 },
      { pt: 0.25, pd: 0.25, ni: 0.25, co: 0.25 },
      { pt: 0.15, pd: 0.15, ni: 0.40, co: 0.30 },
      { pt: 0.35, pd: 0.20, ni: 0.30, co: 0.15 },
    ],
    rationale: 'Generated quaternary Pt-Pd-Ni-Co candidates balancing Pt/Pd active surface sites with 3d-transition metals (Ni, Co) to tune the d-band center and reduce precious metal usage.',
  });
});

// 2. Perform automated Quality Control & Characterization Inspection
app.post('/api/agents/inspect-qc', async (req, res) => {
  const { spot, libraryId } = req.body;

  if (ai && spot) {
    try {
      const prompt = `Perform multi-agent quality control and realizability classification on this high-throughput sample spot:
Spot ID: ${spot.id}
Target Stoichiometry: Pt ${(spot.targetComposition.pt*100).toFixed(1)}%, Pd ${(spot.targetComposition.pd*100).toFixed(1)}%, Ni ${(spot.targetComposition.ni*100).toFixed(1)}%, Co ${(spot.targetComposition.co*100).toFixed(1)}%
Micro-XRF Measured Stoichiometry: Pt ${(spot.xrf.measuredComposition.pt*100).toFixed(1)}%, Pd ${(spot.xrf.measuredComposition.pd*100).toFixed(1)}%, Ni ${(spot.xrf.measuredComposition.ni*100).toFixed(1)}%, Co ${(spot.xrf.measuredComposition.co*100).toFixed(1)}%
Stoichiometric Deviation: ${spot.xrf.compositionDeviationPercent}%
SEM Morphology: Mean Grain Size ${spot.sem.meanGrainSizeNm} nm, Porosity ${spot.sem.porosityPercent}%, Radial Segregation Index (coffee-ring) ${spot.sem.radialSegregationIndex}, Cracks: ${spot.sem.crackCount}, Delamination: ${spot.sem.hasDelamination}
Printing Parameters: Substrate Temp ${spot.printerRecipe.substrateTemperatureC}C, Sintering Temp ${spot.printerRecipe.sinteringTempC}C

Analyze from the perspectives of:
1. Candidate Scout
2. Metrology QC
3. Print Planner
4. FAIR Curator

Output strictly JSON:
{
  "recommendations": [
    {
      "role": "Candidate Scout" | "Metrology QC" | "Print Planner" | "FAIR Curator",
      "status": "optimal" | "warning" | "alert" | "action_required",
      "headline": string,
      "analysis": string,
      "suggestedAction": string
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('Gemini QC agent call failed, using deterministic evaluation:', err);
    }
  }

  // Fallback if no LLM key
  return res.json({ recommendations: null });
});

// Mount Vite or static server
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlloySynth HTE Server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer();

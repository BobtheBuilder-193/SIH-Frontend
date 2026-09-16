# SatQuery AI (GeoLens) — Multimodal Remote-Sensing Interface

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/Problem%20Statement-SIH26167-orange.svg)]()
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646cff.svg?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **Read the ground truth, straight from orbit.**  
> SatQuery AI is an evidence-first, agentic interface for multimodal remote-sensing imagery analysis. Built strictly as an independent client to SatQuery's FastAPI + Pydantic backend.

---

## 🌟 Overview & Master Prompt Compliance

SatQuery AI enables earth-observation analysts, researchers, and decision-makers to:
1. **Upload remote-sensing imagery** (GeoTIFF, optical, SAR, multispectral).
2. **Ask natural-language questions** without forced pipeline or model selection.
3. **Allow the backend agent** to determine whether to run VQA, spatial grounding, change detection, or multi-sensor cross-modal fusion.
4. **Follow the observable execution trace** with step-by-step verified events.
5. **Receive a visually dominant answer** with structured, calibrated confidence.
6. **Inspect supporting visual evidence** (bounding boxes, bi-temporal split sliders, change heatmaps, Recharts metrics, and optical/SAR agreement).
7. **Download analysis reports** as downloadable artifacts.
8. **Experience the workflow in Demo Mode**, including the primary killer query.

---

## ✨ Key Features & Specialized Workspaces

### 1. Interactive Landing & Role Gate
- Orbital SVG path animation visualizer (accessible and reduced-motion compliant).
- Entry selection between **Researcher Mode** (full upload & technical inspection) and **Explore Mode** (sample scene exploration).

### 2. The "Killer Query" Cross-Modal Workflow
- Full UI realization of the SIH primary demonstration:
  > *"Did urban development increase between these dates, and can SAR support the result?"*
- Synthesizes bi-temporal optical change with Sentinel-1 SAR microwave backscatter.
- Displays the **Agreement / Disagreement Banner** (`agree`, `disagree`, or `inconclusive` — never styled as a failure).

### 3. Spatial Grounding & Detection (`features/grounding/`)
- Responsive `<BoundingBoxOverlay />` mapping backend normalized coordinates `[ymin, xmin, ymax, xmax]` directly onto image pixels.
- Category filtering, detection certainty percentages, and localized object inspector.

### 4. Bi-Temporal Change Detection (`features/change-detection/`)
- `<BeforeAfterViewer />` supporting **Interactive Split Slider**, **Side-by-Side Comparison**, and **Change Mask Overlay**.
- Quantitative metric visualization powered by **Recharts** (`<ChangeMetricsChart />`).

### 5. Calibrated Confidence System (`features/analysis/ConfidenceCard.tsx`)
- Explicitly handles `available`, `unavailable`, `calibrated`, `model-derived`, and `evidence-derived` states.
- Cleanly renders "Confidence unavailable" with backend explanations when applicable. Never fabricates scores.

### 6. Interactive Demo Mode (`features/demo/DemoSelector.tsx`)
- One-click staging for pre-configured datasets:
  - **Urban Expansion & SAR Corroboration** (The Killer Query)
  - **Port Facility Infrastructure Grounding**
  - **Post-Flood Surface Water Extent**

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19 (`react`, `react-dom`) |
| **Language** | TypeScript 6 (strict type checking, contract-first schemas) |
| **Bundler & Build Tool** | Vite 8 + `@vitejs/plugin-react` |
| **Styling & Theme** | Tailwind CSS v4 + `@tailwindcss/vite` |
| **Data & Spatial Visualization** | Recharts 3.10, Leaflet 1.9, React-Leaflet 5.0 |
| **Icons** | Custom standalone SVG stroke icons (no heavy icon font) |

---

## 🚀 Quick Start Guide

### Installation & Execution

1. Navigate to the frontend project directory:
   ```bash
   cd geolens-frontend-landing/satquery-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Launch the local development server:
   ```bash
   npm run dev
   ```

5. Open your browser at `http://localhost:5173`.

---

## ⚙️ Environment Variables

```env
# Base URL of the FastAPI Backend
VITE_API_BASE_URL=http://localhost:8000

# API Mode: "mock" (offline in-browser simulator) or "real" (live HTTP backend)
VITE_API_MODE=mock
```

---

## 📁 Project Documentation & Contracts

- [`Codebase.md`](file:///c:/Users/PC/Desktop/SIH%20FRONTEND/Codebase.md) — Exhaustive codebase technical reference.
- [`Architecture.md`](file:///c:/Users/PC/Desktop/SIH%20FRONTEND/Architecture.md) — System architecture, state machines, and sequence diagrams.
- [`docs/FRONTEND_ARCHITECTURE.md`](file:///c:/Users/PC/Desktop/SIH%20FRONTEND/docs/FRONTEND_ARCHITECTURE.md) — Master architecture specification.
- [`docs/FRONTEND_COMPONENT_MAP.md`](file:///c:/Users/PC/Desktop/SIH%20FRONTEND/docs/FRONTEND_COMPONENT_MAP.md) — Reusable & feature component catalog.
- [`docs/FRONTEND_INTEGRATION.md`](file:///c:/Users/PC/Desktop/SIH%20FRONTEND/docs/FRONTEND_INTEGRATION.md) — Backend integration guide and REST endpoints.
- [`docs/FRONTEND_API_MISMATCHES.md`](file:///c:/Users/PC/Desktop/SIH%20FRONTEND/docs/FRONTEND_API_MISMATCHES.md) — API discrepancy and contract validation log.

---

## 🤝 Smart India Hackathon 2026

Developed for Problem Statement **SIH26167**. All rights reserved.

import type { SatQueryApiClient } from '../client'
import type { ImageMetadata, ImageValidation, ImageModality } from '@/types/image'
import type { AnalysisResult, ExecutionStep } from '@/types/analysis'
import type { DemoSample } from '@/types/demo'
import type {
  BoundingBoxEvidence,
  ChangeMapEvidence,
  CrossModalEvidence,
  NumericalEvidence,
  TextEvidence,
} from '@/types/evidence'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function guessModality(filename: string): ImageModality {
  const lower = filename.toLowerCase()
  if (lower.includes('sar')) return 'sar'
  if (lower.includes('ms') || lower.includes('multispectral')) return 'multispectral'
  if (lower.endsWith('.tif') || lower.endsWith('.tiff')) return 'optical'
  return 'unknown'
}

async function readImageDimensions(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith('image/')) return {}
  try {
    const url = URL.createObjectURL(file)
    const dims = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = reject
      img.src = url
    })
    URL.revokeObjectURL(url)
    return dims
  } catch {
    return {}
  }
}

// Built-in Demo Scenarios for Master Prompt Section 21 & 33
export const MOCK_DEMO_SAMPLES: DemoSample[] = [
  {
    id: 'urban-growth-sar',
    title: 'Urban Expansion & SAR Corroboration',
    tagline: 'The SIH Killer Query Workflow',
    description:
      'Bi-temporal optical comparison coupled with Sentinel-1 SAR backscatter verification to confirm permanent urban development.',
    targetWorkflow: 'cross_modal',
    images: [
      {
        id: 'demo-opt-2022',
        filename: 'Sentinel2_Urban_2022_T1.tif',
        url: 'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80',
        modality: 'optical',
        dimensions: { width: 2048, height: 2048 },
        acquisitionDate: '2022-03-15',
        sensor: 'Sentinel-2 MSI',
        crs: 'EPSG:4326',
      },
      {
        id: 'demo-opt-2024',
        filename: 'Sentinel2_Urban_2024_T2.tif',
        url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        modality: 'optical',
        dimensions: { width: 2048, height: 2048 },
        acquisitionDate: '2024-03-18',
        sensor: 'Sentinel-2 MSI',
        crs: 'EPSG:4326',
      },
      {
        id: 'demo-sar-2024',
        filename: 'Sentinel1_SAR_C_Band_2024.tif',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        modality: 'sar',
        dimensions: { width: 2048, height: 2048 },
        acquisitionDate: '2024-03-20',
        sensor: 'Sentinel-1 C-SAR',
        crs: 'EPSG:4326',
      },
    ],
    suggestedQueries: [
      'Did urban development increase between these dates, and can SAR support the result?',
      'What changed between these images?',
      'Identify permanent structural changes corroborated by radar.',
    ],
    defaultQuery:
      'Did urban development increase between these dates, and can SAR support the result?',
  },
  {
    id: 'port-grounding',
    title: 'Port Facility Infrastructure Grounding',
    tagline: 'Visual Grounding & Spatial Detection',
    description:
      'Detects, segments, and bounds maritime logistics assets, storage facilities, and transport vessels.',
    targetWorkflow: 'grounding',
    images: [
      {
        id: 'demo-port-opt',
        filename: 'Port_Logistics_Hub_RGB.tif',
        url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
        modality: 'optical',
        dimensions: { width: 3840, height: 2160 },
        acquisitionDate: '2024-05-10',
        sensor: 'WorldView-3',
        crs: 'EPSG:3857',
      },
    ],
    suggestedQueries: [
      'Where are the buildings and storage tanks?',
      'Locate maritime vessels docked in the harbour.',
      'What is visible in this image?',
    ],
    defaultQuery: 'Where are the buildings and storage tanks?',
  },
  {
    id: 'flood-change',
    title: 'Post-Flood Surface Water Extent',
    tagline: 'Bi-Temporal Change Detection',
    description:
      'Compares pre-flood baseline with post-monsoon imagery to delineate inundation boundaries and affected hectares.',
    targetWorkflow: 'change_detection',
    images: [
      {
        id: 'demo-flood-pre',
        filename: 'River_Basin_Pre_Flood.tif',
        url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        modality: 'multispectral',
        dimensions: { width: 1920, height: 1080 },
        acquisitionDate: '2023-06-01',
        sensor: 'Landsat-9 OLI-2',
        crs: 'EPSG:4326',
      },
      {
        id: 'demo-flood-post',
        filename: 'River_Basin_Post_Inundation.tif',
        url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80',
        modality: 'multispectral',
        dimensions: { width: 1920, height: 1080 },
        acquisitionDate: '2023-08-14',
        sensor: 'Landsat-9 OLI-2',
        crs: 'EPSG:4326',
      },
    ],
    suggestedQueries: [
      'What changed between these images?',
      'Calculate total inundated area in hectares.',
      'What is visible in this image?',
    ],
    defaultQuery: 'What changed between these images?',
  },
]

let analysisCounter = 0
const storedQueries = new Map<string, { prompt: string; imageIds: string[] }>()

export const mockClient: SatQueryApiClient = {
  async uploadImage(file, onProgress) {
    const steps = [15, 45, 75, 95, 100]
    for (const pct of steps) {
      await delay(120)
      onProgress?.(pct)
    }

    const dims = await readImageDimensions(file)
    const modality = guessModality(file.name)

    const metadata: ImageMetadata = {
      filename: file.name,
      fileType: file.type || 'image/tiff',
      sizeBytes: file.size,
      width: dims.width ?? 2048,
      height: dims.height ?? 2048,
      bandCount: modality === 'multispectral' ? 8 : modality === 'sar' ? 1 : 3,
      modality,
      crs: 'EPSG:4326',
      acquisitionDate: new Date().toISOString().split('T')[0],
      sensor:
        modality === 'sar'
          ? 'Sentinel-1 C-SAR'
          : modality === 'multispectral'
            ? 'Sentinel-2 MSI'
            : 'High-Res Optical',
    }

    const issues: ImageValidation['issues'] = []
    if (file.size > 250 * 1024 * 1024) {
      issues.push({
        id: 'large-file',
        message: 'File size exceeds 250MB; tile caching enabled.',
        severity: 'warning',
      })
    }

    const validation: ImageValidation = {
      status: issues.length > 0 ? 'warning' : 'valid',
      issues,
    }

    return { metadata, validation }
  },

  async submitQuery(query) {
    analysisCounter += 1
    const id = `analysis-${analysisCounter}`
    storedQueries.set(id, query)
    await delay(350)

    const promptLower = query.prompt.toLowerCase()
    const isKillerQuery =
      promptLower.includes('urban') ||
      promptLower.includes('sar') ||
      promptLower.includes('increase') ||
      promptLower.includes('support')

    const traceLabels = isKillerQuery
      ? [
          'Validating bi-temporal & SAR scenes',
          'Aligning coordinate reference systems (EPSG:4326)',
          'Computing optical Normalized Difference Built-up Index (NDBI)',
          'Analyzing C-band SAR backscatter coherence',
          'Evaluating cross-modal sensor agreement',
          'Synthesizing grounded evidence & metrics',
        ]
      : promptLower.includes('where') || promptLower.includes('building') || promptLower.includes('detect')
        ? [
            'Ingesting scene spatial footprint',
            'Parsing visual grounding intent',
            'Extracting multi-scale feature pyramids',
            'Generating candidate bounding regions',
            'Applying non-maximum suppression (IoU 0.5)',
            'Calibrating spatial coordinates',
          ]
        : [
            'Parsing natural-language query',
            'Selecting relevant spectral bands',
            'Executing bi-temporal change comparison',
            'Delineating altered pixel clusters',
            'Compiling evidence artifacts',
          ]

    return {
      id,
      queryId: `query-${analysisCounter}`,
      status: 'running',
      executionTrace: traceLabels.map((label, idx) => ({
        id: `step-${idx}`,
        label,
        status: idx === 0 ? 'active' : 'pending',
      })),
      evidence: [],
      warnings: [],
    }
  },

  async getAnalysis(analysisId) {
    await delay(600)
    const stored = storedQueries.get(analysisId)
    const prompt = stored?.prompt.toLowerCase() ?? ''

    // 1. Killer Query: Cross-Modal SAR + Optical Urban Growth
    if (prompt.includes('urban') || prompt.includes('sar') || prompt.includes('support')) {
      const trace: ExecutionStep[] = [
        { id: 'step-0', label: 'Validating bi-temporal & SAR scenes', status: 'done' },
        { id: 'step-1', label: 'Aligning coordinate reference systems (EPSG:4326)', status: 'done' },
        { id: 'step-2', label: 'Computing optical Normalized Difference Built-up Index (NDBI)', status: 'done' },
        { id: 'step-3', label: 'Analyzing C-band SAR backscatter coherence', status: 'done' },
        { id: 'step-4', label: 'Evaluating cross-modal sensor agreement', status: 'done' },
        { id: 'step-5', label: 'Synthesizing grounded evidence & metrics', status: 'done' },
      ]

      const crossModalEvidence: CrossModalEvidence = {
        id: 'ev-cross-1',
        type: 'cross_modal',
        label: 'Optical + SAR Corroboration Synthesis',
        opticalImageUrl:
          'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        sarImageUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        agreement: 'agree',
        opticalEvidence:
          'NDBI differential analysis indicates a +38.4 hectare expansion of high-reflectance impervious surfaces along the eastern corridor.',
        sarEvidence:
          'Sentinel-1 C-SAR double-bounce backscatter (+4.2 dB in VV polarization) confirms permanent vertical concrete/steel structures, ruling out transient agricultural changes.',
        combinedInterpretation:
          'Both sensor modalities positively corroborate urban growth. Optical spectral indices and radar microwave backscatter independently confirm genuine structural expansion.',
        confidence: 0.94,
      }

      const changeMapEvidence: ChangeMapEvidence = {
        id: 'ev-change-1',
        type: 'change_map',
        label: 'Bi-Temporal Urban Footprint Change Map',
        beforeImageUrl:
          'https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=1200&q=80',
        afterImageUrl:
          'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        changeMapUrl:
          'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
        changedAreaHectares: 38.4,
        changedAreaKm2: 0.384,
        changeType: 'New Urban Development',
        confidence: 0.95,
        metrics: {
          totalAreaHectares: 1240,
          changedPercentage: 3.1,
          gainHectares: 38.4,
          lossHectares: 0,
        },
      }

      const numericalEvidence: NumericalEvidence = {
        id: 'ev-num-1',
        type: 'numerical',
        label: 'Urban Built-up Area Trend (2020 - 2024)',
        value: 38.4,
        unit: 'Hectares Added',
        changeDirection: 'increase',
        series: [
          { name: '2020 Baseline', value: 412.0, secondaryValue: 0 },
          { name: '2021 Expansion', value: 428.5, secondaryValue: 16.5 },
          { name: '2022 Pre-Epoch', value: 445.0, secondaryValue: 16.5 },
          { name: '2023 Intermediate', value: 462.8, secondaryValue: 17.8 },
          { name: '2024 Post-Epoch', value: 483.4, secondaryValue: 20.6 },
        ],
      }

      const textEvidence: TextEvidence = {
        id: 'ev-text-1',
        type: 'text',
        label: 'Observable Ground Truth Citations',
        text: 'Urban development increase confirmed across Eastern Sector (Centroid: 28.6139° N, 77.2090° E). Grounding verification shows 42 new industrial units, paved access network, and persistent microwave backscatter.',
        provenance: 'Sentinel-2 Level-2A (BOA Reflectance) & Sentinel-1 GRD (Ground Range Detected)',
      }

      const result: AnalysisResult = {
        id: analysisId,
        queryId: 'query-urban-sar',
        status: 'succeeded',
        task: 'cross_modal',
        answer:
          'Yes, urban development increased significantly between these dates (+38.4 hectares). SAR backscatter analysis strongly supports and corroborates the optical findings, confirming permanent structural built-up density.',
        summary:
          'Yes, urban development increased significantly between these dates (+38.4 hectares). SAR backscatter analysis strongly supports and corroborates the optical findings, confirming permanent structural built-up density.',
        confidence: {
          status: 'available',
          score: 0.94,
          method: 'calibrated',
          explanation:
            'Calibrated cross-sensor agreement: optical NDBI variance (p < 0.01) matched with Sentinel-1 VV-polarized backscatter permanence.',
        },
        executionTrace: trace,
        evidence: [crossModalEvidence, changeMapEvidence, numericalEvidence, textEvidence],
        warnings: [
          'SAR local incidence angle variation (34.2°) normalized using SRTM 30m digital elevation model.',
        ],
        technicalDetails: {
          modelUsed: 'SatQuery Agentic Ensemble v2.4',
          modelVersion: '2.4.1-rc3',
          processingTimeMs: 1480,
          crs: 'EPSG:4326',
          sensor: 'Sentinel-2 MSI + Sentinel-1 C-SAR',
          modality: 'Multimodal (Optical + SAR)',
          confidenceSource: 'Cross-Sensor Bayes Calibration',
        },
        report: {
          available: true,
          downloadUrl: `/reports/${analysisId}.pdf`,
          format: 'pdf',
          filename: `SatQuery_Urban_Analysis_${analysisId}.pdf`,
        },
      }
      return result
    }

    // 2. Grounding Query (Where are the buildings / objects)
    if (prompt.includes('where') || prompt.includes('building') || prompt.includes('detect') || prompt.includes('tank')) {
      const trace: ExecutionStep[] = [
        { id: 'step-0', label: 'Ingesting scene spatial footprint', status: 'done' },
        { id: 'step-1', label: 'Parsing visual grounding intent', status: 'done' },
        { id: 'step-2', label: 'Extracting multi-scale feature pyramids', status: 'done' },
        { id: 'step-3', label: 'Generating candidate bounding regions', status: 'done' },
        { id: 'step-4', label: 'Applying non-maximum suppression', status: 'done' },
        { id: 'step-5', label: 'Calibrating spatial coordinates', status: 'done' },
      ]

      const boxes: BoundingBoxEvidence[] = [
        {
          id: 'box-1',
          type: 'bounding_box',
          label: 'Primary Logistics Warehouse',
          sourceImageId: stored?.imageIds[0] ?? 'img-1',
          box: [0.18, 0.22, 0.42, 0.52], // ymin, xmin, ymax, xmax
          category: 'Warehouse Facility',
          confidence: 0.96,
          color: '#e08a5b',
        },
        {
          id: 'box-2',
          type: 'bounding_box',
          label: 'Storage Terminal Alpha',
          sourceImageId: stored?.imageIds[0] ?? 'img-1',
          box: [0.48, 0.26, 0.68, 0.46],
          category: 'Storage Terminal',
          confidence: 0.92,
          color: '#e3c581',
        },
        {
          id: 'box-3',
          type: 'bounding_box',
          label: 'Commercial Processing Unit',
          sourceImageId: stored?.imageIds[0] ?? 'img-1',
          box: [0.24, 0.62, 0.54, 0.88],
          category: 'Industrial Unit',
          confidence: 0.89,
          color: '#7fc09a',
        },
        {
          id: 'box-4',
          type: 'bounding_box',
          label: 'Cargo Handling Annex',
          sourceImageId: stored?.imageIds[0] ?? 'img-1',
          box: [0.62, 0.58, 0.84, 0.86],
          category: 'Cargo Annex',
          confidence: 0.88,
          color: '#e08a5b',
        },
      ]

      const numEvidence: NumericalEvidence = {
        id: 'ev-ground-count',
        type: 'numerical',
        label: 'Detected Structures Breakdown',
        value: 4,
        unit: 'Facilities Localized',
        series: [
          { name: 'Warehouses', value: 1 },
          { name: 'Storage Terminals', value: 1 },
          { name: 'Industrial Units', value: 1 },
          { name: 'Cargo Annexes', value: 1 },
        ],
      }

      return {
        id: analysisId,
        queryId: 'query-grounding',
        status: 'succeeded',
        task: 'grounding',
        answer:
          'Located 4 major facility structures across the scene with average grounding confidence of 91.2%. Bounding coordinates mapped directly to raster coordinates.',
        summary:
          'Located 4 major facility structures across the scene with average grounding confidence of 91.2%. Bounding coordinates mapped directly to raster coordinates.',
        confidence: {
          status: 'available',
          score: 0.91,
          method: 'model-derived',
          explanation: 'Spatial bounding box IoU score > 0.85 across multi-scale feature pyramids.',
        },
        executionTrace: trace,
        evidence: [...boxes, numEvidence],
        warnings: [],
        technicalDetails: {
          modelUsed: 'GeoGround-Vision-XL',
          processingTimeMs: 980,
          crs: 'EPSG:4326',
        },
        report: {
          available: true,
          downloadUrl: `/reports/${analysisId}.pdf`,
          format: 'pdf',
          filename: `Grounding_Inspection_${analysisId}.pdf`,
        },
      }
    }

    // 3. Default VQA / Change Detection Fallback
    const trace: ExecutionStep[] = [
      { id: 'step-0', label: 'Ingesting image metadata & CRS', status: 'done' },
      { id: 'step-1', label: 'Processing multispectral bands', status: 'done' },
      { id: 'step-2', label: 'Running evidence-backed inference', status: 'done' },
      { id: 'step-3', label: 'Compiling observable findings', status: 'done' },
    ]

    return {
      id: analysisId,
      queryId: 'query-vqa',
      status: 'succeeded',
      task: 'vqa',
      answer:
        'The analyzed scene encompasses mixed urban-industrial land cover with prominent transportation corridors and logistical warehousing. No anomalous structural degradation detected.',
      summary:
        'The analyzed scene encompasses mixed urban-industrial land cover with prominent transportation corridors and logistical warehousing. No anomalous structural degradation detected.',
      confidence: {
        status: 'available',
        score: 0.88,
        method: 'evidence-derived',
        explanation: 'Derived from high spectral clarity and zero cloud occlusion in observation footprint.',
      },
      executionTrace: trace,
      evidence: [
        {
          id: 'ev-text-general',
          type: 'text',
          label: 'Land Cover Classification Evidence',
          text: 'Surface distribution: 54% Built-up infrastructure, 28% Vegetated buffer, 18% Paved transit corridors.',
          provenance: 'Sentinel-2 Level-2A surface reflectance',
        },
        {
          id: 'ev-num-general',
          type: 'numerical',
          label: 'Land Cover Distribution (%)',
          value: 54,
          unit: '% Built-up',
          series: [
            { name: 'Built-up', value: 54 },
            { name: 'Vegetation', value: 28 },
            { name: 'Paved Roads', value: 18 },
          ],
        },
      ],
      warnings: [],
      technicalDetails: {
        modelUsed: 'SatQuery Core VLM',
        processingTimeMs: 820,
        crs: 'EPSG:4326',
      },
      report: {
        available: true,
        downloadUrl: `/reports/${analysisId}.pdf`,
        format: 'pdf',
        filename: `Analysis_Report_${analysisId}.pdf`,
      },
    }
  },

  async checkBackendStatus() {
    await delay(120)
    return { online: true, mode: 'mock' }
  },

  async getDemoSamples() {
    await delay(80)
    return MOCK_DEMO_SAMPLES
  },

  async downloadReport(analysisId) {
    await delay(300)
    const reportText = `=====================================================
SATQUERY AI — REMOTE SENSING ANALYSIS REPORT
Smart India Hackathon 2026 | Problem Statement SIH26167
=====================================================

Analysis ID: ${analysisId}
Generated: ${new Date().toISOString()}
Compliance: Evidence-First Multimodal Verification

SUMMARY OF FINDINGS:
Urban development increased significantly (+38.4 hectares).
Synthetic Aperture Radar (SAR) backscatter analysis corroborates
optical findings with positive agreement (p < 0.01).

TECHNICAL SPECIFICATIONS:
- Sensors: Sentinel-2 MSI + Sentinel-1 C-SAR
- Coordinate System: EPSG:4326
- Confidence Score: 94% (Calibrated Cross-Sensor)
- Observable Execution Events: 6 steps verified

=====================================================
Report generated by SatQuery AI Independent Client.
=====================================================`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    return { blob, filename: `SatQuery_Report_${analysisId}.txt` }
  },
}

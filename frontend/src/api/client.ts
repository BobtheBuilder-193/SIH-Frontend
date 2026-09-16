import type { ImageMetadata, ImageValidation, UploadedImage } from '@/types/image'
import type { AnalysisQuery, AnalysisResult } from '@/types/analysis'
import type { DemoSample } from '@/types/demo'

/**
 * SatQueryApiClient
 *
 * Strict contract-first interface boundary.
 * The UI layer NEVER accesses backend internals or models directly.
 * Switching between mock and real backend is a one-configuration change.
 */
export interface SatQueryApiClient {
  uploadImage(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<{ metadata: ImageMetadata; validation: ImageValidation; remotePreviewUrl?: string }>

  submitQuery(query: Pick<AnalysisQuery, 'prompt' | 'imageIds'>): Promise<AnalysisResult>

  getAnalysis(analysisId: string): Promise<AnalysisResult>

  checkBackendStatus(): Promise<{ online: boolean; mode: 'mock' | 'real' }>

  getDemoSamples(): Promise<DemoSample[]>

  downloadReport(analysisId: string): Promise<{ blob: Blob; filename: string }>
}

export type { UploadedImage }

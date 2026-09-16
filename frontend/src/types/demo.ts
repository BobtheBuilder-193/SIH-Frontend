/**
 * Demo Mode Types & Data Sets
 *
 * Implements Master Prompt Section 21 (DEMO MODE) and Section 33 (KILLER QUERY).
 * Enables the frontend to present real, pre-configured remote-sensing packages
 * with one-click staging and query auto-population.
 */

import type { ImageModality } from './image'

export interface DemoImageSample {
  id: string
  filename: string
  url: string
  modality: ImageModality
  dimensions: { width: number; height: number }
  acquisitionDate: string
  sensor: string
  crs: string
}

export interface DemoSample {
  id: string
  title: string
  tagline: string
  description: string
  targetWorkflow: 'cross_modal' | 'change_detection' | 'grounding' | 'vqa'
  images: DemoImageSample[]
  suggestedQueries: string[]
  defaultQuery: string
}

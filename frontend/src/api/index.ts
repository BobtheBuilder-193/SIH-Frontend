import type { SatQueryApiClient } from './client'
import { mockClient } from './mock/mockClient'

const mode = (import.meta.env.VITE_API_MODE ?? 'mock') as 'mock' | 'real'

function createClient(): SatQueryApiClient {
  if (mode === 'real') {
    // Real backend integration lands in a later part, once
    // /docs/API_CONTRACT.md is available to build against. Falling back
    // to the mock keeps the app usable rather than throwing at startup.
    console.warn(
      '[GeoLens] VITE_API_MODE=real but no real client is wired up yet — using mock client.',
    )
    return mockClient
  }
  return mockClient
}

export const apiClient = createClient()
export const apiMode = mode
export type { SatQueryApiClient } from './client'

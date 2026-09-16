import { apiClient } from './index'

export async function fetchDemoSamples() {
  return apiClient.getDemoSamples()
}

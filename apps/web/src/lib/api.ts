import { healthResponseSchema, type HealthResponse } from '@reclo/shared'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`)
  const health = healthResponseSchema.parse(await response.json())
  if (health.status !== 'ok') {
    throw new Error('The API is running but cannot reach the database')
  }
  return health
}

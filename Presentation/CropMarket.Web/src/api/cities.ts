import type { City } from '../types'

const API_URL = import.meta.env.VITE_API_URL

// GET /api/cities (FR-11)
export async function getCities(): Promise<City[]> {
  const response = await fetch(`${API_URL}/api/cities`)

  if (!response.ok) {
    throw new Error('Failed to load cities')
  }

  return response.json()
}
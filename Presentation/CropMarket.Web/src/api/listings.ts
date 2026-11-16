import type { CreateListingRequest, Listing, ListingFilters } from '../types'
import { ApiError } from './ApiError'

const API_URL = import.meta.env.VITE_API_URL

// FR-03: the filtering is done by the API, so only matching listings come back
export async function getListings(filters: ListingFilters): Promise<Listing[]> {
  const params = new URLSearchParams()

  if (filters.search.trim() !== '') {
    params.set('search', filters.search.trim())
  }

  if (filters.category !== 'all') {
    params.set('category', filters.category)
  }

  if (filters.location !== '') {
    params.set('location', filters.location)
  }

  const response = await fetch(`${API_URL}/api/listings?${params}`)

  if (!response.ok) {
    throw new Error('Failed to load listings')
  }

  return response.json()
}

export async function createListing(request: CreateListingRequest, token: string): Promise<Listing> {
  const response = await fetch(`${API_URL}/api/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  return response.json()
}

// Returns null when the API answers 404, so the page can show "not found"
export async function getListing(id: number): Promise<Listing | null> {
  const response = await fetch(`${API_URL}/api/listings/${id}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to load listing')
  }

  return response.json()
}

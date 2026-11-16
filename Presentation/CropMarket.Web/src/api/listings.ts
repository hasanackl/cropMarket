import type { CreateListingRequest, EditableListing, Listing, ListingFilters, MyListing } from '../types'
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

// GET /api/listings/mine (farmers): also the sold-out listings
export async function getMyListings(token: string): Promise<MyListing[]> {
  const response = await fetch(`${API_URL}/api/listings/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  return response.json()
}

// GET /api/listings/{id}/edit (FR-10); null when it is not this farmer's listing
export async function getListingForEdit(id: number, token: string): Promise<EditableListing | null> {
  const response = await fetch(`${API_URL}/api/listings/${id}/edit`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  return response.json()
}

// PUT /api/listings/{id} (FR-10)
export async function updateListing(id: number, request: CreateListingRequest, token: string): Promise<Listing> {
  const response = await fetch(`${API_URL}/api/listings/${id}`, {
    method: 'PUT',
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

// PUT /api/listings/{id}/image (FR-12): a file can't travel inside JSON, so it goes as multipart/form-data
export async function uploadListingImage(id: number, image: File, token: string): Promise<Listing> {
  const formData = new FormData()
  formData.append('image', image)

  const response = await fetch(`${API_URL}/api/listings/${id}/image`, {
    method: 'PUT',
    // No Content-Type here: the browser adds it together with the multipart boundary
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  return response.json()
}
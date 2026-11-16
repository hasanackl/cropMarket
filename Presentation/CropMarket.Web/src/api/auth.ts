import type { AuthUser, ChangePasswordRequest, LoginRequest, RegisterRequest } from '../types'
import { ApiError } from './ApiError'

const API_URL = import.meta.env.VITE_API_URL

export async function loginUser(request: LoginRequest): Promise<AuthUser | null> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Login failed')
  }

  return response.json()
}

export async function registerUser(request: RegisterRequest): Promise<AuthUser | null> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (response.status === 409) {
    return null
  }

  if (!response.ok) {
    throw new Error('Register failed')
  }

  return response.json()
}

// POST /api/auth/change-password (FR-13); a wrong current password answers 400
export async function changePassword(request: ChangePasswordRequest, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/change-password`, {
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
}
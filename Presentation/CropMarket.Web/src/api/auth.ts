import type { AuthUser, LoginRequest, RegisterRequest } from '../types'

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
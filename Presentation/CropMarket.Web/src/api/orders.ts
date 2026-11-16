import type { CreateOrderRequest, Order } from '../types'
import { ApiError } from './ApiError'

const API_URL = import.meta.env.VITE_API_URL

// FR-04: POST /api/orders (consumers only)
export async function createOrder(request: CreateOrderRequest, token: string): Promise<Order> {
  const response = await fetch(`${API_URL}/api/orders`, {
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

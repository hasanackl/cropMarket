import type { CreateOrderRequest, MyOrder, Order, OrderStatus, ReceivedOrder, UpdateOrderRequest } from '../types'
import { ApiError } from './ApiError'

const API_URL = import.meta.env.VITE_API_URL

// Every order call sends the token and turns a failed answer into an ApiError
async function send<T>(path: string, token: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}/api/orders${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw new ApiError(response.status)
  }

  // 204 No Content has no body to read
  return response.status === 204 ? (undefined as T) : response.json()
}

// ---------- Consumer ----------

// FR-04: POST /api/orders
export function createOrder(request: CreateOrderRequest, token: string) {
  return send<Order>('', token, 'POST', request)
}

export function getMyOrders(token: string) {
  return send<MyOrder[]>('/mine', token)
}

// FR-07: PUT /api/orders/{id}
export function updateOrder(id: number, request: UpdateOrderRequest, token: string) {
  return send<MyOrder>(`/${id}`, token, 'PUT', request)
}

// FR-08: PATCH /api/orders/{id}/cancel
export function cancelOrder(id: number, token: string) {
  return send<MyOrder>(`/${id}/cancel`, token, 'PATCH')
}

// ---------- Farmer ----------

// FR-06
export function getReceivedOrders(token: string) {
  return send<ReceivedOrder[]>('/received', token)
}

export function updateOrderStatus(id: number, status: OrderStatus, token: string) {
  return send<ReceivedOrder>(`/${id}/status`, token, 'PATCH', { status })
}

// FR-09: new-order notifications
export function getUnseenOrderCount(token: string) {
  return send<number>('/received/unseen-count', token)
}

export function getUnseenOrders(token: string) {
  return send<ReceivedOrder[]>('/received/unseen', token)
}

export function markOrdersSeen(token: string) {
  return send<void>('/received/mark-seen', token, 'POST')
}
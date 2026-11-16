import type { OrderStatus } from '../types'

// The only allowed next step for each status (same rule as the API)
export const nextStatus: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'delivered',
  delivered: null,
  cancelled: null,
}

export const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  preparing: 'bg-blue-50 text-blue-700',
  delivered: 'bg-brand-50 text-brand-700',
  cancelled: 'bg-red-50 text-red-700',
}

// The order of the steps in the progress bar
export const orderSteps: OrderStatus[] = ['pending', 'preparing', 'delivered']

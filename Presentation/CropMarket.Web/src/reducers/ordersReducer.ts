import type { ReceivedOrder } from '../types'

export type OrdersState = {
  orders: ReceivedOrder[]
  isLoading: boolean
  hasError: boolean
  notice: string
}

// Everything that can happen to the received orders list
export type OrdersAction =
  | { type: 'loaded'; orders: ReceivedOrder[] }
  | { type: 'failed' }
  | { type: 'statusChanged'; order: ReceivedOrder; notice: string }

export const initialOrdersState: OrdersState = {
  orders: [],
  isLoading: true,
  hasError: false,
  notice: '',
}

// Takes the old state and an action, returns the new state; it never changes the old one
export function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case 'loaded':
      return { ...state, orders: action.orders, isLoading: false }

    case 'failed':
      return { ...state, isLoading: false, hasError: true, notice: '' }

    case 'statusChanged':
      return {
        ...state,
        // Replace only the changed order; keep the others as they are
        orders: state.orders.map((item) => (item.id === action.order.id ? action.order : item)),
        notice: action.notice,
      }
  }
}
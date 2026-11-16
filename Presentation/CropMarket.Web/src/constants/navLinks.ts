import type { NavLink, Role } from '../types'

export const navLinks: Record<Role, NavLink[]> = {
  guest: [
    { labelKey: 'nav.browse', href: '/' },
  ],
  consumer: [
    { labelKey: 'nav.browse', href: '/' },
    { labelKey: 'nav.myOrders', href: '/orders' },
  ],
  farmer: [
    { labelKey: 'nav.browse', href: '/' },
    { labelKey: 'nav.myListings', href: '/farmer/listings' },
    { labelKey: 'nav.receivedOrders', href: '/farmer/orders' },
  ],
}
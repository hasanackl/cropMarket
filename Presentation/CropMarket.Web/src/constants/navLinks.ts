import type { NavLink, Role } from '../types'

export const navLinks: Record<Role, NavLink[]> = {
  guest: [
    { labelKey: 'nav.browse', href: '/' },
  ],
  consumer: [
    { labelKey: 'nav.browse', href: '/' },
  ],
  farmer: [
    { labelKey: 'nav.browse', href: '/' },
  ],
}
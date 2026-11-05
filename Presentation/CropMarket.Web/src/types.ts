export type UserRole = 'consumer' | 'farmer'

export type Role = 'guest' | UserRole

export type AuthUser = {
  token: string
  id: number
  fullName: string
  email: string
  role: UserRole
}

export type Category = 'vegetables' | 'fruits' | 'grains' | 'oilOlives' | 'dairyEggs'

export type CategoryFilter = 'all' | Category

export type Unit = 'kg' | 'piece' | 'box'

export type Listing = {
  id: number
  productName: string
  category: string
  unitPrice: number
  unit: Unit
  availableQuantity: number
  location: string
  farmerId: number
  farmerName: string
  createdAt: string
}

export type ListingFilters = {
  search: string
  category: CategoryFilter
  location: string
}

export type NavLink = {
  labelKey: string
  href: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  fullName: string
  email: string
  password: string
  phoneNumber: string
  role: UserRole
}

export type CreateListingRequest = {
  productName: string
  category: Category
  unitPrice: number
  unit: Unit
  availableQuantity: number
  location: string
}

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
  imageUrl: string | null
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

// FR-13
export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type CreateListingRequest = {
  productName: string
  category: Category
  unitPrice: number
  unit: Unit
  availableQuantity: number
  location: string
}

// The current values in the edit form (EditListingDto in the API, FR-10)
export type EditableListing = CreateListingRequest & {
  id: number
  imageUrl: string | null
  hasOrders: boolean
}

// Same fields as CityDto in the API (FR-11)
export type City = {
  id: number
  name: string
}

export type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled'

export type PaymentMethod = 'cashOnDelivery'

// Same fields as OrderDto in the API
export type Order = {
  id: number
  listingId: number
  productName: string
  quantity: number
  unit: Unit
  unitPriceAtOrder: number
  totalPrice: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  deliveryAddress: string
  remainingQuantity: number
  createdAt: string
}

export type CreateOrderRequest = {
  listingId: number
  quantity: number
  deliveryAddress: string
}

// Same fields as MyOrderDto in the API
export type MyOrder = {
  id: number
  listingId: number
  productName: string
  category: string
  farmerName: string
  quantity: number
  unit: Unit
  totalPrice: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  deliveryAddress: string
  createdAt: string
  imageUrl: string | null
}

// Same fields as ReceivedOrderDto in the API
export type ReceivedOrder = {
  id: number
  listingId: number
  productName: string
  category: string
  consumerName: string
  consumerPhone: string | null
  quantity: number
  unit: Unit
  totalPrice: number
  status: OrderStatus
  deliveryAddress: string
  createdAt: string
  imageUrl: string | null
}

// Same fields as MyListingDto in the API
export type MyListing = {
  id: number
  productName: string
  category: string
  unitPrice: number
  unit: Unit
  availableQuantity: number
  location: string
  isActive: boolean
  orderCount: number
  createdAt: string
  imageUrl: string | null
}

// Same fields as UpdateOrderRequest in the API (FR-07)
export type UpdateOrderRequest = {
  quantity: number
  deliveryAddress: string
}

export type StatusFilter = 'all' | OrderStatus

export type SortOrder = 'newest' | 'oldest'
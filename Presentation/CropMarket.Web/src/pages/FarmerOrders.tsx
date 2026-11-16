import { useEffect, useState, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBoxOpen, faCheck, faCircleCheck, faClock, faSeedling } from '@fortawesome/free-solid-svg-icons'
import type { ReceivedOrder, StatusFilter, SortOrder } from '../types'
import { getReceivedOrders, updateOrderStatus } from '../api/orders'
import { getListings } from '../api/listings'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../hooks/useAuth'
import { nextStatus } from '../constants/orderStatus'
import { getGreetingKey } from '../utils/getGreetingKey'
import { initialOrdersState, ordersReducer } from '../reducers/ordersReducer'
import SummaryCard from '../components/farmer-orders/SummaryCard'
import StatusTabs from '../components/farmer-orders/StatusTabs'
import OrdersTable from '../components/farmer-orders/OrdersTable'
import SortSelect from '../components/farmer-orders/SortSelect'

function FarmerOrders() {
  const [state, dispatch] = useReducer(ordersReducer, initialOrdersState)
  const [activeListingCount, setActiveListingCount] = useState(0)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user === null) {
      return
    }

    getReceivedOrders(user.token)
      .then((data) => dispatch({ type: 'loaded', orders: data }))
      .catch(() => dispatch({ type: 'failed' }))

    getListings()
      .then((listings) => setActiveListingCount(listings.filter((listing) => listing.farmerId === user.id).length))
      .catch(() => dispatch({ type: 'failed' }))
  }, [user])

  if (user === null) {
    return null
  }

  const { orders, isLoading, hasError, notice } = state

  const counts: Record<StatusFilter, number> = {
    all: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    preparing: orders.filter((order) => order.status === 'preparing').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
    cancelled: orders.filter((order) => order.status === 'cancelled').length,
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter((order) => order.status === filter)
  const firstName = user.fullName.split(' ')[0]
  // Copy first: sort() changes the array it is called on
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const difference = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    return sortOrder === 'newest' ? difference : -difference
  })

  async function handleAdvance(order: ReceivedOrder, token: string) {
    const next = nextStatus[order.status]

    if (next === null) {
      return
    }

    try {

      const updated = await updateOrderStatus(order.id, next, token)

      const message = t('farmerOrders.statusChanged', {
        product: updated.listingName,
        name: updated.consumerName,
        status: t(`orderStatus.${updated.status}`),
      })

      dispatch({ type: 'statusChanged', order: updated, notice: message })
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      dispatch({ type: 'failed' })
    }
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">{t(getGreetingKey(), { name: firstName })}</h1>
          <p className="mt-2 text-gray-500">{t('farmerOrders.subtitle')}</p>
        </div>

        {notice && (
          <p className="rounded-xl border border-brand-300 bg-brand-50 px-5 py-3 font-semibold text-brand-700">
            <FontAwesomeIcon icon={faCheck} className="mr-2" />
            {notice}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={faClock} iconClass="bg-amber-50 text-amber-600" count={counts.pending} label={t('farmerOrders.pendingOrders')} />
        <SummaryCard icon={faBoxOpen} iconClass="bg-blue-50 text-blue-600" count={counts.preparing} label={t('orderStatus.preparing')} />
        <SummaryCard icon={faCircleCheck} iconClass="bg-brand-50 text-brand-500" count={counts.delivered} label={t('orderStatus.delivered')} />
        <SummaryCard icon={faSeedling} iconClass="bg-brand-50 text-brand-500" count={activeListingCount} label={t('farmerOrders.activeListings')} />
      </div>

      <section className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{t('farmerOrders.title')}</h2>
          <div className="flex flex-wrap items-center gap-4">
            <StatusTabs selected={filter} counts={counts} onSelect={setFilter} />
            <SortSelect value={sortOrder} onChange={setSortOrder} />
          </div>
        </div>

        {isLoading && <p className="mt-8 text-center text-gray-500">{t('common.loading')}</p>}
        {hasError && <p className="mt-8 text-center text-red-600">{t('common.loadError')}</p>}
        {!isLoading && !hasError && filteredOrders.length === 0 && (
          <p className="mt-8 text-center text-gray-500">{t('farmerOrders.empty')}</p>
        )}

        {sortedOrders.length > 0 && (
          <OrdersTable orders={sortedOrders} onAdvance={(order) => handleAdvance(order, user.token)} />
        )}
      </section>
    </main>
  )
}

export default FarmerOrders
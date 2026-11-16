import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBasketShopping } from '@fortawesome/free-solid-svg-icons'
import type { MyOrder, UpdateOrderRequest } from '../types'
import { cancelOrder, getMyOrders, updateOrder } from '../api/orders'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../hooks/useAuth'
import MyOrderCard from '../components/my-orders/MyOrderCard'
import EditOrderForm from '../components/my-orders/EditOrderForm'

function MyOrders() {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [errorKey, setErrorKey] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [cancelErrorKey, setCancelErrorKey] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user === null) {
      return
    }

    getMyOrders(user.token)
      .then((data) => setOrders(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [user])

  if (user === null) {
    return null
  }

  function startEditing(id: number) {
    setEditingId(id)
    setErrorKey('')
  }

  async function handleSave(id: number, request: UpdateOrderRequest, token: string) {
    setErrorKey('')
    setIsSaving(true)

    try {
      const updated = await updateOrder(id, request, token)

      // Replace only the changed order and close the form
      setOrders((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setEditingId(null)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (error instanceof ApiError && error.status === 409) {
        setErrorKey('myOrders.updateRejected')
        return
      }

      setErrorKey('common.loadError')
    } finally {
      setIsSaving(false)
    }
  }

    async function handleCancel(id: number, token: string) {
    // The browser's own yes/no box; nothing happens if the user says no
    if (!window.confirm(t('myOrders.cancelConfirm'))) {
      return
    }

    setCancelErrorKey('')

    try {
      const cancelled = await cancelOrder(id, token)
      setOrders((current) => current.map((item) => (item.id === cancelled.id ? cancelled : item)))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (error instanceof ApiError && error.status === 409) {
        setCancelErrorKey('myOrders.cancelRejected')

        // The farmer has moved the order on; load the list again to show its real status
        getMyOrders(token)
          .then((data) => setOrders(data))
          .catch(() => setHasError(true))
        return
      }

      setCancelErrorKey('common.loadError')
    }
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <h1 className="text-4xl font-extrabold">{t('myOrders.title')}</h1>
      <p className="mt-2 text-gray-500">{t('myOrders.subtitle')}</p>

      {isLoading && <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>}
      {hasError && <p className="mt-10 text-center text-red-600">{t('common.loadError')}</p>}

      {!isLoading && !hasError && orders.length === 0 && (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center">
          <FontAwesomeIcon icon={faBasketShopping} className="text-5xl text-brand-500" />
          <p className="mt-4 text-gray-500">{t('myOrders.empty')}</p>
          <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-700 px-5 py-2 font-semibold text-white shadow-md">
            {t('myOrders.browse')}
          </Link>
        </div>
      )}

      {cancelErrorKey && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-medium text-red-700">{t(cancelErrorKey)}</p>
      )}

      <div className="mt-8 space-y-6">
        {orders.map((order) => (
          <MyOrderCard
            key={order.id}
            order={order}
            canEdit={order.status !== 'delivered' && order.status !== 'cancelled' && editingId !== order.id}
            canCancel={order.status === 'pending' && editingId !== order.id}
            onEdit={() => startEditing(order.id)}
            onCancelOrder={() => handleCancel(order.id, user.token)}
          >
            {editingId === order.id && (
              <EditOrderForm
                order={order}
                errorKey={errorKey}
                isSaving={isSaving}
                onSave={(request) => handleSave(order.id, request, user.token)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </MyOrderCard>
        ))}
      </div>
    </main>
  )
}

export default MyOrders

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import type { ReceivedOrder } from '../../types'
import { getUnseenOrderCount, getUnseenOrders, markOrdersSeen } from '../../api/orders'
import { useAuth } from '../../hooks/useAuth'
import NotificationList from './NotificationList'

// Ask the API for new orders every 30 seconds
const REFRESH_INTERVAL = 30 * 1000

function NotificationBell() {
  const [count, setCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [orders, setOrders] = useState<ReceivedOrder[] | null>(null)
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const isOnOrdersPage = pathname === '/farmer/orders'

  useEffect(() => {
    if (user === null) {
      return
    }

    const token = user.token

    function refresh() {
      getUnseenOrderCount(token)
        .then((data) => setCount(data))
        .catch(() => setCount(0))
    }

    // Opening the orders page means the farmer has seen the new orders
    if (isOnOrdersPage) {
      markOrdersSeen(token)
        .then(() => setCount(0))
        .catch(() => setCount(0))
    } else {
      refresh()
    }

    const timer = setInterval(refresh, REFRESH_INTERVAL)

    // Stop the timer when the page changes or the user logs out
    return () => clearInterval(timer)
  }, [user, isOnOrdersPage])

  if (user === null) {
    return null
  }

  function handleToggle(token: string) {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    // Clear the old list so "loading" shows until the new one arrives
    setOrders(null)
    setIsOpen(true)

    getUnseenOrders(token)
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
  }

  return (
    <div className="relative">
      <button
        onClick={() => handleToggle(user.token)}
        className="relative px-2 text-xl text-brand-900"
        aria-label={t('notifications.title')}
        title={t('notifications.title')}
      >
        <FontAwesomeIcon icon={faBell} />
        {count > 0 && (
          <span className="absolute -right-1 -top-2 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Invisible full-screen layer: a click anywhere outside closes the list */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <NotificationList orders={orders} onClose={() => setIsOpen(false)} />
        </>
      )}
    </div>
  )
}

export default NotificationBell
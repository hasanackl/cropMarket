import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import type { Listing, Order } from '../../types'
import { createOrder } from '../../api/orders'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../hooks/useAuth'
import { formatPrice } from '../../utils/formatPrice'
import QuantityPicker from './QuantityPicker'
import OrderSummary from './OrderSummary'

type OrderBoxProps = {
  listing: Listing
  onOrdered: (order: Order) => void
}

function OrderBox({ listing, onOrdered }: OrderBoxProps) {
  const [quantity, setQuantity] = useState(1)
  const [address, setAddress] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [errorKey, setErrorKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const unit = t(`units.${listing.unit}`)
  const total = quantity * listing.unitPrice

  async function handleSubmit() {
    if (user === null) {
      navigate('/login')
      return
    }

    setErrorKey('')
    setIsSubmitting(true)

    try {
      const newOrder = await createOrder({ listingId: listing.id, quantity, deliveryAddress: address.trim() }, user.token)
      setOrder(newOrder)
      // Lets the page show the new stock that the API returned (FR-05)
      onOrdered(newOrder)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        // Token is missing or expired: log out and ask the user to log in again
        logout()
        navigate('/login')
        return
      }

      // Our API: 400 = invalid quantity or not enough stock, 404 = listing gone,
      // 409 = another order changed the stock at the same time (RowVersion)
      if (error instanceof ApiError && error.status === 400) {
        setErrorKey('order.notEnoughStock')
      } else if (error instanceof ApiError && error.status === 404) {
        setErrorKey('order.listingGone')
      } else if (error instanceof ApiError && error.status === 409) {
        setErrorKey('order.stockChanged')
      } else {
        setErrorKey('common.loadError')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (order !== null) {
    return (
      <div className="mt-6 rounded-3xl border border-brand-300 bg-white p-6 text-center">
        <FontAwesomeIcon icon={faCircleCheck} className="text-5xl text-brand-500" />
        <p className="mt-3 font-semibold">{t('order.success', { total: formatPrice(order.totalPrice) })}</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit()
      }}
      className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold">{t('order.title')}</h2>

      <p className="mt-4 font-semibold">{t('order.quantity', { unit })}</p>
      <QuantityPicker value={quantity} max={listing.availableQuantity} onChange={setQuantity} />
      <p className="mt-1 text-sm text-gray-500">{t('order.range', { max: listing.availableQuantity, unit })}</p>

      <label className="mt-4 block font-semibold">
        {t('order.address')}
        <input
          type="text"
          value={address}
          maxLength={250}
          onChange={(event) => setAddress(event.target.value)}
          placeholder={t('order.addressPlaceholder')}
          className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
        />
      </label>

      <OrderSummary quantity={quantity} unit={unit} price={listing.unitPrice} total={total} />

      {errorKey && <p className="mt-4 text-sm font-medium text-red-600">{t(errorKey)}</p>}

      <button
        type="submit"
        disabled={isSubmitting || address.trim() === ''}
        className="mt-5 w-full rounded-xl bg-brand-700 py-3 text-lg font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
      >
        {isSubmitting ? t('common.loading') : t('order.submit')}
      </button>
    </form>
  )
}

export default OrderBox

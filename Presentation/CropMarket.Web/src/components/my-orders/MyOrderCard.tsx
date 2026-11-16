import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { MyOrder } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'
import ListingImage from '../ListingImage'
import OrderProgress from './OrderProgress'

type MyOrderCardProps = {
  order: MyOrder
  canEdit: boolean
  canCancel: boolean
  onEdit: () => void
  onCancelOrder: () => void
  children?: ReactNode
}

function MyOrderCard({ order, canEdit, canCancel, onEdit, onCancelOrder, children }: MyOrderCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-6">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
          <ListingImage imageUrl={order.imageUrl} name={order.listingName} category={order.category} className="h-full w-full" />
        </div>

        <div className="min-w-60 flex-1">
          <p className="text-xl">
            <span className="font-bold">{order.listingName}</span>
            <span className="text-gray-500">
              {' '}
              · {order.quantity} {order.unit}
            </span>
          </p>
          <p className="mt-1 text-gray-500">
            {t('myOrders.info', { id: order.id, date: formatDate(order.createdAt, i18n.language), farmer: order.farmerName })}
          </p>
          <p className="mt-1 text-sm text-gray-500">{order.deliveryAddress}</p>
        </div>

        {order.status === 'cancelled' ? (
          <span className="rounded-full bg-red-50 px-4 py-2 font-semibold text-red-700">
            <FontAwesomeIcon icon={faXmark} className="mr-2" />
            {t('orderStatus.cancelled')}
          </span>
        ) : (
          <OrderProgress status={order.status} />
        )}

        <div className="text-right">
          <p className="text-2xl font-bold text-brand-700">{formatPrice(order.totalPrice)}</p>
          <p className="text-sm text-gray-500">
            <FontAwesomeIcon icon={faMoneyBill} className="mr-1 text-brand-500" />
            {t('order.cashOnDelivery')}
          </p>
        <div className="mt-2 flex justify-end gap-4">
            {canEdit && (
                <button type="button" onClick={onEdit} className="text-sm font-semibold text-brand-700 hover:underline">
                <FontAwesomeIcon icon={faPen} className="mr-1" />
                {t('myOrders.edit')}
                </button>
            )}
            {canCancel && (
                <button type="button" onClick={onCancelOrder} className="text-sm font-semibold text-red-600 hover:underline">
                <FontAwesomeIcon icon={faXmark} className="mr-1" />
                {t('myOrders.cancelOrder')}
                </button>
            )}
        </div>
        </div>
      </div>

      {children}
    </div>
  )
}

export default MyOrderCard

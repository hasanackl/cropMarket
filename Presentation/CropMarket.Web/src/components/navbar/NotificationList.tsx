import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { ReceivedOrder } from '../../types'
import ListingImage from '../ListingImage'
import { formatDateTime } from '../../utils/formatDateTime'

type NotificationListProps = {
  orders: ReceivedOrder[] | null
  onClose: () => void
}

function NotificationList({ orders, onClose }: NotificationListProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="absolute right-0 top-full z-20 mt-3 w-80 rounded-2xl border border-gray-200 bg-white shadow-lg">
      <p className="border-b border-gray-100 px-4 py-3 font-bold">{t('notifications.title')}</p>

      {/* null means the list is still loading */}
      {orders === null && <p className="px-4 py-6 text-center text-sm text-gray-500">{t('common.loading')}</p>}
      {orders !== null && orders.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-gray-500">{t('notifications.empty')}</p>
      )}

      {orders !== null &&
        orders.map((order) => (
          <Link
            key={order.id}
            to="/farmer/orders"
            onClick={onClose}
            className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-brand-50"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <ListingImage imageUrl={order.imageUrl} name={order.productName} category={order.category} className="h-full w-full" iconSize="text-lg" />
            </div>
            <div>
              <p className="text-sm">
                {t('notifications.item', {
                  name: order.consumerName,
                  quantity: order.quantity,
                  unit: t(`units.${order.unit}`),
                  product: order.productName,
                })}
              </p>
              <p className="text-xs text-gray-500">{formatDateTime(order.createdAt, i18n.language)}</p>
            </div>
          </Link>
        ))}

      <Link
        to="/farmer/orders"
        onClick={onClose}
        className="block rounded-b-2xl px-4 py-3 text-center text-sm font-semibold text-brand-700 hover:bg-brand-50"
      >
        {t('notifications.seeAll')}
      </Link>
    </div>
  )
}

export default NotificationList
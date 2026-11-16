import { useTranslation } from 'react-i18next'
import type { ReceivedOrder } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import ListingImage from '../ListingImage'
import StatusControl from './StatusControl'
import { formatDateTime } from '../../utils/formatDateTime'

const columns = ['date', 'product', 'buyer', 'quantity', 'total', 'address', 'status']

type OrdersTableProps = {
  orders: ReceivedOrder[]
  onAdvance: (order: ReceivedOrder) => void
}

function OrdersTable({ orders, onAdvance }: OrdersTableProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-200 text-left">
        <thead>
          <tr className="border-b border-gray-200 text-sm uppercase tracking-wider text-gray-500">
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {t(`farmerOrders.${column}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-100 last:border-0">
              <td className="whitespace-nowrap px-4 py-4 text-gray-500">{formatDateTime(order.createdAt, i18n.language)}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <ListingImage imageUrl={order.imageUrl} name={order.productName} category={order.category} className="h-full w-full" iconSize="text-xl" />
                  </div>
                  <span className="font-semibold">{order.productName}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <p>{order.consumerName}</p>
                {/* The farmer may need to call the buyer about the delivery */}
                {order.consumerPhone && <p className="text-sm text-gray-500">{order.consumerPhone}</p>}
              </td>
              <td className="px-4 py-4">
                {order.quantity} {t(`units.${order.unit}`)}
              </td>
              <td className="px-4 py-4 font-bold">{formatPrice(order.totalPrice)}</td>
              <td className="px-4 py-4 text-gray-500">{order.deliveryAddress}</td>
              <td className="px-4 py-4">
                <StatusControl status={order.status} onAdvance={() => onAdvance(order)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable
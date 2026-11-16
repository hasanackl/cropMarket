import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons'
import { formatPrice } from '../../utils/formatPrice'

type OrderSummaryProps = {
  quantity: number
  unit: string
  price: number
  total: number
}

function OrderSummary({ quantity, unit, price, total }: OrderSummaryProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-5 space-y-2 rounded-2xl bg-brand-50 p-4">
      <div className="flex justify-between text-gray-600">
        <span>{quantity} {unit} × {formatPrice(price)}</span>
        <span>{formatPrice(total)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>{t('order.payment')}</span>
        <span>
          <FontAwesomeIcon icon={faMoneyBillWave} className="mr-1 text-brand-500" />
          {t('order.cashOnDelivery')}
        </span>
      </div>
      <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-lg font-bold">
        <span>{t('order.total')}</span>
        <span className="text-brand-700">{formatPrice(total)}</span>
      </div>
    </div>
  )
}

export default OrderSummary
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import type { OrderStatus } from '../../types'
import { orderSteps } from '../../constants/orderStatus'

type OrderProgressProps = {
  status: OrderStatus
}

function OrderProgress({ status }: OrderProgressProps) {
  const { t } = useTranslation()
  const currentIndex = orderSteps.indexOf(status)

  return (
    <div className="flex items-start">
      {orderSteps.map((step, index) => {
        const isDone = index <= currentIndex

        return (
          <Fragment key={step}>
            {/* Line between two steps, green when the next step is reached */}
            {index > 0 && <div className={`mt-4 h-1 w-10 rounded-full ${isDone ? 'bg-brand-500' : 'bg-gray-200'}`} />}

            <div className="flex w-24 flex-col items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  isDone ? 'bg-brand-700 text-white' : 'bg-gray-200 text-transparent'
                }`}
              >
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={`text-sm ${isDone ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                {t(`orderStatus.${step}`)}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

export default OrderProgress

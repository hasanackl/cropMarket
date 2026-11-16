import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import type { OrderStatus } from '../../types'
import { nextStatus, statusStyles } from '../../constants/orderStatus'

type StatusControlProps = {
  status: OrderStatus
  onAdvance: () => void
}

function StatusControl({ status, onAdvance }: StatusControlProps) {
  const { t } = useTranslation()
  const next = nextStatus[status]

  // Delivered is the last step, so there is nothing to choose
  if (next === null) {
    return (
      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}>
        <FontAwesomeIcon icon={status === 'cancelled' ? faXmark : faCheck} className="mr-1" />
        {t(`orderStatus.${status}`)}
      </span>
    )
  }

  return (
    <select
      value={status}
      onChange={() => onAdvance()}
      className={`cursor-pointer rounded-full px-3 py-1 text-sm font-semibold outline-none ${statusStyles[status]}`}
    >
      <option value={status}>{t(`orderStatus.${status}`)}</option>
      <option value={next}>{t(`orderStatus.${next}`)}</option>
    </select>
  )
}

export default StatusControl

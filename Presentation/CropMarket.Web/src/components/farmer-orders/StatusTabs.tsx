import { useTranslation } from 'react-i18next'
import type { StatusFilter } from '../../types'

const tabs: StatusFilter[] = ['all', 'pending', 'preparing', 'delivered', 'cancelled']

type StatusTabsProps = {
  selected: StatusFilter
  counts: Record<StatusFilter, number>
  onSelect: (filter: StatusFilter) => void
}

function StatusTabs({ selected, counts, onSelect }: StatusTabsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={
            tab === selected
              ? 'rounded-full bg-brand-900 px-4 py-2 font-semibold text-white'
              : 'rounded-full border border-gray-200 bg-white px-4 py-2 font-medium text-gray-700 hover:border-brand-300'
          }
        >
          {t(`orderStatus.${tab}`)} {counts[tab]}
        </button>
      ))}
    </div>
  )
}

export default StatusTabs
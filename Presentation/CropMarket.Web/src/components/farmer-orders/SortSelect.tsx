import { useTranslation } from 'react-i18next'
import type { SortOrder } from '../../types'

const options: SortOrder[] = ['newest', 'oldest']

type SortSelectProps = {
  value: SortOrder
  onChange: (sortOrder: SortOrder) => void
}

function SortSelect({ value, onChange }: SortSelectProps) {
  const { t } = useTranslation()

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-600">
      {t('farmerOrders.sortLabel')}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SortOrder)}
        className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 font-medium text-gray-700"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {t(`farmerOrders.${option}`)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default SortSelect
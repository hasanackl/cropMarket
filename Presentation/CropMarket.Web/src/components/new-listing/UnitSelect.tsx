import { useTranslation } from 'react-i18next'
import type { Unit } from '../../types'
import { units } from '../../constants/units'

type UnitSelectProps = {
  value: Unit
  onChange: (value: Unit) => void
}

function UnitSelect({ value, onChange }: UnitSelectProps) {
  const { t } = useTranslation()

  return (
    <label className="block font-semibold">
      {t('newListing.unit')}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Unit)}
        className="mt-2 w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-normal outline-none focus:border-brand-500"
      >
        {units.map((unit) => (
          <option key={unit} value={unit}>
            {t(`units.${unit}`)}
          </option>
        ))}
      </select>
    </label>
  )
}

export default UnitSelect

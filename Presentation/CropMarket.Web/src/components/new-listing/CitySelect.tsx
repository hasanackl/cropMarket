import { useTranslation } from 'react-i18next'
import type { City } from '../../types'

type CitySelectProps = {
  cities: City[]
  value: string
  onChange: (value: string) => void
}

// The listing stores the city name, so the option value is the name (FR-11)
function CitySelect({ cities, value, onChange }: CitySelectProps) {
  const { t } = useTranslation()

  return (
    <label className="block font-semibold">
      {t('newListing.city')}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-normal outline-none focus:border-brand-500"
      >
        <option value="" disabled>
          {t('newListing.selectCity')}
        </option>
        {cities.map((city) => (
          <option key={city.id} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CitySelect
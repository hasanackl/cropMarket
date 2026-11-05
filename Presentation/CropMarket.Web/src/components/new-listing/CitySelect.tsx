import { useTranslation } from 'react-i18next'
import { cities } from '../../constants/cities'

type CitySelectProps = {
  value: string
  onChange: (value: string) => void
}

function CitySelect({ value, onChange }: CitySelectProps) {
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
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CitySelect
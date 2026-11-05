import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

type SearchBarProps = {
  search: string
  onSearchChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  locations: string[]
}

function SearchBar({ search, onSearchChange, location, onLocationChange, locations }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="relative -mt-8 px-6 lg:px-10">
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-lg md:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl bg-brand-50 px-4">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="w-full bg-transparent py-3 outline-none"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 md:w-60">
          <FontAwesomeIcon icon={faLocationDot} className="text-brand-500" />
          <select
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            className="w-full cursor-pointer bg-transparent py-3 outline-none"
          >
            <option value="">{t('home.allLocations')}</option>
            {locations.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}

export default SearchBar
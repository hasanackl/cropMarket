import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Category } from '../../types'
import { categoryChips } from '../../constants/categoryChips'

type CategoryPickerProps = {
  selected: Category
  onSelect: (category: Category) => void
}

function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-2 flex flex-wrap gap-3">
      {categoryChips.map((chip) => {
        const name = chip.name

        // "All" is a filter option, not a real category
        if (name === 'all') {
          return null
        }

        return (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={
              name === selected
                ? 'rounded-full bg-brand-900 px-5 py-2 font-semibold text-white'
                : 'rounded-full border border-gray-200 bg-white px-5 py-2 font-medium text-gray-700 hover:border-brand-300'
            }
          >
            <FontAwesomeIcon icon={chip.icon} className="mr-2" />
            {t(`categories.${name}`)}
          </button>
        )
      })}
    </div>
  )
}

export default CategoryPicker
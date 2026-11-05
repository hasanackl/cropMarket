import type { CategoryFilter } from '../../types'
import { categoryChips } from '../../constants/categoryChips'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'

type CategoryChipsProps = {
    selected: CategoryFilter
    onSelect: (category: CategoryFilter) => void
}

function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
    const { t } = useTranslation()

    return (
        <div className="flex flex-wrap gap-3">
            {categoryChips.map((chip) => (
                <button
                    key={chip.name}
                    onClick={() => onSelect(chip.name)}
                    className={
                        chip.name === selected
                            ? 'rounded-full bg-brand-900 px-5 py-2 font-semibold text-white'
                            : 'rounded-full border border-gray-200 bg-white px-5 py-2 font-medium text-gray-700 hover:border-brand-300'
                    }
                >
                    <FontAwesomeIcon icon={chip.icon} className="mr-2" />
                    {t(`categories.${chip.name}`)}
                </button>
            ))}
        </div>
    )
}

export default CategoryChips
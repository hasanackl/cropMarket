import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type RoleCardProps = {
  icon: IconDefinition
  title: string
  text: string
  isSelected: boolean
  onSelect: () => void
}

function RoleCard({ icon, title, text, isSelected, onSelect }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        isSelected
          ? 'relative rounded-2xl border-2 border-brand-500 bg-brand-50 p-5 text-left'
          : 'relative rounded-2xl border-2 border-gray-200 p-5 text-left hover:border-brand-300'
      }
    >
      {isSelected && <FontAwesomeIcon icon={faCircleCheck} className="absolute right-4 top-4 text-xl text-brand-700" />}
      <FontAwesomeIcon icon={icon} className="text-3xl text-brand-500" />
      <p className="mt-2 text-lg font-bold">{title}</p>
      <p className="text-sm text-gray-500">{text}</p>
    </button>
  )
}

export default RoleCard
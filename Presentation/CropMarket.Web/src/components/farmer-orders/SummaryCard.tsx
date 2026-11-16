import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type SummaryCardProps = {
  icon: IconDefinition
  iconClass: string
  count: number
  label: string
}

function SummaryCard({ icon, iconClass, count, label }: SummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${iconClass}`}>
        <FontAwesomeIcon icon={icon} />
      </span>
      <div>
        <p className="text-3xl font-extrabold">{count}</p>
        <p className="text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default SummaryCard

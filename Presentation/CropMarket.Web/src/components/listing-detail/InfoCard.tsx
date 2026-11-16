import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type InfoCardProps = {
  icon: IconDefinition
  label: string
  value: string
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 flex items-center gap-2 text-lg font-bold">
        <FontAwesomeIcon icon={icon} className="text-brand-500" />
        {value}
      </p>
    </div>
  )
}

export default InfoCard
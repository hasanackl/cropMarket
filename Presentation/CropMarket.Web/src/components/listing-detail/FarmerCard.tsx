import { useTranslation } from 'react-i18next'
import Avatar from '../Avatar'

type FarmerCardProps = {
  name: string
  location: string
}

// Organics also showed the farmer's listing count; our API does not return it, so it is left out
function FarmerCard({ name, location }: FarmerCardProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <Avatar name={name} />
      <div>
        <p className="text-lg font-semibold">{name}</p>
        <p className="text-sm text-gray-500">
          {t('roles.farmer')} · {location}
        </p>
      </div>
    </div>
  )
}

export default FarmerCard

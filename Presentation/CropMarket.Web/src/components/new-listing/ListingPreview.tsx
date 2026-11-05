import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'
import type { Listing } from '../../types'
import ListingCard from '../ListingCard'

type ListingPreviewProps = {
  listing: Listing
}

function ListingPreview({ listing }: ListingPreviewProps) {
  const { t } = useTranslation()

  return (
    <aside>
      <p className="mb-3 font-semibold">{t('newListing.preview')}</p>

      <div className="pointer-events-none">
        <ListingCard listing={listing} />
      </div>

      <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <FontAwesomeIcon icon={faLightbulb} className="mr-2" />
        {t('newListing.tip')}
      </p>
    </aside>
  )
}

export default ListingPreview
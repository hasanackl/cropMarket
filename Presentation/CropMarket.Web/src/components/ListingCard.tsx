import type { Listing } from '../types'
import Avatar from './Avatar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../utils/formatPrice'
import ListingImage from './ListingImage'
import { Link } from 'react-router'

type ListingCardProps = {
  listing: Listing
}

function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation()
  const unit = t(`units.${listing.unit}`)

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-40">
        <ListingImage category={listing.category} className="h-full w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">
          {t(`categories.${listing.category}`, { defaultValue: listing.category })}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold">{listing.productName}</h3>
        <p className="mt-1">
          <span className="text-2xl font-bold text-brand-700">{formatPrice(listing.unitPrice)}</span>
          <span className="text-gray-500"> / {unit}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-brand-500" /> {listing.location} · {t('listing.left', { quantity: listing.availableQuantity, unit })}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Avatar name={listing.farmerName} small />
            <span className="text-sm font-medium">{listing.farmerName}</span>
          </div>
          <Link to={`/listings/${listing.id}`} className="rounded-lg border-2 border-brand-300 px-4 py-1 text-sm font-semibold text-brand-700 transition-colors hover:border-brand-700 hover:bg-brand-700 hover:text-white">
            {t('listing.view')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ListingCard
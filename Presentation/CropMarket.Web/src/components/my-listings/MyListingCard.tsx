import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faLocationDot, faPen, faReceipt } from '@fortawesome/free-solid-svg-icons'
import type { MyListing } from '../../types'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'
import ListingImage from '../ListingImage'

type MyListingCardProps = {
  listing: MyListing
}

function MyListingCard({ listing }: MyListingCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="relative h-40">
        <ListingImage
          imageUrl={listing.imageUrl}
          name={listing.name}
          category={listing.category}
          className={listing.isActive ? 'h-full w-full' : 'h-full w-full grayscale'}
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            listing.isActive ? 'bg-white text-brand-700' : 'bg-gray-800 text-white'
          }`}
        >
          {listing.isActive ? t('myListings.active') : t('myListings.soldOut')}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold">{listing.name}</h3>
        <p className="mt-1">
          <span className="text-2xl font-bold text-brand-700">{formatPrice(listing.price)}</span>
          <span className="text-gray-500"> / {listing.unit}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          <FontAwesomeIcon icon={faLocationDot} className="mr-1 text-brand-500" /> {listing.city} · {t('listing.left', { quantity: listing.quantity, unit: listing.unit })}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
          <span>
            <FontAwesomeIcon icon={faReceipt} className="mr-1" />
            {t('myListings.orders', { count: listing.orderCount })}
          </span>
          <span>
            <FontAwesomeIcon icon={faCalendar} className="mr-1" />
            {formatDate(listing.createdAt, i18n.language)}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          {/* Sold out listings have no public page, so only active ones get a link */}
          {listing.isActive && (
            <Link
              to={`/listings/${listing.id}`}
              className="flex-1 rounded-lg border-2 border-brand-300 py-1 text-center text-sm font-semibold text-brand-700 transition-colors hover:border-brand-700 hover:bg-brand-700 hover:text-white"
            >
              {t('listing.view')}
            </Link>
          )}
          <Link
            to={`/farmer/listings/${listing.id}/edit`}
            className="flex-1 rounded-lg bg-brand-700 py-1 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-900"
          >
            <FontAwesomeIcon icon={faPen} className="mr-1" />
            {t('myListings.edit')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MyListingCard
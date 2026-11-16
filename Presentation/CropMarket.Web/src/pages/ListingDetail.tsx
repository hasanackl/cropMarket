import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { faBasketShopping, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import type { Listing, Order, Role } from '../types'
import { getListing } from '../api/listings'
import { formatPrice } from '../utils/formatPrice'
import InfoCard from '../components/listing-detail/InfoCard'
import FarmerCard from '../components/listing-detail/FarmerCard'
import NotFound from './NotFound'
import OrderBox from '../components/listing-detail/OrderBox'
import OrderNotice from '../components/listing-detail/OrderNotice'
import ListingImage from '../components/ListingImage'

type ListingDetailProps = {
  role: Role
}

function ListingDetail({ role }: ListingDetailProps) {
  const { id } = useParams()
  const { t } = useTranslation()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    getListing(Number(id))
      .then((data) => setListing(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  // FR-05: after an order, show the stock that the API calculated
  function handleOrdered(order: Order) {
    setListing((current) => (current ? { ...current, availableQuantity: order.remainingQuantity } : current))
  }

  if (isLoading) {
    return <p className="px-6 py-24 text-center text-gray-500 lg:px-10">{t('common.loading')}</p>
  }

  if (hasError) {
    return <p className="px-6 py-24 text-center text-red-600 lg:px-10">{t('common.loadError')}</p>
  }

  if (!listing) {
    return <NotFound />
  }

  const unit = t(`units.${listing.unit}`)
  const category = t(`categories.${listing.category}`, { defaultValue: listing.category })

  return (
    <main className="px-6 py-8 lg:px-10">
      <nav className="text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-700">
          {t('nav.browse')}
        </Link>
        <span className="mx-2">›</span>
        <span>{category}</span>
        <span className="mx-2">›</span>
        <span className="font-semibold text-gray-900">{listing.productName}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="relative overflow-hidden rounded-3xl">
            <ListingImage category={listing.category} className="h-80 w-full lg:h-96" />
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-brand-700">
              {category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoCard icon={faLocationDot} label={t('detail.location')} value={listing.location} />
            <InfoCard icon={faBasketShopping} label={t('detail.inStock')} value={`${listing.availableQuantity} ${unit}`} />
          </div>

          <FarmerCard name={listing.farmerName} location={listing.location} />
        </div>

        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-300/30 px-3 py-1 text-sm font-semibold text-brand-700">
            <span className="h-2 w-2 rounded-full bg-brand-500" />
            {t('detail.available')}
          </span>

          <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{listing.productName}</h1>

          <p className="mt-2">
            <span className="text-4xl font-extrabold text-brand-700">{formatPrice(listing.unitPrice)}</span>
            <span className="text-lg text-gray-500"> / {unit}</span>
          </p>

          {role === 'consumer' && <OrderBox listing={listing} onOrdered={handleOrdered} />}
          {role === 'farmer' && <OrderNotice message={t('order.farmerNotice')} />}
          {role === 'guest' && <OrderNotice message={t('order.guestNotice')} showLogin />}
        </div>
      </div>
    </main>
  )
}

export default ListingDetail

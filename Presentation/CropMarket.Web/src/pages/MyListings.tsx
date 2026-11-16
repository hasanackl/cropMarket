import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'
import type { MyListing } from '../types'
import { getMyListings } from '../api/listings'
import { useAuth } from '../hooks/useAuth'
import MyListingCard from '../components/my-listings/MyListingCard'

function MyListings() {
  const [listings, setListings] = useState<MyListing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { user } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    if (user === null) {
      return
    }

    getMyListings(user.token)
      .then((data) => setListings(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [user])

  const activeCount = listings.filter((listing) => listing.isActive).length
  const soldOutCount = listings.length - activeCount

  return (
    <main className="px-6 py-8 lg:px-10">
      <h1 className="text-4xl font-extrabold">{t('myListings.title')}</h1>
      <p className="mt-2 text-gray-500">{t('myListings.summary', { active: activeCount, soldOut: soldOutCount })}</p>

      {isLoading && <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>}
      {hasError && <p className="mt-10 text-center text-red-600">{t('common.loadError')}</p>}

      {!isLoading && !hasError && listings.length === 0 && (
        <div className="mt-10 rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center">
          <FontAwesomeIcon icon={faSeedling} className="text-5xl text-brand-500" />
          <p className="mt-4 text-gray-500">{t('myListings.empty')}</p>
          <Link to="/listings/new" className="mt-6 inline-block rounded-xl bg-brand-700 px-5 py-2 font-semibold text-white shadow-md">
            {t('myListings.createFirst')}
          </Link>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <MyListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  )
}

export default MyListings
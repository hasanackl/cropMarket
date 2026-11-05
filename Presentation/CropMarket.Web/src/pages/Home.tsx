import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CategoryFilter, Listing } from '../types'
import { getListings } from '../api/listings'
import { cities } from '../constants/cities'
import Hero from '../components/home/Hero'
import SearchBar from '../components/home/SearchBar'
import CategoryChips from '../components/home/CategoryChips'
import ListingCard from '../components/ListingCard'

// Wait until the user stops typing before calling the API
const SEARCH_DELAY_MS = 300

function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    // ignore: an older, slower response must not overwrite a newer one
    let ignore = false

    const timer = setTimeout(() => {
      getListings({ search, category: selectedCategory, location })
        .then((data) => {
          if (!ignore) {
            setListings(data)
            setHasError(false)
          }
        })
        .catch(() => {
          if (!ignore) {
            setHasError(true)
          }
        })
        .finally(() => {
          if (!ignore) {
            setIsLoading(false)
          }
        })
    }, SEARCH_DELAY_MS)

    return () => {
      ignore = true
      clearTimeout(timer)
    }
  }, [search, selectedCategory, location])

  return (
    <>
      <Hero />
      <SearchBar
        search={search}
        onSearchChange={setSearch}
        location={location}
        onLocationChange={setLocation}
        locations={cities}
      />

      <main className="px-6 py-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CategoryChips selected={selectedCategory} onSelect={setSelectedCategory} />
          <p className="text-gray-500">{t('home.activeListings', { count: listings.length })}</p>
        </div>

        {isLoading && <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>}
        {hasError && <p className="mt-10 text-center text-red-600">{t('common.loadError')}</p>}
        {!isLoading && !hasError && listings.length === 0 && (
          <p className="mt-10 text-center text-gray-500">{t('home.empty')}</p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
    </>
  )
}

export default Home
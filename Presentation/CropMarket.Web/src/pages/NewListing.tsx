import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { Category, Listing, Unit } from '../types'
import { createListing } from '../api/listings'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../hooks/useAuth'
import FormField from '../components/auth/FormField'
import CategoryPicker from '../components/new-listing/CategoryPicker'
import CitySelect from '../components/new-listing/CitySelect'
import UnitSelect from '../components/new-listing/UnitSelect'
import ListingPreview from '../components/new-listing/ListingPreview'

function NewListing() {
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState<Category>('vegetables')
  const [unitPrice, setUnitPrice] = useState('')
  const [unit, setUnit] = useState<Unit>('kg')
  const [availableQuantity, setAvailableQuantity] = useState('')
  const [location, setLocation] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (user === null) {
    return null
  }

  const isPriceInvalid = unitPrice !== '' && Number(unitPrice) <= 0
  const isFormValid =
    productName.trim() !== '' && Number(unitPrice) > 0 && Number(availableQuantity) > 0 && location !== ''

  const preview: Listing = {
    id: 0,
    productName: productName.trim() || t('newListing.namePlaceholder'),
    category,
    unitPrice: Number(unitPrice) || 0,
    unit,
    availableQuantity: Number(availableQuantity) || 0,
    location,
    farmerId: user.id,
    farmerName: user.fullName,
    createdAt: '',
  }

  async function handleSubmit(token: string) {
    setErrorKey('')
    setIsSubmitting(true)

    try {
      await createListing(
        {
          productName,
          category,
          unitPrice: Number(unitPrice),
          unit,
          availableQuantity: Number(availableQuantity),
          location,
        },
        token,
      )
      navigate('/')
    } catch (error) {
      // 401: the token has expired, so the user has to log in again
      if (error instanceof ApiError && error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (error instanceof ApiError && error.status === 400) {
        setErrorKey('newListing.invalid')
      } else {
        setErrorKey('common.loadError')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <h1 className="text-4xl font-extrabold">{t('newListing.title')}</h1>
      <p className="mt-2 text-gray-500">{t('newListing.subtitle')}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit(user.token)
          }}
          className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2 lg:p-10"
        >
          <FormField label={t('newListing.name')} value={productName} onChange={setProductName} placeholder={t('newListing.namePlaceholder')} />

          <div>
            <p className="font-semibold">{t('newListing.category')}</p>
            <CategoryPicker selected={category} onSelect={setCategory} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label={t('newListing.price')} type="number" value={unitPrice} onChange={setUnitPrice} placeholder="0" />
            <UnitSelect value={unit} onChange={setUnit} />
            <FormField label={t('newListing.quantity')} type="number" value={availableQuantity} onChange={setAvailableQuantity} placeholder="0" />
          </div>
          {isPriceInvalid && <p className="text-sm font-medium text-red-600">{t('newListing.priceError')}</p>}

          <CitySelect value={location} onChange={setLocation} />

          {errorKey && <p className="text-sm font-medium text-red-600">{t(errorKey)}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="rounded-xl bg-brand-700 px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
            >
              {isSubmitting ? t('common.loading') : t('newListing.publish')}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-xl border-2 border-brand-300 px-8 py-3 text-lg font-semibold text-brand-700 hover:border-brand-700"
            >
              {t('newListing.cancel')}
            </button>
          </div>
        </form>

        <ListingPreview listing={preview} />
      </div>
    </main>
  )
}

export default NewListing
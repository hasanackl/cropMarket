import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { Category, City, CreateListingRequest, EditableListing, Listing, Unit } from '../../types'
import { getCities } from '../../api/cities'
import { useAuth } from '../../hooks/useAuth'
import FormField from '../auth/FormField'
import CategoryPicker from './CategoryPicker'
import CitySelect from './CitySelect'
import UnitSelect from './UnitSelect'
import ImagePicker from './ImagePicker'
import ListingPreview from './ListingPreview'

// Same limit as the API (FR-12), checked here first so the user does not wait for an upload
const MAX_IMAGE_SIZE = 2 * 1024 * 1024

type ListingFormProps = {
  // The edit page passes the current values; the new-listing page passes null
  initial: EditableListing | null
  submitLabel: string
  errorKey: string
  isSubmitting: boolean
  onSubmit: (request: CreateListingRequest, image: File | null) => void
}

// One form for "New listing" (FR-02) and "Edit listing" (FR-10)
function ListingForm({ initial, submitLabel, errorKey, isSubmitting, onSubmit }: ListingFormProps) {
  const [productName, setProductName] = useState(initial ? initial.productName : '')
  const [category, setCategory] = useState<Category>(initial ? initial.category : 'vegetables')
  const [unitPrice, setUnitPrice] = useState(initial ? String(initial.unitPrice) : '')
  const [unit, setUnit] = useState<Unit>(initial ? initial.unit : 'kg')
  const [availableQuantity, setAvailableQuantity] = useState(initial ? String(initial.availableQuantity) : '')
  const [location, setLocation] = useState(initial ? initial.location : '')
  const [cities, setCities] = useState<City[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formErrorKey, setFormErrorKey] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    getCities()
      .then((data) => setCities(data))
      .catch(() => setFormErrorKey('common.loadError'))
  }, [])

  if (user === null) {
    return null
  }

  // Old orders show the listing's unit, so the API keeps it fixed once there are orders
  const isUnitLocked = initial !== null && initial.hasOrders
  const isPriceInvalid = unitPrice !== '' && Number(unitPrice) <= 0
  const isFormValid =
    productName.trim() !== '' && Number(unitPrice) > 0 && Number(availableQuantity) > 0 && location !== ''

  // Errors of this form (photo, cities) come first, then the page's errors (API)
  const shownErrorKey = formErrorKey || errorKey

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
    // A newly chosen photo wins; otherwise the current one (or the category icon)
    imageUrl: previewUrl ?? initial?.imageUrl ?? null,
  }

  function handleImageChange(file: File | null) {
    // Free the old preview from memory before making a new one
    if (previewUrl !== null) {
      URL.revokeObjectURL(previewUrl)
    }

    if (file !== null && file.size > MAX_IMAGE_SIZE) {
      setImage(null)
      setPreviewUrl(null)
      setFormErrorKey('newListing.photoTooLarge')
      return
    }

    setFormErrorKey('')
    setImage(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-3">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(
            {
              productName,
              category,
              unitPrice: Number(unitPrice),
              unit,
              availableQuantity: Number(availableQuantity),
              location,
            },
            image,
          )
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
          {isUnitLocked ? (
            <div className="font-semibold">
              {t('newListing.unit')}
              <p className="mt-2 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-normal text-gray-500">{t(`units.${unit}`)}</p>
            </div>
          ) : (
            <UnitSelect value={unit} onChange={setUnit} />
          )}
          <FormField label={t('newListing.quantity')} type="number" value={availableQuantity} onChange={setAvailableQuantity} placeholder="0" />
        </div>
        {isPriceInvalid && <p className="text-sm font-medium text-red-600">{t('newListing.priceError')}</p>}
        {isUnitLocked && <p className="text-sm text-amber-700">{t('editListing.unitLocked')}</p>}

        <CitySelect cities={cities} value={location} onChange={setLocation} />

        <ImagePicker fileName={image ? image.name : null} onChange={handleImageChange} />

        {shownErrorKey && <p className="text-sm font-medium text-red-600">{t(shownErrorKey)}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="rounded-xl bg-brand-700 px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
          >
            {isSubmitting ? t('common.loading') : submitLabel}
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
  )
}

export default ListingForm
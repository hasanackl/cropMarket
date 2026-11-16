import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import type { CreateListingRequest, EditableListing } from '../types'
import { getListingForEdit, updateListing, uploadListingImage } from '../api/listings'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../hooks/useAuth'
import ListingForm from '../components/new-listing/ListingForm'

// FR-10: the farmer changes an own listing; FR-12: and can replace its photo
function EditListing() {
  const { id } = useParams()
  const [listing, setListing] = useState<EditableListing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorKey, setErrorKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    if (user === null) {
      return
    }

    getListingForEdit(Number(id), user.token)
      .then((data) => setListing(data))
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false))
  }, [id, user])

  if (user === null) {
    return null
  }

  async function handleSubmit(request: CreateListingRequest, image: File | null, token: string) {
    setErrorKey('')
    setIsSubmitting(true)

    try {
      await updateListing(Number(id), request, token)

      if (image !== null) {
        await uploadListingImage(Number(id), image, token)
      }

      navigate('/farmer/listings')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (error instanceof ApiError && error.status === 400) {
        setErrorKey('newListing.invalid')
      } else if (error instanceof ApiError && error.status === 409) {
        setErrorKey('editListing.stockChanged')
      } else {
        setErrorKey('common.loadError')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <h1 className="text-4xl font-extrabold">{t('editListing.title')}</h1>
      <p className="mt-2 text-gray-500">{t('editListing.subtitle')}</p>

      {isLoading && <p className="mt-10 text-center text-gray-500">{t('common.loading')}</p>}
      {hasError && <p className="mt-10 text-center text-red-600">{t('common.loadError')}</p>}
      {!isLoading && !hasError && listing === null && (
        <p className="mt-10 text-center text-gray-500">{t('editListing.notFound')}</p>
      )}

      {/* The form is drawn only after loading, so its fields start with the current values */}
      {listing && (
        <ListingForm
          initial={listing}
          submitLabel={t('editListing.save')}
          errorKey={errorKey}
          isSubmitting={isSubmitting}
          onSubmit={(request, image) => handleSubmit(request, image, user.token)}
        />
      )}
    </main>
  )
}

export default EditListing
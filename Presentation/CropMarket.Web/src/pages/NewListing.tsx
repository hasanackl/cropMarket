import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import type { CreateListingRequest } from '../types'
import { createListing, uploadListingImage } from '../api/listings'
import { ApiError } from '../api/ApiError'
import { useAuth } from '../hooks/useAuth'
import ListingForm from '../components/new-listing/ListingForm'

function NewListing() {
  const [errorKey, setErrorKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (user === null) {
    return null
  }

  async function handleSubmit(request: CreateListingRequest, image: File | null, token: string) {
    setErrorKey('')
    setIsSubmitting(true)

    try {
      // FR-02: first the listing, then (if chosen) its photo (FR-12)
      const listing = await createListing(request, token)

      if (image !== null) {
        try {
          await uploadListingImage(listing.id, image, token)
        } catch {
          // The listing exists already; the farmer can add the photo on the edit page
          navigate(`/farmer/listings/${listing.id}/edit`)
          return
        }
      }

      navigate(`/listings/${listing.id}`)
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

      <ListingForm
        initial={null}
        submitLabel={t('newListing.publish')}
        errorKey={errorKey}
        isSubmitting={isSubmitting}
        onSubmit={(request, image) => handleSubmit(request, image, user.token)}
      />
    </main>
  )
}

export default NewListing
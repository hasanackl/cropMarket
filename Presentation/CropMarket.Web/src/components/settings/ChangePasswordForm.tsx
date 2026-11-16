import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { changePassword } from '../../api/auth'
import { ApiError } from '../../api/ApiError'
import { useAuth } from '../../hooks/useAuth'
import { MIN_PASSWORD_LENGTH } from '../../constants/password'
import FormField from '../auth/FormField'

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (user === null) {
    return null
  }

  const isTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH
  const isMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword
  const isValid = currentPassword !== '' && newPassword.length >= MIN_PASSWORD_LENGTH && confirmPassword === newPassword

  async function handleSubmit(token: string) {
    setErrorKey('')
    setIsSaved(false)
    setIsSubmitting(true)

    try {
      await changePassword({ currentPassword, newPassword }, token)

      // Empty the fields so the passwords don't stay on the screen
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsSaved(true)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
        navigate('/login')
        return
      }

      if (error instanceof ApiError && error.status === 400) {
        setErrorKey('settings.wrongPassword')
      } else {
        setErrorKey('common.loadError')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleSubmit(user.token)
      }}
      className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold">{t('settings.changePassword')}</h2>

      <FormField
        label={t('settings.currentPassword')}
        type="password"
        value={currentPassword}
        onChange={setCurrentPassword}
        autoComplete="current-password"
      />
      <FormField
        label={t('settings.newPassword')}
        type="password"
        value={newPassword}
        onChange={setNewPassword}
        autoComplete="new-password"
      />
      {isTooShort && (
        <p className="text-sm font-medium text-red-600">{t('auth.passwordTooShort', { count: MIN_PASSWORD_LENGTH })}</p>
      )}
      <FormField
        label={t('settings.confirmPassword')}
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
      />
      {isMismatch && <p className="text-sm font-medium text-red-600">{t('settings.mismatch')}</p>}

      {errorKey && <p className="text-sm font-medium text-red-600">{t(errorKey)}</p>}
      {isSaved && (
        <p className="text-sm font-medium text-brand-700">
          <FontAwesomeIcon icon={faCheck} className="mr-2" />
          {t('settings.saved')}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !isValid}
        className="rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
      >
        {isSubmitting ? t('common.loading') : t('settings.changePassword')}
      </button>
    </form>
  )
}

export default ChangePasswordForm
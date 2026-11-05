import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import type { UserRole } from '../types'
import { registerUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'
import RoleCard from '../components/auth/RoleCard'
import { faBasketShopping, faTractor } from '@fortawesome/free-solid-svg-icons'

const MIN_PASSWORD_LENGTH = 8

function Register() {
  const [role, setRole] = useState<UserRole>('consumer')
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const isPasswordShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH
  const isFormFilled =
    fullName.trim() !== '' && phoneNumber.trim() !== '' && email.trim() !== '' && password.length >= MIN_PASSWORD_LENGTH

  async function handleSubmit() {
    setErrorKey('')
    setIsSubmitting(true)

    try {
      const user = await registerUser({ fullName, email, password, phoneNumber, role })

      if (user === null) {
        setErrorKey('auth.emailTaken')
        return
      }

      login(user)
      navigate('/')
    } catch {
      setErrorKey('common.loadError')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-3xl font-extrabold">{t('auth.registerTitle')}</h1>
      <p className="mt-1 text-gray-500">{t('auth.registerSubtitle')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <RoleCard
          icon={faTractor}
          title={t('auth.farmerTitle')}
          text={t('auth.farmerText')}
          isSelected={role === 'farmer'}
          onSelect={() => setRole('farmer')}
        />
        <RoleCard
          icon={faBasketShopping}
          title={t('auth.consumerTitle')}
          text={t('auth.consumerText')}
          isSelected={role === 'consumer'}
          onSelect={() => setRole('consumer')}
        />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
        className="mt-6 space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('auth.fullName')} value={fullName} onChange={setFullName} autoComplete="name" />
          <FormField label={t('auth.phoneNumber')} type="tel" value={phoneNumber} onChange={setPhoneNumber} autoComplete="tel" placeholder="0532 000 00 00" />
        </div>
        <FormField label={t('auth.email')} type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FormField label={t('auth.password')} type="password" value={password} onChange={setPassword} autoComplete="new-password" />

        {isPasswordShort && <p className="text-sm font-medium text-red-600">{t('auth.passwordTooShort', { count: MIN_PASSWORD_LENGTH })}</p>}
        {errorKey && <p className="text-sm font-medium text-red-600">{t(errorKey)}</p>}

        <button
          type="submit"
          disabled={isSubmitting || !isFormFilled}
          className="w-full rounded-xl bg-brand-700 py-3 text-lg font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
        >
          {isSubmitting ? t('common.loading') : t('auth.createAccount')}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-500">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-brand-700">
          {t('nav.login')}
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register
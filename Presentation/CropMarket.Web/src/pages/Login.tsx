import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { loginUser } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import AuthLayout from '../components/auth/AuthLayout'
import FormField from '../components/auth/FormField'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  async function handleSubmit() {
    setErrorKey('')
    setIsSubmitting(true)

    try {
      const user = await loginUser({ email, password })

      if (user === null) {
        setErrorKey('auth.invalidCredentials')
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
      <h1 className="text-3xl font-extrabold">{t('auth.loginTitle')}</h1>
      <p className="mt-1 text-gray-500">{t('auth.loginSubtitle')}</p>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          handleSubmit()
        }}
        className="mt-6 space-y-4"
      >
        <FormField label={t('auth.email')} type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FormField label={t('auth.password')} type="password" value={password} onChange={setPassword} autoComplete="current-password" />

        {errorKey && <p className="text-sm font-medium text-red-600">{t(errorKey)}</p>}

        <button
          type="submit"
          disabled={isSubmitting || email.trim() === '' || password === ''}
          className="w-full rounded-xl bg-brand-700 py-3 text-lg font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
        >
          {isSubmitting ? t('common.loading') : t('nav.login')}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-500">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-semibold text-brand-700">
          {t('nav.register')}
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import Avatar from '../components/Avatar'
import ChangePasswordForm from '../components/settings/ChangePasswordForm'

function Settings() {
  const { user } = useAuth()
  const { t } = useTranslation()

  if (user === null) {
    return null
  }

  return (
    <main className="px-6 py-8 lg:px-10">
      <h1 className="text-4xl font-extrabold">{t('settings.title')}</h1>
      <p className="mt-2 text-gray-500">{t('settings.subtitle')}</p>

      <div className="mt-8 grid max-w-5xl items-start gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">{t('settings.account')}</h2>

          <div className="mt-4 flex items-center gap-3">
            <Avatar name={user.fullName} />
            <div>
              <p className="font-semibold">{user.fullName}</p>
              <p className="text-sm text-gray-500">{t(`roles.${user.role}`)}</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-gray-500">{t('auth.email')}</p>
          <p className="font-medium">{user.email}</p>
        </section>

        <ChangePasswordForm />
      </div>
    </main>
  )
}

export default Settings
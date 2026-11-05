import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons'
import AuthTabs from './AuthTabs'

const benefitKeys = ['auth.benefit1', 'auth.benefit2', 'auth.benefit3']

type AuthLayoutProps = {
  children: ReactNode
}

function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="hidden bg-linear-to-br from-brand-900 to-brand-500 px-16 py-20 text-white lg:block">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">{t('auth.kicker')}</p>
        <h1 className="mt-3 max-w-md text-4xl font-extrabold leading-tight">{t('auth.title')}</h1>
        <p className="mt-4 max-w-md text-white/80">{t('auth.text')}</p>

        <ul className="mt-8 space-y-3">
          {benefitKeys.map((key) => (
            <li key={key} className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCircleCheck} className="text-brand-300" />
              {t(key)}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white px-6 py-12 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-lg">
          <AuthTabs />
          {children}
        </div>
      </section>
    </main>
  )
}

export default AuthLayout
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

function NotFound() {
  const { t } = useTranslation()

  return (
    <main className="px-6 py-24 text-center lg:px-10">
      <p className="text-6xl font-extrabold text-brand-300">404</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-900">{t('notFound.title')}</h1>
      <p className="mt-2 text-gray-500">{t('notFound.text')}</p>
      <Link to="/" className="mt-6 inline-block rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white">
        {t('notFound.back')}
      </Link>
    </main>
  )
}

export default NotFound
import { useTranslation } from 'react-i18next'

function Hero() {
  const { t } = useTranslation()

  return (
    <section className="bg-linear-to-r from-brand-900 via-brand-700 to-brand-300 text-white">
      <div className="px-6 pb-16 pt-8 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">{t('home.kicker')}</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{t('home.title')}</h1>
        <p className="mt-3 max-w-xl text-white/80">{t('home.subtitle')}</p>
      </div>
    </section>
  )
}

export default Hero
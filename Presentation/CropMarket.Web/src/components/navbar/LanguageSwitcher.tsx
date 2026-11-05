import { useTranslation } from 'react-i18next'

const languages = ['en', 'tr']

function LanguageSwitcher() {
  const { i18n } = useTranslation()

  function changeLanguage(language: string) {
    i18n.changeLanguage(language)
    localStorage.setItem('language', language)
  }

  return (
    <div className="flex rounded-lg border border-gray-200 p-0.5 text-sm font-semibold">
      {languages.map((language) => (
        <button
          key={language}
          onClick={() => changeLanguage(language)}
          className={i18n.language === language ? 'rounded-md bg-brand-700 px-2 py-1 text-white' : 'rounded-md px-2 py-1 text-gray-500'}
        >
          {language.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
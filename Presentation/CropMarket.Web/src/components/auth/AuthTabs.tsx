import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

const tabs = [
  { labelKey: 'nav.login', href: '/login' },
  { labelKey: 'nav.register', href: '/register' },
]

function AuthTabs() {
  const { t } = useTranslation()

  return (
    <div className="mb-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.href}
          to={tab.href}
          className={({ isActive }) =>
            isActive
              ? 'rounded-lg bg-white py-2 text-center font-semibold text-brand-700 shadow-sm'
              : 'rounded-lg py-2 text-center font-medium text-gray-500 hover:text-brand-700'
          }
        >
          {t(tab.labelKey)}
        </NavLink>
      ))}
    </div>
  )
}

export default AuthTabs

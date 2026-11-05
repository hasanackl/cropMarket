import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import type { Role } from '../../types'
import { navLinks } from '../../constants/navLinks'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

type MobileMenuProps = {
  role: Role
  name: string
  onClose: () => void
}

function MobileMenu({ role, name, onClose }: MobileMenuProps) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()

function handleLogout() {
  logout()
  onClose()
  navigate('/')
}

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />

      <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white p-6 shadow-xl">
        <button onClick={onClose} aria-label={t('nav.closeMenu')} className="self-end text-2xl text-brand-900">
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <nav className="mt-4">
          {navLinks[role].map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? 'block rounded-lg bg-brand-50 px-3 py-2 font-semibold text-brand-700'
                  : 'block rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-brand-50'
              }
            >
              {t(link.labelKey)}
            </NavLink>
          ))}
        </nav>

        {role === 'guest' ? (
          <div className="mt-6 flex flex-col gap-3">
            <Link to="/login" onClick={onClose} className="rounded-xl border-2 border-brand-300 py-2 text-center font-semibold text-brand-700">
              {t('nav.login')}
            </Link>
            <Link to="/register" onClick={onClose} className="rounded-xl bg-brand-700 py-2 text-center font-semibold text-white">
              {t('nav.register')}
            </Link>
          </div>
        ) : (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-gray-500">{t(`roles.${role}`)}</p>

            {role === 'farmer' && (
              <Link to="/listings/new" onClick={onClose} className="mt-4 block rounded-xl bg-brand-700 py-2 text-center font-semibold text-white">
                {t('nav.newListing')}
              </Link>
            )}

            <button onClick={handleLogout} className="mt-3 w-full rounded-xl border-2 border-brand-300 py-2 font-semibold text-brand-700">
              {t('nav.logout')}
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}

export default MobileMenu
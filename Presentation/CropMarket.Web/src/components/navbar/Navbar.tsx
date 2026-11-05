import { useState } from 'react'
import type { Role } from '../../types'
import { navLinks } from '../../constants/navLinks'
import Logo from '../Logo'
import UserMenu from './UserMenu'
import MobileMenu from './MobileMenu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { NavLink } from 'react-router'

type NavbarProps = {
  role: Role
  name?: string
}

function Navbar({ role, name = '' }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-10">
        <div className="flex items-center gap-8">
          <Logo />

          <div className="hidden items-center gap-8 lg:flex">
            {navLinks[role].map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end
                className={({ isActive }) =>
                  isActive
                    ? 'border-b-2 border-brand-500 pb-1 font-semibold text-brand-700'
                    : 'border-b-2 border-transparent pb-1 font-medium text-gray-600 hover:text-brand-700'
                }
              >
                {t(link.labelKey)}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <UserMenu role={role} name={name} />

          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg px-2 text-2xl text-brand-900 lg:hidden"
            aria-label={t('nav.openMenu')}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </nav>

      {isOpen && <MobileMenu role={role} name={name} onClose={() => setIsOpen(false)} />}
    </header>
  )
}

export default Navbar
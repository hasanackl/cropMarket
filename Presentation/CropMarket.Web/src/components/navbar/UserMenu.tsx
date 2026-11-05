import { useTranslation } from 'react-i18next'
import type { Role } from '../../types'
import Avatar from '../Avatar'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

type UserMenuProps = {
  role: Role
  name: string
}

function UserMenu({ role, name }: UserMenuProps) {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const navigate = useNavigate()

function handleLogout() {
  logout()
  navigate('/')
}

  if (role === 'guest') {
    return (
      <div className="hidden items-center gap-3 lg:flex">
        <Link to="/login" className="rounded-xl border-2 border-brand-300 px-5 py-2 font-semibold text-brand-700">
          {t('nav.login')}
        </Link>
        <Link to="/register" className="rounded-xl bg-brand-700 px-5 py-2 font-semibold text-white shadow-md">
          {t('nav.register')}
        </Link>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-4 lg:flex">
      {role === 'farmer' && (
        <Link to="/listings/new" className="rounded-xl bg-brand-700 px-5 py-2 font-semibold text-white shadow-md">
          {t('nav.newListing')}
        </Link>
      )}

      <div className="flex items-center gap-2">
        <Avatar name={name} />
        <div>
          <p className="font-semibold leading-tight">{name}</p>
          <p className="text-sm text-gray-500">{t(`roles.${role}`)}</p>
        </div>
      </div>

      <button onClick={handleLogout} className="rounded-xl border-2 border-brand-300 px-4 py-2 font-semibold text-brand-700">
        {t('nav.logout')}
      </button>
    </div>
  )
}

export default UserMenu
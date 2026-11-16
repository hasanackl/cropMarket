import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

type OrderNoticeProps = {
  message: string
  showLogin?: boolean
}

function OrderNotice({ message, showLogin = false }: OrderNoticeProps) {
  const { t } = useTranslation()

  return (
    <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <p className="flex items-start gap-3 text-amber-900">
        <FontAwesomeIcon icon={faCircleInfo} className="mt-1" />
        {message}
      </p>

      {showLogin && (
        <Link to="/login" className="mt-4 block rounded-xl bg-brand-700 py-3 text-center font-semibold text-white hover:bg-brand-900">
          {t('nav.login')}
        </Link>
      )}
    </div>
  )
}

export default OrderNotice
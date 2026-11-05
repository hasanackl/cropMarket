import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSeedling } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-300 to-brand-700 text-xl text-white">
        <FontAwesomeIcon icon={faSeedling} />
      </span>
      <span className="text-2xl font-extrabold text-brand-900">Crop Market</span>
    </Link>
  )
}

export default Logo
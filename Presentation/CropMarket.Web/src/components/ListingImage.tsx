import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLeaf } from '@fortawesome/free-solid-svg-icons'
import { categoryChips } from '../constants/categoryChips'

type ListingImageProps = {
  category: string
  className: string
  // Small pictures (table rows, notifications) need a smaller icon
  iconSize?: string
}

// Week 4 has no photo upload, so every listing shows its category icon
function ListingImage({ category, className, iconSize = 'text-6xl' }: ListingImageProps) {
  const chip = categoryChips.find((c) => c.name === category)

  return (
    <div className={`${className} flex items-center justify-center bg-linear-to-br from-brand-50 to-brand-300`}>
      <FontAwesomeIcon icon={chip ? chip.icon : faLeaf} className={`${iconSize} text-brand-700`} />
    </div>
  )
}

export default ListingImage
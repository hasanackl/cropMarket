import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLeaf } from '@fortawesome/free-solid-svg-icons'
import { categoryChips } from '../constants/categoryChips'

const API_URL = import.meta.env.VITE_API_URL

type ListingImageProps = {
  category: string
  className: string
  // Uploaded photo (FR-12); without one the category icon is shown
  imageUrl?: string | null
  name?: string
  // Small pictures (table rows, notifications) need a smaller icon
  iconSize?: string
}

function ListingImage({ category, className, imageUrl = null, name = '', iconSize = 'text-6xl' }: ListingImageProps) {
  if (imageUrl !== null) {
    // Paths like /uploads/x.jpg live on the API; blob: URLs are local previews of a chosen file
    const src = imageUrl.startsWith('/') ? `${API_URL}${imageUrl}` : imageUrl

    return <img src={src} alt={name} className={`${className} object-cover`} />
  }

  const chip = categoryChips.find((c) => c.name === category)

  return (
    <div className={`${className} flex items-center justify-center bg-linear-to-br from-brand-50 to-brand-300`}>
      <FontAwesomeIcon icon={chip ? chip.icon : faLeaf} className={`${iconSize} text-brand-700`} />
    </div>
  )
}

export default ListingImage
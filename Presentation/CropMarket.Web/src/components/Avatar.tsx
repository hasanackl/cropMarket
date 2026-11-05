import { getInitials } from '../utils/getInitials'

type AvatarProps = {
  name: string
  small?: boolean
}

function Avatar({ name, small = false }: AvatarProps) {
  const size = small ? 'h-8 w-8 text-xs' : 'h-10 w-10'

  return (
    <span className={`flex ${size} items-center justify-center rounded-full bg-brand-500 font-bold text-white`}>
      {getInitials(name)}
    </span>
  )
}

export default Avatar
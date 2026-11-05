import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faAppleWhole, faBottleDroplet, faCarrot, faEgg, faLeaf, faWheatAwn } from '@fortawesome/free-solid-svg-icons'
import type { CategoryFilter } from '../types'

type CategoryChip = {
  name: CategoryFilter
  icon: IconDefinition
}

export const categoryChips: CategoryChip[] = [
  { name: 'all', icon: faLeaf },
  { name: 'vegetables', icon: faCarrot },
  { name: 'fruits', icon: faAppleWhole },
  { name: 'grains', icon: faWheatAwn },
  { name: 'oilOlives', icon: faBottleDroplet },
  { name: 'dairyEggs', icon: faEgg },
]
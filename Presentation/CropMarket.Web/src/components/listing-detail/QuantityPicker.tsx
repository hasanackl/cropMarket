import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons'

type QuantityPickerProps = {
  value: number
  max: number
  onChange: (value: number) => void
}

function QuantityPicker({ value, max, onChange }: QuantityPickerProps) {
  const { t } = useTranslation()

  function change(newValue: number) {
    onChange(Math.min(Math.max(newValue, 1), max))
  }

  return (
    <div className="mt-2 inline-flex items-center overflow-hidden rounded-xl border-2 border-gray-200">
      <button
        type="button"
        onClick={() => change(value - 1)}
        disabled={value <= 1}
        aria-label={t('order.decrease')}
        className="px-4 py-3 text-brand-700 hover:bg-brand-50 disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <input
        type="number"
        value={value}
        onChange={(event) => change(Number(event.target.value))}
        className="w-20 text-center text-lg font-bold outline-none"
      />
      <button
        type="button"
        onClick={() => change(value + 1)}
        disabled={value >= max}
        aria-label={t('order.increase')}
        className="px-4 py-3 text-brand-700 hover:bg-brand-50 disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </div>
  )
}

export default QuantityPicker
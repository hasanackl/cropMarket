import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MyOrder, UpdateOrderRequest } from '../../types'

type EditOrderFormProps = {
  order: MyOrder
  errorKey: string
  isSaving: boolean
  onSave: (request: UpdateOrderRequest) => void
  onCancel: () => void
}

function EditOrderForm({ order, errorKey, isSaving, onSave, onCancel }: EditOrderFormProps) {
  const [quantity, setQuantity] = useState(String(order.quantity))
  const [address, setAddress] = useState(order.deliveryAddress)
  const { t } = useTranslation()

  // Same rule as the API: quantity is locked once the farmer starts preparing
  const canChangeQuantity = order.status === 'pending'
  // Only kilograms can have decimals (same rule as the API, NFR-02)
  const step = order.unit === 'kg' ? 0.5 : 1
  const isValid = Number(quantity) > 0 && address.trim() !== ''

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSave({ quantity: Number(quantity), deliveryAddress: address })
      }}
      className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-[12rem_1fr]"
    >
      <label className="block font-semibold">
        {t('order.quantity', { unit: t(`units.${order.unit}`) })}
        <input
          type="number"
          min={step}
          step={step}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          disabled={!canChangeQuantity}
          className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-normal outline-none focus:border-brand-500 disabled:bg-gray-100 disabled:text-gray-400"
        />
      </label>

      <label className="block font-semibold">
        {t('order.address')}
        <input
          value={address}
          maxLength={250}
          onChange={(event) => setAddress(event.target.value)}
          className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
        />
      </label>

      {!canChangeQuantity && <p className="text-sm text-amber-700 sm:col-span-2">{t('myOrders.quantityLocked')}</p>}
      {errorKey && <p className="text-sm font-medium text-red-600 sm:col-span-2">{t(errorKey)}</p>}

      <div className="flex gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={isSaving || !isValid}
          className="rounded-xl bg-brand-700 px-5 py-2 font-semibold text-white shadow-md hover:bg-brand-900 disabled:opacity-50"
        >
          {t('myOrders.save')}
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border-2 border-gray-200 px-5 py-2 font-semibold text-gray-600 hover:border-gray-400">
          {t('myOrders.cancel')}
        </button>
      </div>
    </form>
  )
}

export default EditOrderForm
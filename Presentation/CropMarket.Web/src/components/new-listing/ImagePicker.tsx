import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faXmark } from '@fortawesome/free-solid-svg-icons'

type ImagePickerProps = {
  fileName: string | null
  onChange: (file: File | null) => void
}

function ImagePicker({ fileName, onChange }: ImagePickerProps) {
  const { t } = useTranslation()

  return (
    <div>
      <p className="font-semibold">{t('newListing.photo')}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-xl border-2 border-dashed border-brand-300 px-5 py-3 font-semibold text-brand-700 hover:border-brand-700">
          <FontAwesomeIcon icon={faCamera} className="mr-2" />
          {fileName ? t('newListing.changePhoto') : t('newListing.choosePhoto')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              onChange(event.target.files?.[0] ?? null)
              event.target.value = ''
            }}
          />
        </label>

        {fileName && (
          <>
            <span className="text-gray-500">{fileName}</span>
            <button type="button" onClick={() => onChange(null)} className="text-sm font-semibold text-red-600 hover:underline">
              <FontAwesomeIcon icon={faXmark} className="mr-1" />
              {t('newListing.removePhoto')}
            </button>
          </>
        )}
      </div>

      <p className="mt-1 text-sm text-gray-500">{t('newListing.photoHint')}</p>
    </div>
  )
}

export default ImagePicker
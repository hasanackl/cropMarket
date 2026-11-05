type FormFieldProps = {
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
}

function FormField({ label, type = 'text', value, onChange, autoComplete, placeholder }: FormFieldProps) {
  return (
    <label className="block font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border-2 border-gray-200 px-4 py-3 font-normal outline-none focus:border-brand-500"
      />
    </label>
  )
}

export default FormField
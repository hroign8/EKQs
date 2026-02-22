import { forwardRef } from 'react'

const BASE = 'w-full px-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-gold-500 outline-none transition-all'

/** Labelled text / number / email / date input */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, required, error, className = '', ...props }, ref) => (
    <div>
      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input ref={ref} className={`${BASE} ${error ? 'ring-2 ring-red-400' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
FormInput.displayName = 'FormInput'

/** Labelled <select> */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  required?: boolean
  error?: string
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, required, error, className = '', children, ...props }, ref) => (
    <div>
      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select ref={ref} className={`${BASE} ${error ? 'ring-2 ring-red-400' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
FormSelect.displayName = 'FormSelect'

/** Labelled <textarea> */
interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  error?: string
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, required, error, className = '', ...props }, ref) => (
    <div>
      <label className="block text-sm font-semibold text-burgundy-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea ref={ref} className={`${BASE} resize-none ${error ? 'ring-2 ring-red-400' : ''} ${className}`} {...props} />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
FormTextarea.displayName = 'FormTextarea'

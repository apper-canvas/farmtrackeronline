import { forwardRef } from 'react'

const Textarea = forwardRef(({ 
  label, 
  error, 
  helper, 
  className = '',
  required = false,
  rows = 3,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          form-input resize-vertical
          ${error ? 'border-error focus:ring-error focus:border-error' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea
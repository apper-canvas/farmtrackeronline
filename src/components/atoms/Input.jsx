import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  helper, 
  type = 'text',
  className = '',
  required = false,
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
      <input
        ref={ref}
        type={type}
        className={`
          form-input
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

Input.displayName = 'Input'

export default Input
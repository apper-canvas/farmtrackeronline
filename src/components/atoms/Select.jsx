import { forwardRef } from 'react'

const Select = forwardRef(({ 
  label, 
  error, 
  helper, 
  children,
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
      <select
        ref={ref}
        className={`
          form-input
          ${error ? 'border-error focus:ring-error focus:border-error' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

export default Select
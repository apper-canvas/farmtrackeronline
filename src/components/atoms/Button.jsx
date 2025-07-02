import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 hover:border-gray-400 focus:ring-primary-500',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500 shadow-sm hover:shadow-md',
    danger: 'bg-error hover:bg-red-600 text-white focus:ring-red-500 shadow-sm hover:shadow-md',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-primary-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  const disabledClasses = 'opacity-50 cursor-not-allowed'
  
  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? disabledClasses : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      {...props}
    >
      {loading && (
        <ApperIcon 
          name="Loader2" 
          className={`animate-spin ${children ? 'mr-2' : ''}`}
          size={16}
        />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon 
          name={icon} 
          className={children ? 'mr-2' : ''} 
          size={16}
        />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon 
          name={icon} 
          className={children ? 'ml-2' : ''} 
          size={16}
        />
      )}
    </motion.button>
  )
}

export default Button
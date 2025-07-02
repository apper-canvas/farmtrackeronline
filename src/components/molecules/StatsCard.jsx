import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  className = '' 
}) => {
  const colors = {
    primary: 'text-primary-600 bg-primary-50',
    secondary: 'text-secondary-600 bg-secondary-50',
    accent: 'text-accent-600 bg-accent-50',
    success: 'text-success bg-green-50',
    warning: 'text-warning bg-yellow-50',
    error: 'text-error bg-red-50'
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`card p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-display">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === 'up' ? 'TrendingUp' : 'TrendingDown'}
                className={`mr-1 ${trend === 'up' ? 'text-success' : 'text-error'}`}
                size={16}
              />
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-success' : 'text-error'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-full ${colors[color]}`}>
            <ApperIcon name={icon} size={24} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default StatsCard
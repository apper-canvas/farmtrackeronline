import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Empty = ({ 
  icon = "FileX",
  title = "No data found",
  message = "Get started by adding your first item.",
  action,
  actionLabel = "Add New"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ApperIcon name={icon} className="text-gray-400" size={40} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {message}
      </p>
      
      {action && (
        <Button
          onClick={action}
          icon="Plus"
          variant="primary"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default Empty
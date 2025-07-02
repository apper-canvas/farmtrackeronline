import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Error = ({ 
  message = "Something went wrong. Please try again.", 
  onRetry,
  title = "Oops!"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8 text-center max-w-md mx-auto"
    >
      <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <ApperIcon name="AlertTriangle" className="text-error" size={32} />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          icon="RefreshCw"
          className="mx-auto"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

export default Error
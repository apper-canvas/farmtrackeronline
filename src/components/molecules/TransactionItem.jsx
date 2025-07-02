import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === 'income'
  
  const getCategoryIcon = (category) => {
    const iconMap = {
      // Income categories
      'crop-sales': 'DollarSign',
      'livestock': 'Beef',
      'equipment-rental': 'Truck',
      'subsidies': 'FileText',
      'other-income': 'Plus',
      
      // Expense categories
      'seeds': 'Seed',
      'fertilizers': 'Zap',
      'equipment': 'Wrench',
      'labor': 'Users',
      'fuel': 'Fuel',
      'supplies': 'Package',
      'maintenance': 'Settings',
      'other-expense': 'Minus'
    }
    return iconMap[category] || 'DollarSign'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 border-l-4 border-l-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-2 rounded-lg ${isIncome ? 'bg-success/10' : 'bg-error/10'}`}>
            <ApperIcon 
              name={getCategoryIcon(transaction.category)}
              className={isIncome ? 'text-success' : 'text-error'}
              size={20}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 capitalize">
                {transaction.category.replace('-', ' ')}
              </h4>
              <span className={`font-bold ${isIncome ? 'text-success' : 'text-error'}`}>
                {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
              </span>
            </div>
<p className="text-sm text-gray-600 mb-2">
              {transaction.description || 'No description provided'}
            </p>
            
            {transaction.images && transaction.images.length > 0 && (
              <div className="flex space-x-2 mb-2 overflow-x-auto">
                {transaction.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img 
                      src={image.data} 
                      alt={image.name}
                      className="w-12 h-12 object-cover rounded border border-gray-200"
                    />
                  </div>
                ))}
                {transaction.images.length > 3 && (
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{transaction.images.length - 3}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
<span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
              <span>{transaction.farm_name || 'All Farms'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => onEdit(transaction)}
            className="opacity-60 hover:opacity-100"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete(transaction.Id)}
            className="opacity-60 hover:opacity-100 text-error hover:text-error"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionItem
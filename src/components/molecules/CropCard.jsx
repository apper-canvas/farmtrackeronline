import { motion } from 'framer-motion'
import { format, differenceInDays } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'

const CropCard = ({ crop, onEdit, onDelete }) => {
  const daysToHarvest = differenceInDays(new Date(crop.expectedHarvest), new Date())
  const isReadyToHarvest = daysToHarvest <= 7 && daysToHarvest >= 0
  const isOverdue = daysToHarvest < 0
  
  const getStatusVariant = (status) => {
    const variants = {
      'planted': 'info',
      'growing': 'success',
      'ready': 'warning',
      'harvested': 'default'
    }
    return variants[status] || 'default'
  }
  
  const getCropIcon = (type) => {
    const iconMap = {
      'corn': 'Wheat',
      'tomatoes': 'Cherry',
      'potatoes': 'Circle',
      'wheat': 'Wheat',
      'carrots': 'Carrot',
      'lettuce': 'Leaf',
      'beans': 'Grape',
      'peppers': 'Flame'
    }
    return iconMap[type?.toLowerCase()] || 'Wheat'
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="card p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <ApperIcon 
              name={getCropIcon(crop.type)} 
              className="text-primary-600" 
              size={24} 
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 font-display">{crop.type}</h3>
            <p className="text-sm text-gray-600">{crop.field}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusVariant(crop.status)}>
            {crop.status}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            icon="MoreVertical"
            className="opacity-60 hover:opacity-100"
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Planted:</span>
          <span className="font-medium">{format(new Date(crop.plantingDate), 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Expected Harvest:</span>
          <span className={`font-medium ${isOverdue ? 'text-error' : isReadyToHarvest ? 'text-warning' : ''}`}>
            {format(new Date(crop.expectedHarvest), 'MMM d, yyyy')}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Days to Harvest:</span>
          <span className={`font-medium ${isOverdue ? 'text-error' : isReadyToHarvest ? 'text-warning' : 'text-success'}`}>
            {isOverdue ? 'Overdue' : daysToHarvest === 0 ? 'Today' : `${daysToHarvest} days`}
          </span>
        </div>
{(crop.notes || (crop.images && crop.images.length > 0)) && (
          <div className="pt-3 border-t border-gray-200 space-y-3">
            {crop.notes && (
              <p className="text-sm text-gray-600">{crop.notes}</p>
            )}
            
            {crop.images && crop.images.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto">
                {crop.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img 
                      src={image.data} 
                      alt={image.name}
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                  </div>
                ))}
                {crop.images.length > 3 && (
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">+{crop.images.length - 3}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          icon="Edit"
          onClick={() => onEdit(crop)}
        />
        <Button
          variant="ghost"
          size="sm"
          icon="Trash2"
          onClick={() => onDelete(crop.Id)}
          className="text-error hover:text-error"
        />
      </div>
    </motion.div>
  )
}

export default CropCard
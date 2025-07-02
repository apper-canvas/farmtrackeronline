import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const FarmCard = ({ farm, onEdit, onDelete, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="card p-6 cursor-pointer"
      onClick={() => onSelect(farm)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary-50 rounded-lg">
            <ApperIcon name="MapPin" className="text-primary-600" size={24} />
          </div>
          <div>
<h3 className="font-semibold text-gray-900 font-display">{farm.Name}</h3>
            <p className="text-sm text-gray-600">{farm.location}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => onEdit(farm)}
            className="opacity-60 hover:opacity-100"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete(farm.Id)}
            className="opacity-60 hover:opacity-100 text-error hover:text-error"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900 font-display">
            {farm.size}
          </p>
          <p className="text-xs text-gray-600 uppercase tracking-wide">
{farm.size_unit}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-900 font-display">
{farm.active_crops || 0}
          </p>
          <p className="text-xs text-gray-600 uppercase tracking-wide">
            Active Crops
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Created:</span>
<span>{new Date(farm.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default FarmCard
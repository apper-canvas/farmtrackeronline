import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Badge from '@/components/atoms/Badge'

const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed
  const isDueToday = format(new Date(task.dueDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  
  const getTaskIcon = (type) => {
    const iconMap = {
      'watering': 'Droplets',
      'fertilizing': 'Zap',
      'harvesting': 'Scissors',
      'planting': 'Seed',
      'weeding': 'Trash2',
      'inspection': 'Eye',
      'maintenance': 'Wrench',
      'other': 'CheckSquare'
    }
    return iconMap[type] || 'CheckSquare'
  }
  
  const getPriorityColor = () => {
    if (isOverdue) return 'error'
    if (isDueToday) return 'warning'
    return 'default'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        card p-4 border-l-4 
        ${task.completed ? 'border-l-success bg-green-50/50' : 
          isOverdue ? 'border-l-error' : 
          isDueToday ? 'border-l-warning' : 'border-l-primary-500'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => onToggleComplete(task.Id)}
            className={`
              mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${task.completed 
                ? 'bg-success border-success text-white' 
                : 'border-gray-300 hover:border-primary-500'
              }
            `}
          >
            {task.completed && <ApperIcon name="Check" size={12} />}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <ApperIcon 
                name={getTaskIcon(task.type)} 
                className={`${task.completed ? 'text-gray-400' : 'text-primary-600'}`}
                size={16}
              />
              <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {task.title}
              </h4>
              <Badge variant={getPriorityColor()} size="sm">
                {format(new Date(task.dueDate), 'MMM d')}
              </Badge>
            </div>
            
            <p className={`text-sm ${task.completed ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              {task.notes || 'No additional notes'}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <ApperIcon name="MapPin" className="mr-1" size={12} />
                Farm: {task.farmName || 'Unknown'}
              </span>
              {task.cropType && (
                <span className="flex items-center">
                  <ApperIcon name="Wheat" className="mr-1" size={12} />
                  {task.cropType}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            icon="Edit"
            onClick={() => onEdit(task)}
            className="opacity-60 hover:opacity-100"
          />
          <Button
            variant="ghost"
            size="sm"
            icon="Trash2"
            onClick={() => onDelete(task.Id)}
            className="opacity-60 hover:opacity-100 text-error hover:text-error"
          />
        </div>
      </div>
    </motion.div>
  )
}

export default TaskItem
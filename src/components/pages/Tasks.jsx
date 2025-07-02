import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns'
import Modal from 'react-modal'
import TaskItem from '@/components/molecules/TaskItem'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Textarea from '@/components/atoms/Textarea'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import taskService from '@/services/api/taskService'
import farmService from '@/services/api/farmService'
import cropService from '@/services/api/cropService'

// Set app element for accessibility
Modal.setAppElement('#root')
const Tasks = () => {
  const [tasks, setTasks] = useState([])
  const [farms, setFarms] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [formData, setFormData] = useState({
    farmId: '',
    cropId: '',
    title: '',
    type: 'other',
    dueDate: '',
    notes: ''
  })
  
  const taskTypes = [
    { value: 'watering', label: 'Watering', icon: 'Droplets' },
    { value: 'fertilizing', label: 'Fertilizing', icon: 'Zap' },
    { value: 'harvesting', label: 'Harvesting', icon: 'Scissors' },
    { value: 'planting', label: 'Planting', icon: 'Seed' },
    { value: 'weeding', label: 'Weeding', icon: 'Trash2' },
    { value: 'inspection', label: 'Inspection', icon: 'Eye' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { value: 'other', label: 'Other', icon: 'CheckSquare' }
  ]
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ])
      setTasks(tasksData)
      setFarms(farmsData)
      setCrops(cropsData)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'completed') return task.completed
    if (filterStatus === 'pending') return !task.completed
    return true
  })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const taskData = {
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        completed: editingTask ? editingTask.completed : false
      }
      
      if (editingTask) {
        await taskService.update(editingTask.Id, taskData)
        setTasks(tasks.map(t => t.Id === editingTask.Id ? { ...taskData, Id: editingTask.Id } : t))
        toast.success('Task updated successfully!')
      } else {
        const newTask = await taskService.create(taskData)
        setTasks([...tasks, newTask])
        toast.success('Task added successfully!')
      }
      
      resetForm()
    } catch (err) {
      toast.error('Failed to save task')
    }
  }
  
  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId)
      const updatedTask = { ...task, completed: !task.completed }
      await taskService.update(taskId, updatedTask)
      setTasks(tasks.map(t => t.Id === taskId ? updatedTask : t))
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task marked as pending')
    } catch (err) {
      toast.error('Failed to update task')
    }
  }
  
const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      farmId: task.farm_id,
      cropId: task.crop_id || '',
      title: task.title,
      type: task.type,
      dueDate: task.due_date.split('T')[0],
      notes: task.notes || ''
    })
    setShowForm(true)
  }
  
  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    
    try {
      await taskService.delete(taskId)
      setTasks(tasks.filter(t => t.Id !== taskId))
      toast.success('Task deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }
  
  const resetForm = () => {
    setFormData({
      farmId: '',
      cropId: '',
      title: '',
      type: 'other',
      dueDate: '',
      notes: ''
    })
    setEditingTask(null)
    setShowForm(false)
  }
  
  const getWeekDays = () => {
    const start = startOfWeek(currentWeek)
    const end = endOfWeek(currentWeek)
    return eachDayOfInterval({ start, end })
  }
  
  const getTasksForDay = (day) => {
    return filteredTasks.filter(task => isSameDay(new Date(task.dueDate), day))
  }
  
  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your farm activities and schedules</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          variant="primary"
        >
          Add Task
        </Button>
      </div>
      
      {/* View Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="List" className="mr-2" size={16} />
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name="Calendar" className="mr-2" size={16} />
              Calendar View
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {viewMode === 'calendar' && (
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
              variant="ghost"
              size="sm"
              icon="ChevronLeft"
            />
            <span className="font-medium">
              {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
            </span>
            <Button
              onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
              variant="ghost"
              size="sm"
              icon="ChevronRight"
            />
          </div>
        )}
      </div>
      
{/* Add/Edit Task Form Modal */}
      <Modal
        isOpen={showForm}
        onRequestClose={resetForm}
        className="modal-content"
        overlayClassName="modal-overlay"
        closeTimeoutMS={200}
      >
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 font-display">
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </h3>
                  <Button
                    onClick={resetForm}
                    variant="ghost"
                    size="sm"
                    icon="X"
                  />
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Task Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., Water tomatoes in greenhouse"
                  />
                  
                  <Select
                    label="Task Type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    {taskTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                  
                  <Select
                    label="Farm"
                    value={formData.farmId}
                    onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                    required
                  >
                    <option value="">Select a farm</option>
                    {farms.map(farm => (
                      <option key={farm.Id} value={farm.Id}>
                        {farm.name} - {farm.location}
                      </option>
                    ))}
                  </Select>
                  
                  <Select
                    label="Related Crop (Optional)"
                    value={formData.cropId}
                    onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
>
                    <option value="">No specific crop</option>
                    {crops.filter(crop => crop.farm_id === parseInt(formData.farmId)).map(crop => (
                      <option key={crop.Id} value={crop.Id}>
                        {crop.type} - {crop.field}
                      </option>
                    ))}
                  </Select>
                  
                  <Input
                    label="Due Date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                  
                  <div className="md:col-span-2">
                    <Textarea
                      label="Notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional details about this task..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex items-center justify-end space-x-4">
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon={editingTask ? 'Save' : 'Plus'}
                    >
                      {editingTask ? 'Update Task' : 'Add Task'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
      
      {/* Tasks Display */}
      {filteredTasks.length === 0 ? (
        <Empty
          icon="CheckSquare"
          title="No tasks found"
          message="Create your first task to start organizing your farm activities."
          action={() => setShowForm(true)}
          actionLabel="Add Task"
        />
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredTasks
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .map(task => (
              <TaskItem
                key={task.Id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
        </div>
      ) : (
        <div className="card p-6">
          <div className="grid grid-cols-7 gap-4">
            {getWeekDays().map(day => (
              <div key={day.toISOString()} className="min-h-[200px]">
                <div className="text-center mb-3">
                  <div className="text-sm font-medium text-gray-500">
                    {format(day, 'EEE')}
                  </div>
                  <div className={`text-lg font-bold ${
                    isSameDay(day, new Date()) 
                      ? 'text-primary-600 bg-primary-50 w-8 h-8 rounded-full flex items-center justify-center mx-auto'
                      : 'text-gray-900'
                  }`}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {getTasksForDay(day).map(task => (
                    <div
                      key={task.Id}
                      className={`p-2 rounded text-xs border-l-2 cursor-pointer transition-colors ${
                        task.completed 
                          ? 'bg-green-50 border-l-success text-green-700'
                          : 'bg-gray-50 border-l-primary-500 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleEdit(task)}
                    >
                      <div className="font-medium truncate">{task.title}</div>
                      <div className="text-gray-500 capitalize">{task.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Tasks
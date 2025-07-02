import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import CropCard from '@/components/molecules/CropCard'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Textarea from '@/components/atoms/Textarea'
import Badge from '@/components/atoms/Badge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import cropService from '@/services/api/cropService'
import farmService from '@/services/api/farmService'

const Crops = () => {
  const [crops, setCrops] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    farmId: '',
    type: '',
    field: '',
    plantingDate: '',
    expectedHarvest: '',
    status: 'planted',
    notes: ''
  })
  
  const cropTypes = [
    'Corn', 'Wheat', 'Soybeans', 'Tomatoes', 'Potatoes', 'Carrots', 
    'Lettuce', 'Peppers', 'Beans', 'Rice', 'Barley', 'Other'
  ]
  
  const statusOptions = [
    { value: 'planted', label: 'Planted', variant: 'info' },
    { value: 'growing', label: 'Growing', variant: 'success' },
    { value: 'ready', label: 'Ready to Harvest', variant: 'warning' },
    { value: 'harvested', label: 'Harvested', variant: 'default' }
  ]
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ])
      setCrops(cropsData)
      setFarms(farmsData)
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  const filteredCrops = statusFilter === 'all' 
    ? crops 
    : crops.filter(crop => crop.status === statusFilter)
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const cropData = {
        ...formData,
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvest: new Date(formData.expectedHarvest).toISOString()
      }
      
      if (editingCrop) {
        await cropService.update(editingCrop.Id, cropData)
        setCrops(crops.map(c => c.Id === editingCrop.Id ? { ...cropData, Id: editingCrop.Id } : c))
        toast.success('Crop updated successfully!')
      } else {
        const newCrop = await cropService.create(cropData)
        setCrops([...crops, newCrop])
        toast.success('Crop added successfully!')
      }
      
      resetForm()
    } catch (err) {
      toast.error('Failed to save crop')
    }
  }
  
  const handleEdit = (crop) => {
    setEditingCrop(crop)
    setFormData({
      farmId: crop.farmId,
      type: crop.type,
      field: crop.field,
      plantingDate: crop.plantingDate.split('T')[0],
      expectedHarvest: crop.expectedHarvest.split('T')[0],
      status: crop.status,
      notes: crop.notes || ''
    })
    setShowForm(true)
  }
  
  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return
    
    try {
      await cropService.delete(cropId)
      setCrops(crops.filter(c => c.Id !== cropId))
      toast.success('Crop deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete crop')
    }
  }
  
  const resetForm = () => {
    setFormData({
      farmId: '',
      type: '',
      field: '',
      plantingDate: '',
      expectedHarvest: '',
      status: 'planted',
      notes: ''
    })
    setEditingCrop(null)
    setShowForm(false)
  }
  
  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Crops</h1>
          <p className="text-gray-600 mt-1">Track your crop plantings and harvests</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          variant="primary"
        >
          Add Crop
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by status:</span>
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            statusFilter === 'all' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({crops.length})
        </button>
        {statusOptions.map(status => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === status.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.label} ({crops.filter(c => c.status === status.value).length})
          </button>
        ))}
      </div>
      
      {/* Add/Edit Crop Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                {editingCrop ? 'Edit Crop' : 'Add New Crop'}
              </h3>
              <Button
                onClick={resetForm}
                variant="ghost"
                size="sm"
                icon="X"
              />
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                label="Crop Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="">Select crop type</option>
                {cropTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              
              <Input
                label="Field/Area"
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                required
                placeholder="e.g., North Field, Greenhouse A"
              />
              
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
              
              <Input
                label="Planting Date"
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                required
              />
              
              <Input
                label="Expected Harvest Date"
                type="date"
                value={formData.expectedHarvest}
                onChange={(e) => setFormData({ ...formData, expectedHarvest: e.target.value })}
                required
              />
              
              <div className="md:col-span-2">
                <Textarea
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional notes about this crop..."
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
                  icon={editingCrop ? 'Save' : 'Plus'}
                >
                  {editingCrop ? 'Update Crop' : 'Add Crop'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <Empty
          icon="Wheat"
          title={statusFilter === 'all' ? "No crops yet" : `No ${statusFilter} crops`}
          message={statusFilter === 'all' 
            ? "Start tracking your crops by adding your first planting."
            : `No crops found with status: ${statusFilter}`
          }
          action={statusFilter === 'all' ? () => setShowForm(true) : undefined}
          actionLabel="Add Crop"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map(crop => (
            <CropCard
              key={crop.Id}
              crop={crop}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Crops
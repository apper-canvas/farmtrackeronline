import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
import FarmCard from '@/components/molecules/FarmCard'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import farmService from '@/services/api/farmService'

// Set app element for accessibility
Modal.setAppElement('#root')
const Farms = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingFarm, setEditingFarm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    sizeUnit: 'acres'
  })
  
  const loadFarms = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await farmService.getAll()
      setFarms(data)
    } catch (err) {
      setError('Failed to load farms')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadFarms()
  }, [])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const farmData = {
        ...formData,
        size: parseFloat(formData.size),
        createdAt: editingFarm ? editingFarm.createdAt : new Date().toISOString()
      }
      
      if (editingFarm) {
        await farmService.update(editingFarm.Id, farmData)
        setFarms(farms.map(f => f.Id === editingFarm.Id ? { ...farmData, Id: editingFarm.Id } : f))
        toast.success('Farm updated successfully!')
      } else {
        const newFarm = await farmService.create(farmData)
        setFarms([...farms, newFarm])
        toast.success('Farm added successfully!')
      }
      
      resetForm()
    } catch (err) {
      toast.error('Failed to save farm')
    }
  }
  
  const handleEdit = (farm) => {
    setEditingFarm(farm)
    setFormData({
      name: farm.name,
      location: farm.location,
      size: farm.size.toString(),
      sizeUnit: farm.sizeUnit
    })
    setShowForm(true)
  }
  
  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return
    
    try {
      await farmService.delete(farmId)
      setFarms(farms.filter(f => f.Id !== farmId))
      toast.success('Farm deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete farm')
    }
  }
  
  const resetForm = () => {
    setFormData({ name: '', location: '', size: '', sizeUnit: 'acres' })
    setEditingFarm(null)
    setShowForm(false)
  }
  
  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={loadFarms} />
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Farms</h1>
          <p className="text-gray-600 mt-1">Manage your farm properties</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          variant="primary"
        >
          Add Farm
        </Button>
      </div>
      
{/* Add/Edit Farm Form Modal */}
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
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 font-display">
                    {editingFarm ? 'Edit Farm' : 'Add New Farm'}
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
                    label="Farm Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter farm name"
                  />
                  
                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="City, State"
                  />
                  
                  <Input
                    label="Size"
                    type="number"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    required
                    placeholder="Enter size"
                    min="0"
                    step="0.1"
                  />
                  
                  <Select
                    label="Size Unit"
                    value={formData.sizeUnit}
                    onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
                    required
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="square-feet">Square Feet</option>
                    <option value="square-meters">Square Meters</option>
                  </Select>
                  
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
                      icon={editingFarm ? 'Save' : 'Plus'}
                    >
                      {editingFarm ? 'Update Farm' : 'Add Farm'}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
      
      {/* Farms Grid */}
      {farms.length === 0 ? (
        <Empty
          icon="MapPin"
          title="No farms yet"
          message="Add your first farm to start managing your agricultural operations."
          action={() => setShowForm(true)}
          actionLabel="Add Farm"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map(farm => (
            <FarmCard
              key={farm.Id}
              farm={farm}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={(farm) => console.log('Selected farm:', farm)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Farms
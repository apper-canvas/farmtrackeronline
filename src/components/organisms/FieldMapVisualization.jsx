import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import Button from '@/components/atoms/Button'
import Select from '@/components/atoms/Select'
import Badge from '@/components/atoms/Badge'
import ApperIcon from '@/components/ApperIcon'
import cropService from '@/services/api/cropService'

const FieldMapVisualization = ({
  farms,
  crops,
  selectedFarm,
  onFarmSelect,
  onCropEdit,
  onCropDelete,
  onAddCrop,
  cropTypes,
  statusOptions
}) => {
  const [draggedCrop, setDraggedCrop] = useState(null)
  const [hoveredField, setHoveredField] = useState(null)
  const [showRotationPlan, setShowRotationPlan] = useState(false)

  // Get crops for selected farm
  const farmCrops = selectedFarm 
    ? crops.filter(crop => crop.farmId === selectedFarm.Id)
    : []

  // Generate field layout for visualization
  const generateFieldLayout = (farm) => {
    if (!farm) return []
    
    const fieldCount = Math.min(Math.max(Math.floor(farm.size / 50), 4), 12)
    const fields = []
    
    for (let i = 0; i < fieldCount; i++) {
      const fieldSize = farm.size / fieldCount
      fields.push({
        id: `field-${i + 1}`,
        name: `Field ${i + 1}`,
        size: Math.round(fieldSize),
        position: {
          x: (i % 4) * 25,
          y: Math.floor(i / 4) * 30
        }
      })
    }
    
    return fields
  }

  const fields = selectedFarm ? generateFieldLayout(selectedFarm) : []

  // Get crop for specific field
  const getFieldCrop = (fieldName) => {
    return farmCrops.find(crop => crop.field === fieldName)
  }

  // Handle crop assignment to field
  const handleCropAssignment = async (fieldName, cropType) => {
    if (!selectedFarm || !cropType) return

    try {
      const existingCrop = getFieldCrop(fieldName)
      if (existingCrop) {
        // Update existing crop
        const updatedData = { ...existingCrop, type: cropType }
        await cropService.update(existingCrop.Id, updatedData)
        toast.success(`Updated ${fieldName} with ${cropType}`)
      } else {
        // Create new crop assignment
        const newCropData = {
          farmId: selectedFarm.Id,
          type: cropType,
          field: fieldName,
          plantingDate: new Date().toISOString(),
          expectedHarvest: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'planted',
          notes: `Assigned via field map`
        }
        await cropService.create(newCropData)
        toast.success(`Assigned ${cropType} to ${fieldName}`)
      }
      
      // Refresh data would be handled by parent component
      window.location.reload() // Simple refresh for demo
    } catch (error) {
      toast.error('Failed to assign crop to field')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e, cropType) => {
    setDraggedCrop(cropType)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, fieldName) => {
    e.preventDefault()
    if (draggedCrop) {
      handleCropAssignment(fieldName, draggedCrop)
      setDraggedCrop(null)
    }
  }

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status)
    return statusOption?.variant || 'default'
  }

  return (
    <div className="space-y-6">
      {/* Farm Selection */}
      <div className="bg-white rounded-lg p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-display">Field Map Visualization</h3>
            <p className="text-gray-600 text-sm">Plan crop rotations and visualize field assignments</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select
              value={selectedFarm?.Id || ''}
              onChange={(e) => {
                const farm = farms.find(f => f.Id === parseInt(e.target.value))
                onFarmSelect(farm)
              }}
              className="min-w-[200px]"
            >
              <option value="">Select a farm</option>
              {farms.map(farm => (
                <option key={farm.Id} value={farm.Id}>
                  {farm.name} - {farm.location}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => setShowRotationPlan(!showRotationPlan)}
              variant="secondary"
              size="sm"
              icon="Calendar"
            >
              Rotation Plan
            </Button>
          </div>
        </div>
      </div>

      {selectedFarm ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Crop Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-4 shadow-card">
              <h4 className="font-semibold text-gray-900 mb-4 font-display">Available Crops</h4>
              <div className="space-y-2">
                {cropTypes.map(cropType => (
                  <motion.div
                    key={cropType}
                    draggable
                    onDragStart={(e) => handleDragStart(e, cropType)}
                    className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ApperIcon name="Wheat" size={16} className="text-primary-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">{cropType}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  onClick={onAddCrop}
                  variant="primary"
                  size="sm"
                  icon="Plus"
                  className="w-full"
                >
                  Add New Crop
                </Button>
              </div>
            </div>
          </div>

          {/* Field Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 font-display">
                  {selectedFarm.name} - Field Layout
                </h4>
                <div className="text-sm text-gray-600">
                  {selectedFarm.size} {selectedFarm.sizeUnit} • {fields.length} fields
                </div>
              </div>
              
              <div className="relative bg-green-50 rounded-lg p-8 min-h-[400px] overflow-auto">
                <div className="relative w-full h-full">
                  {fields.map(field => {
                    const fieldCrop = getFieldCrop(field.name)
                    return (
                      <motion.div
                        key={field.id}
                        className={`absolute bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          hoveredField === field.name 
                            ? 'border-primary-400 shadow-lg scale-105' 
                            : fieldCrop 
                            ? 'border-green-400' 
                            : 'border-gray-300 border-dashed'
                        }`}
                        style={{
                          left: `${field.position.x}%`,
                          top: `${field.position.y}%`,
                          width: '20%',
                          minHeight: '120px'
                        }}
                        onMouseEnter={() => setHoveredField(field.name)}
                        onMouseLeave={() => setHoveredField(null)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, field.name)}
                        whileHover={{ scale: 1.05 }}
                        layout
                      >
                        <div className="text-center">
                          <h5 className="font-medium text-gray-900 text-sm mb-2">{field.name}</h5>
                          <p className="text-xs text-gray-600 mb-3">{field.size} acres</p>
                          
                          {fieldCrop ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <ApperIcon name="Wheat" size={20} className="text-green-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{fieldCrop.type}</div>
                              <Badge variant={getStatusColor(fieldCrop.status)} size="sm">
                                {fieldCrop.status}
                              </Badge>
                              <div className="flex items-center justify-center space-x-1 mt-2">
                                <Button
                                  onClick={() => onCropEdit(fieldCrop)}
                                  variant="ghost"
                                  size="sm"
                                  icon="Edit"
                                  className="p-1"
                                />
                                <Button
                                  onClick={() => onCropDelete(fieldCrop.Id)}
                                  variant="ghost"
                                  size="sm"
                                  icon="Trash2"
                                  className="p-1 text-red-600 hover:text-red-700"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="flex items-center justify-center mb-2">
                                <ApperIcon name="Plus" size={16} className="text-gray-400" />
                              </div>
                              <p className="text-xs text-gray-500">Drop crop here</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 shadow-card text-center">
          <ApperIcon name="Map" size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2 font-display">Select a Farm</h3>
          <p className="text-gray-600 mb-6">Choose a farm to visualize its field layout and plan crop rotations</p>
          <Select
            value=""
            onChange={(e) => {
              const farm = farms.find(f => f.Id === parseInt(e.target.value))
              onFarmSelect(farm)
            }}
            className="max-w-xs mx-auto"
          >
            <option value="">Select a farm</option>
            {farms.map(farm => (
              <option key={farm.Id} value={farm.Id}>
                {farm.name} - {farm.location}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Rotation Planning Panel */}
      <AnimatePresence>
        {showRotationPlan && selectedFarm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg p-6 shadow-card overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900 font-display">Crop Rotation Timeline</h4>
              <Button
                onClick={() => setShowRotationPlan(false)}
                variant="ghost"
                size="sm"
                icon="X"
              />
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Spring', 'Summer', 'Fall', 'Winter'].map(season => (
                  <div key={season} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3">{season} Planning</h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>• Optimal planting window</div>
                      <div>• Recommended crops</div>
                      <div>• Soil preparation</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Plan your crop rotations by season to optimize soil health and maximize yields. 
                  Drag crops to fields to assign them for different growing periods.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FieldMapVisualization
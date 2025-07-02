import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import Modal from 'react-modal'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Textarea from '@/components/atoms/Textarea'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import inventoryService from '@/services/api/inventoryService'

const Inventory = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'seeds',
    currentStock: '',
    reorderLevel: '',
    unit: '',
    costPerUnit: '',
    supplier: '',
    description: ''
  })

  const loadInventory = async () => {
    try {
      setLoading(true)
      setError('')
      const inventory = await inventoryService.getAll()
      setData(inventory)
    } catch (err) {
      setError('Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'seeds',
      currentStock: '',
      reorderLevel: '',
      unit: '',
      costPerUnit: '',
      supplier: '',
      description: ''
    })
    setIsModalOpen(true)
  }

const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.Name,
      category: item.category,
      currentStock: item.current_stock.toString(),
      reorderLevel: item.reorder_level.toString(),
      unit: item.unit,
      costPerUnit: item.cost_per_unit.toString(),
      supplier: item.supplier,
      description: item.description
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await inventoryService.delete(item.Id)
        setData(prev => prev.filter(i => i.Id !== item.Id))
        toast.success('Item deleted successfully')
      } catch (err) {
        toast.error('Failed to delete item')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const itemData = {
      name: formData.name,
      category: formData.category,
      currentStock: parseInt(formData.currentStock),
      reorderLevel: parseInt(formData.reorderLevel),
      unit: formData.unit,
      costPerUnit: parseFloat(formData.costPerUnit),
      supplier: formData.supplier,
      description: formData.description
    }

    try {
      if (editingItem) {
        const updatedItem = await inventoryService.update(editingItem.Id, itemData)
        setData(prev => prev.map(item => item.Id === editingItem.Id ? updatedItem : item))
        toast.success('Item updated successfully')
      } else {
        const newItem = await inventoryService.create(itemData)
        setData(prev => [...prev, newItem])
        toast.success('Item added successfully')
      }
      setIsModalOpen(false)
    } catch (err) {
      toast.error(editingItem ? 'Failed to update item' : 'Failed to add item')
    }
  }

const filteredData = data
    .filter(item => {
      const matchesSearch = item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
.sort((a, b) => {
      if (sortBy === 'name') return a.Name.localeCompare(b.Name)
      if (sortBy === 'stock') return b.current_stock - a.current_stock
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return 0
    })

const lowStockItems = data.filter(item => item.current_stock <= item.reorder_level)

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadInventory} />

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track seeds, fertilizers, and equipment</p>
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Item
        </Button>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 border-l-4 border-warning bg-yellow-50"
        >
          <div className="flex items-center mb-3">
            <ApperIcon name="AlertTriangle" className="text-warning mr-2" size={20} />
            <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStockItems.map(item => (
<div key={item.Id} className="text-sm">
                <span className="font-medium">{item.Name}</span>
                <span className="text-gray-600 ml-1">
                  ({item.current_stock} {item.unit} remaining)
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <Input
              type="text"
              placeholder="Search items or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="seeds">Seeds</option>
              <option value="fertilizers">Fertilizers</option>
              <option value="equipment">Equipment</option>
            </Select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="stock">Stock Level</option>
              <option value="category">Category</option>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              {filteredData.length} of {data.length} items
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid */}
      {filteredData.length === 0 ? (
        <Empty
          icon="Package"
          title="No inventory items found"
          message="Start by adding your first inventory item."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map(item => (
            <motion.div
              key={item.Id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    item.category === 'seeds' ? 'bg-success/10' :
                    item.category === 'fertilizers' ? 'bg-warning/10' :
                    'bg-primary/10'
                  }`}>
                    <ApperIcon
                      name={
                        item.category === 'seeds' ? 'Wheat' :
                        item.category === 'fertilizers' ? 'Droplets' :
                        'Wrench'
                      }
                      className={
                        item.category === 'seeds' ? 'text-success' :
                        item.category === 'fertilizers' ? 'text-warning' :
                        'text-primary-600'
                      }
                      size={20}
                    />
                  </div>
                  <div>
<h3 className="font-semibold text-gray-900 text-sm">{item.Name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <ApperIcon name="Edit" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                    className="text-error hover:text-error"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
<span className="text-sm text-gray-600">Current Stock</span>
                  <span className={`font-semibold ${
                    item.current_stock <= item.reorder_level ? 'text-error' : 'text-gray-900'
                  }`}>
                    {item.current_stock} {item.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reorder Level</span>
                  <span className="text-gray-900">{item.reorder_level} {item.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cost per Unit</span>
                  <span className="text-gray-900">${item.cost_per_unit.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600">{item.supplier}</p>
                </div>
{item.current_stock <= item.reorder_level && (
                  <div className="flex items-center space-x-2 p-2 bg-error/10 rounded-lg">
                    <ApperIcon name="AlertTriangle" className="text-error" size={14} />
                    <span className="text-xs text-error font-medium">Reorder needed</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Add/Edit Inventory Item"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6 w-full max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 font-display">
              {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              <ApperIcon name="X" size={16} />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Item Name *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Category *</label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="seeds">Seeds</option>
                  <option value="fertilizers">Fertilizers</option>
                  <option value="equipment">Equipment</option>
                </Select>
              </div>
              <div>
                <label className="form-label">Current Stock *</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Reorder Level *</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Unit *</label>
                <Input
                  type="text"
                  placeholder="e.g., bags, units, tons"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="form-label">Cost per Unit *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, costPerUnit: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label">Supplier *</label>
              <Input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Optional description of the item"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </form>
        </motion.div>
      </Modal>
    </div>
  )
}

export default Inventory
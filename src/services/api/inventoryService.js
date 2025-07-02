import mockData from '@/services/mockData/inventory.json'

// Generate unique ID
let lastId = Math.max(...mockData.map(item => item.Id), 0)

// Mock inventory data storage
let inventoryData = [...mockData]

const inventoryService = {
  // Get all inventory items
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...inventoryData])
      }, 200)
    })
  },

  // Get inventory item by ID
  getById: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = inventoryData.find(item => item.Id === parseInt(id))
        if (item) {
          resolve({ ...item })
        } else {
          reject(new Error(`Inventory item with Id ${id} not found`))
        }
      }, 200)
    })
  },

  // Create new inventory item
  create: (itemData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = {
          ...itemData,
          Id: ++lastId
        }
        inventoryData.push(newItem)
        resolve({ ...newItem })
      }, 200)
    })
  },

  // Update inventory item
  update: (id, itemData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = inventoryData.findIndex(item => item.Id === parseInt(id))
        if (index !== -1) {
          const updatedItem = {
            ...inventoryData[index],
            ...itemData,
            Id: parseInt(id) // Ensure ID doesn't change
          }
          inventoryData[index] = updatedItem
          resolve({ ...updatedItem })
        } else {
          reject(new Error(`Inventory item with Id ${id} not found`))
        }
      }, 200)
    })
  },

  // Delete inventory item
  delete: (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = inventoryData.findIndex(item => item.Id === parseInt(id))
        if (index !== -1) {
          const deletedItem = inventoryData.splice(index, 1)[0]
          resolve({ ...deletedItem })
        } else {
          reject(new Error(`Inventory item with Id ${id} not found`))
        }
      }, 200)
    })
  }
}

export default inventoryService
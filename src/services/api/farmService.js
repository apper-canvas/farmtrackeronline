import farmsData from '@/services/mockData/farms.json'

class FarmService {
  constructor() {
    this.farms = [...farmsData]
  }
  
  async getAll() {
    await this.delay(300)
    return [...this.farms]
  }
  
  async getById(id) {
    await this.delay(200)
    const farm = this.farms.find(f => f.Id === parseInt(id))
    if (!farm) throw new Error('Farm not found')
    return { ...farm }
  }
  
  async create(farmData) {
    await this.delay(400)
    const maxId = Math.max(...this.farms.map(f => f.Id), 0)
    const newFarm = {
      ...farmData,
      Id: maxId + 1,
      activeCrops: 0,
      createdAt: farmData.createdAt || new Date().toISOString()
    }
    this.farms.push(newFarm)
    return { ...newFarm }
  }
  
  async update(id, farmData) {
    await this.delay(400)
    const index = this.farms.findIndex(f => f.Id === parseInt(id))
    if (index === -1) throw new Error('Farm not found')
    
    this.farms[index] = { ...this.farms[index], ...farmData, Id: parseInt(id) }
    return { ...this.farms[index] }
  }
  
  async delete(id) {
    await this.delay(300)
    const index = this.farms.findIndex(f => f.Id === parseInt(id))
    if (index === -1) throw new Error('Farm not found')
    
    this.farms.splice(index, 1)
    return true
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new FarmService()
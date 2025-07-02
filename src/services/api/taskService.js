import tasksData from '@/services/mockData/tasks.json'

class TaskService {
  constructor() {
    this.tasks = [...tasksData]
  }
  
  async getAll() {
    await this.delay(300)
    return [...this.tasks]
  }
  
  async getById(id) {
    await this.delay(200)
    const task = this.tasks.find(t => t.Id === parseInt(id))
    if (!task) throw new Error('Task not found')
    return { ...task }
  }
  
  async getByFarmId(farmId) {
    await this.delay(250)
    return this.tasks.filter(t => t.farmId === farmId).map(t => ({ ...t }))
  }
  
  async create(taskData) {
    await this.delay(400)
    const maxId = Math.max(...this.tasks.map(t => t.Id), 0)
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      completed: false
    }
    this.tasks.push(newTask)
    return { ...newTask }
  }
  
  async update(id, taskData) {
    await this.delay(400)
    const index = this.tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) throw new Error('Task not found')
    
    this.tasks[index] = { ...this.tasks[index], ...taskData, Id: parseInt(id) }
    return { ...this.tasks[index] }
  }
  
  async delete(id) {
    await this.delay(300)
    const index = this.tasks.findIndex(t => t.Id === parseInt(id))
    if (index === -1) throw new Error('Task not found')
    
    this.tasks.splice(index, 1)
    return true
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new TaskService()
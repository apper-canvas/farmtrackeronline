import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import StatsCard from '@/components/molecules/StatsCard'
import WeatherCard from '@/components/molecules/WeatherCard'
import TaskItem from '@/components/molecules/TaskItem'
import CropCard from '@/components/molecules/CropCard'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import farmService from '@/services/api/farmService'
import cropService from '@/services/api/cropService'
import taskService from '@/services/api/taskService'
import transactionService from '@/services/api/transactionService'
import weatherService from '@/services/api/weatherService'

const Dashboard = () => {
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    transactions: [],
    weather: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [farms, crops, tasks, transactions, weather] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getAll(),
        weatherService.getCurrentWeather()
      ])
      
      setData({ farms, crops, tasks, transactions, weather })
    } catch (err) {
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />
  
  const activeCrops = data.crops.filter(crop => crop.status !== 'harvested')
  const pendingTasks = data.tasks.filter(task => !task.completed)
  const currentMonthIncome = data.transactions
    .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0)
  const currentMonthExpenses = data.transactions
    .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + t.amount, 0)
  const monthlyProfit = currentMonthIncome - currentMonthExpenses
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your farm operations</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Farms"
          value={data.farms.length}
          icon="MapPin"
          color="primary"
        />
        <StatsCard
          title="Active Crops"
          value={activeCrops.length}
          icon="Wheat"
          color="success"
        />
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks.length}
          icon="CheckSquare"
          color="warning"
        />
        <StatsCard
          title="Monthly Profit"
          value={`$${monthlyProfit.toLocaleString()}`}
          icon="DollarSign"
          color={monthlyProfit >= 0 ? 'success' : 'error'}
          trend={monthlyProfit >= 0 ? 'up' : 'down'}
          trendValue={`${monthlyProfit >= 0 ? '+' : ''}${((monthlyProfit / (currentMonthExpenses || 1)) * 100).toFixed(1)}%`}
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="lg:col-span-1">
          <WeatherCard weather={data.weather} />
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Recent Activity</h3>
              <ApperIcon name="Activity" className="text-gray-400" size={20} />
            </div>
            
            <div className="space-y-4">
              {data.transactions.slice(0, 3).map(transaction => (
                <div key={transaction.Id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-success/10' : 'bg-error/10'}`}>
                    <ApperIcon 
                      name={transaction.type === 'income' ? 'TrendingUp' : 'TrendingDown'}
                      className={transaction.type === 'income' ? 'text-success' : 'text-error'}
                      size={16}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 capitalize">
                      {transaction.category.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`font-bold ${transaction.type === 'income' ? 'text-success' : 'text-error'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tasks and Crops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display">Upcoming Tasks</h3>
            <ApperIcon name="Calendar" className="text-gray-400" size={20} />
          </div>
          
          {pendingTasks.length === 0 ? (
            <Empty
              icon="CheckSquare"
              title="No pending tasks"
              message="All caught up! Your farm is running smoothly."
            />
          ) : (
            <div className="space-y-4">
              {pendingTasks.slice(0, 3).map(task => (
                <TaskItem
                  key={task.Id}
                  task={task}
                  onToggleComplete={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Active Crops */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display">Active Crops</h3>
            <ApperIcon name="Wheat" className="text-gray-400" size={20} />
          </div>
          
          {activeCrops.length === 0 ? (
            <Empty
              icon="Wheat"
              title="No active crops"
              message="Start your growing season by planting your first crop."
            />
          ) : (
            <div className="space-y-4">
              {activeCrops.slice(0, 2).map(crop => (
                <CropCard
                  key={crop.Id}
                  crop={crop}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
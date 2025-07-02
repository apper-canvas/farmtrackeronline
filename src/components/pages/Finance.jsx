import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns'
import TransactionItem from '@/components/molecules/TransactionItem'
import StatsCard from '@/components/molecules/StatsCard'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'
import Textarea from '@/components/atoms/Textarea'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'
import transactionService from '@/services/api/transactionService'
import farmService from '@/services/api/farmService'

const Finance = () => {
  const [transactions, setTransactions] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [formData, setFormData] = useState({
    farmId: '',
    type: 'expense',
    category: '',
    amount: '',
    date: '',
    description: ''
  })
  
  const incomeCategories = [
    'crop-sales',
    'livestock',
    'equipment-rental',
    'subsidies',
    'other-income'
  ]
  
  const expenseCategories = [
    'seeds',
    'fertilizers',
    'equipment',
    'labor',
    'fuel',
    'supplies',
    'maintenance',
    'other-expense'
  ]
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [transactionsData, farmsData] = await Promise.all([
        transactionService.getAll(),
        farmService.getAll()
      ])
      setTransactions(transactionsData)
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
  
  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date)
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const isInCurrentMonth = transactionDate >= monthStart && transactionDate <= monthEnd
    
    if (activeTab === 'income') return transaction.type === 'income' && isInCurrentMonth
    if (activeTab === 'expenses') return transaction.type === 'expense' && isInCurrentMonth
    return isInCurrentMonth
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
  
  const monthlyIncome = transactions
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'income' && 
             date >= startOfMonth(currentMonth) && 
             date <= endOfMonth(currentMonth)
    })
    .reduce((sum, t) => sum + t.amount, 0)
  
  const monthlyExpenses = transactions
    .filter(t => {
      const date = new Date(t.date)
      return t.type === 'expense' && 
             date >= startOfMonth(currentMonth) && 
             date <= endOfMonth(currentMonth)
    })
    .reduce((sum, t) => sum + t.amount, 0)
  
  const monthlyProfit = monthlyIncome - monthlyExpenses
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      }
      
      if (editingTransaction) {
        await transactionService.update(editingTransaction.Id, transactionData)
        setTransactions(transactions.map(t => 
          t.Id === editingTransaction.Id ? { ...transactionData, Id: editingTransaction.Id } : t
        ))
        toast.success('Transaction updated successfully!')
      } else {
        const newTransaction = await transactionService.create(transactionData)
        setTransactions([newTransaction, ...transactions])
        toast.success('Transaction added successfully!')
      }
      
      resetForm()
    } catch (err) {
      toast.error('Failed to save transaction')
    }
  }
  
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      farmId: transaction.farmId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date.split('T')[0],
      description: transaction.description || ''
    })
    setShowForm(true)
  }
  
  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return
    
    try {
      await transactionService.delete(transactionId)
      setTransactions(transactions.filter(t => t.Id !== transactionId))
      toast.success('Transaction deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete transaction')
    }
  }
  
  const resetForm = () => {
    setFormData({
      farmId: '',
      type: 'expense',
      category: '',
      amount: '',
      date: '',
      description: ''
    })
    setEditingTransaction(null)
    setShowForm(false)
  }
  
  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Finance</h1>
          <p className="text-gray-600 mt-1">Track your farm income and expenses</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          variant="primary"
        >
          Add Transaction
        </Button>
      </div>
      
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            variant="ghost"
            size="sm"
            icon="ChevronLeft"
          />
          <h2 className="text-xl font-semibold text-gray-900 font-display">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            variant="ghost"
            size="sm"
            icon="ChevronRight"
          />
        </div>
        
        <Button
          onClick={() => setCurrentMonth(new Date())}
          variant="ghost"
          size="sm"
        >
          Current Month
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Income"
          value={`$${monthlyIncome.toLocaleString()}`}
          icon="TrendingUp"
          color="success"
        />
        <StatsCard
          title="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString()}`}
          icon="TrendingDown"
          color="error"
        />
        <StatsCard
          title="Net Profit"
          value={`$${monthlyProfit.toLocaleString()}`}
          icon="DollarSign"
          color={monthlyProfit >= 0 ? 'success' : 'error'}
          trend={monthlyProfit >= 0 ? 'up' : 'down'}
          trendValue={`${monthlyProfit >= 0 ? '+' : ''}${((monthlyProfit / (monthlyExpenses || 1)) * 100).toFixed(1)}%`}
        />
        <StatsCard
          title="Transactions"
          value={filteredTransactions.length}
          icon="Receipt"
          color="info"
        />
      </div>
      
      {/* Transaction Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'All Transactions', count: filteredTransactions.length },
          { key: 'income', label: 'Income', count: filteredTransactions.filter(t => t.type === 'income').length },
          { key: 'expenses', label: 'Expenses', count: filteredTransactions.filter(t => t.type === 'expense').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      
      {/* Add/Edit Transaction Form */}
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
                {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
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
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>
              
              <Select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                  <option key={category} value={category}>
                    {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </Select>
              
              <Input
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              
              <Input
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
              
              <Select
                label="Farm (Optional)"
                value={formData.farmId}
                onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              >
                <option value="">All Farms</option>
                {farms.map(farm => (
                  <option key={farm.Id} value={farm.Id}>
                    {farm.name} - {farm.location}
                  </option>
                ))}
              </Select>
              
              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add details about this transaction..."
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
                  icon={editingTransaction ? 'Save' : 'Plus'}
                >
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Empty
          icon="Receipt"
          title="No transactions found"
          message={`No ${activeTab === 'all' ? '' : activeTab} transactions found for ${format(currentMonth, 'MMMM yyyy')}.`}
          action={() => setShowForm(true)}
          actionLabel="Add Transaction"
        />
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <TransactionItem
              key={transaction.Id}
              transaction={transaction}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Finance
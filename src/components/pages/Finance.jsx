import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { addMonths, endOfMonth, format, isWithinInterval, startOfMonth, subMonths } from "date-fns";
import Modal from "react-modal";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import Input from "@/components/atoms/Input";
import ImageUpload from "@/components/atoms/ImageUpload";
import Button from "@/components/atoms/Button";
import StatsCard from "@/components/molecules/StatsCard";
import TransactionItem from "@/components/molecules/TransactionItem";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Farms from "@/components/pages/Farms";
import transactionsData from "@/services/mockData/transactions.json";
import inventoryData from "@/services/mockData/inventory.json";
import farmsData from "@/services/mockData/farms.json";
import tasksData from "@/services/mockData/tasks.json";
import cropsData from "@/services/mockData/crops.json";
import farmService from "@/services/api/farmService";
import transactionService from "@/services/api/transactionService";

// Set app element for accessibility
Modal.setAppElement('#root')

const Finance = () => {
  const [transactions, setTransactions] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showDateRange, setShowDateRange] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
const [formData, setFormData] = useState({
    farmId: '',
    type: 'expense',
    category: '',
    amount: '',
    date: '',
    description: '',
    images: []
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
    let isInDateRange
    
    if (showDateRange) {
      const start = new Date(dateRange.startDate)
      const end = new Date(dateRange.endDate)
      end.setHours(23, 59, 59, 999) // Include full end date
      isInDateRange = isWithinInterval(transactionDate, { start, end })
    } else {
      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)
      isInDateRange = transactionDate >= monthStart && transactionDate <= monthEnd
    }
    
    if (activeTab === 'income') return transaction.type === 'income' && isInDateRange
    if (activeTab === 'expenses') return transaction.type === 'expense' && isInDateRange
    return isInDateRange
  }).sort((a, b) => new Date(b.date) - new Date(a.date))
  
const periodIncome = transactions
    .filter(t => {
      const date = new Date(t.date)
      if (showDateRange) {
        const start = new Date(dateRange.startDate)
        const end = new Date(dateRange.endDate)
        end.setHours(23, 59, 59, 999)
        return t.type === 'income' && isWithinInterval(date, { start, end })
      } else {
        return t.type === 'income' && 
               date >= startOfMonth(currentMonth) && 
               date <= endOfMonth(currentMonth)
      }
    })
    .reduce((sum, t) => sum + t.amount, 0)
  
  const periodExpenses = transactions
    .filter(t => {
      const date = new Date(t.date)
      if (showDateRange) {
        const start = new Date(dateRange.startDate)
        const end = new Date(dateRange.endDate)
        end.setHours(23, 59, 59, 999)
        return t.type === 'expense' && isWithinInterval(date, { start, end })
      } else {
        return t.type === 'expense' && 
               date >= startOfMonth(currentMonth) && 
               date <= endOfMonth(currentMonth)
      }
    })
    .reduce((sum, t) => sum + t.amount, 0)
  
  const periodProfit = periodIncome - periodExpenses
  
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
      farmId: transaction.farm_id,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      date: transaction.date.split('T')[0],
      description: transaction.description || '',
      images: transaction.images || []
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
      description: '',
      images: []
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const exportToCSV = () => {
    try {
const csvData = filteredTransactions.map(transaction => {
        const farm = farms.find(f => f.Id === transaction.farm_id)
        return {
          Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
          Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
          Category: transaction.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          Amount: transaction.amount,
          Farm: farm ? `${farm.Name} - ${farm.location}` : 'All Farms',
          Description: transaction.description || ''
        }
      })

      const headers = Object.keys(csvData[0] || {})
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `financial-report-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('CSV report exported successfully!')
    } catch (err) {
      toast.error('Failed to export CSV report')
    }
  }

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.text('Financial Report', 20, 20)
      
      // Add date range
      const dateRangeText = showDateRange 
        ? `${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}`
        : format(currentMonth, 'MMMM yyyy')
      
      doc.setFontSize(12)
      doc.text(`Period: ${dateRangeText}`, 20, 30)
      
      // Add summary
      doc.text(`Total Income: $${periodIncome.toLocaleString()}`, 20, 40)
      doc.text(`Total Expenses: $${periodExpenses.toLocaleString()}`, 20, 50)
      doc.text(`Net Profit: $${periodProfit.toLocaleString()}`, 20, 60)
      
// Add transactions table
      const tableData = filteredTransactions.map(transaction => {
        const farm = farms.find(f => f.Id === transaction.farm_id)
        return [
          format(new Date(transaction.date), 'dd/MM/yyyy'),
          transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
          transaction.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          `$${transaction.amount.toLocaleString()}`,
          farm ? `${farm.Name}` : 'All Farms',
          transaction.description || ''
        ]
      })

      doc.autoTable({
        head: [['Date', 'Type', 'Category', 'Amount', 'Farm', 'Description']],
        body: tableData,
        startY: 70,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [43, 122, 11] },
        columnStyles: {
          3: { halign: 'right' },
          5: { cellWidth: 30 }
        }
      })
      
      doc.save(`financial-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('PDF report exported successfully!')
    } catch (err) {
      toast.error('Failed to export PDF report')
    }
  }

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }))
  }

  const applyDateRange = () => {
    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      toast.error('Start date cannot be after end date')
      return
    }
    setShowDateRange(true)
  }

  const clearDateRange = () => {
    setShowDateRange(false)
    setDateRange({
      startDate: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
      endDate: format(endOfMonth(currentMonth), 'yyyy-MM-dd')
    })
}

  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Finance</h1>
          <p className="text-gray-600 mt-1">Track your farm income and expenses</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={exportToCSV}
            icon="Download"
            variant="secondary"
            size="sm"
            disabled={filteredTransactions.length === 0}
          >
            Export CSV
          </Button>
          <Button
            onClick={exportToPDF}
            icon="FileText"
            variant="secondary"
            size="sm"
            disabled={filteredTransactions.length === 0}
          >
            Export PDF
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            icon="Plus"
            variant="primary"
          >
            Add Transaction
          </Button>
        </div>
</div>

      {/* Date Range Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="monthly"
                name="dateMode"
                checked={!showDateRange}
                onChange={() => clearDateRange()}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="monthly" className="text-sm font-medium text-gray-700">
                Monthly View
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="custom"
                name="dateMode"
                checked={showDateRange}
                onChange={() => setShowDateRange(true)}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="custom" className="text-sm font-medium text-gray-700">
                Custom Range
              </label>
            </div>
          </div>
          
          {showDateRange ? (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="text-sm"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="text-sm"
                />
              </div>
              <Button
                onClick={applyDateRange}
                variant="primary"
                size="sm"
              >
                Apply Range
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                variant="ghost"
                size="sm"
                icon="ChevronLeft"
              />
              <h2 className="text-xl font-semibold text-gray-900 font-display min-w-[180px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                variant="ghost"
                size="sm"
                icon="ChevronRight"
              />
              <Button
                onClick={() => setCurrentMonth(new Date())}
                variant="ghost"
                size="sm"
              >
                Today
              </Button>
            </div>
          )}
        </div>
</div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title={showDateRange ? "Period Income" : "Monthly Income"}
          value={`$${periodIncome.toLocaleString()}`}
          icon="TrendingUp"
          color="success"
        />
        <StatsCard
          title={showDateRange ? "Period Expenses" : "Monthly Expenses"}
          value={`$${periodExpenses.toLocaleString()}`}
          icon="TrendingDown"
          color="error"
        />
        <StatsCard
          title="Net Profit"
          value={`$${periodProfit.toLocaleString()}`}
          icon="DollarSign"
          color={periodProfit >= 0 ? 'success' : 'error'}
          trend={periodProfit >= 0 ? 'up' : 'down'}
          trendValue={`${periodProfit >= 0 ? '+' : ''}${((periodProfit / (periodExpenses || 1)) * 100).toFixed(1)}%`}
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
      
      {/* Add/Edit Transaction Form Modal */}
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
                  
                  <div className="md:col-span-2">
                    <ImageUpload
                      label="Attach Receipt Images"
                      images={formData.images}
                      onChange={(images) => setFormData({ ...formData, images })}
                      maxImages={3}
                      maxSizeKB={2048}
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
      
      {/* Transactions List */}
{filteredTransactions.length === 0 ? (
        <Empty
          icon="Receipt"
          title="No transactions found"
          message={`No ${activeTab === 'all' ? '' : activeTab} transactions found for ${
            showDateRange 
              ? `${format(new Date(dateRange.startDate), 'dd/MM/yyyy')} - ${format(new Date(dateRange.endDate), 'dd/MM/yyyy')}`
              : format(currentMonth, 'MMMM yyyy')
          }.`}
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
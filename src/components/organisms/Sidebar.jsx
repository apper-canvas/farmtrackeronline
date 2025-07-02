import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = ({ onClose }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
    { name: 'Farms', href: '/farms', icon: 'MapPin' },
    { name: 'Crops', href: '/crops', icon: 'Wheat' },
    { name: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
    { name: 'Finance', href: '/finance', icon: 'DollarSign' },
    { name: 'Weather', href: '/weather', icon: 'Cloud' }
  ]
  
  return (
    <div className="bg-white border-r border-gray-200 w-70 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <ApperIcon name="Tractor" className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-gray-900 font-display">FarmTracker</h1>
            <p className="text-sm text-gray-600">Agriculture Management</p>
          </div>
        </div>
        
        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
          >
            <ApperIcon name="X" size={20} />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ApperIcon 
                  name={item.icon} 
                  size={20}
                  className={isActive ? 'text-primary-600' : 'text-gray-500'}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
          <div className="p-2 bg-primary-500 rounded-full">
            <ApperIcon name="User" className="text-white" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Farm Manager</p>
            <p className="text-xs text-gray-600 truncate">Managing your farm data</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
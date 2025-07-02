import { format } from 'date-fns'
import { useContext } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import { AuthContext } from '@/App'

const Header = ({ onMenuClick }) => {
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy')
  const { logout } = useContext(AuthContext)
  const { user } = useSelector((state) => state.user)
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout()
        toast.success('Logged out successfully')
      } catch (error) {
        toast.error('Failed to logout')
      }
    }
  }
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMenuClick}
            className="lg:hidden"
          />
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 font-display">
              Good morning, {user?.firstName || 'Farmer'}
            </h2>
            <p className="text-sm text-gray-600">{currentDate}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Weather indicator */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <ApperIcon name="Sun" className="text-yellow-500" size={16} />
            <span>72°F</span>
          </div>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            icon="Bell"
            className="relative"
          />
          
          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            icon="LogOut"
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
            title="Logout"
          />
        </div>
      </div>
    </header>
  )
}

export default Header
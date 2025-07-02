import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'

const Header = ({ onMenuClick }) => {
  const currentDate = format(new Date(), 'EEEE, MMMM d, yyyy')
  
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
              Good morning, Farmer
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
        </div>
      </div>
    </header>
  )
}

export default Header
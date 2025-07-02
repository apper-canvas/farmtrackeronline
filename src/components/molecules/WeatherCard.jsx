import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const WeatherCard = ({ weather, className = '' }) => {
  const getWeatherIcon = (condition) => {
    const iconMap = {
      'sunny': 'Sun',
      'cloudy': 'Cloud',
      'rainy': 'CloudRain',
      'stormy': 'CloudLightning',
      'snowy': 'CloudSnow',
      'partly-cloudy': 'CloudSun'
    }
    return iconMap[condition] || 'Sun'
  }
  
  const getWeatherColor = (condition) => {
    const colorMap = {
      'sunny': 'text-yellow-500',
      'cloudy': 'text-gray-500',
      'rainy': 'text-blue-500',
      'stormy': 'text-purple-500',
      'snowy': 'text-blue-300',
      'partly-cloudy': 'text-yellow-400'
    }
    return colorMap[condition] || 'text-yellow-500'
  }
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`card p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 font-display">Current Weather</h3>
        <ApperIcon 
          name={getWeatherIcon(weather?.condition)}
          className={getWeatherColor(weather?.condition)}
          size={32}
        />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900 font-display">
            {weather?.temperature || 72}°F
          </span>
          <span className="text-gray-600 capitalize">
            {weather?.condition || 'sunny'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <ApperIcon name="Droplets" className="text-blue-500 mr-2" size={16} />
            <span className="text-gray-600">
              Humidity: {weather?.humidity || 65}%
            </span>
          </div>
          <div className="flex items-center">
            <ApperIcon name="Wind" className="text-gray-500 mr-2" size={16} />
            <span className="text-gray-600">
              Wind: {weather?.windSpeed || 8} mph
            </span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Precipitation chance: {weather?.precipitationChance || 20}%
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default WeatherCard
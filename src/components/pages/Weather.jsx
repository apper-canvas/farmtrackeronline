import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format, addDays } from 'date-fns'
import StatsCard from '@/components/molecules/StatsCard'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ApperIcon from '@/components/ApperIcon'
import weatherService from '@/services/api/weatherService'

const Weather = () => {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const loadWeatherData = async () => {
    try {
      setLoading(true)
      setError('')
      const [currentWeather, forecastData] = await Promise.all([
        weatherService.getCurrentWeather(),
        weatherService.getForecast()
      ])
      setWeather(currentWeather)
      setForecast(forecastData)
    } catch (err) {
      setError('Failed to load weather data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadWeatherData()
  }, [])
  
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
  
  const getFarmingAdvice = (weather) => {
    if (!weather) return []
    
    const advice = []
    
    if (weather.precipitationChance > 70) {
      advice.push({
        icon: 'CloudRain',
        text: 'High chance of rain - consider postponing irrigation',
        type: 'info'
      })
    }
    
    if (weather.temperature > 85) {
      advice.push({
        icon: 'Thermometer',
        text: 'High temperature - ensure adequate watering for crops',
        type: 'warning'
      })
    }
    
    if (weather.windSpeed > 15) {
      advice.push({
        icon: 'Wind',
        text: 'Strong winds - avoid spraying pesticides or fertilizers',
        type: 'warning'
      })
    }
    
    if (weather.humidity < 30) {
      advice.push({
        icon: 'Droplets',
        text: 'Low humidity - monitor crop stress and increase watering',
        type: 'info'
      })
    }
    
    return advice
  }
  
  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadWeatherData} />
  
  const advice = getFarmingAdvice(weather)
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display">Weather</h1>
        <p className="text-gray-600 mt-1">Weather conditions and forecasts for your farm</p>
      </div>
      
      {/* Current Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="card p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-display">Current Conditions</h2>
                <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
              </div>
              <div className="text-right">
                <ApperIcon 
                  name={getWeatherIcon(weather?.condition)}
                  className={`${getWeatherColor(weather?.condition)} mb-2`}
                  size={48}
                />
                <p className="text-sm text-gray-600 capitalize">{weather?.condition || 'sunny'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 font-display mb-1">
                  {weather?.temperature || 72}°F
                </div>
                <div className="text-sm text-gray-600">Temperature</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 font-display mb-1">
                  {weather?.humidity || 65}%
                </div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 font-display mb-1">
                  {weather?.windSpeed || 8}
                </div>
                <div className="text-sm text-gray-600">Wind (mph)</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 font-display mb-1">
                  {weather?.precipitationChance || 20}%
                </div>
                <div className="text-sm text-gray-600">Rain Chance</div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Farming Advice */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
            Farming Advice
          </h3>
          
          {advice.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="CheckCircle" className="text-success mx-auto mb-3" size={32} />
              <p className="text-gray-600">Conditions look good for farming activities!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {advice.map((item, index) => (
                <div key={index} className={`p-3 rounded-lg ${
                  item.type === 'warning' ? 'bg-warning/10 border border-warning/20' : 'bg-info/10 border border-info/20'
                }`}>
                  <div className="flex items-start space-x-3">
                    <ApperIcon 
                      name={item.icon}
                      className={item.type === 'warning' ? 'text-warning' : 'text-info'}
                      size={20}
                    />
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 7-Day Forecast */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 font-display mb-6">
          7-Day Forecast
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {forecast.map((day, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <div className="text-sm font-medium text-gray-600 mb-2">
                {format(addDays(new Date(), index), index === 0 ? "'Today'" : 'EEE')}
              </div>
              
              <ApperIcon 
                name={getWeatherIcon(day.condition)}
                className={`${getWeatherColor(day.condition)} mx-auto mb-3`}
                size={32}
              />
              
              <div className="space-y-1">
                <div className="font-bold text-gray-900">
                  {day.high}°
                </div>
                <div className="text-sm text-gray-600">
                  {day.low}°
                </div>
                <div className="text-xs text-gray-500">
                  {day.precipitationChance}% rain
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Weather Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="UV Index"
          value={weather?.uvIndex || 6}
          icon="Sun"
          color="warning"
        />
        <StatsCard
          title="Visibility"
          value={`${weather?.visibility || 10} mi`}
          icon="Eye"
          color="info"
        />
        <StatsCard
          title="Pressure"
          value={`${weather?.pressure || 30.15} in`}
          icon="Gauge"
          color="primary"
        />
        <StatsCard
          title="Dew Point"
          value={`${weather?.dewPoint || 58}°F`}
          icon="Droplets"
          color="info"
        />
      </div>
    </div>
  )
}

export default Weather
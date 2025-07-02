class WeatherService {
  async getCurrentWeather() {
    await this.delay(500)
    return {
      temperature: 72,
      condition: 'sunny',
      humidity: 65,
      windSpeed: 8,
      precipitationChance: 20,
      uvIndex: 6,
      visibility: 10,
      pressure: 30.15,
      dewPoint: 58
    }
  }
  
  async getForecast() {
    await this.delay(600)
    return [
      { high: 75, low: 62, condition: 'sunny', precipitationChance: 10 },
      { high: 78, low: 65, condition: 'partly-cloudy', precipitationChance: 25 },
      { high: 73, low: 60, condition: 'cloudy', precipitationChance: 40 },
      { high: 69, low: 58, condition: 'rainy', precipitationChance: 80 },
      { high: 71, low: 59, condition: 'partly-cloudy', precipitationChance: 30 },
      { high: 76, low: 63, condition: 'sunny', precipitationChance: 15 },
      { high: 79, low: 66, condition: 'sunny', precipitationChance: 5 }
    ]
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default new WeatherService()
class WeatherService {
    async getForecast(city) {
        // Mock implementation
        // In a real app, you would fetch from OpenWeatherMap or similar
        const forecasts = [
            { date: '2023-10-27', temp: 25, condition: 'Sunny' },
            { date: '2023-10-28', temp: 24, condition: 'Cloudy' },
            { date: '2023-10-29', temp: 22, condition: 'Rain' }
        ];
        return forecasts;
    }
}

module.exports = new WeatherService();

'use client';

import { useState } from 'react';

export default function ForecastCard({ forecast }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const getMostFrequentWeather = (weatherCounts) => {
    return Object.entries(weatherCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const getWeatherIcon = (weatherMain) => {
    const iconMap = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️'
    };
    return iconMap[weatherMain] || '🌈';
  };

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
      <h3 className="text-2xl font-semibold mb-6 text-center">5-Day Forecast</h3>
      <div className="space-y-4">
        {forecast.map((day, index) => {
          const isExpanded = expandedDay === index;
          const dominantWeather = getMostFrequentWeather(day.stats.weatherCounts);
          
          return (
            <div 
              key={index} 
              className="bg-white/10 rounded-2xl overflow-hidden transition-all duration-300"
            >
              {/* Day Header */}
              <div 
                className="p-4 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => setExpandedDay(isExpanded ? null : index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getWeatherIcon(dominantWeather)}</span>
                    <div>
                      <h4 className="text-lg font-medium">{day.dayOfWeek}</h4>
                      <p className="text-sm text-white/60">{day.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">{Math.round(day.stats.maxTemp)}°</p>
                      <p className="text-sm text-white/60">{Math.round(day.stats.minTemp)}°</p>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg 
                        className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-4 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <h5 className="text-sm font-medium mb-2">Daily Summary</h5>
                      <div className="space-y-2">
                        <p>Average Temperature: {Math.round(day.stats.avgTemp)}°</p>
                        <p>Total Precipitation: {day.stats.totalPrecipitation.toFixed(1)}mm</p>
                        <p>Mostly: {dominantWeather}</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <h5 className="text-sm font-medium mb-2">Weather Conditions</h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(day.stats.weatherCounts).map(([weather, count]) => (
                          <span 
                            key={weather}
                            className="px-2 py-1 bg-white/10 rounded-full text-sm"
                          >
                            {getWeatherIcon(weather)} {weather} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h5 className="text-sm font-medium mb-3">Hourly Forecast</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {day.hours.map((hour, hourIndex) => (
                      <div 
                        key={hourIndex}
                        className="bg-white/5 rounded-xl p-3 text-center"
                      >
                        <p className="text-sm font-medium">{hour.time}</p>
                        <p className="text-2xl my-2">{getWeatherIcon(hour.weather.main)}</p>
                        <p className="text-lg font-semibold">{hour.temperature.current}°</p>
                        <p className="text-xs text-white/60">
                          {hour.precipitation.probability}% rain
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState } from 'react';
import ForecastCard from './ForecastCard';
import WeatherMap from './WeatherMap';

export default function WeatherCard({ data }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!data || !data.current) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2">{data.current.location.name}</h2>
          <p className="text-white/80">{data.current.time.current}</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <img
              src={`http://openweathermap.org/img/wn/${data.current.weather.icon}@4x.png`}
              alt={data.current.weather.description}
              className="w-32 h-32 mx-auto"
            />
            <p className="text-5xl font-bold mt-4">{data.current.temperature.current}°</p>
            <p className="text-xl capitalize mt-2">{data.current.weather.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60">Feels Like</p>
            <p className="text-2xl font-semibold">{data.current.temperature.feelsLike}°</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60">Humidity</p>
            <p className="text-2xl font-semibold">{data.current.humidity.value}%</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60">Wind</p>
            <p className="text-2xl font-semibold">{data.current.wind.speed} {data.current.wind.unit}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60">Pressure</p>
            <p className="text-2xl font-semibold">{data.current.pressure.seaLevel} {data.current.pressure.unit}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60">Sunrise</p>
            <p className="text-xl font-semibold">{data.current.time.sunrise}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-white/60">Sunset</p>
            <p className="text-xl font-semibold">{data.current.time.sunset}</p>
          </div>
        </div>
      </div>

      {data.forecast && data.forecast.length > 0 && (
        <ForecastCard forecast={data.forecast} />
      )}

      {data.current.location.coordinates && (
        <WeatherMap coordinates={data.current.location.coordinates} />
      )}
    </div>
  );
} 
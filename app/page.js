'use client';

import { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import SearchBar from './components/SearchBar';
import LoadingSpinner from './components/LoadingSpinner';

export default function Home() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geolocationLoading, setGeolocationLoading] = useState(false);
  const [geolocationError, setGeolocationError] = useState(null);

  // State for the search bar input, initialized from URL or empty
  const [searchCity, setSearchCity] = useState('');

  const fetchWeather = async (city, lat = null, lon = null) => {
    setLoading(true);
    setError(null);
    try {
      let apiUrl = '/api/weather';
      if (city) {
        apiUrl += `?city=${encodeURIComponent(city)}`;
      } else if (lat !== null && lon !== null) {
        apiUrl += `?lat=${lat}&lon=${lon}`;
      } else {
        throw new Error('No city or coordinates provided.');
      }
      
      const response = await fetch(apiUrl);
      console.log('Weather API Response:', {
        status: response.status,
        ok: response.ok
      });
      const data = await response.json();
      console.log('Weather API Data:', data);
      if (!response.ok) throw new Error(data.message);
      setWeatherData(data);
      setSearchCity(data.current.location.name); // Update search bar with detected city name
    } catch (err) {
      console.error('Weather API Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');

    if (cityParam) {
      setSearchCity(cityParam);
      fetchWeather(cityParam);
    } else if (navigator.geolocation) {
      setGeolocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Geolocation successful:', { latitude, longitude });
          fetchWeather(null, latitude, longitude);
          setGeolocationLoading(false);
          setGeolocationError(null);
        },
        (geoError) => {
          console.error('Geolocation error:', geoError);
          let errorMessage = 'Unable to retrieve your location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            errorMessage = 'Location access denied. Please allow location access in your browser settings or search for a city.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            errorMessage = 'Location information is unavailable.';
          } else if (geoError.code === geoError.TIMEOUT) {
            errorMessage = 'The request to get user location timed out.';
          }
          setGeolocationError(errorMessage);
          setGeolocationLoading(false);
        }
      );
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Weather Forecast</h1>
        <SearchBar onSearch={fetchWeather} initialCity={searchCity} />
        
        {loading && <LoadingSpinner />}

        {geolocationLoading && (
          <div className="text-center mt-4 text-white/80">
            Detecting your location...
          </div>
        )}

        {geolocationError && (
          <div className="text-red-300 text-center mt-4">
            {geolocationError}
          </div>
        )}
        
        {error && !geolocationError && (
          <div className="text-red-300 text-center mt-4">
            {error}
          </div>
        )}

        {weatherData && <WeatherCard data={weatherData} />}
        </div>
      </main>
  );
}

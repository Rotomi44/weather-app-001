'use client';

import { useState, useEffect } from 'react';

const WEATHER_LAYERS = {
  clouds: {
    name: 'Clouds',
    layer: 'clouds_new',
    description: 'Cloud coverage map'
  },
  precipitation: {
    name: 'Precipitation',
    layer: 'precipitation_new',
    description: 'Rain and snow forecast'
  },
  pressure: {
    name: 'Pressure',
    layer: 'pressure_new',
    description: 'Sea level pressure'
  },
  wind: {
    name: 'Wind',
    layer: 'wind_new',
    description: 'Wind speed and direction'
  },
  temperature: {
    name: 'Temperature',
    layer: 'temp_new',
    description: 'Temperature forecast'
  }
};

export default function WeatherMap({ coordinates }) {
  const [selectedLayer, setSelectedLayer] = useState('temperature');
  const [zoom, setZoom] = useState(5);
  const [tiles, setTiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coordinates?.latitude || !coordinates?.longitude) {
      setError('Invalid coordinates: Latitude or Longitude is missing.');
      return;
    }

    try {
      const { latitude, longitude } = coordinates;
      console.log('WeatherMap useEffect - input coordinates:', { latitude, longitude });

      const n = Math.pow(2, zoom);
      const latRad = latitude * Math.PI / 180;
      const centerX = Math.floor((longitude + 180) / 360 * n);
      const centerY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);

      console.log('WeatherMap useEffect - calculated center tiles:', { centerX, centerY });

      // Generate a 3x3 grid of tiles centered on the coordinates
      const newTiles = [];
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          newTiles.push({
            x: centerX + x,
            y: centerY + y,
            z: zoom
          });
        }
      }
      setTiles(newTiles);
      setError(null);
    } catch (err) {
      console.error('Error calculating tile coordinates:', err);
      setError('Error calculating map tiles');
    }
  }, [coordinates, zoom]);

  const getTileUrl = (tile) => {
    return `/api/weather/map?layer=${WEATHER_LAYERS[selectedLayer].layer}&z=${tile.z}&x=${tile.x}&y=${tile.y}`;
  };

  if (error) {
    return (
      <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
        <div className="text-center text-red-300">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-2xl font-semibold mb-4 md:mb-0">Weather Map</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(WEATHER_LAYERS).map(([key, layer]) => (
            <button
              key={key}
              onClick={() => setSelectedLayer(key)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedLayer === key
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/15'
              }`}
              title={layer.description}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/20">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {tiles.map((tile, index) => (
            <img
              key={index}
              src={getTileUrl(tile)}
              alt={`Weather map tile ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load tile:', tile);
                e.target.style.display = 'none';
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z + 1, 10))}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            +
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 1, 2))}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            -
          </button>
        </div>
      </div>

      <p className="text-sm text-white/60 mt-4 text-center">
        {WEATHER_LAYERS[selectedLayer].description}
      </p>
    </div>
  );
} 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!city && (!lat || !lon)) {
    return new Response(JSON.stringify({ message: 'City or coordinates (latitude, longitude) parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }

    let geoData;
    let currentLat;
    let currentLon;

    if (city) {
      // Step 1: Get coordinates using geocoding API if city is provided
      const geoResponse = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          city
        )}&limit=1&appid=${apiKey}`
      );
      geoData = await geoResponse.json();
      console.log('Geocoding API Response:', {
        status: geoResponse.status,
        ok: geoResponse.ok,
        data: geoData
      });

      if (!geoResponse.ok) {
        throw new Error(geoData.message || 'Failed to fetch location data');
      }

      if (!geoData.length) {
        throw new Error('City not found');
      }

      currentLat = geoData[0].lat;
      currentLon = geoData[0].lon;
    } else {
      // Use provided lat/lon if no city
      currentLat = parseFloat(lat);
      currentLon = parseFloat(lon);

      if (isNaN(currentLat) || isNaN(currentLon)) {
        throw new Error('Invalid latitude or longitude provided.');
      }
      // For reverse geocoding to get city name from coordinates if needed for display
      const reverseGeoResponse = await fetch(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${currentLat}&lon=${currentLon}&limit=1&appid=${apiKey}`
      );
      const reverseGeoData = await reverseGeoResponse.json();
      if (reverseGeoResponse.ok && reverseGeoData.length > 0) {
        geoData = reverseGeoData;
      } else {
        geoData = [{
          name: 'Unknown Location',
          country: '',
          state: '',
          lat: currentLat,
          lon: currentLon
        }];
      }
    }

    // Step 2: Get current weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${currentLat}&lon=${currentLon}&units=metric&appid=${apiKey}`
    );

    const weatherData = await weatherResponse.json();
    console.log('Current Weather API Response:', {
      status: weatherResponse.status,
      ok: weatherResponse.ok,
      data: weatherData
    });

    if (!weatherResponse.ok) {
      throw new Error(weatherData.message || 'Failed to fetch weather data');
    }

    // Step 3: Get 5-day forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${currentLat}&lon=${currentLon}&units=metric&appid=${apiKey}`
    );

    const forecastData = await forecastResponse.json();
    console.log('Forecast API Response:', {
      status: forecastResponse.status,
      ok: forecastResponse.ok,
      data: forecastData
    });
    
    if (!forecastResponse.ok) {
      throw new Error(forecastData.message || 'Failed to fetch forecast data');
    }

    // Format the current weather data
    const formattedCurrentData = {
      location: {
        name: geoData[0].name,
        country: geoData[0].country,
        state: geoData[0].state,
        coordinates: {
          latitude: currentLat,
          longitude: currentLon
        }
      },
      weather: {
        id: weatherData.weather[0].id,
        main: weatherData.weather[0].main,
        description: weatherData.weather[0].description,
        icon: weatherData.weather[0].icon
      },
      temperature: {
        current: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        min: Math.round(weatherData.main.temp_min),
        max: Math.round(weatherData.main.temp_max),
        unit: '°C'
      },
      pressure: {
        seaLevel: weatherData.main.sea_level,
        groundLevel: weatherData.main.grnd_level,
        unit: 'hPa'
      },
      humidity: {
        value: weatherData.main.humidity,
        unit: '%'
      },
      visibility: {
        value: weatherData.visibility / 1000,
        unit: 'km'
      },
      wind: {
        speed: Math.round(weatherData.wind.speed * 3.6),
        direction: weatherData.wind.deg,
        gust: weatherData.wind.gust ? Math.round(weatherData.wind.gust * 3.6) : null,
        unit: 'km/h'
      },
      clouds: {
        value: weatherData.clouds.all,
        unit: '%'
      },
      precipitation: {
        rain: weatherData.rain ? {
          '1h': weatherData.rain['1h'],
          unit: 'mm/h'
        } : null,
        snow: weatherData.snow ? {
          '1h': weatherData.snow['1h'],
          unit: 'mm/h'
        } : null
      },
      time: {
        sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
        sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
        timezone: weatherData.timezone,
        lastUpdated: new Date(weatherData.dt * 1000).toLocaleString(),
        current: 'Now'
      }
    };

    // Format the forecast data
    const forecastByDay = forecastData.list.reduce((acc, item) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });

      if (!acc[dayKey]) {
        acc[dayKey] = {
          date: dayKey,
          dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
          hours: [],
          stats: {
            maxTemp: -Infinity,
            minTemp: Infinity,
            avgTemp: 0,
            totalPrecipitation: 0,
            weatherCounts: {}
          }
        };
      }

      const hourData = {
        time: date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        temperature: {
          current: Math.round(item.main.temp),
          feelsLike: Math.round(item.main.feels_like),
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max),
          unit: '°C'
        },
        weather: {
          id: item.weather[0].id,
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        wind: {
          speed: Math.round(item.wind.speed * 3.6),
          direction: item.wind.deg,
          gust: item.wind.gust ? Math.round(item.wind.gust * 3.6) : null,
          unit: 'km/h'
        },
        clouds: {
          value: item.clouds.all,
          unit: '%'
        },
        precipitation: {
          probability: Math.round(item.pop * 100),
          rain: item.rain ? {
            '3h': item.rain['3h'],
            unit: 'mm'
          } : null,
          snow: item.snow ? {
            '3h': item.snow['3h'],
            unit: 'mm'
          } : null
        }
      };

      // Update day stats
      acc[dayKey].hours.push(hourData);
      acc[dayKey].stats.maxTemp = Math.max(acc[dayKey].stats.maxTemp, hourData.temperature.current);
      acc[dayKey].stats.minTemp = Math.min(acc[dayKey].stats.minTemp, hourData.temperature.current);
      acc[dayKey].stats.avgTemp = (acc[dayKey].stats.avgTemp * (acc[dayKey].hours.length - 1) + hourData.temperature.current) / acc[dayKey].hours.length;
      
      if (hourData.precipitation.rain) {
        acc[dayKey].stats.totalPrecipitation += hourData.precipitation.rain['3h'] || 0;
      }
      if (hourData.precipitation.snow) {
        acc[dayKey].stats.totalPrecipitation += hourData.precipitation.snow['3h'] || 0;
      }

      // Count weather conditions
      const weatherKey = hourData.weather.main;
      acc[dayKey].stats.weatherCounts[weatherKey] = (acc[dayKey].stats.weatherCounts[weatherKey] || 0) + 1;

      return acc;
    }, {});

    // Convert to array and sort by date
    const formattedForecastData = Object.values(forecastByDay).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // Combine both responses
    const combinedData = {
      current: formattedCurrentData,
      forecast: formattedForecastData
    };

    return new Response(JSON.stringify(combinedData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const layer = searchParams.get('layer');
  const z = parseInt(searchParams.get('z'));
  const x = parseInt(searchParams.get('x'));
  const y = parseInt(searchParams.get('y'));

  if (!layer || isNaN(z) || isNaN(x) || isNaN(y)) {
    return new Response(JSON.stringify({ 
      message: 'Invalid parameters',
      details: { layer, z, x, y }
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }

    const response = await fetch(
      `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`
    );

    console.log("Map tile request:", {
      url: `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png`,
      status: response.status,
      ok: response.ok
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch map tile: ${response.status} ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Map tile error:', error);
    return new Response(
      JSON.stringify({ 
        message: error.message || 'Internal server error',
        details: { layer, z, x, y }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
} 
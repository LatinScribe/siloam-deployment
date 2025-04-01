import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Next.js API route to fetch weather data from OpenWeatherMap by latitude and longitude.
 *
 * Expects a POST request with JSON body:
 *   {
 *     "latitude": number,
 *     "longitude": number
 *   }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract lat/lon from JSON body
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'latitude and longitude are required as numbers' });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OpenWeatherMap API key' });
    }

    // Example: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&units=metric&appid={apiKey}
    // Using 'metric' for Celsius. For Fahrenheit, replace 'metric' with 'imperial'.
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

    // Call OpenWeatherMap
    const weatherResponse = await fetch(url);
    if (!weatherResponse.ok) {
      throw new Error(`OpenWeatherMap request failed: ${weatherResponse.status}`);
    }

    const data = await weatherResponse.json();

    // Extract info
    const tempC = data.main?.temp; // current temp in Celsius
    const desc = data.weather?.[0]?.description; // e.g. "broken clouds" or "raining"

    // Build a weather string
    const weatherText = `The current temperature is ${tempC}°C with ${desc}.`;

    // Return JSON
    return res.status(200).json({ text: weatherText });
  } catch (error) {
    console.error('Error fetching weather:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}

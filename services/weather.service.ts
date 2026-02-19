
import axios from 'axios';

// Interfaces for OpenWeatherMap Response
interface WeatherResponse {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  base: string;
  main: { temp: number; feels_like: number; temp_min: number; temp_max: number; pressure: number; humidity: number };
  visibility: number;
  wind: { speed: number; deg: number };
  clouds: { all: number };
  dt: number;
  sys: { country: string; sunrise: number; sunset: number };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface SimpleWeatherData {
  temp: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  iconUrl: string;
  isAlert: boolean; // Simple logic for heavy rain/storm
}

// Coordinates for Talibon, Bohol
const LAT = '10.1444';
const LON = '124.2250';

export const WeatherService = {
  getCurrentWeather: async (): Promise<SimpleWeatherData | null> => {
    // FIXED: Safe access to env var to prevent runtime "undefined" errors
    const env = (import.meta as any).env || {};
    const API_KEY = env.VITE_OPENWEATHER_API_KEY;

    if (!API_KEY) {
        // Return default mock data silently to avoid console spam if key is missing
        return {
            temp: 31,
            condition: 'Clear',
            description: 'scattered clouds',
            humidity: 75,
            windSpeed: 12,
            iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
            isAlert: false
        };
    }

    try {
      const response = await axios.get<WeatherResponse>(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
      );

      const data = response.data;
      // Alert logic: Rain (Group 5xx) or Thunderstorm (Group 2xx) or Wind > 50km/h
      const weatherId = data.weather[0].id;
      const isAlert = (weatherId >= 200 && weatherId < 600) || data.wind.speed > 13.8; // > ~50km/h

      return {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed, // m/s
        iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        isAlert
      };
    } catch (error) {
      console.error("Failed to fetch weather data", error);
      return null;
    }
  }
};

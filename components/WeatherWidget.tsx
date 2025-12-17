
import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, Loader2, RefreshCw } from 'lucide-react';
import { getWeatherInsights } from '../services/geminiService';

export const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code`
      );
      const data = await response.json();
      const current = data.current;
      
      const weatherData = {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        rain: current.rain,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code
      };
      
      setWeather(weatherData);
      
      // Get AI Insights
      const aiInsights = await getWeatherInsights(weatherData);
      setInsights(aiInsights);
      
    } catch (err) {
      console.error("Weather fetch failed", err);
      setError("Unable to load weather.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError("Location access denied.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation not supported.");
      setLoading(false);
    }
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-amber-500 h-10 w-10" />;
    if (code >= 1 && code <= 3) return <Cloud className="text-slate-500 h-10 w-10" />;
    if (code >= 51) return <CloudRain className="text-blue-500 h-10 w-10" />;
    return <Sun className="text-amber-500 h-10 w-10" />;
  };

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Snow";
    if (code <= 82) return "Showers";
    if (code <= 99) return "Thunderstorm";
    return "Clear";
  };

  if (loading) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center h-48">
      <Loader2 className="animate-spin text-agri-600" />
    </div>
  );

  if (error) return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center h-48 text-slate-400">
      <CloudRain size={32} />
      <p className="mt-2 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg border border-blue-400/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Cloud size={100} />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            {getWeatherIcon(weather.weatherCode)}
            <div>
              <h3 className="text-3xl font-bold">{weather.temperature}°C</h3>
              <p className="text-blue-100 font-medium">{getWeatherDescription(weather.weatherCode)}</p>
            </div>
          </div>
          
          <div className="flex gap-4 text-sm text-blue-100">
            <div className="flex items-center gap-1">
              <Droplets size={16} /> {weather.humidity}% Hum
            </div>
            <div className="flex items-center gap-1">
              <Wind size={16} /> {weather.windSpeed} km/h
            </div>
            <div className="flex items-center gap-1">
              <CloudRain size={16} /> {weather.rain} mm
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 w-full">
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <RefreshCw size={14} className="animate-spin-slow" /> AI Farming Insights
          </h4>
          <div className="text-xs space-y-1 leading-relaxed opacity-90">
            {insights.split('\n').filter(line => line.trim()).map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

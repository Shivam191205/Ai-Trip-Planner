import React from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Thermometer, 
  CalendarCheck,
  Compass
} from 'lucide-react';

function WeatherForecast({ weatherData, loading, isPrinting, trip }) {
  if (loading) {
    return (
      <div className="w-full glass-panel rounded-3xl p-6 md:p-8 border border-white/60 shadow-lg flex flex-col items-center justify-center min-h-[250px] animate-pulse">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-semibold">Gathering weather details for your destination...</p>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  const startDateStr = trip?.userSelection?.startDate;
  const totalDays = Number(trip?.userSelection?.days || 0);
  
  // Create a list of trip dates
  const tripDates = [];
  if (startDateStr && totalDays > 0) {
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDateStr);
      date.setDate(date.getDate() + i);
      tripDates.push(date.toISOString().split('T')[0]);
    }
  }

  const getTripDayLabel = (dateStr) => {
    const index = tripDates.indexOf(dateStr);
    return index !== -1 ? `Day ${index + 1}` : null;
  };

  const isTripDate = (dateStr) => {
    return tripDates.includes(dateStr);
  };

  const hasMatchingDates = weatherData.forecast.some(day => isTripDate(day.date));

  // Determine weather background/accent based on current description
  const getWeatherTheme = (mainCondition) => {
    const cond = (mainCondition || "").toLowerCase();
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('thunderstorm')) {
      return {
        bg: 'from-blue-500/10 via-indigo-500/5 to-transparent',
        border: 'border-blue-200/50',
        text: 'text-blue-700',
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
        glow: 'shadow-blue-500/5'
      };
    }
    if (cond.includes('snow')) {
      return {
        bg: 'from-sky-100/30 via-slate-100/10 to-transparent',
        border: 'border-sky-200/50',
        text: 'text-sky-700',
        badgeBg: 'bg-sky-50 text-sky-700 border-sky-100',
        glow: 'shadow-sky-500/5'
      };
    }
    if (cond.includes('clear') || cond.includes('sunny')) {
      return {
        bg: 'from-amber-500/10 via-orange-500/5 to-transparent',
        border: 'border-amber-200/50',
        text: 'text-amber-700',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
        glow: 'shadow-amber-500/5'
      };
    }
    // Default to cloudy/neutral
    return {
      bg: 'from-teal-500/10 via-emerald-500/5 to-transparent',
      border: 'border-emerald-250/30',
      text: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      glow: 'shadow-emerald-500/5'
    };
  };

  const theme = getWeatherTheme(weatherData.current?.main);

  return (
    <div className={`mt-8 px-4 sm:px-0 transition-all duration-500`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-2xl text-gray-900 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs">🌦️</span> 
            Destination Weather Outlook
          </h2>
          {hasMatchingDates && !isPrinting && (
            <span className="hidden sm:flex items-center gap-1 bg-emerald-100/75 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full animate-bounce">
              <CalendarCheck className="w-3.5 h-3.5" />
              Forecast matches your trip!
            </span>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Current Live Weather Panel */}
          <div className={`lg:col-span-1 glass-panel rounded-3xl border ${theme.border} p-6 shadow-xl relative overflow-hidden flex flex-col justify-between bg-gradient-to-br ${theme.bg}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black tracking-widest text-slate-500 uppercase flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  Live Condition
                </span>
                <span className="text-xs font-bold bg-white/80 border border-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {weatherData.city}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.current?.icon}@4x.png`} 
                  alt={weatherData.current?.main}
                  className="w-20 h-20 object-contain drop-shadow-md animate-pulse"
                />
                <div>
                  <h3 className="text-4xl sm:text-5xl font-black text-slate-900 leading-none">
                    {weatherData.current?.temp}°C
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 capitalize mt-1.5">
                    {weatherData.current?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Weather Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-center text-slate-500">
                  <Thermometer className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Feels Like</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5">{weatherData.current?.feels_like}°C</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-center text-slate-500">
                  <Droplets className="w-4.5 h-4.5 text-blue-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Humidity</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5">{weatherData.current?.humidity}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100/80 flex items-center justify-center text-slate-500">
                  <Wind className="w-4.5 h-4.5 text-sky-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Wind Speed</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5">{weatherData.current?.wind} m/s</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5 font-medium text-xs text-slate-450 leading-relaxed justify-end col-span-2">
                <span>Updated in real-time</span>
              </div>
            </div>

          </div>

          {/* 5-Day Forecast Grid Panel */}
          <div className="lg:col-span-2 glass-panel rounded-3xl border border-slate-100 p-5 md:p-6 shadow-xl flex flex-col justify-between bg-white">
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-1.5">
                📅 5-Day Weather Outlook
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                {weatherData.forecast.slice(0, 5).map((day) => {
                  const dayLabel = getTripDayLabel(day.date);
                  const isMatch = isTripDate(day.date);
                  
                  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div 
                      key={day.date} 
                      className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                        isMatch 
                          ? 'border-emerald-500 bg-emerald-50/15 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/20' 
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="text-center w-full flex flex-col gap-0.5">
                        {isMatch && dayLabel ? (
                          <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider mx-auto mb-1 block">
                            {dayLabel}
                          </span>
                        ) : (
                          <div className="h-4"></div>
                        )}
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight block">{formattedDate.split(',')[0]}</span>
                        <span className="text-xs font-black text-slate-800 block">{formattedDate.split(',')[1]}</span>
                      </div>

                      <img 
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                        alt={day.main}
                        className="w-12 h-12 object-contain my-1.5 filter drop-shadow-xs"
                      />

                      <div className="text-center">
                        <span className="text-base font-black text-slate-900 block">{day.avgTemp}°C</span>
                        <span className="text-[9px] font-semibold text-slate-400 capitalize block truncate max-w-[80px]">
                          {day.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
              <p>Forecast shows average conditions for each upcoming day.</p>
              {!hasMatchingDates && startDateStr && (
                <span className="text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                  Trip dates fall outside the 5-day forecast window.
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default WeatherForecast;

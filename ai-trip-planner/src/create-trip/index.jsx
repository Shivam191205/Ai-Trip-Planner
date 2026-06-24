import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { SelectBudgetOptions, SelectTravelsList } from '@/constants/options'
import {
  GeoapifyContext,
  GeoapifyGeocoderAutocomplete
} from "@geoapify/react-geocoder-autocomplete";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { chatSession } from '@/service/AImodel';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner'
import { AI_PROMPT_BASIC } from '@/constants/options';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from "axios";
import  {setDoc, doc} from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { useNavigate, useSearchParams } from 'react-router-dom';

function CreateTrip() {

  const [place, setPlace] = useState(null)
  const [formData, setformData] = useState({})
  const [openDialog, setOpenDialog] = useState(false);
  const [openDatesDialog, setOpenDatesDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [departureCity, setDepartureCity] = useState("");
  const[loading,setLoading]=useState(false);
  const route=useNavigate();
  const [searchParams] = useSearchParams();

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [openWeatherDialog, setOpenWeatherDialog] = useState(false);

  useEffect(() => {
    const destination = searchParams.get('destination');
    const days = searchParams.get('days');
    const budget = searchParams.get('budget');
    const traveller = searchParams.get('traveller');

    if (destination || days || budget || traveller) {
      setformData({
        location: destination || "",
        days: days || "",
        budget: budget || "",
        traveller: traveller || ""
      });
      if (destination) {
        setPlace({
          properties: {
            formatted: destination
          }
        });
      }
    }
  }, [searchParams]);

  const handleInputChange = (name, value) => {
    setformData({
      ...formData,
      [name]: value
    })
  }

  useEffect(() => {
    console.log(formData)
  }, [formData])

  const login = useGoogleLogin({
    onSuccess: (response) => {
      console.log(response);
      getUserInfo(response)
    },
    onError: (error) => { console.log(error) }
  })

  const parseTripData = (tripData) => {
    if (!tripData) return null;
    if (typeof tripData === 'object') return tripData;

    let raw = String(tripData).trim();
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*)\s*```$/i);
    if (codeBlockMatch) {
      raw = codeBlockMatch[1].trim();
    }

    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      raw = raw.slice(firstBrace, lastBrace + 1);
    }

    return JSON.parse(raw);
  };

  const getEndDate = () => {
    if (!startDate || !formData?.days) return "";
    const date = new Date(startDate);
    date.setDate(date.getDate() + Number(formData.days));
    return date.toISOString().split('T')[0];
  };

  const handleDatesSubmit = (e) => {
    e.preventDefault();
    if (!departureCity.trim()) {
      toast.error("Please enter a departure city.");
      return;
    }
    if (!startDate) {
      toast.error("Please select your travel start date.");
      return;
    }
    
    const calculatedEnd = getEndDate();
    const updatedData = {
      ...formData,
      departureCity: departureCity.trim(),
      startDate: startDate,
      endDate: calculatedEnd
    };
    
    setformData(updatedData);
    setOpenDatesDialog(false);
    handleGenerateTrip(updatedData);
  };

  const handleCheckWeather = async () => {
    if (!startDate) {
      toast.error("Please select your travel start date first.");
      return;
    }
    const locationStr = formData?.location;
    if (!locationStr) {
      toast.error("Please enter a travel destination first.");
      return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const selected = new Date(startDate);
    selected.setHours(0,0,0,0);
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      toast.error("Cannot check weather for past dates.");
      return;
    }

    if (diffDays > 14) {
      toast.error("Dates are too far, can't show weather at those days");
      return;
    }

    if (diffDays > 5) {
      toast.info(`Weather forecasting is only available up to 5 days in advance. Your trip starts in ${diffDays} days.`);
      return;
    }

    setWeatherLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        throw new Error("OpenWeather API key is undefined. Please verify VITE_OPENWEATHER_API_KEY exists in your .env.local file and restart your Vite dev server.");
      }
      
      let response;
      let data;
      let success = false;
      
      // Strategy 1: query with original full location
      try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(locationStr)}&appid=${apiKey}&units=metric`;
        response = await fetch(url);
        if (response.ok) {
          data = await response.json();
          success = true;
        }
      } catch (e) {
        console.warn("Failed fetching weather with full location, trying fallback", e);
      }
      
      // Strategy 2: query with cleaned location (split by comma and take last 2 segments, e.g. "Paris, France")
      if (!success) {
        const parts = locationStr.split(",").map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          const cleanedStr = parts.slice(-2).join(", ");
          const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cleanedStr)}&appid=${apiKey}&units=metric`;
          response = await fetch(url);
          if (response.ok) {
            data = await response.json();
            success = true;
          }
        }
      }
      
      // Strategy 3: query with city name (second to last segment, or first segment)
      if (!success) {
        const parts = locationStr.split(",").map(p => p.trim()).filter(Boolean);
        if (parts.length > 0) {
          const cityOption1 = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
          const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityOption1)}&appid=${apiKey}&units=metric`;
          response = await fetch(url);
          if (response.ok) {
            data = await response.json();
            success = true;
          } else if (parts.length > 2) {
            const cityOption2 = parts[0];
            const url2 = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityOption2)}&appid=${apiKey}&units=metric`;
            const response2 = await fetch(url2);
            if (response2.ok) {
              data = await response2.json();
              success = true;
            }
          }
        }
      }
      
      if (!success || !data) {
        throw new Error("Could not fetch weather data from any fallback");
      }
      
      const dailyForecasts = {};
      data.list.forEach((item) => {
        const dateStr = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
        if (!dailyForecasts[dateStr]) {
          dailyForecasts[dateStr] = {
            tempSum: 0,
            count: 0,
            minTemp: item.main.temp_min,
            maxTemp: item.main.temp_max,
            weather: item.weather[0],
            date: dateStr
          };
        }
        dailyForecasts[dateStr].tempSum += item.main.temp;
        dailyForecasts[dateStr].count += 1;
        if (item.main.temp_min < dailyForecasts[dateStr].minTemp) {
          dailyForecasts[dateStr].minTemp = item.main.temp_min;
        }
        if (item.main.temp_max > dailyForecasts[dateStr].maxTemp) {
          dailyForecasts[dateStr].maxTemp = item.main.temp_max;
        }
      });

      const formattedForecast = Object.values(dailyForecasts).map((day) => ({
        date: day.date,
        avgTemp: Math.round(day.tempSum / day.count),
        minTemp: Math.round(day.minTemp),
        maxTemp: Math.round(day.maxTemp),
        description: day.weather.description,
        icon: day.weather.icon,
        main: day.weather.main
      }));

      setWeatherData({
        city: data.city.name,
        country: data.city.country,
        forecast: formattedForecast
      });
      setOpenWeatherDialog(true);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load weather forecast: ${error.message || error}`);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleGenerateTrip = async (dataToUse) => {
    const actualData = (dataToUse && !dataToUse.target && !dataToUse.preventDefault) ? dataToUse : formData;
    
    let user = localStorage.getItem("user");
    if (!user && import.meta.env.DEV) {
      user = JSON.stringify({ email: "dev@example.com", name: "Dev User", picture: "https://lh3.googleusercontent.com/a/default-user" });
      localStorage.setItem("user", user);
    }
    if (!user) {
      setOpenDialog(true);
      return;
    }
    if (!actualData?.location || !actualData?.budget || !actualData?.traveller || !actualData?.days) {
      toast("Please fill all the details correctly")
      return;
    }
    if (Number(actualData?.days) > 5) {
      toast("Please enter 5 days or fewer to ensure a reliable response within token limits.")
      return;
    }

    if (!actualData?.startDate || !actualData?.departureCity) {
      if (actualData?.departureCity) setDepartureCity(actualData.departureCity);
      if (actualData?.startDate) setStartDate(actualData.startDate);
      setOpenDatesDialog(true);
      return;
    }

    setLoading(true);
    try {
      const FINAL_PROMPT = AI_PROMPT_BASIC.replaceAll('{location}', actualData?.location)
        .replace('{days}', actualData?.days)
        .replace('{traveller}', actualData?.traveller)
        .replace('{budget}', actualData?.budget)
        .replace('{budget}', actualData?.budget);

      console.log(FINAL_PROMPT)

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const textResponse = result.response.text();
      console.log(textResponse);
      
      await saveAItrip(textResponse, actualData);
    } catch (error) {
      console.error("Error generating trip:", error);
      toast("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const saveAItrip = async (TripData, dataToUse = formData) => {
    const docId = Date.now().toString();
    const user = JSON.parse(localStorage.getItem("user"));
    
    let parsedData;
    try {
      parsedData = parseTripData(TripData);
    } catch (error) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Invalid response format received from AI.");
    }

    await setDoc(doc(db, "trips", docId), {
      userSelection: dataToUse,
      email: user?.email,
      tripData: parsedData,
      ID: docId,
    });
    
    route(`/view-trip/${docId}`);
  }

  const getUserInfo = (tokenInfo) => {
    axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: "application/json",
        },
      }).then((resp) => {
        console.log(resp);
        localStorage.setItem("user", JSON.stringify(resp.data));
        window.dispatchEvent(new Event('auth-change'));
        setOpenDialog(false)
        handleGenerateTrip();
      }).catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className='w-full min-h-screen travel-bg-ambient py-6 px-4 sm:py-12 sm:px-10 md:px-20 lg:px-32 xl:px-44 flex flex-col items-center'>
      <div className='max-w-4xl w-full glass-panel rounded-3xl p-5 sm:p-8 md:p-12 shadow-2xl border border-white/60 mx-2'>
        <h2 className='text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center gap-3 flex-wrap justify-center sm:justify-start'>
          Tell us your travel preferences
          <span className='bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-500 animate-pulse'>🏕️🌴</span>
        </h2>

        <div className='text-gray-600 text-sm sm:text-lg mt-3 font-medium'>
          Provide some basic information, and our AI trip planner will build a custom travel diary tailored to your vibes.
        </div>

        <div className="mt-10 md:mt-12 flex flex-col gap-8 md:gap-10">
          <div>
            <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2'>
              <span className='bg-emerald-100 text-emerald-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>📍</span> Where do you want to travel?
            </h2>
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-xs transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <GeoapifyContext apiKey={import.meta.env.VITE_GEOAPIFY_API_KEY}>
                <GeoapifyGeocoderAutocomplete
                  placeholder="Enter Location"
                  value={formData.location || ''}
                  placeSelect={(value) => {
                    setPlace(value);
                    handleInputChange('location', value.properties.formatted);
                    console.log(value);
                  }}
                />
              </GeoapifyContext>
            </div>
          </div>

          <div>
            <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-3 flex items-center gap-2'>
              <span className='bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>📅</span> How many days are you planning your trip?
            </h2>
            <Input
              onChange={(e) => handleInputChange('days', e.target.value)}
              placeholder="Ex. 3"
              type="number"
              value={formData.days || ''}
              className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white py-6 text-lg shadow-xs"
            />
          </div>

          <div>
            <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
              <span className='bg-amber-100 text-amber-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>💰</span> What is your budget?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              {SelectBudgetOptions.map((option) => {
                const isSelected = formData.budget === option.title;
                let selectedStyle = 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/5';
                if (isSelected) {
                  if (option.title === 'Cheap') {
                    selectedStyle = 'border-emerald-600 bg-emerald-50/20 text-emerald-950 shadow-lg shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-500/20';
                  } else if (option.title === 'Moderate') {
                    selectedStyle = 'border-teal-600 bg-teal-50/20 text-teal-950 shadow-lg shadow-teal-500/10 scale-[1.02] ring-2 ring-teal-500/20';
                  } else if (option.title === 'Luxury') {
                    selectedStyle = 'border-purple-600 bg-purple-50/20 text-purple-950 shadow-lg shadow-purple-500/10 scale-[1.02] ring-2 ring-purple-500/20';
                  }
                }
                return (
                  <div key={option.id}
                    onClick={() => handleInputChange('budget', option.title)}
                    className={`group flex gap-3 sm:gap-4 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-md ${selectedStyle}`}>
                    <div className="text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110">{option.icon}</div>
                    <div className='flex flex-col gap-1'>
                      <h3 className="text-base sm:text-lg font-bold leading-tight">{option.title}</h3>
                      <p className="text-gray-505 text-[11px] sm:text-xs leading-normal font-medium">{option.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-1 flex items-center gap-2'>
              <span className='bg-rose-100 text-rose-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>👥</span> Who do you plan on traveling with on your next adventure?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
              {SelectTravelsList.map((option) => {
                const isSelected = formData.traveller === option.people;
                let selectedStyle = 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/5';
                if (isSelected) {
                  if (option.id === 1) {
                    selectedStyle = 'border-emerald-600 bg-emerald-50/20 text-emerald-950 shadow-lg shadow-emerald-500/10 scale-[1.02] ring-2 ring-emerald-500/20';
                  } else if (option.id === 2) {
                    selectedStyle = 'border-teal-600 bg-teal-50/20 text-teal-950 shadow-lg shadow-teal-500/10 scale-[1.02] ring-2 ring-teal-500/20';
                  } else if (option.id === 3) {
                    selectedStyle = 'border-purple-600 bg-purple-50/20 text-purple-950 shadow-lg shadow-purple-500/10 scale-[1.02] ring-2 ring-purple-500/20';
                  } else if (option.id === 4) {
                    selectedStyle = 'border-amber-600 bg-amber-50/20 text-amber-950 shadow-lg shadow-amber-500/10 scale-[1.02] ring-2 ring-amber-500/20';
                  }
                }
                return (
                  <div key={option.id}
                    onClick={() => handleInputChange('traveller', option.people)}
                    className={`group flex gap-3 sm:gap-4 rounded-2xl border p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:shadow-md ${selectedStyle}`}>
                    <div className="text-3xl shrink-0 transition-transform duration-300 group-hover:scale-110">{option.icon}</div>
                    <div className='flex flex-col gap-1'>
                      <h3 className="text-base sm:text-lg font-bold leading-tight">{option.title}</h3>
                      <p className="text-gray-505 text-[11px] sm:text-xs leading-normal font-medium">{option.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='flex justify-end my-10 border-t border-gray-200/50 pt-8'>
          <Button 
            className='w-full sm:w-auto cursor-pointer bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-base sm:text-lg px-6 py-5 sm:px-8 sm:py-6 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-md shadow-emerald-900/10 hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2' 
            onClick={handleGenerateTrip}
            disabled={loading}
          >
            {loading ? <AiOutlineLoading3Quarters className='w-5 h-5 animate-spin' /> : "Generate Trip ✨"}
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="glass-panel border-white/60 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogDescription>
              <div className='flex flex-col items-center text-center p-3'>
                <img src="/logoo.png" className='w-32 h-14 object-contain mb-3' alt="Logo" />
                <h2 className='font-black text-2xl text-gray-900 mt-2'>Sign in with Google</h2>
                <p className='text-gray-500 text-sm mt-1 mb-6'>Sign in securely to save and view your custom AI itineraries.</p>
                <Button className='w-full flex gap-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm py-6 rounded-xl font-bold cursor-pointer transition-all hover:scale-[1.01]' onClick={login}>
                  <FcGoogle className='w-6 h-6' />
                  Continue with Google
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={openDatesDialog} onOpenChange={setOpenDatesDialog}>
        <DialogContent className="glass-panel border-white/60 shadow-2xl rounded-3xl max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 text-center">
              Specify Travel Details 📅
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm text-center mt-1">
              Provide departure details and dates to personalize your weather and flight options.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDatesSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <span>🛫</span> Where are you flying from?
              </label>
              <Input
                type="text"
                placeholder="Departure city, e.g. Delhi"
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                className="rounded-2xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white py-5 text-base shadow-xs"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <span>📅</span> Travel Start Date
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-12 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-base shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                required
              />
            </div>

            {startDate && formData?.days && (
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-4 text-center mt-2">
                <p className="text-emerald-950 text-sm font-semibold">
                  Your trip will run from <span className="underline font-bold text-emerald-800">{startDate}</span> to <span className="underline font-bold text-emerald-800">{getEndDate()}</span> ({formData?.days} days).
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                type="button"
                onClick={handleCheckWeather}
                disabled={weatherLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl cursor-pointer shadow-sm transition-all hover:scale-[1.01] flex items-center justify-center gap-1.5"
              >
                {weatherLoading ? (
                  <AiOutlineLoading3Quarters className="w-5 h-5 animate-spin" />
                ) : (
                  <>🌦️ Check Weather</>
                )}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl cursor-pointer shadow-md transition-all hover:scale-[1.01]"
              >
                Confirm & Generate ✨
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openWeatherDialog} onOpenChange={setOpenWeatherDialog}>
        <DialogContent className="glass-panel border-white/60 shadow-2xl rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 text-center flex items-center justify-center gap-2">
              🌦️ 5-Day Weather Forecast
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-sm text-center mt-1">
              Live weather forecast for <span className="font-bold text-gray-800">{weatherData?.city}, {weatherData?.country}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex flex-col gap-4">
            {weatherData?.forecast && weatherData.forecast.length > 0 ? (
              <div className="flex flex-col gap-3">
                {weatherData.forecast.slice(0, 5).map((day, index) => {
                  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div 
                      key={day.date} 
                      className="flex items-center justify-between p-4 bg-white/70 border border-gray-100 rounded-2xl hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 text-base">{formattedDate}</span>
                        <span className="text-xs text-gray-500 capitalize">{day.description}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
                          alt={day.main}
                          className="w-12 h-12 object-contain"
                        />
                        <div className="text-right">
                          <span className="text-lg font-black text-gray-955">{day.avgTemp}°C</span>
                          <p className="text-[10px] text-gray-400">H: {day.maxTemp}° L: {day.minTemp}°</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500">No forecast data available.</p>
            )}

            <Button
              type="button"
              onClick={() => setOpenWeatherDialog(false)}
              className="w-full mt-4 bg-[#0B1E36] hover:bg-[#152e4d] text-white font-bold py-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
            >
              Close Forecast
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateTrip
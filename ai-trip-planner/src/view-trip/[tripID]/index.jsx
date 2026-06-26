import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { toast } from 'sonner'
import { chatSession } from '@/service/AImodel';
import { AI_PROMPT_ITINERARY } from '@/constants/options';
import InfoSection from '../components/InfoSection';
import WeatherForecast from '../components/WeatherForecast';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import Flights from '../components/Flights';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

function ViewTrip() {
  const {tripID}=useParams();
  const [trip, setTrip] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [itineraryLoading, setItineraryLoading] = useState(false);

  useEffect(() => {
    if (trip?.userSelection?.location) {
      getWeatherData(trip.userSelection.location);
    }
  }, [trip]);

  const getWeatherData = async (locationStr) => {
    setWeatherLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.warn("OpenWeather API key not found");
        return;
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
        console.warn("Could not fetch weather data from any fallback");
        return;
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
            date: dateStr,
            humiditySum: 0,
            windSum: 0
          };
        }
        dailyForecasts[dateStr].tempSum += item.main.temp;
        dailyForecasts[dateStr].count += 1;
        dailyForecasts[dateStr].humiditySum += item.main.humidity;
        dailyForecasts[dateStr].windSum += item.wind.speed;
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
        avgHumidity: Math.round(day.humiditySum / day.count),
        avgWind: Math.round((day.windSum / day.count) * 10) / 10,
        description: day.weather.description,
        icon: day.weather.icon,
        main: day.weather.main
      }));

      setWeatherData({
        city: data.city.name,
        country: data.city.country,
        forecast: formattedForecast,
        current: {
          temp: Math.round(data.list[0].main.temp),
          feels_like: Math.round(data.list[0].main.feels_like),
          description: data.list[0].weather[0].description,
          icon: data.list[0].weather[0].icon,
          main: data.list[0].weather[0].main,
          humidity: data.list[0].main.humidity,
          wind: data.list[0].wind.speed
        }
      });
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const parseTripData = (tripData) => {
    if (!tripData) return null;
    if (typeof tripData === 'object') return tripData;

    let raw = String(tripData).trim();
    const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*)\s*```$/i);
    if (codeBlockMatch) {
      raw = codeBlockMatch[1].trim();
    }

    let firstChar = raw.indexOf('{');
    let lastChar = raw.lastIndexOf('}');
    const firstArray = raw.indexOf('[');
    const lastArray = raw.lastIndexOf(']');
    if (firstArray !== -1 && (firstChar === -1 || firstArray < firstChar)) {
      firstChar = firstArray;
      lastChar = lastArray;
    }
    if (firstChar !== -1 && lastChar !== -1 && lastChar > firstChar) {
      raw = raw.slice(firstChar, lastChar + 1);
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error('Failed to parse tripData JSON:', error, raw);
      return null;
    }
  };

    useEffect(()=>{
        tripID&&getTripData();
    },[tripID])

    //Used to get Trip information from the firebase
    const getTripData=async()=>{
        const docRef=doc(db,"trips",tripID);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            const data = docSnap.data();
            console.log("Document data:", data);
            const parsedTripData = parseTripData(data.tripData);
            const fullTrip = { ...data, tripData: parsedTripData ?? data.tripData };
            setTrip(fullTrip);

            // If itinerary doesn't exist or flights don't exist, generate them in the background
            if (!parsedTripData?.itinerary || parsedTripData.itinerary.length === 0 || !parsedTripData?.flights) {
              generateItineraryInBackground(parsedTripData ?? data.tripData, data.userSelection);
            }
        }else{
            console.log("No such document!");
            toast('No trip found')
        }
    }

    const generateItineraryInBackground = async (currentTripData, userSelection) => {
      setItineraryLoading(true);
      try {
        const FINAL_PROMPT = AI_PROMPT_ITINERARY.replaceAll('{location}', userSelection?.location)
          .replace('{departureCity}', userSelection?.departureCity || 'Major Hubs')
          .replace('{days}', userSelection?.days)
          .replace('{traveller}', userSelection?.traveller)
          .replace('{budget}', userSelection?.budget);

        console.log("Generating itinerary and flights in background...");
        const result = await chatSession.sendMessage(FINAL_PROMPT);
        const textResponse = result.response.text();

        const parsedResponse = parseTripData(textResponse);
        if (parsedResponse && parsedResponse.itinerary) {
          const updatedTripData = {
            ...currentTripData,
            itinerary: parsedResponse.itinerary,
            flights: parsedResponse.flights || []
          };
          const docRef = doc(db, "trips", tripID);
          await updateDoc(docRef, {
            tripData: updatedTripData
          });

          setTrip(prev => ({
            ...prev,
            tripData: updatedTripData
          }));
          toast.success("Itinerary and flights generated successfully!");
        } else {
          throw new Error("Parsed background data is invalid");
        }
      } catch (error) {
        console.error("Failed to generate itinerary and flights:", error);
        toast.error("Failed to generate detailed itinerary. Please try reloading.");
      } finally {
        setItineraryLoading(false);
      }
    };
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    setIsPrinting(true);

    // Wait a short delay for React state updates and itinerary rendering to expand
    await new Promise((resolve) => setTimeout(resolve, 800));

    const element = document.getElementById("trip-details-container");
    if (!element) {
      toast.error("Could not find the trip content to download.");
      setPdfLoading(false);
      setIsPrinting(false);
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        scale: 1.5, // optimal quality vs size
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const doc = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add the first page
      doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if height exceeds A4 height
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const destination = trip?.userSelection?.location || "Trip";
      const filename = `${destination.toLowerCase().replace(/[^a-z0-9]/g, "_")}_itinerary.pdf`;
      doc.save(filename);
      toast.success("PDF Itinerary downloaded successfully!");
    } catch (error) {
      console.error("PDF download error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
      setIsPrinting(false);
    }
  };

  return (
    <div className='w-full min-h-screen travel-bg-ambient py-12 px-4 sm:px-10 md:px-20 lg:px-32 xl:px-44 flex flex-col items-center'>
      <div 
        id="trip-details-container" 
        className='max-w-5xl w-full bg-white rounded-3xl p-6 md:p-12 shadow-2xl border border-slate-100 flex flex-col gap-10 relative'
      >
        <InfoSection 
          trip={trip} 
          isPrinting={isPrinting} 
          onDownloadPDF={handleDownloadPDF} 
          pdfLoading={pdfLoading} 
        />
        <WeatherForecast 
          weatherData={weatherData} 
          loading={weatherLoading} 
          isPrinting={isPrinting} 
          trip={trip}
        />
        <Flights trip={trip} loading={itineraryLoading} isPrinting={isPrinting} />
        <Hotels trip={trip} isPrinting={isPrinting} />
        <PlacesToVisit trip={trip} isPrinting={isPrinting} weatherData={weatherData} loading={itineraryLoading} />
      </div>

      {pdfLoading && (
        <div className='fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in'>
          <div className='bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-slate-100 flex flex-col items-center gap-4'>
            <div className='w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin'></div>
            <h3 className='font-bold text-gray-900 text-lg mt-2'>Generating PDF Brochure</h3>
            <p className='text-xs text-gray-500 leading-relaxed'>
              Compiling your personalized travel plan and high-resolution visuals. Please wait...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewTrip

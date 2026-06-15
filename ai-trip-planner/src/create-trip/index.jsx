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
import { AI_PROMPT } from '@/constants/options';
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
  const[loading,setLoading]=useState(false);
  const route=useNavigate();
  const [searchParams] = useSearchParams();

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

  const handleGenerateTrip = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      setOpenDialog(true);
      return;
    }
    if (!formData?.location || !formData?.budget || !formData?.traveller || !formData?.days) {
      toast("Please fill all the details correctly")
      return;
    }
    if (Number(formData?.days) > 5) {
      toast("Please enter 5 days or fewer to ensure a reliable response within token limits.")
      return;
    }
    setLoading(true);
    try {
      const FINAL_PROMPT = AI_PROMPT.replaceAll('{location}', formData?.location)
        .replace('{days}', formData?.days)
        .replace('{traveller}', formData?.traveller)
        .replace('{budget}', formData?.budget)
        .replace('{budget}', formData?.budget);

      console.log(FINAL_PROMPT)

      const result = await chatSession.sendMessage(FINAL_PROMPT);
      const textResponse = result.response.text();
      console.log(textResponse);
      
      await saveAItrip(textResponse);
    } catch (error) {
      console.error("Error generating trip:", error);
      toast("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const saveAItrip = async (TripData) => {
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
      userSelection: formData,
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

      <Dialog open={openDialog}>
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
    </div>
  )
}

export default CreateTrip
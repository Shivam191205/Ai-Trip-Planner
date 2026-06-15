import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/service/firebaseConfig'
import { searchPexelsImage } from '@/service/PexelsAPI'
import { Button } from '@/components/ui/button'
import { Trash2, Calendar, Compass, Users, DollarSign, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

function UserTripCard({ trip, onDelete }) {
  const [imageUrl, setImageUrl] = useState("");
  const navigate = useNavigate();

  const location = trip?.userSelection?.location;
  const days = trip?.userSelection?.days || trip?.tripData?.duration;
  const budget = trip?.userSelection?.budget || trip?.tripData?.budget_level;
  const travellers = trip?.userSelection?.traveller;

  useEffect(() => {
    if (!location) return;
    const fetchImage = async () => {
      const url = await searchPexelsImage(location);
      if (url) {
        setImageUrl(url);
      }
    };
    fetchImage();
  }, [location]);

  const DUMMY_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80";

  return (
    <div className='group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-emerald-100/50 transition-all duration-300 flex flex-col relative'>
      <div className='relative h-[180px] overflow-hidden cursor-pointer' onClick={() => navigate(`/view-trip/${trip.ID}`)}>
        <img 
          src={imageUrl || DUMMY_IMAGE} 
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700' 
          alt={location}
          onError={(e) => { e.currentTarget.src = DUMMY_IMAGE; }}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent' />
        
        {/* Days badge overlay */}
        {days && (
          <div className='absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full shadow-xs flex items-center gap-1'>
            <Calendar className='w-3.5 h-3.5 text-emerald-600' />
            {days} {days == 1 ? 'Day' : 'Days'}
          </div>
        )}
      </div>

      <div className='p-5 flex flex-col flex-grow justify-between bg-white'>
        <div className='space-y-2'>
          <h3 
            className='font-bold text-gray-905 text-lg group-hover:text-emerald-700 transition-colors duration-300 leading-snug line-clamp-1 cursor-pointer'
            onClick={() => navigate(`/view-trip/${trip.ID}`)}
          >
            {location || "Trip Adventure"}
          </h3>
          
          <div className='flex flex-wrap gap-2 pt-1'>
            {budget && (
              <span className='bg-amber-50 text-amber-700 border border-amber-100/50 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-2xs'>
                <DollarSign className='w-3 h-3' /> {budget}
              </span>
            )}
            {travellers && (
              <span className='bg-purple-50 text-purple-700 border border-purple-100/50 text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-2xs'>
                <Users className='w-3 h-3' /> {travellers}
              </span>
            )}
          </div>
        </div>

        <div className='pt-4 mt-4 border-t border-slate-100 flex items-center justify-between'>
          <button 
            onClick={() => onDelete(trip.ID)}
            className='p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-300 cursor-pointer'
            title="Delete Trip"
          >
            <Trash2 className='w-4.5 h-4.5' />
          </button>
          
          <button 
            onClick={() => navigate(`/view-trip/${trip.ID}`)}
            className='text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1 transition-colors duration-300 cursor-pointer'
          >
            View Details 
            <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1 duration-300' />
          </button>
        </div>
      </div>
    </div>
  );
}

function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const activeUser = JSON.parse(localStorage.getItem("user"));
    setUser(activeUser);

    if (!activeUser) {
      setLoading(false);
      return;
    }

    const fetchUserTrips = async () => {
      try {
        const q = query(
          collection(db, "trips"), 
          where("email", "==", activeUser.email)
        );
        const querySnapshot = await getDocs(q);
        const userTrips = [];
        querySnapshot.forEach((doc) => {
          userTrips.push({
            ...doc.data(),
            ID: doc.id
          });
        });
        
        // Sort trips by ID (which is timestamp) descending so newest shows first
        userTrips.sort((a, b) => Number(b.ID || 0) - Number(a.ID || 0));
        setTrips(userTrips);
      } catch (error) {
        console.error("Error fetching user trips from firestore:", error);
        toast.error("Failed to load your trips. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, []);

  const handleDeleteTrip = async (tripId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this trip itinerary?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "trips", tripId));
      setTrips(prev => prev.filter(t => t.ID !== tripId));
      toast.success("Trip itinerary deleted successfully.");
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast.error("Failed to delete trip. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className='w-full min-h-screen travel-bg-ambient flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-gray-550 font-bold text-lg animate-pulse'>Loading your adventures...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='w-full min-h-screen travel-bg-ambient flex items-center justify-center px-6'>
        <div className='max-w-md w-full glass-panel rounded-3xl p-8 text-center border border-white/60 shadow-2xl flex flex-col items-center gap-6'>
          <div className='w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl shadow-sm'>
            🧭
          </div>
          <div>
            <h2 className='font-black text-2xl text-gray-905'>Access Your Trips</h2>
            <p className='text-gray-500 text-sm mt-2 leading-relaxed'>
              Sign in with Google to securely access and view your custom AI itineraries.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create-trip')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl cursor-pointer"
          >
            Go to Planner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full min-h-screen travel-bg-ambient py-6 px-4 sm:py-12 sm:px-10 md:px-20 lg:px-32 xl:px-44 flex flex-col items-center'>
      <div className='max-w-6xl w-full mx-2'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10 border-b border-gray-200/50 pb-6'>
          <div>
            <h2 className='text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight flex items-center gap-2'>
              My Saved Trips 🗺️
            </h2>
            <p className='text-gray-500 text-xs sm:text-base mt-2 font-medium'>
              Browse, manage, and download all your personalized AI travel diaries.
            </p>
          </div>
          <Button
            onClick={() => navigate('/create-trip')}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full px-6 py-2.5 transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-200/50 shrink-0"
          >
            <Compass className='w-5 h-5' />
            Plan New Trip
          </Button>
        </div>

        {trips.length === 0 ? (
          <div className='glass-panel rounded-3xl p-12 text-center border border-white/60 shadow-lg flex flex-col items-center gap-4 my-10'>
            <span className='text-5xl'>🌴</span>
            <h3 className='font-bold text-gray-900 text-xl'>No saved trips yet</h3>
            <p className='text-gray-500 max-w-sm text-sm leading-relaxed'>
              Create your very first AI-guided travel plan and save it directly to your profile.
            </p>
            <Button
              onClick={() => navigate('/create-trip')}
              className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-3 mt-2 cursor-pointer shadow-sm"
            >
              Get Started
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {trips.map((trip) => (
              <UserTripCard 
                key={trip.ID} 
                trip={trip} 
                onDelete={handleDeleteTrip} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyTrips;

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { searchPexelsImage } from "@/service/PexelsAPI";

function HotelDescription() {
  const isImageValid = (url) => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return lower.includes('pexels.com') || lower.includes('wikimedia.org') || lower.includes('unsplash.com') || lower.includes('wikipedia.org');
  };

  const { state } = useLocation();
  const hotel = state;
  const DUMMY_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
  const dbImage = hotel?.image_url || hotel?.imagei_url || hotel?.hotel_image || hotel?.image;
  const initialImage = isImageValid(dbImage) ? dbImage : DUMMY_IMAGE;
  const [imageUrl, setImageUrl] = useState(initialImage);

  useEffect(() => {
    if (!hotel) return;

    const hasImage = isImageValid(dbImage);
    if (hasImage) return;

    const query = `${hotel?.hotel_name || 'hotel'} ${hotel?.address || ''}`.trim();

    searchPexelsImage(query || 'hotel room').then((url) => {
      if (url) {
        setImageUrl(url);
      }
    });
  }, [hotel]);

  if (!state) {
    return (
      <div className="p-10 text-2xl font-bold text-center">
        No Hotel Data Found
      </div>
    );
  }

  const name = hotel?.hotel_name;
  const location = hotel?.address;
  const price =
    hotel?.price_range_per_night ||
    hotel?.price_per_night ||
    hotel?.price ||
    "N/A";
  const description =
    hotel?.description ||
    "Luxury hotel with beautiful rooms and amazing services.";
  const stars = hotel?.stars || 4.5;
  const latitude = hotel?.geo_coordinates?.latitude;
  const longitude = hotel?.geo_coordinates?.longitude;

  return (
    <div className="min-h-screen travel-bg-ambient flex items-center justify-center p-4 sm:p-6 relative">
      <div className="max-w-3xl w-full glass-panel border border-white/60 rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 z-20 bg-white/90 hover:bg-white text-gray-800 text-xs font-bold rounded-full px-4 py-2 shadow-md border border-slate-100 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center gap-1"
          title="Go Back"
        >
          <span>⬅</span> Back
        </button>

        <div className="relative h-[220px] sm:h-[320px] overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = DUMMY_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        <div className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {name}
            </h1>
            <span className="w-fit bg-emerald-50 text-emerald-800 px-4 py-2 rounded-full font-bold border border-emerald-100/50 shadow-xs text-sm shrink-0">
              🏷️ {price} / night
            </span>
          </div>

          <div className="mt-3 text-amber-500 text-base sm:text-lg font-bold flex items-center gap-1">
            <span>⭐</span> {stars} Star Rating
          </div>

          <p className="mt-5 text-gray-600 text-sm leading-relaxed font-medium">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 bg-slate-50/40 p-4 border border-slate-100 rounded-2xl">
            <div className="flex items-start gap-2">
              <span className="text-xl shrink-0">📍</span>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">{location}</p>
            </div>
            <Link 
              to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}, ${encodeURIComponent(location)}`} 
              target="_blank" 
              className="shrink-0 w-full sm:w-auto"
            >
              <Button className='w-full sm:w-auto cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1'>
                🗺️ View on Map
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-0.5">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Latitude</span>
              <span className="text-slate-800 text-sm font-semibold">{latitude || 'N/A'}</span>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 flex flex-col gap-0.5">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Longitude</span>
              <span className="text-slate-800 text-sm font-semibold">{longitude || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDescription;
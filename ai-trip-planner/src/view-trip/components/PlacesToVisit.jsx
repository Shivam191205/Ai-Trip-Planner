import React, { useEffect, useState } from 'react'
import { searchPexelsImage } from '@/service/PexelsAPI'

function PlacesToVisit({ trip, isPrinting }) {
  const DUMMY_IMAGE = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80";
  
  const isImageValid = (url) => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    return lower.includes('pexels.com') || lower.includes('wikimedia.org') || lower.includes('unsplash.com') || lower.includes('wikipedia.org');
  };

  const itinerary = trip?.tripData?.itinerary || trip?.tripData?.Itinerary;
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [placeImageUrls, setPlaceImageUrls] = useState({});
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    if (!itinerary?.length) return;
    
    const selectedItinerary = itinerary?.[selectedDay];
    if (!selectedItinerary) return;

    const loadImages = async () => {
      const updates = {};
      const placesToLoad = selectedItinerary?.places || [];

      for (let index = 0; index < placesToLoad.length; index += 1) {
        const place = placesToLoad[index];
        if (!place) continue;

        const key = place?.place_name || place?.name || place?.title || `place-${index}`;
        const dbImage = place?.image_url || place?.imagei_url || place?.image;
        const hasExistingImage = (isImageValid(dbImage) ? dbImage : null) || placeImageUrls[key];
        if (hasExistingImage) continue;

        const query = `${place?.place_name || place?.name || place?.title || 'travel destination'} ${selectedItinerary?.theme || ''}`.trim();
        const url = await searchPexelsImage(query || 'travel destination');
        if (url) {
          updates[key] = url;
        }
      }

      if (Object.keys(updates).length) {
        setPlaceImageUrls((prev) => ({ ...prev, ...updates }));
      }

      const firstPlaceImage = placesToLoad[0]?.image_url || placesToLoad[0]?.imagei_url || placesToLoad[0]?.image;
      if (!coverImageUrl && placesToLoad.length && !isImageValid(firstPlaceImage)) {
        const query = `${placesToLoad[0]?.place_name || placesToLoad[0]?.name || placesToLoad[0]?.title || 'travel destination'} ${selectedItinerary?.theme || ''}`.trim();
        const url = await searchPexelsImage(query || 'travel destination');
        if (url) {
          setCoverImageUrl(url);
        }
      }
    };

    loadImages();
  }, [itinerary, selectedDay, placeImageUrls, coverImageUrl]);

  if (!itinerary?.length) {
    return (
      <div className='mt-8 px-4 sm:px-6'>
        <h2 className='font-bold text-xl'>Places to visit</h2>
        <p className='text-gray-500 mt-3'>No itinerary available for this trip yet.</p>
      </div>
    );
  }

  const selectedItinerary = itinerary[selectedDay];
  const theme = selectedItinerary?.theme || 'Daily plan';
  const day = selectedItinerary?.day || selectedDay + 1;
  const dinner = selectedItinerary?.dinner_option;
  const lunch = selectedItinerary?.lunch_option;
  const places = selectedItinerary?.places || [];
  
  const dbCoverImage =
    places[0]?.image_url ||
    places[0]?.imagei_url ||
    places[0]?.image ||
    selectedItinerary?.image_url ||
    selectedItinerary?.imagei_url ||
    selectedItinerary?.image;
  const safeCoverImage = (isImageValid(dbCoverImage) ? dbCoverImage : null) || coverImageUrl || DUMMY_IMAGE;

  const lunchName = lunch?.restaurant_name || lunch?.name || lunch?.restaurant || 'Lunch';
  const dinnerName = dinner?.restaurant_name || dinner?.name || dinner?.restaurant || 'Dinner';

  return (
    <div className='mt-8 px-4 sm:px-0'>
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <h2 className='font-extrabold text-2xl text-gray-900 flex items-center gap-2'>
          <span className='bg-emerald-100 text-emerald-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>🗺️</span> Places to Visit
        </h2>
        {!isPrinting && (
          <button
            onClick={() => setIsItineraryOpen(!isItineraryOpen)}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold transition-all duration-300 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 ${
              isItineraryOpen
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'
                : 'bg-white text-gray-800 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/5'
            }`}
          >
            📅 {isItineraryOpen ? "Hide Itinerary" : "Show Itinerary"}
          </button>
        )}
      </div>

      {isPrinting ? (
        <div className='flex flex-col gap-10'>
          {itinerary.map((dayItem, index) => {
            const day = dayItem?.day || index + 1;
            const theme = dayItem?.theme || 'Daily plan';
            const lunch = dayItem?.lunch_option;
            const dinner = dayItem?.dinner_option;
            const places = dayItem?.places || [];
            
            const lunchName = lunch?.restaurant_name || lunch?.name || lunch?.restaurant || 'Lunch';
            const dinnerName = dinner?.restaurant_name || dinner?.name || dinner?.restaurant || 'Dinner';
            
            const firstPlaceImage = places[0]?.image_url || places[0]?.imagei_url || places[0]?.image;
            const dayCover = (isImageValid(firstPlaceImage) ? firstPlaceImage : placeImageUrls[places[0]?.place_name || places[0]?.name || '']) || DUMMY_IMAGE;

            return (
              <div key={index} className='page-break-after border-b border-slate-100 pb-10 mb-8'>
                <div className='flex gap-6 items-center mb-6'>
                  <div className='w-40 h-28 rounded-xl overflow-hidden shadow-xs shrink-0'>
                    <img src={dayCover} alt={theme} className='w-full h-full object-cover' />
                  </div>
                  <div>
                    <span className='bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full'>
                      Day {day} Focus
                    </span>
                    <h3 className='text-2xl font-extrabold text-slate-800 mt-2'>{theme}</h3>
                  </div>
                </div>

                {(lunch || dinner) && (
                  <div className='mb-6'>
                    <h4 className='font-bold text-md text-slate-800 mb-2 flex items-center gap-1.5'>
                      🍽️ Dining Guide
                    </h4>
                    <div className='grid grid-cols-2 gap-4'>
                      {lunch && (
                        <div className='p-3 rounded-xl border border-amber-100/50 bg-amber-50/10 flex gap-2'>
                          <span className='text-lg'>☀️</span>
                          <div>
                            <h5 className='font-bold text-sm text-slate-800'>{lunchName} (Lunch)</h5>
                            {lunch?.cuisine && <p className='text-xxs text-slate-500 mt-0.5'>{lunch.cuisine}</p>}
                          </div>
                        </div>
                      )}
                      {dinner && (
                        <div className='p-3 rounded-xl border border-indigo-100/50 bg-indigo-50/10 flex gap-2'>
                          <span className='text-lg'>🌙</span>
                          <div>
                            <h5 className='font-bold text-sm text-slate-800'>{dinnerName} (Dinner)</h5>
                            {dinner?.cuisine && <p className='text-xxs text-slate-500 mt-0.5'>{dinner.cuisine}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className='font-bold text-md text-slate-800 mb-3 flex items-center gap-1.5'>
                    📍 Sights & Activities
                  </h4>
                  <div className='flex flex-col gap-4 relative pl-4 border-l-2 border-emerald-100/40 ml-1'>
                    {places.map((place, pIdx) => {
                      const placeName = place?.place_name || place?.name || place?.title || `Sight ${pIdx + 1}`;
                      const placeImg = (isImageValid(place?.image_url || place?.imagei_url || place?.image)
                        ? (place?.image_url || place?.imagei_url || place?.image)
                        : placeImageUrls[placeName]) || DUMMY_IMAGE;
                      return (
                        <div key={pIdx} className='flex gap-4 p-4 bg-white border border-slate-100 rounded-xl'>
                          <div className='w-32 h-24 rounded-lg overflow-hidden shadow-xs shrink-0'>
                            <img src={placeImg} alt={placeName} className='w-full h-full object-cover' />
                          </div>
                          <div className='flex-1 flex flex-col justify-between'>
                            <div>
                              <h5 className='font-bold text-slate-800 text-sm'>{placeName}</h5>
                              <p className='text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed'>{place?.details}</p>
                            </div>
                            <div className='flex flex-wrap gap-1.5 mt-2'>
                              {place?.travel_time_from_previous_location && (
                                <span className='bg-slate-50 text-slate-600 text-xxs font-semibold px-2 py-0.5 rounded border border-slate-100'>
                                  🚗 {place.travel_time_from_previous_location}
                                </span>
                              )}
                              {place?.time_to_spend && (
                                <span className='bg-indigo-50 text-indigo-700 text-xxs font-semibold px-2 py-0.5 rounded border border-indigo-100/30'>
                                  ⏱️ Stay: {place.time_to_spend}
                                </span>
                              )}
                              {place?.ticket_pricing && (
                                <span className='bg-emerald-50 text-emerald-700 text-xxs font-semibold px-2 py-0.5 rounded border border-emerald-100/30'>
                                  🎟️ {place.ticket_pricing}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        isItineraryOpen && (
          <div className='transition-all duration-300 ease-out'>
            {/* Day Selector */}
            <div className='flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-100'>
              {itinerary.map((dayItem, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedDay(idx)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                    selectedDay === idx
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Day {dayItem?.day || idx + 1}
                </button>
              ))}
            </div>

            {/* Selected Day Content */}
            <div className='relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs p-5 md:p-6 mb-6'>
              <div className='flex flex-col md:flex-row gap-6 items-center'>
                <div className='w-full md:w-1/3 h-44 rounded-xl overflow-hidden shadow-xs shrink-0'>
                  <img
                    src={safeCoverImage}
                    alt={theme}
                    className='w-full h-full object-cover hover:scale-105 transition-all duration-500'
                  />
                </div>
                <div className='flex-1'>
                  <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100'>
                    Day {day} Focus
                  </span>
                  <h3 className='text-xl md:text-2xl font-extrabold text-slate-800 mt-2'>{theme}</h3>
                </div>
              </div>
            </div>

            {/* Dining Guide */}
            {(lunch || dinner) && (
              <div className='mb-6'>
                <h4 className='font-bold text-lg text-slate-800 mb-3 flex items-center gap-2'>
                  🍽️ Dining Guide
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {lunch && (
                    <div className='p-4 rounded-xl border border-amber-100/60 bg-amber-50/20 backdrop-blur-xs flex gap-3'>
                      <span className='text-2xl shrink-0'>☀️</span>
                      <div>
                        <h5 className='font-bold text-slate-800'>{lunchName} (Lunch)</h5>
                        {lunch?.cuisine && <p className='text-xs text-slate-500 mt-0.5'>{lunch.cuisine}</p>}
                        {lunch?.best_time_to_visit && <p className='text-xs text-amber-700 mt-1 font-medium'>⏰ Recommended: {lunch.best_time_to_visit}</p>}
                      </div>
                    </div>
                  )}
                  {dinner && (
                    <div className='p-4 rounded-xl border border-indigo-100/60 bg-indigo-50/20 backdrop-blur-xs flex gap-3'>
                      <span className='text-2xl shrink-0'>🌙</span>
                      <div>
                        <h5 className='font-bold text-slate-800'>{dinnerName} (Dinner)</h5>
                        {dinner?.cuisine && <p className='text-xs text-slate-500 mt-0.5'>{dinner.cuisine}</p>}
                        {dinner?.best_time_to_visit && <p className='text-xs text-indigo-700 mt-1 font-medium'>⏰ Recommended: {dinner.best_time_to_visit}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sights */}
            <div>
              <h4 className='font-bold text-lg text-slate-800 mb-4 flex items-center gap-2'>
                📍 Sights & Activities
              </h4>
              <div className='flex flex-col gap-6 relative pl-2 sm:pl-6 border-l-2 border-emerald-100/60 ml-2'>
                {places.map((place, index) => {
                  const placeName = place?.place_name || place?.name || place?.title || `Sight ${index + 1}`;
                  const placeImg = (isImageValid(place?.image_url || place?.imagei_url || place?.image) 
                    ? (place?.image_url || place?.imagei_url || place?.image) 
                    : placeImageUrls[placeName]) || DUMMY_IMAGE;
                  return (
                    <div key={index} className='relative group'>
                      <div className='absolute -left-[19px] sm:-left-[35px] top-6 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-xs group-hover:scale-110 transition-transform'></div>
                      
                      <div className='flex flex-col sm:flex-row gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all duration-300'>
                        <div className='w-full sm:w-48 sm:h-32 h-40 rounded-xl overflow-hidden shadow-xs shrink-0'>
                          <img
                            src={placeImg}
                            alt={placeName}
                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                          />
                        </div>
                        <div className='flex-1 flex flex-col justify-between'>
                          <div>
                            <h5 className='font-bold text-slate-800 text-lg leading-snug'>{placeName}</h5>
                            <p className='text-sm text-slate-500 mt-1.5 leading-relaxed'>{place?.details}</p>
                          </div>
                          
                          <div className='flex flex-wrap gap-2 mt-4'>
                            {place?.travel_time_from_previous_location && (
                              <span className='bg-slate-50 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-100'>
                                🚗 {place.travel_time_from_previous_location}
                              </span>
                            )}
                            {place?.time_to_spend && (
                              <span className='bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-100/50'>
                                ⏱️ Stay: {place.time_to_spend}
                              </span>
                            )}
                            {place?.ticket_pricing && (
                              <span className='bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-100/50'>
                                🎟️ {place.ticket_pricing}
                              </span>
                            )}
                            {place?.best_time_to_visit && (
                              <span className='bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-100/50'>
                                ⏰ Best: {place.best_time_to_visit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {!isItineraryOpen && !isPrinting && (
        <div className='rounded-3xl border border-dashed border-slate-350 p-8 text-center text-gray-500 mt-5 bg-white/20 backdrop-blur-xs'>
          <p className='font-semibold text-slate-700'>💼 Ready to explore your route?</p>
          <p className='text-xs text-slate-500 mt-1'>Tap the itinerary button above to reveal the day-by-day planner maps, dining suggestions, and sights.</p>
        </div>
      )}
    </div>
  );
}

export default PlacesToVisit;

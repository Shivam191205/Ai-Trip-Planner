import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPexelsImage } from '@/service/PexelsAPI'

function Hotels({ trip }) {

  const isImageValid = (url) => {
    if (!url || typeof url !== 'string') return false;
    return url.toLowerCase().includes('pexels.com');
  };

  const hotelOptions = trip?.tripData?.hotels_options;
  const navigate = useNavigate();
  const [hotelImages, setHotelImages] = useState({});

  useEffect(() => {
    if (!hotelOptions?.length) return;

    const loadImages = async () => {
      const updates = {};

      for (let index = 0; index < hotelOptions.length; index += 1) {
        const item = hotelOptions[index];
        if (!item) continue;

        const dbImage = item?.image_url || item?.imagei_url || item?.hotel_image || item?.image;
        const hasImage = isImageValid(dbImage) || hotelImages[index];
        if (hasImage) continue;

        const query = `${item?.hotel_name || 'hotel'} ${item?.address || ''}`.trim();
        const url = await searchPexelsImage(query || 'hotel room');
        if (url) {
          updates[index] = url;
        }
      }

      if (Object.keys(updates).length) {
        setHotelImages((prev) => ({ ...prev, ...updates }));
      }
    };

    loadImages();
  }, [hotelOptions]);

  return (
    <div>
      <h2 className='font-extrabold text-2xl text-gray-900 mt-5 flex items-center gap-2'>
        <span className='bg-amber-100 text-amber-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>🏨</span> Hotel Recommendations
      </h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-5'>
        {hotelOptions?.map((item, index) => {
          const name = item?.hotel_name;
          const location = item?.address;
          const price =
            item?.price_range_per_night ||
            item?.price_per_night ||
            item?.price ||
            "N/A";
          const rating = item?.rating || item?.stars || 4.5;

          const DUMMY_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80";
          const dbImage = item?.image_url || item?.imagei_url || item?.hotel_image || item?.image;
          const imageUrl = (isImageValid(dbImage) ? dbImage : null) || hotelImages[index] || DUMMY_IMAGE;

          return (
            <div
              key={index}
              onClick={() =>
                navigate("/hotel-description", {
                  state: item,
                })
              }
              className='group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.03] hover:border-emerald-100/50 transition-all duration-300 cursor-pointer flex flex-col'
            >
              <div className='relative h-[190px] overflow-hidden'>
                <img
                  src={imageUrl}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                  alt={name}
                  onError={(e) => {
                    e.currentTarget.src = DUMMY_IMAGE;
                  }}
                />
                <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-amber-600 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm z-10'>
                  ⭐ {rating}
                </div>
                <div className='absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent' />
              </div>

              <div className='p-5 flex flex-col flex-grow justify-between gap-4 bg-white'>
                <div className='space-y-1.5'>
                  <h3 className='font-bold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors duration-300 leading-snug line-clamp-1'>
                    {name}
                  </h3>
                  <p className='text-gray-500 text-xs flex items-start gap-1 line-clamp-2 leading-relaxed'>
                    <span className='shrink-0 text-emerald-500'>📍</span> {location}
                  </p>
                </div>

                <div className='pt-3 border-t border-slate-100 flex items-center justify-between'>
                  <span className='bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100/50 shadow-xs'>
                    🏷️ {price} / night
                  </span>
                  <span className='text-emerald-600 text-xs font-bold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-0.5'>
                    View details ➔
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default Hotels
import React, { useEffect, useState } from 'react'
import { searchPexelsImage } from '@/service/PexelsAPI';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

function InfoSection({ trip, isPrinting, onDownloadPDF, pdfLoading }) {
  const [imageUrl, setImageUrl] = useState("");

  const location = trip?.userSelection?.location;
  const days = trip?.userSelection?.days || trip?.tripData?.duration;
  const budget = trip?.userSelection?.budget || trip?.tripData?.budget_level;
  const travellers = trip?.userSelection?.traveller;
  const estimatedTotalCost = trip?.tripData?.estimated_total_cost || trip?.tripData?.estimatedTotalCost || trip?.tripData?.total_cost || trip?.tripData?.totalCost;
  const estimatedCostPerPerson = trip?.tripData?.estimated_cost_per_person || trip?.tripData?.estimatedCostPerPerson || trip?.tripData?.cost_per_person || trip?.tripData?.costPerPerson || trip?.tripData?.per_person_budget || trip?.tripData?.perPersonBudget;

  useEffect(() => {
    if (!location) return;

    const getPlacePhoto = async () => {
      const url = await searchPexelsImage(location);
      if (url) {
        setImageUrl(url);
      }
    };

    getPlacePhoto();
  }, [location]);

  const DUMMY_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";
  const displayImage = imageUrl || DUMMY_IMAGE;

  return (
    <div className='flex flex-col gap-6'>
      <div className='relative h-[220px] sm:h-[300px] md:h-[400px] w-full overflow-hidden rounded-3xl shadow-lg group'>
        <img 
          src={displayImage} 
          className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105' 
          alt={location || "Location image"} 
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/25 to-transparent' />
        <div className='absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 text-white max-w-[90%]'>
          <p className='text-emerald-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1 sm:mb-1.5 flex items-center gap-1'>
            <span>🌴</span> Travel Destination
          </p>
          <h1 className='font-black text-xl sm:text-2xl md:text-4xl text-white tracking-tight leading-tight drop-shadow-md line-clamp-2'>
            {location || 'Your custom adventure'}
          </h1>
        </div>
      </div>

      <div className='my-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5'>
        <div className='flex flex-wrap gap-2.5 sm:gap-3'>
          {days && (
            <div className='flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-default'>
              <span>📅</span> {days} Days
            </div>
          )}
          {budget && (
            <div className='flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-default'>
              <span>💸</span> {budget} Budget
            </div>
          )}
          {travellers && (
            <div className='flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-default'>
              <span>👥</span> {travellers}
            </div>
          )}
          {estimatedTotalCost && (
            <div className='flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-sky-50 text-sky-700 border border-sky-100 rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-default'>
              <span>💰</span> Total: {estimatedTotalCost}
            </div>
          )}
          {estimatedCostPerPerson && (
            <div className='flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs sm:text-sm font-bold shadow-xs transition-all duration-200 hover:-translate-y-0.5 cursor-default'>
              <span>👤</span> Per Person: {estimatedCostPerPerson}
            </div>
          )}
        </div>

        {!isPrinting && (
          <Button 
            onClick={onDownloadPDF}
            disabled={pdfLoading}
            className="w-full md:w-auto cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-full shadow-md shadow-emerald-200/50 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shrink-0"
          >
            {pdfLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4.5 h-4.5" />
                Download PDF
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

export default InfoSection

import React, { useState } from 'react'

function Flights({ trip, loading, isPrinting }) {
  const [isOpen, setIsOpen] = useState(false);
  const flights = trip?.tripData?.flights;

  if (loading && (!flights || flights.length === 0)) {
    return (
      <div className="mt-8 px-4 sm:px-0">
        <h2 className='font-extrabold text-2xl text-gray-900 flex items-center gap-2 mb-4'>
          <span className='bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs animate-pulse'>🛫</span> Flight Options
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-44 w-full bg-slate-100/70 border border-slate-100 rounded-3xl animate-pulse flex flex-col justify-between p-5" />
          ))}
        </div>
      </div>
    );
  }

  if (!flights || flights.length === 0) {
    return null; // Return nothing or a small fallback if no flights exist
  }

  return (
    <div className="mt-8 px-4 sm:px-0">
      {/* Header and Independent Toggle Button */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <h2 className='font-extrabold text-2xl text-gray-900 flex items-center gap-2'>
          <span className='bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-xs'>🛫</span> Flight Recommendations
        </h2>
        {!isPrinting && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-full font-bold transition-all duration-300 cursor-pointer shadow-sm flex items-center justify-center gap-1.5 ${
              isOpen
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700'
                : 'bg-white text-gray-800 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/5'
            }`}
          >
            🛫 {isOpen ? "Hide Flights" : "Show Flights"}
          </button>
        )}
      </div>

      {/* Flight Cards Grid - Shown if isOpen is true, or if generating a PDF printout */}
      {(isOpen || isPrinting) && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 animate-fade-in'>
          {flights.map((flight, index) => {
            const airline = flight?.airline || "Commercial Airline";
            const flightType = flight?.flight_type || "Direct";
            const price = flight?.estimated_price || flight?.price || "N/A";
            const date = flight?.flight_date || "Travel Dates";
            const bookingLink = flight?.booking_link_suggestion || "https://www.google.com/travel/flights";

            return (
              <a 
                href={bookingLink} 
                target="_blank" 
                rel="noopener noreferrer"
                key={index}
                className='group bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] hover:border-indigo-100/50 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-4'
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className='font-bold text-gray-900 text-lg group-hover:text-indigo-700 transition-colors duration-300 leading-snug'>
                      {airline}
                    </h3>
                    <p className='text-gray-500 text-xs mt-1 flex items-center gap-1'>
                      <span>📅</span> Depart: {date}
                    </p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full border border-indigo-100/40">
                    {flightType}
                  </span>
                </div>

                <div className='pt-3 border-t border-slate-100 flex items-center justify-between'>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Est. Price</span>
                    <span className='text-emerald-700 text-lg font-extrabold'>
                      {price}
                    </span>
                  </div>
                  <span className='bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1'>
                    Book Now ➔
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Helper text if flights are collapsed */}
      {!isOpen && !isPrinting && (
        <div className='rounded-3xl border border-dashed border-slate-200 p-6 text-center text-gray-500 bg-white/20 backdrop-blur-xs'>
          <p className='font-semibold text-slate-700 text-sm'>✈️ Want to see flights?</p>
          <p className='text-xs text-slate-500 mt-1'>Tap the "Show Flights" button above to reveal curated flight recommendations matching your destination and budget.</p>
        </div>
      )}
    </div>
  )
}

export default Flights

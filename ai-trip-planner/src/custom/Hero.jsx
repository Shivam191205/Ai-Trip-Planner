import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Compass, 
  Map, 
  Sparkles, 
  ChevronDown, 
  DollarSign, 
  Hotel, 
  Utensils, 
  MapPin 
} from 'lucide-react'

const PRESET_TRIPS = [
  {
    id: 1,
    title: "Austria Alpine Escape",
    destination: "Austria, Europe",
    days: 5,
    budget: "Luxury",
    traveller: "Family (3 to 5 People)",
    image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=600&q=80",
    description: "Explore majestic palaces, classical music halls, and fairytale villages nestled in the Alps.",
    tag: "Alpine Getaway",
    tripId: "1781600000000"
  },
  {
    id: 2,
    title: "Las Vegas Glitz & Glamour",
    destination: "Las Vegas, NV, United States of America",
    days: 3,
    budget: "Luxury",
    traveller: "3 to 5 People",
    image: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80",
    description: "Experience the ultimate entertainment capital with high-end resorts, casino floors, and spectacular stage shows.",
    tag: "Urban Adventure",
    tripId: "1781240311320"
  },
  {
    id: 3,
    title: "Royal Rajasthan Heritage",
    destination: "Rajasthan, India",
    days: 4,
    budget: "Moderate",
    traveller: "5 to 10 People",
    image: "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=600&q=80",
    description: "Immerse in majestic fortresses, pink palaces, and vibrant spice bazaars.",
    tag: "Cultural Tour",
    tripId: "1781506770653"
  }
];

const STEPS = [
  {
    id: 1,
    title: "1. Tell Us Your Vibe",
    description: "Enter your destination, select duration (up to 5 days), choose budget level (Cheap, Moderate, Luxury), and group size.",
    icon: Compass,
    color: "bg-emerald-50 text-emerald-600 border border-emerald-100"
  },
  {
    id: 2,
    title: "2. AI Plans Instantly",
    description: "Our backend queries Gemini 2.5 Flash to handpick the best hotels, compile day-by-day itineraries, and recommend dining options.",
    icon: Sparkles,
    color: "bg-indigo-50 text-indigo-600 border border-indigo-100"
  },
  {
    id: 3,
    title: "3. Customize & Go",
    description: "View ratings, approximate pricing in INR, geo-coordinates, and local insights. Refine your options and start booking!",
    icon: Map,
    color: "bg-amber-50 text-amber-600 border border-amber-100"
  }
];

const FEATURES = [
  {
    title: "Smart Budget Allocation",
    description: "Estimates total and per-person costs dynamically in Indian Rupees (₹) to keep you fully aware of expenses.",
    icon: DollarSign
  },
  {
    title: "Curated Hotels Options",
    description: "Provides 4-5 handpicked hotel listings with pricing, rating details, address, and location details.",
    icon: Hotel
  },
  {
    title: "Local Dining Guides",
    description: "Recommends local cafes and restaurants for lunch and dinner on each day matching your budget level.",
    icon: Utensils
  },
  {
    title: "Geo-Mapping Ready",
    description: "Includes exact coordinates for all tourist attractions and accommodations for seamless navigation.",
    icon: MapPin
  }
];

const FAQ_ITEMS = [
  {
    question: "Is this AI Trip Planner free to use?",
    answer: "Yes! It is completely free to generate, customize, and view your itineraries. We use advanced AI models to construct your plans instantly."
  },
  {
    question: "How accurate are the budget and cost calculations?",
    answer: "We structure estimations using standard travel metrics and format them in Indian Rupees (INR) for easy budgeting. They are calculated dynamically per-person and for the total trip."
  },
  {
    question: "Why is the duration limited to 5 days?",
    answer: "To ensure that the generated response is highly detailed, complete, and stays within token limits without being cut off mid-itinerary by the AI model."
  },
  {
    question: "Can I customize the plan after it has been created?",
    answer: "Yes, you can save it to your dashboard and modify constraints, or simply run the generator again with updated details."
  }
];

function Hero() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className='w-full bg-[#fcfbf7]/40 min-h-screen flex flex-col items-center'>
      
      {/* Hero Header Section with Background */}
      <div 
        className='relative w-full min-h-[90vh] flex flex-col items-center justify-center py-10 md:py-20 px-4 md:px-12 lg:px-24'
        style={{
          backgroundImage: "url('/landing_bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className='max-w-3xl text-center space-y-5 md:space-y-8 mb-12 md:mb-24 bg-white/85 backdrop-blur-md border border-white/60 p-5 sm:p-8 md:p-12 rounded-2xl md:rounded-3xl shadow-xl shadow-emerald-900/5 mx-2'>
          <span className='inline-flex items-center gap-1.5 py-1 px-3 md:py-1.5 md:px-4 rounded-full text-[10px] md:text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider shadow-sm'>
            🌴 Your Travel, Your Way
          </span>
          
          <h1 className='text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight'>
            Your Trip, Your Vibe <br />
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 font-extrabold'>
              Our AI's on It
            </span>
          </h1>
          
          <p className='text-sm sm:text-base md:text-xl text-gray-600 max-w-xl mx-auto font-medium leading-relaxed'>
            Solo? Couple? Group? We Plan Like It's Just for You — Because It Is. Stop spending hours scheduling.
          </p>
 
          <div className='flex flex-wrap items-center justify-center gap-4 pt-1 md:pt-2'>
            <Link to="/create-trip" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#0B1E36] hover:bg-[#152e4d] text-white font-bold text-base md:text-lg px-6 py-5 md:px-8 md:py-6 rounded-xl shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
                + Plan & Book My Trip with AI
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className='w-full py-10 px-4 sm:py-20 sm:px-16 lg:px-32 bg-white border-t border-gray-100'>
        <div className='max-w-6xl mx-auto space-y-8 md:space-y-12'>
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-4xl font-extrabold text-gray-955 tracking-tight'>
              How It Works
            </h2>
            <p className='text-gray-500 text-sm md:text-lg max-w-xl mx-auto'>
              Plan your dream getaway in three simple, interactive steps.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-4'>
            {STEPS.map((step) => {
              const IconComp = step.icon;
              return (
                <div key={step.id} className='bg-slate-50/50 hover:bg-slate-50 border border-gray-100 rounded-3xl p-6 md:p-8 transition-all duration-300 flex flex-col space-y-5 hover:shadow-lg group'>
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${step.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <IconComp className='w-6 h-6 md:w-7 md:h-7' />
                  </div>
                  <div className='space-y-2'>
                    <h3 className='text-lg md:text-xl font-bold text-gray-900'>{step.title}</h3>
                    <p className='text-gray-505 leading-relaxed text-xs md:text-sm'>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Grid Section */}
      <div className='w-full py-10 px-4 sm:py-20 sm:px-16 lg:px-32 bg-slate-50/50 border-t border-b border-gray-100'>
        <div className='max-w-6xl mx-auto space-y-8 md:space-y-12'>
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-4xl font-extrabold text-gray-955 tracking-tight'>
              Why Choose AI Trip Planner?
            </h2>
            <p className='text-gray-500 text-sm md:text-lg max-w-xl mx-auto'>
              A state-of-the-art trip planner designed to automate scheduling and offer local insights.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4'>
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className='bg-white border border-gray-100 rounded-2xl p-5 md:p-6 transition-all duration-300 flex flex-col space-y-4 hover:shadow-md hover:border-emerald-100'>
                  <div className='w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center'>
                    <Icon className='w-5 h-5' />
                  </div>
                  <div className='space-y-1.5'>
                    <h4 className='font-bold text-gray-900 text-sm md:text-base'>{feature.title}</h4>
                    <p className='text-gray-500 text-xs leading-relaxed'>{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preset Trips Grid Section */}
      <div className='w-full py-10 px-4 sm:py-20 sm:px-16 lg:px-32 bg-white'>
        <div className='max-w-6xl mx-auto space-y-8 md:space-y-10'>
          <div className='text-center md:text-left space-y-2'>
            <h2 className='text-2xl md:text-3xl font-extrabold text-gray-955 tracking-tight'>
              Popular Curated Itineraries
            </h2>
            <p className='text-gray-500 text-sm md:text-lg'>
              Click any curated trip to automatically populate the planner and customize your journey.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
            {PRESET_TRIPS.map((trip) => {
              const presetUrl = `/view-trip/${trip.tripId}`;
              
              return (
                <Link 
                  key={trip.id} 
                  to={presetUrl}
                  className='group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:border-emerald-100 transition-all duration-300 flex flex-col'
                >
                  {/* Image Wrap */}
                  <div className='relative h-48 md:h-56 overflow-hidden'>
                    <img 
                      src={trip.image} 
                      alt={trip.title} 
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
                    <span className='absolute top-3 left-3 md:top-4 md:left-4 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold py-1.5 px-3 rounded-full shadow-sm'>
                      {trip.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <div className='p-5 md:p-6 flex flex-col flex-grow space-y-4 justify-between'>
                    <div className='space-y-2'>
                      <h3 className='text-xl md:text-2xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300'>
                        {trip.title}
                      </h3>
                      <p className='text-xs md:text-sm text-gray-500 line-clamp-2'>
                        {trip.description}
                      </p>
                    </div>

                    {/* Metadata Chips */}
                    <div className='flex flex-wrap gap-2 pt-1 md:pt-2'>
                      <span className='bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full'>
                        📅 {trip.days} Days
                      </span>
                      <span className='bg-amber-50 text-amber-700 text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full'>
                        💸 {trip.budget}
                      </span>
                      <span className='bg-blue-50 text-blue-700 text-[10px] md:text-xs font-semibold px-2.5 py-1 rounded-full'>
                        👥 {trip.traveller}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className='pt-2 block w-full'>
                      <Button 
                        variant="outline" 
                        className='w-full border-gray-200 text-gray-700 group-hover:text-emerald-700 group-hover:border-emerald-500 group-hover:bg-emerald-50/30 rounded-full py-4 md:py-5 font-semibold transition-all duration-300 cursor-pointer text-xs md:text-sm'
                      >
                        Customize & Plan
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className='w-full py-10 px-4 sm:py-20 sm:px-16 lg:px-32 bg-slate-50/50 border-t border-gray-100'>
        <div className='max-w-4xl mx-auto space-y-8 md:space-y-12'>
          <div className='text-center space-y-3'>
            <h2 className='text-2xl md:text-4xl font-extrabold text-gray-955 tracking-tight'>
              Frequently Asked Questions
            </h2>
            <p className='text-gray-550 text-sm md:text-lg'>
              Find answers to the most common questions about planning trips.
            </p>
          </div>

          <div className='space-y-4 pt-4'>
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className='bg-white border border-gray-150 rounded-2xl overflow-hidden transition-all duration-300 shadow-xs'
                >
                  <button 
                    onClick={() => toggleFaq(idx)}
                    className='w-full flex items-center justify-between p-5 md:p-6 text-left font-bold text-gray-800 hover:text-emerald-600 transition-colors cursor-pointer focus:outline-hidden text-sm md:text-base'
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 border-t border-gray-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                  >
                    <p className='p-5 md:p-6 text-xs md:text-sm text-gray-505 leading-relaxed bg-slate-50/30'>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Hero
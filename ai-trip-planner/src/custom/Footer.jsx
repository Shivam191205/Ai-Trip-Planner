import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaXTwitter, FaYoutube } from 'react-icons/fa6';

function Footer() {
  const currentYear = new Date().getFullYear();

  // Scroll to top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to about section helper
  const handleAboutClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('why-choose-us');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#why-choose-us';
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-900 mt-auto">
      {/* Top section: Category Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        {/* Support Column */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <span className="text-emerald-500">🎧</span> Support & Contact
          </h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Contact%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Contact us
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Support%20Request%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Customer support
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Service%20Guarantee%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Service Guarantee
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Security%20Inquiry%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Security
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=General%20Info%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                More service info
              </a>
            </li>
          </ul>
        </div>

        {/* Company Column */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <span className="text-emerald-500">🏢</span> About Us
          </h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <a href="#why-choose-us" onClick={handleAboutClick} className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                About
              </a>
            </li>
            <li>
              <a href="#why-choose-us" onClick={handleAboutClick} className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                About AI Trip Planner
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Press/News%20Inquiry%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                News
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Careers%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Careers <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full ml-1 font-extrabold uppercase">Hiring</span>
              </a>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Investor%20Relations%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Investor relations
              </a>
            </li>
            <li>
              <a href="#why-choose-us" onClick={handleAboutClick} className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                About Trip Planner Group
              </a>
            </li>
          </ul>
        </div>

        {/* Partnerships Column */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <span className="text-emerald-500">🤝</span> Partnerships
          </h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Affiliate%20Program%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Affiliate program
              </a>
            </li>
            <li>
              <Link to="/create-trip" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                List your property <span className="text-slate-500 font-normal ml-1">(Hotels & Homes)</span>
              </Link>
            </li>
            <li>
              <Link to="/create-trip" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                All hotels
              </Link>
            </li>
            <li>
              <a href="mailto:shivamnagpal603@gmail.com?subject=Supplier%20Registration%20-%20AI%20Trip%20Planner" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Become a Supplier
              </a>
            </li>
            <li>
              <Link to="/create-trip" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Other services
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm tracking-wider uppercase border-b border-slate-900 pb-2 flex items-center gap-1.5">
            <span className="text-emerald-500">📜</span> Terms & Policy
          </h3>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Privacy Statement
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Accessibility Statement
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1 hover:translate-x-0.5 transform transition-transform">
                Rewards Program Rules
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Middle section: Social & Brand bar */}
      <div className="bg-slate-950/40 border-t border-slate-900/60 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
            <Link to="/" onClick={scrollToTop} className="flex items-center cursor-pointer">
              <img src="/logoo.png" className="h-10 object-contain brightness-100 hover:brightness-110 transition-all duration-300" alt="AI Trip Planner Logo" />
            </Link>
            <p className="text-slate-500 text-xs font-medium max-w-sm">
              Your personalized AI-driven travel companion. Tailor-made itineraries, hotel choices, flight options, and dining suggestions, all in one smart system.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:-translate-y-1 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center w-11 h-11"
              aria-label="Visit our Facebook page"
            >
              <FaFacebookF className="w-5 h-5" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:-translate-y-1 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center w-11 h-11"
              aria-label="Visit our X (Twitter) page"
            >
              <FaXTwitter className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:-translate-y-1 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center w-11 h-11"
              aria-label="Visit our YouTube channel"
            >
              <FaYoutube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom section: Copyright */}
      <div className="bg-slate-950 border-t border-slate-900/60 py-6 px-4 text-center text-[11px] text-slate-600 font-semibold tracking-wide">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {currentYear} AI Trip Planner. All rights reserved.</p>
          <p className="flex items-center gap-1 justify-center">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> 
            Crafted for premium AI assistance
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

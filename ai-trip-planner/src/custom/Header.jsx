import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { LogOut, Compass, FolderHeart, Plus, Menu, X } from 'lucide-react'

function Header() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, []);

  const handleAboutClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById('why-choose-us');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#why-choose-us';
    }
  };

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const login = useGoogleLogin({
    onSuccess: (response) => {
      getUserInfo(response);
    },
    onError: (error) => console.log(error)
  });

  const getUserInfo = (tokenInfo) => {
    axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`,
      {
        headers: {
          Authorization: `Bearer ${tokenInfo?.access_token}`,
          Accept: "application/json",
        },
      }).then((resp) => {
        localStorage.setItem("user", JSON.stringify(resp.data));
        setUser(resp.data);
        window.dispatchEvent(new Event('auth-change'));
      }).catch((error) => {
        console.log(error);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/';
  };

  return (
    <>
      <div 
        className='py-3 px-4 md:py-4 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 border-b border-gray-100 shadow-sm transition-all duration-300'
        style={{ zIndex: 999 }}
      >
      <Link to="/" className='flex items-center gap-2 cursor-pointer animate-fade-in'>
        <img src="/logoo.png" className='h-11 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-[1.02]' alt="Logo" />
      </Link>

      {/* Middle Navigation Links - Desktop */}
      <div className='hidden md:flex items-center gap-8 font-semibold text-gray-600'>
        <Link 
          to="/" 
          className='hover:text-emerald-600 transition-colors duration-200 cursor-pointer text-sm tracking-wide'
        >
          Home
        </Link>
        <a 
          href="#why-choose-us" 
          onClick={handleAboutClick}
          className='hover:text-emerald-600 transition-colors duration-200 cursor-pointer text-sm tracking-wide'
        >
          About
        </a>
        {user && (
          <Link 
            to="/my-trips" 
            className='hover:text-emerald-600 transition-colors duration-200 cursor-pointer text-sm tracking-wide'
          >
            My Trips
          </Link>
        )}
        <Link 
          to="/create-trip" 
          className='hover:text-emerald-600 transition-colors duration-200 cursor-pointer text-sm tracking-wide'
        >
          Create Trip
        </Link>
      </div>
      
      {/* Right Side Auth / Actions */}
      <div className='flex items-center gap-4'>
        {user ? (
          <div className='flex items-center gap-4'>
            <Link to="/create-trip" className='hidden sm:block'>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-200/50 rounded-full px-5 py-2 transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center gap-2"
              >
                <Plus className='w-4.5 h-4.5' />
                Create Trip
              </Button>
            </Link>
            
            <div className='relative' ref={dropdownRef}>
              <img 
                src={user?.picture} 
                alt={user?.name} 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className='w-11 h-11 rounded-full border-2 border-emerald-500 cursor-pointer shadow-md hover:scale-105 transition-all duration-300 object-cover'
                referrerPolicy="no-referrer"
              />
              {dropdownOpen && (
                <div className='absolute right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 z-50 transition-all duration-200'>
                  <div className='px-4 py-2 border-b border-slate-100'>
                    <p className='text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider'>Signed in as</p>
                    <p className='font-bold text-gray-900 truncate text-sm mt-0.5'>{user?.name}</p>
                    <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
                  </div>
                  <div className='py-1.5'>
                    <Link to="/my-trips" onClick={() => setDropdownOpen(false)}>
                      <button className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer font-medium'>
                        <FolderHeart className='w-4 h-4 text-emerald-600' />
                        My Trips
                      </button>
                    </Link>
                    <Link to="/" onClick={() => setDropdownOpen(false)}>
                      <button className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer font-medium'>
                        <Compass className='w-4 h-4 text-emerald-600' />
                        Home
                      </button>
                    </Link>
                  </div>
                  <div className='border-t border-slate-100 pt-1.5 px-2'>
                    <button 
                      onClick={handleLogout}
                      className='w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors duration-200 flex items-center gap-2 cursor-pointer font-bold'
                    >
                      <LogOut className='w-4 h-4' />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className='hidden md:flex items-center gap-4'>
            <Button 
              variant="ghost" 
              onClick={login}
              className="font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer rounded-full px-5 py-2"
            >
              Login
            </Button>
            <Button 
              onClick={login}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-200/50 rounded-full px-6 py-2.5 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              Sign Up
            </Button>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className='md:hidden p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors cursor-pointer animate-fade-in'
          aria-label="Toggle menu"
        >
          <Menu className='w-6 h-6' />
        </button>
      </div>
    </div>

    {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div 
          className='fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden cursor-pointer pointer-events-auto'
          style={{ zIndex: 9999 }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[280px] shadow-2xl p-6 flex flex-col justify-between transform transition-all duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'white', zIndex: 10000 }}
      >
        <div className='flex flex-col gap-6'>
          {/* Header of Drawer */}
          <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
            <img src="/logoo.png" className='h-9 w-auto object-contain' alt="Logo" />
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className='p-1.5 text-gray-500 hover:text-rose-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* User Profile Info in Drawer */}
          {user && (
            <div className='flex items-center gap-3 p-3 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl'>
              <img 
                src={user?.picture} 
                alt={user?.name} 
                className='w-11 h-11 rounded-full border border-emerald-500 object-cover'
                referrerPolicy="no-referrer"
              />
              <div className='overflow-hidden'>
                <p className='font-bold text-gray-800 text-sm truncate'>{user?.name}</p>
                <p className='text-xs text-gray-500 truncate'>{user?.email}</p>
              </div>
            </div>
          )}

          {/* Links */}
          <nav className='flex flex-col gap-3 font-semibold text-gray-700 mt-2'>
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200'
            >
              <Compass className='w-5 h-5 text-emerald-600' />
              Home
            </Link>
            <a 
              href="#why-choose-us" 
              onClick={handleAboutClick}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200'
            >
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About
            </a>
            {user && (
              <Link 
                to="/my-trips" 
                onClick={() => setMobileMenuOpen(false)}
                className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200'
              >
                <FolderHeart className='w-5 h-5 text-emerald-600' />
                My Trips
              </Link>
            )}
            <Link 
              to="/create-trip" 
              onClick={() => setMobileMenuOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 bg-emerald-50/40'
            >
              <Plus className='w-5 h-5 text-emerald-600' />
              Create Trip
            </Link>
          </nav>
        </div>

        {/* Footer Actions of Drawer (Auth buttons / Logout) */}
        <div className='border-t border-slate-100 pt-4 mt-auto'>
          {user ? (
            <button 
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className='w-full px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer font-bold border border-rose-100'
            >
              <LogOut className='w-4 h-4' />
              Sign Out
            </button>
          ) : (
            <div className='flex flex-col gap-2'>
              <Button 
                variant="outline" 
                onClick={() => {
                  login();
                  setMobileMenuOpen(false);
                }}
                className="w-full font-semibold text-gray-700 border-gray-200 rounded-xl py-2.5"
              >
                Login
              </Button>
              <Button 
                onClick={() => {
                  login();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-2.5"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Header
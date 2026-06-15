import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/button'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { LogOut, Compass, FolderHeart, Plus } from 'lucide-react'

function Header() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <div className='py-3 px-4 md:py-4 md:px-6 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm transition-all duration-300'>
      <div className='flex items-center gap-2 cursor-pointer animate-fade-in' onClick={() => window.location.href = '/'}>
        <img src="/logoo.png" className='w-24 h-10 md:w-32 md:h-14 object-contain transition-transform duration-300 hover:scale-[1.02]' alt="Logo" />
      </div>
      
      {user ? (
        <div className='flex items-center gap-4'>
          <a href="/my-trips" className='hidden md:block'>
            <Button 
              variant="ghost" 
              className="font-medium text-gray-650 hover:text-emerald-600 hover:bg-emerald-50/50 cursor-pointer flex items-center gap-2 rounded-full px-4 py-2"
            >
              <FolderHeart className='w-4.5 h-4.5 text-emerald-600' />
              My Trips
            </Button>
          </a>
          <a href="/create-trip">
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-200/50 rounded-full px-5 py-2 transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <Plus className='w-4.5 h-4.5' />
              Create Trip
            </Button>
          </a>
          
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
                  <a href="/my-trips" className='md:hidden block' onClick={() => setDropdownOpen(false)}>
                    <button className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer font-medium'>
                      <FolderHeart className='w-4 h-4 text-emerald-600' />
                      My Trips
                    </button>
                  </a>
                  <a href="/" onClick={() => setDropdownOpen(false)}>
                    <button className='w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-700 transition-colors duration-200 flex items-center gap-2 cursor-pointer font-medium'>
                      <Compass className='w-4 h-4 text-emerald-600' />
                      Home
                    </button>
                  </a>
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
        <div className='flex items-center gap-4'>
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
    </div>
  )
}

export default Header
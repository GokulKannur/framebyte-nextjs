"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default function Header({ categories = [] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);

  // This function forces a full page reload, resetting all state.
  const handleLogoClick = (e) => {
    // Check if we are already on the homepage.
    if (window.location.pathname === '/') {
      e.preventDefault(); // Prevent the link from navigating.
      window.location.reload(); // Force a reload to reset the state.
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="max-w-full mx-auto flex items-center justify-between p-4 px-6">
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center cursor-pointer" 
          id="logo-link"
        >
          <img src="/logo/logo.png" alt="FrameByte Logo" className="h-9 mr-3" />
          <span className="text-4xl font-bold text-gray-900 font-caveat">FrameByte</span>
        </Link>

        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl p-2">
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4 text-lg font-josefin-sans">
          <Link href="/" className="nav-link px-3 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer" id="nav-wallpapers">
            Wallpapers
          </Link>
          <div className="relative" id="nav-categories-container">
            <button
              id="nav-categories-btn"
              onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
              className="nav-link px-3 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer flex items-center"
            >
              Categories
              <FontAwesomeIcon icon={faChevronDown} className={`w-4 h-4 ml-1 transition-transform duration-200 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCategoriesDropdownOpen && (
              <div id="nav-categories-dropdown" className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1" role="none">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setIsCategoriesDropdownOpen(false);
                      }}
                      className="text-gray-700 block w-full text-left capitalize px-4 py-2 text-sm dropdown-item"
                      role="menuitem"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Link href="/about" className="nav-link px-3 py-2 rounded-md hover:bg-gray-200 transition-colors duration-200 cursor-pointer" id="nav-about">
            About
          </Link>
        </div>
      </nav>

      <div id="mobile-menu" className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t border-gray-200`}>
        <div className="flex flex-col items-center p-4 space-y-4 font-josefin-sans">
          <Link href="/" id="mobile-nav-wallpapers" className="text-lg" onClick={() => setIsMobileMenuOpen(false)}>
            Wallpapers
          </Link>
          <Link href="/about" id="mobile-nav-about" className="text-lg" onClick={() => setIsMobileMenuOpen(false)}>
            About
          </Link>
          <hr className="w-full" />
          <h3 className="font-bold">Categories</h3>
          <div id="mobile-nav-categories" className="text-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
                className="block py-1 capitalize"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
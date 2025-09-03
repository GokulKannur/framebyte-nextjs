"use client";
import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

// A standard debounce helper function
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

export default function Hero({ searchQuery, setSearchQuery }) {
  const heroStyle = {
    backgroundImage: "url('https://storage.googleapis.com/framebyte-e4123.firebasestorage.app/your-best-wallpaper.jpg')"
  };

  // This state is just for what's visible inside the input box
  const [inputValue, setInputValue] = useState(searchQuery);

  // useCallback creates a stable, debounced version of the setSearchQuery function
  // that won't cause bugs by being recreated on every render.
  const debouncedSetSearchQuery = useCallback(
    debounce(setSearchQuery, 300),
    [setSearchQuery]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value); // Update the input field text instantly
    debouncedSetSearchQuery(value); // Trigger the actual search after a 300ms delay
  };

  const handleSearchClick = () => {
    // Immediately trigger the search with the current input value
    setSearchQuery(inputValue);
  };

  return (
    <section id="hero-section" className="relative text-white text-center py-20 md:py-32" style={heroStyle}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 font-josefin-sans">Find Your Next Background</h1>
        <p className="text-lg md:text-xl mb-8">High-quality wallpapers curated for your screens.</p>
        <div className="max-w-2xl mx-auto relative">
          <input
            id="searchInput"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search for nature, cars, anime..."
            className="px-4 py-4 rounded-full w-full border-2 border-transparent focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-gray-800 pr-12"
          />
          <button
            type="button"
            onClick={handleSearchClick}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600"
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </div>
    </section>
  );
}
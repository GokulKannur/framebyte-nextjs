"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function FilterBar({
  activeFilter,
  setActiveFilter,
  setSortBy,
  showCategories,
  setShowCategories,
  categories = [],
  setSearchQuery,
  searchQuery
}) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Most Popular');

  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sortDropdownRef = useRef(null);

  // ✅ Debounced scroll check for better performance
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const isScrollable = el.scrollWidth > el.clientWidth;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(isScrollable && el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleResize = () => checkScroll();
    const handleScroll = () => checkScroll();

    checkScroll();
    el.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleResize);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleResize);
    };
  }, [checkScroll]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortDropdownOpen(false);
      }
    };
    if (isSortDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMainFilterClick = (filter) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setSearchQuery('');
    }
    if (filter === 'categories') {
      setShowCategories(!showCategories);
    } else {
      setShowCategories(false);
    }
  };

  const handleSortClick = (sort, label) => {
    setSortBy(sort);
    setActiveSort(label);
    setIsSortDropdownOpen(false);
  };

  const isCategoriesActive =
    showCategories && (activeFilter === 'categories' || categories.includes(activeFilter));

  const filters = [
    { key: 'all', label: 'Home' },
    { key: 'phone', label: 'For Phone' },
    { key: 'desktop', label: 'For Desktop' },
    { key: 'categories', label: 'Categories' }
  ];

  return (
    <div className="flex items-center justify-center border-b mb-4 bg-transparent z-30 font-josefin-sans">
      <div className="flex-grow flex items-center relative min-w-0">
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition"
            aria-label="Scroll left"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}

        {/* Scrollable Container */}
        <div ref={scrollContainerRef} className="flex-grow overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start space-x-2 sm:space-x-8 px-4">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleMainFilterClick(filter.key)}
                className={`filter-btn-main font-bold py-2 border-b-2 ${
                  activeFilter === filter.key ||
                  (filter.key === 'all' && activeFilter === 'all' && searchQuery === '')
                    ? 'border-black'
                    : 'border-transparent text-gray-500'
                } flex-shrink-0`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition"
            aria-label="Scroll right"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="relative flex-shrink-0 px-4" ref={sortDropdownRef}>
        <button
          onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          className={`filter-btn-main flex items-center font-bold py-2 border-b-2 ${
            isSortDropdownOpen ? 'border-black' : 'border-transparent text-gray-500'
          }`}
        >
          {activeSort} <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
        </button>
        {isSortDropdownOpen && (
          <div
            id="sort-dropdown"
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-40 animate-fadeIn"
          >
            <div className="py-1" role="none">
              <button
                onClick={() => handleSortClick('likes', 'Most Liked')}
                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Most Liked
              </button>
              <button
                onClick={() => handleSortClick('downloads', 'Most Downloaded')}
                className="text-gray-700 block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Most Downloaded
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

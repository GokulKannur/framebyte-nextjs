"use client";
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default function FilterBar({ activeFilter, setActiveFilter, setSortBy, showCategories, setShowCategories, categories = [], setSearchQuery, searchQuery }) {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Most Popular');

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

  const isCategoriesActive = showCategories && (activeFilter === 'categories' || categories.includes(activeFilter));

  return (
    <div className="flex items-center justify-center border-b mb-4 bg-transparent z-30 font-josefin-sans">
      <div className="flex-grow overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-start space-x-2 sm:space-x-8 px-4">
          <button
            onClick={() => handleMainFilterClick('all')}
            className={`filter-btn-main font-bold py-2 border-b-2 ${activeFilter === 'all' && searchQuery === '' ? 'border-black' : 'border-transparent text-gray-500'} flex-shrink-0`}
          >
            Home
          </button>
          <button
            onClick={() => handleMainFilterClick('phone')}
            className={`filter-btn-main font-bold py-2 border-b-2 ${activeFilter === 'phone' ? 'border-black' : 'border-transparent text-gray-500'} flex-shrink-0`}
          >
            For Phone
          </button>
          <button
            onClick={() => handleMainFilterClick('desktop')}
            className={`filter-btn-main font-bold py-2 border-b-2 ${activeFilter === 'desktop' ? 'border-black' : 'border-transparent text-gray-500'} flex-shrink-0`}
          >
            For Desktop
          </button>
          <button
            onClick={() => handleMainFilterClick('categories')}
            className={`filter-btn-main font-bold py-2 border-b-2 ${isCategoriesActive ? 'border-black' : 'border-transparent text-gray-500'} flex-shrink-0`}
          >
            Categories
          </button>
        </div>
      </div>
      <div className="relative flex-shrink-0 px-4">
        <button
          onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          className={`filter-btn-main flex items-center font-bold py-2 border-b-2 ${isSortDropdownOpen ? 'border-black' : 'border-transparent text-gray-500'}`}
        >
          {activeSort} <FontAwesomeIcon icon={faCaretDown} className="ml-2" />
        </button>
        {isSortDropdownOpen && (
          <div
            id="sort-dropdown"
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-40"
          >
            <div className="py-1" role="none">
              <button
                onClick={() => handleSortClick('likes', 'Most Liked')}
                className="text-gray-700 block w-full text-left px-4 py-2 text-sm dropdown-item"
              >
                Most Liked
              </button>
              <button
                onClick={() => handleSortClick('downloads', 'Most Downloaded')}
                className="text-gray-700 block w-full text-left px-4 py-2 text-sm dropdown-item"
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
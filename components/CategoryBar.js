import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function CategoryBar({ categories, activeFilter, setActiveFilter }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center z-20">
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          type="button"
          aria-label="Scroll categories left"
          className="absolute -left-2 sm:-left-5 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center space-x-3 overflow-x-auto py-2 no-scrollbar px-5"
      >
        <button
          onClick={() => setActiveFilter('all')}
          className={`category-btn flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full ${activeFilter === 'all' ? 'bg-black text-white' : 'text-gray-700 bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('phone')}
          className={`category-btn flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full ${activeFilter === 'phone' ? 'bg-black text-white' : 'text-gray-700 bg-gray-200'}`}
        >
          For Phone
        </button>
        <button
          onClick={() => setActiveFilter('desktop')}
          className={`category-btn flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full ${activeFilter === 'desktop' ? 'bg-black text-white' : 'text-gray-700 bg-gray-200'}`}
        >
          For Desktop
        </button>
        {categories.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`category-btn flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full ${activeFilter === tag ? 'bg-black text-white' : 'text-gray-700 bg-gray-200'}`}
          >
            {tag}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          type="button"
          aria-label="Scroll categories right"
          className="absolute -right-2 sm:-right-5 z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black text-white flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}
    </div>
  );
}
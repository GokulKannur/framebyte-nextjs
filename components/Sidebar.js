"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faClock, faStar, faTv, faDesktop } from '@fortawesome/free-solid-svg-icons';

// Receive sortBy and activeFilter to determine which link is active
export default function Sidebar({ sortBy, activeFilter, setSortBy, setActiveFilter }) {
  
  // When a filter is clicked, reset the sorting
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setSortBy('default'); 
  };

  // When a sort is clicked, reset the filtering
  const handleSortClick = (sort) => {
    setSortBy(sort);
    setActiveFilter('all');
  };

  return (
    <aside className="hidden md:block w-64 flex-shrink-0 mr-8">
      <div className="bg-white rounded-lg p-4 sticky top-24">
        <h3 className="font-bold text-lg mb-4 font-josefin-sans">Discover</h3>
        <nav id="sidebar-nav" className="flex flex-col space-y-2">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleSortClick('likes'); }}
            // Add the 'active' class conditionally
            className={`sidebar-link flex items-center px-3 py-2 rounded-md hover:bg-gray-100 ${sortBy === 'likes' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faFire} className="w-5 h-5 text-red-500" />
            <span className="ml-3">Trending</span>
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleSortClick('recent'); }}
            className={`sidebar-link flex items-center px-3 py-2 rounded-md hover:bg-gray-100 ${sortBy === 'recent' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-blue-500" />
            <span className="ml-3">Recently Added</span>
          </a>
        </nav>
        <hr className="my-4" />
        <h3 className="font-bold text-lg mb-4 font-josefin-sans">Resolutions</h3>
        <nav id="sidebar-nav-res" className="flex flex-col space-y-2">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleFilterClick('4k'); }}
            className={`sidebar-link flex items-center px-3 py-2 rounded-md hover:bg-gray-100 ${activeFilter === '4k' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faTv} className="w-5 h-5 text-purple-500" />
            <span className="ml-3">4K Wallpapers</span>
          </a>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleFilterClick('hd'); }}
            className={`sidebar-link flex items-center px-3 py-2 rounded-md hover:bg-gray-100 ${activeFilter === 'hd' ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faDesktop} className="w-5 h-5 text-green-500" />
            <span className="ml-3">HD Wallpapers</span>
          </a>
        </nav>
      </div>
    </aside>
  );
}
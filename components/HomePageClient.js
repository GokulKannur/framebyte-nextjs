"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Import the hook
import Header from './Header';
import Hero from './Hero';
import Sidebar from './Sidebar';
import FilterBar from './FilterBar';
import WallpaperGallery from './WallpaperGallery';
import CategoryBar from './CategoryBar';
import WallpaperModal from './WallpaperModal';
import SkeletonCard from './SkeletonCard';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';

const enrichWallpapersWithDimensions = async (wallpapers) => {
  // ... this function remains the same
};

const PAGE_SIZE = 12;

function HomePageContent() { // Renamed the main component
  const searchParams = useSearchParams(); // Use the hook to read the URL

  const [allWallpapers, setAllWallpapers] = useState([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState([]);
  // Set the initial filter from the URL, or default to 'all'
  const [activeFilter, setActiveFilter] = useState(() => searchParams.get('filter') || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // This new useEffect watches for changes in the URL and updates the filter
  useEffect(() => {
    const filterFromUrl = searchParams.get('filter');
    if (filterFromUrl) {
      setActiveFilter(filterFromUrl);
    }
  }, [searchParams]);

  // All other functions and useEffects remain the same...
  
  const fetchWallpapers = async (isInitial = false) => { /* ... */ };
  useEffect(() => { fetchWallpapers(true); }, []);
  useEffect(() => { /* ... applyFiltersAndSort logic ... */ }, [sortBy, searchQuery, activeFilter, allWallpapers]);
  useEffect(() => { /* ... getCategories logic ... */ }, [allWallpapers]);
  const generateRecommendations = (likedWallpaper) => { /* ... */ };
  const handleLikeToggle = (wallpaper, newLikeCount) => { /* ... */ };
  const openModal = (wallpaper) => { setSelectedWallpaper(wallpaper); };
  const closeModal = () => { setSelectedWallpaper(null); };

  return (
    <main>
      <Header />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="max-w-full mx-auto flex flex-row items-start px-6 pt-4">
        <Sidebar 
          sortBy={sortBy} 
          activeFilter={activeFilter} 
          setSortBy={setSortBy} 
          setActiveFilter={setActiveFilter}
        />
        <main className="flex-grow min-w-0">
          <FilterBar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            setSortBy={setSortBy}
            showCategories={showCategories}
            setShowCategories={setShowCategories}
            categories={categories}
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
          />
          {showCategories && (
            <CategoryBar
              categories={categories}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          )}
          {recommendations.length > 0 && (
            <div className="px-4 md:px-8 pt-4">
              <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
              <WallpaperGallery wallpapers={recommendations} onLikeToggle={handleLikeToggle} onWallpaperClick={openModal} />
              <hr className="my-8" />
            </div>
          )}
          {isLoading ? (
            <div className="p-4 md:p-8">
              <div className="masonry-gallery">
                {Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)}
              </div>
            </div>
          ) : (
            <WallpaperGallery
              wallpapers={filteredWallpapers}
              onLikeToggle={handleLikeToggle}
              onWallpaperClick={openModal}
            />
          )}
          <div className="text-center my-8">
            {hasMore && !isLoadingMore && (
              <button onClick={() => fetchWallpapers(false)} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full">
                Load More
              </button>
            )}
            {isLoadingMore && <p>Loading more...</p>}
            {!hasMore && filteredWallpapers.length >= PAGE_SIZE && <p>You've reached the end!</p>}
          </div>
        </main>
      </div>
      {selectedWallpaper && <WallpaperModal wallpaper={selectedWallpaper} onClose={closeModal} />}
    </main>
  );
}

// This is the new default export for the file
export default function HomePageClient() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomePageContent />
        </Suspense>
    )
}
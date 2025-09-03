"use client";
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Sidebar from '../components/Sidebar';
import FilterBar from '../components/FilterBar';
import WallpaperGallery from '../components/WallpaperGallery';
import CategoryBar from '../components/CategoryBar';
import WallpaperModal from '../components/WallpaperModal';
import SkeletonCard from '../components/SkeletonCard';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, increment, query, orderBy, limit, startAfter } from 'firebase/firestore';

const enrichWallpapersWithDimensions = async (wallpapers) => {
  const enrichedData = await Promise.all(
    wallpapers.map(async (wallpaper) => {
      if (wallpaper.width && wallpaper.height) {
        const orientation = wallpaper.width > wallpaper.height ? 'desktop' : 'phone';
        const resolution = wallpaper.width >= 3840 || wallpaper.height >= 2160 ? '4k' :
          wallpaper.width >= 1920 || wallpaper.height >= 1080 ? 'hd' : 'sd';
        return { ...wallpaper, orientation, resolution };
      }

      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const orientation = img.naturalWidth > img.naturalHeight ? 'desktop' : 'phone';
          const resolution = img.naturalWidth >= 3840 || img.naturalHeight >= 2160 ? '4k' :
            img.naturalWidth >= 1920 || img.naturalHeight >= 1080 ? 'hd' : 'sd';
          resolve({ ...wallpaper, width: img.naturalWidth, height: img.naturalHeight, orientation, resolution });
        };
        img.onerror = () => {
          resolve({ ...wallpaper, width: null, height: null, orientation: null, resolution: null });
        };
        img.src = wallpaper.imageUrl;
      });
    })
  );
  return enrichedData;
};

const PAGE_SIZE = 12;

export default function HomePage() {
  const [allWallpapers, setAllWallpapers] = useState([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
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

  // This function now ONLY fetches and adds wallpapers
  const fetchWallpapers = async (isInitial = false) => {
    if (!hasMore && !isInitial) return;
    
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const wallpapersCol = collection(db, "wallpapers");
      let q;
      
      // Reset for a new initial fetch
      const cursor = isInitial ? null : lastVisible;
      
      if (cursor) {
        q = query(wallpapersCol, orderBy('uploadedAt', 'desc'), startAfter(cursor), limit(PAGE_SIZE));
      } else {
        q = query(wallpapersCol, orderBy('uploadedAt', 'desc'), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      const newWallpapers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const enrichedWallpapers = await enrichWallpapersWithDimensions(newWallpapers);
      
      if (isInitial) {
        setAllWallpapers(enrichedWallpapers);
      } else {
        setAllWallpapers(prev => [...prev, ...enrichedWallpapers]);
      }
      
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);

      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Failed to fetch wallpapers:", error);
    } finally {
      if(isInitial) setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // This useEffect triggers a BRAND NEW search/filter, resetting the list
  useEffect(() => {
    const applyFiltersAndSort = async () => {
        // When a filter changes, we can't use the paginated list.
        // We need to fetch ALL documents that match the criteria.
        // For simplicity in this step, we will just filter the currently loaded wallpapers.
        // A more advanced implementation would re-fetch from Firestore with new queries.
        let processedData = [...allWallpapers];

        if (sortBy === 'likes') {
            processedData.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        } else if (sortBy === 'downloads') {
            processedData.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
        }

        if (searchQuery.trim() !== '') {
            const lowerCaseQuery = searchQuery.toLowerCase();
            processedData = allWallpapers.filter(wallpaper => { // Filter from the original full list
                const titleMatch = (wallpaper.title || '').toLowerCase().includes(lowerCaseQuery);
                const tagsMatch = Array.isArray(wallpaper.tags) && wallpaper.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
                return titleMatch || tagsMatch;
            });
        } else if (activeFilter !== 'all') {
            processedData = allWallpapers.filter(w => { // Filter from the original full list
                if (['phone', 'desktop'].includes(activeFilter)) {
                    return w.orientation === activeFilter;
                }
                if (['4k', 'hd'].includes(activeFilter)) {
                    return w.resolution === activeFilter;
                }
                if (Array.isArray(w.tags)) {
                    return w.tags.map(t => t.toLowerCase()).includes(activeFilter);
                }
                return false;
            });
        }
        
        setFilteredWallpapers(processedData);
        // When filters are active, we hide the "Load More" button
        const isFiltered = activeFilter !== 'all' || searchQuery.trim() !== '' || sortBy !== 'default';
        setHasMore(!isFiltered);

    };

    applyFiltersAndSort();
  }, [sortBy, searchQuery, activeFilter, allWallpapers]);


  // Fetch initial data only once
  useEffect(() => {
    fetchWallpapers(true);
  }, []);
  
  // This useEffect is now only for extracting categories
  useEffect(() => {
    if (allWallpapers.length > 0) {
      const allTags = new Set();
      allWallpapers.forEach(wallpaper => {
        if (Array.isArray(wallpaper.tags)) {
          wallpaper.tags.forEach(tag => allTags.add(tag.toLowerCase()));
        }
      });
      setCategories(Array.from(allTags).sort());
    }
  }, [allWallpapers]);


  const generateRecommendations = (likedWallpaper) => {
    // ... function remains the same
  };
  const handleLikeToggle = (wallpaper, newLikeCount) => {
    // ... function remains the same
  };
  const openModal = (wallpaper) => {
    // ... function remains the same
  };
  const closeModal = () => {
    // ... function remains the same
  };

  return (
    <main>
      <Header categories={categories} />
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
              <h2 className="text-2xl font-bold mb-4 font-josefin-sans">Recommended for You</h2>
              <WallpaperGallery wallpapers={recommendations} onLikeToggle={handleLikeToggle} onWallpaperClick={openModal} />
              <hr className="my-8" />
            </div>
          )}

          {isLoading ? (
            <div className="p-4 md:p-8">
              <div className="masonry-gallery">
                {Array.from({ length: 12 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
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
              <button
                onClick={() => fetchWallpapers(false)}
                className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-colors"
              >
                Load More
              </button>
            )}
            {isLoadingMore && (
              <p className="text-gray-500">Loading more wallpapers...</p>
            )}
            {!hasMore && filteredWallpapers.length > 0 && (
               <p className="text-gray-500">You've reached the end!</p>
            )}
          </div>
        </main>
      </div>
      
      {selectedWallpaper && (
        <WallpaperModal wallpaper={selectedWallpaper} onClose={closeModal} />
      )}
    </main>
  );
}
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
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';

const enrichWallpapersWithDimensions = async (wallpapers) => {
  return Promise.all(
    wallpapers.map((wallpaper) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const orientation = img.naturalWidth > img.naturalHeight ? 'desktop' : 'phone';
          const resolution =
            img.naturalWidth >= 3840 || img.naturalHeight >= 2160
              ? '4k'
              : img.naturalWidth >= 1920 || img.naturalHeight >= 1080
              ? 'hd'
              : 'sd';
          resolve({
            ...wallpaper,
            width: img.naturalWidth,
            height: img.naturalHeight,
            orientation,
            resolution,
          });
        };
        img.onerror = () => {
          resolve({ ...wallpaper, width: null, height: null, orientation: null, resolution: null });
        };
        img.src = wallpaper.imageUrl;
      });
    })
  );
};

const PAGE_SIZE = 12;

export default function HomePage() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [allWallpapers, setAllWallpapers] = useState([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState([]);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
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

  const fetchWallpapers = async (isInitial = false) => {
    if (!hasMore && !isInitial) return;

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const wallpapersCol = collection(db, 'wallpapers');
      let q;
      const cursor = isInitial ? null : lastVisible;

      if (cursor) {
        q = query(wallpapersCol, orderBy('uploadedAt', 'desc'), startAfter(cursor), limit(PAGE_SIZE));
      } else {
        q = query(wallpapersCol, orderBy('uploadedAt', 'desc'), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      const newWallpapers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const enrichedWallpapers = await enrichWallpapersWithDimensions(newWallpapers);

      if (isInitial) {
        setAllWallpapers(enrichedWallpapers);
      } else {
        setAllWallpapers((prev) => [...prev, ...enrichedWallpapers]);
      }

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);

      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch wallpapers:', error);
    } finally {
      if (isInitial) setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWallpapers(true);
  }, []);

  useEffect(() => {
    const applyFiltersAndSort = () => {
      let processedData = [...allWallpapers];

      if (searchQuery.trim() !== '' || activeFilter !== 'all' || sortBy !== 'default') {
        if (sortBy === 'likes') {
          processedData.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        } else if (sortBy === 'downloads') {
          processedData.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
        }

        if (searchQuery.trim() !== '') {
          const lowerCaseQuery = searchQuery.toLowerCase();
          processedData = processedData.filter((wallpaper) => {
            const titleMatch = (wallpaper.title || '').toLowerCase().includes(lowerCaseQuery);
            const tagsMatch =
              Array.isArray(wallpaper.tags) &&
              wallpaper.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery));
            return titleMatch || tagsMatch;
          });
        } else if (activeFilter !== 'all') {
          processedData = processedData.filter((w) => {
            if (['phone', 'desktop'].includes(activeFilter)) return w.orientation === activeFilter;
            if (['4k', 'hd'].includes(activeFilter)) return w.resolution === activeFilter;
            if (Array.isArray(w.tags)) return w.tags.map((t) => t.toLowerCase()).includes(activeFilter);
            return false;
          });
        }
        setHasMore(false);
      } else {
        setHasMore(allWallpapers.length >= PAGE_SIZE);
      }

      setFilteredWallpapers(processedData);
    };

    applyFiltersAndSort();
  }, [sortBy, searchQuery, activeFilter, allWallpapers]);

  useEffect(() => {
    const allTags = new Set();
    allWallpapers.forEach((wallpaper) => {
      if (Array.isArray(wallpaper.tags)) {
        wallpaper.tags.forEach((tag) => allTags.add(tag.toLowerCase()));
      }
    });
    setCategories(Array.from(allTags).sort());
  }, [allWallpapers]);

  const generateRecommendations = (likedWallpaper) => {
    if (!likedWallpaper || !Array.isArray(likedWallpaper.tags) || likedWallpaper.tags.length === 0) {
      setRecommendations([]);
      return;
    }
    const likedTags = new Set(likedWallpaper.tags.map((t) => t.toLowerCase()));
    const candidates = allWallpapers.filter((w) => {
      if (w.id === likedWallpaper.id) return false;
      if (!Array.isArray(w.tags)) return false;
      return w.tags.some((tag) => likedTags.has(tag.toLowerCase()));
    });
    const finalRecommendations = candidates.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3);
    setRecommendations(finalRecommendations);
  };

  const handleLikeToggle = (wallpaper, newLikeCount) => {
    setAllWallpapers((currentWallpapers) =>
      currentWallpapers.map((wp) => (wp.id === wallpaper.id ? { ...wp, likes: newLikeCount } : wp))
    );
    if (newLikeCount > (wallpaper.likes ?? 0)) {
      generateRecommendations(wallpaper);
    }
  };

  const openModal = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
  };

  const closeModal = () => {
    setSelectedWallpaper(null);
  };

  return (
    <main>
      <Header categories={categories} />
      <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="max-w-full mx-auto flex flex-row items-start px-6 pt-4">
        <Sidebar sortBy={sortBy} activeFilter={activeFilter} setSortBy={setSortBy} setActiveFilter={setActiveFilter} />
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
            <CategoryBar categories={categories} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
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
            <WallpaperGallery wallpapers={filteredWallpapers} onLikeToggle={handleLikeToggle} onWallpaperClick={openModal} />
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
            {isLoadingMore && <p className="text-gray-500">Loading more wallpapers...</p>}
            {!hasMore && filteredWallpapers.length >= PAGE_SIZE && (
              <p className="text-gray-500">You've reached the end!</p>
            )}
          </div>
        </main>
      </div>

      {selectedWallpaper && <WallpaperModal wallpaper={selectedWallpaper} onClose={closeModal} />}
    </main>
  );
}

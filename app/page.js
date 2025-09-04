"use client"; // Must be at the top to use useState/useEffect/hooks

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Sidebar from "../components/Sidebar";
import FilterBar from "../components/FilterBar";
import WallpaperGallery from "../components/WallpaperGallery";
import CategoryBar from "../components/CategoryBar";
import WallpaperModal from "../components/WallpaperModal";
import SkeletonCard from "../components/SkeletonCard";
import { db } from "../lib/firebase";
import { collection, getDocs, query, orderBy, limit, startAfter, doc, updateDoc } from "firebase/firestore";

const PAGE_SIZE = 12;

// Optional: enrich wallpapers with image dimensions
const enrichWallpapersWithDimensions = async (wallpapers) => {
  return Promise.all(
    wallpapers.map(
      (wallpaper) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const orientation = img.naturalWidth > img.naturalHeight ? "desktop" : "phone";
            const resolution =
              img.naturalWidth >= 3840 || img.naturalHeight >= 2160
                ? "4k"
                : img.naturalWidth >= 1920 || img.naturalHeight >= 1080
                ? "hd"
                : "sd";
            resolve({ ...wallpaper, width: img.naturalWidth, height: img.naturalHeight, orientation, resolution });
          };
          img.onerror = () => resolve({ ...wallpaper, width: null, height: null, orientation: null, resolution: null });
          img.src = wallpaper.imageUrl;
        })
    )
  );
};

export default function HomePage() {
  const [allWallpapers, setAllWallpapers] = useState([]);
  const [filteredWallpapers, setFilteredWallpapers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedWallpaper, setSelectedWallpaper] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch wallpapers from Firestore
  const fetchWallpapers = async (isInitial = false) => {
    if (!hasMore && !isInitial) return;
    if (isInitial) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const wallpapersCol = collection(db, "wallpapers");
      let q;
      const cursor = isInitial ? null : lastVisible;

      q = cursor
        ? query(wallpapersCol, orderBy("uploadedAt", "desc"), startAfter(cursor), limit(PAGE_SIZE))
        : query(wallpapersCol, orderBy("uploadedAt", "desc"), limit(PAGE_SIZE));

      const snapshot = await getDocs(q);
      const newWallpapers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const enrichedWallpapers = await enrichWallpapersWithDimensions(newWallpapers);

      if (isInitial) setAllWallpapers(enrichedWallpapers);
      else setAllWallpapers((prev) => [...prev, ...enrichedWallpapers]);

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      if (snapshot.docs.length < PAGE_SIZE) setHasMore(false);
    } catch (error) {
      console.error("Failed to fetch wallpapers:", error);
    } finally {
      if (isInitial) setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWallpapers(true);
  }, []);

  // Apply search, filters, and sorting
  useEffect(() => {
    let processed = [...allWallpapers];

    // Sorting
    if (sortBy === "likes") processed.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
    else if (sortBy === "downloads") processed.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));

    // Filtering
    if (searchQuery.trim() !== "")
      processed = processed.filter((w) => {
        const titleMatch = (w.title || "").toLowerCase().includes(searchQuery.toLowerCase());
        const tagsMatch = Array.isArray(w.tags) && w.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return titleMatch || tagsMatch;
      });
    else if (activeFilter !== "all")
      processed = processed.filter((w) => {
        if (["phone", "desktop"].includes(activeFilter)) return w.orientation === activeFilter;
        if (["4k", "hd"].includes(activeFilter)) return w.resolution === activeFilter;
        if (Array.isArray(w.tags)) return w.tags.map((t) => t.toLowerCase()).includes(activeFilter);
        return false;
      });

    setFilteredWallpapers(processed);
    setHasMore(allWallpapers.length >= PAGE_SIZE);
  }, [sortBy, searchQuery, activeFilter, allWallpapers]);

  // Extract categories from tags
  useEffect(() => {
    const allTags = new Set();
    allWallpapers.forEach((w) => {
      if (Array.isArray(w.tags)) w.tags.forEach((t) => allTags.add(t.toLowerCase()));
    });
    setCategories(Array.from(allTags).sort());
  }, [allWallpapers]);

  // Recommendations based on liked wallpaper
  const generateRecommendations = (likedWallpaper) => {
    if (!likedWallpaper || !Array.isArray(likedWallpaper.tags)) {
      setRecommendations([]);
      return;
    }
    const likedTags = new Set(likedWallpaper.tags.map((t) => t.toLowerCase()));
    const candidates = allWallpapers.filter((w) => w.id !== likedWallpaper.id && w.tags?.some((t) => likedTags.has(t.toLowerCase())));
    setRecommendations(candidates.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3));
  };

  // Handle likes: update Firestore & local state
  const handleLikeToggle = async (wallpaper) => {
    try {
      const newLikes = (wallpaper.likes ?? 0) + 1;
      const docRef = doc(db, "wallpapers", wallpaper.id);
      await updateDoc(docRef, { likes: newLikes });

      setAllWallpapers((prev) =>
        prev.map((w) => (w.id === wallpaper.id ? { ...w, likes: newLikes } : w))
      );

      generateRecommendations({ ...wallpaper, likes: newLikes });
    } catch (error) {
      console.error("Failed to update likes:", error);
    }
  };

  const openModal = (wallpaper) => setSelectedWallpaper(wallpaper);
  const closeModal = () => setSelectedWallpaper(null);

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
              <WallpaperGallery
                wallpapers={recommendations}
                onLikeToggle={handleLikeToggle}
                onWallpaperClick={openModal}
              />
              <hr className="my-8" />
            </div>
          )}

          {isLoading ? (
            <div className="p-4 md:p-8">
              <div className="masonry-gallery">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SkeletonCard key={i} />
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

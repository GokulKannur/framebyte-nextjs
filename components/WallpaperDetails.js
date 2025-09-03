"use client";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faHeart } from '@fortawesome/free-solid-svg-icons';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import WallpaperGallery from './WallpaperGallery';
import BackButton from './BackButton';

const getImageDimensions = (imageUrl) => {
  return new Promise(resolve => {
    if (!imageUrl) {
      resolve({ width: null, height: null });
      return;
    }
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = imageUrl;
  });
};

export default function WallpaperDetails({ wallpaper, allWallpapers }) {
  const [resolution, setResolution] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(wallpaper.likes ?? 0);
  const [downloadCount, setDownloadCount] = useState(wallpaper.downloads ?? 0);

  useEffect(() => {
    const likedState = localStorage.getItem(`liked_${wallpaper.id}`) === 'true';
    setIsLiked(likedState);
  }, [wallpaper.id]);
  
  useEffect(() => {
    getImageDimensions(wallpaper.imageUrl).then(setResolution);
  }, [wallpaper.imageUrl]);

  useEffect(() => {
    const generateRecommendations = async () => {
      if (!wallpaper || !allWallpapers || allWallpapers.length === 0) return;

      const dimensions = await getImageDimensions(wallpaper.imageUrl);
      if (!dimensions.width) return;
      
      const mainWallpaperOrientation = dimensions.width > dimensions.height ? 'desktop' : 'phone';
      const mainWallpaperTags = new Set(wallpaper.tags || []);
      
      const enrichedAllWallpapers = await Promise.all(allWallpapers.map(async w => {
          const dims = await getImageDimensions(w.imageUrl);
          return { ...w, ...dims };
      }));

      const candidates = enrichedAllWallpapers.filter(w => {
        if (w.id === wallpaper.id) return false;
        if (!w.width || !w.height) return false;
        
        const candidateOrientation = w.width > w.height ? 'desktop' : 'phone';
        if (candidateOrientation !== mainWallpaperOrientation) return false;
        
        if (!w.tags || w.tags.length === 0) return false;
        return w.tags.some(tag => mainWallpaperTags.has(tag));
      });

      const sortedRecommendations = candidates
        .map(w => ({ ...w, commonTagsCount: w.tags.filter(tag => mainWallpaperTags.has(tag)).length }))
        .sort((a, b) => b.commonTagsCount - a.commonTagsCount)
        .slice(0, 3);
      
      setRecommendations(sortedRecommendations);
    };

    generateRecommendations();
  }, [wallpaper, allWallpapers]);

  const handleDownload = async () => {
    setDownloadCount(current => current + 1);
    try {
      const response = await fetch(wallpaper.imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.download = `FrameByte-${wallpaper.title || wallpaper.id}.jpg`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      URL.revokeObjectURL(blobUrl);
      const docRef = doc(db, 'wallpapers', wallpaper.id);
      await updateDoc(docRef, { downloads: increment(1) });
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadCount(current => current - 1);
      window.open(wallpaper.imageUrl, '_blank');
    }
  };

  const handleLikeClick = async () => {
    const newLikedState = !isLiked;
    const incrementValue = newLikedState ? 1 : -1;
    setIsLiked(newLikedState);
    setLikeCount(current => current + incrementValue);
    localStorage.setItem(`liked_${wallpaper.id}`, newLikedState);
    const wallpaperRef = doc(db, 'wallpapers', wallpaper.id);
    try {
      await updateDoc(wallpaperRef, { likes: increment(incrementValue) });
    } catch (error) {
      console.error("Failed to update like count:", error);
      setIsLiked(!newLikedState);
      setLikeCount(current => current - incrementValue);
      localStorage.setItem(`liked_${wallpaper.id}`, !newLikedState);
    }
  };
  
  const handleRecommendationLike = (likedWallpaper, newLikeCount) => {
    setRecommendations(currentRecommendations =>
      currentRecommendations.map(rec =>
        rec.id === likedWallpaper.id ? { ...rec, likes: newLikeCount } : rec
      )
    );
  };

  const displayTitle = wallpaper.title || (wallpaper.tags && wallpaper.tags.length > 0 ? wallpaper.tags.join(', ') : "Untitled Wallpaper");

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton />
      <div className="mt-4 flex flex-col md:flex-row gap-8">
        <div className="flex-1 max-w-lg mx-auto md:max-w-none">
          <img
            src={wallpaper.imageUrl}
            alt={displayTitle}
            onContextMenu={e => e.preventDefault()}
            className="h-auto rounded-lg shadow-xl max-h-[80vh] w-auto mx-auto"
          />
        </div>
        <div className="md:w-1/3 flex flex-col gap-4">
          <div className="p-4 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4 font-josefin-sans capitalize">
              {displayTitle}
            </h1>
            <p className="text-gray-700 mb-1"><span className="font-semibold">Likes:</span> {likeCount}</p>
            <p className="text-gray-700"><span className="font-semibold">Downloads:</span> {downloadCount}</p>
            <div className="flex items-center space-x-4 mt-6">
               <button onClick={handleLikeClick} className={`flex-1 inline-flex items-center justify-center font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300 shadow-lg border-2 ${isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                  <FontAwesomeIcon icon={faHeart} className="mr-3" />
                  {isLiked ? 'Liked' : 'Like'}
                </button>
                <button onClick={handleDownload} className="flex-1 inline-flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300 shadow-lg">
                  <FontAwesomeIcon icon={faDownload} className="mr-3" />
                  Download
                </button>
            </div>
          </div>
          {wallpaper.tags && wallpaper.tags.length > 0 && (
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="font-bold mb-2 font-josefin-sans">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {wallpaper.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm capitalize">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-12">
        {recommendations.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-4 font-josefin-sans">Recommended for You</h2>
            <WallpaperGallery wallpapers={recommendations} onLikeToggle={handleRecommendationLike} onWallpaperClick={(w) => window.location.href = `/wallpaper/${w.id}`} />
          </>
        )}
      </div>
    </div>
  );
}
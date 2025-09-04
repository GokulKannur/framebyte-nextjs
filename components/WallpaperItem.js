"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDownload } from '@fortawesome/free-solid-svg-icons';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function WallpaperItem({ wallpaper, onLikeToggle, onDownload }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(wallpaper.likes ?? 0);
  const [downloadCount, setDownloadCount] = useState(wallpaper.downloads ?? 0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  // ✅ Observe when component enters viewport for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Check localStorage for liked state
  useEffect(() => {
    const likedState = localStorage.getItem(`liked_${wallpaper.id}`) === 'true';
    setIsLiked(likedState);
    setLikeCount(wallpaper.likes ?? 0);
    setDownloadCount(wallpaper.downloads ?? 0);
    setIsLoaded(false);
  }, [wallpaper.id, wallpaper.likes, wallpaper.downloads]);

  // ✅ Handle Like Click (Optimistic UI)
  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newLikedState = !isLiked;
    const incrementValue = newLikedState ? 1 : -1;
    setIsLiked(newLikedState);
    setLikeCount((prev) => prev + incrementValue);
    localStorage.setItem(`liked_${wallpaper.id}`, newLikedState);

    if (onLikeToggle) onLikeToggle(wallpaper, likeCount + incrementValue);

    try {
      const wallpaperRef = doc(db, 'wallpapers', wallpaper.id);
      await updateDoc(wallpaperRef, { likes: increment(incrementValue) });
    } catch (error) {
      console.error("Failed to update like count:", error);
    }
  };

  // ✅ Handle Download Click (Direct download)
  const handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setDownloadCount((prev) => prev + 1);
    if (onDownload) onDownload(wallpaper.id, downloadCount + 1);

    try {
      const tempLink = document.createElement('a');
      tempLink.href = wallpaper.imageUrl;
      tempLink.download = `FrameByte-${wallpaper.title || wallpaper.id}.jpg`;
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      const wallpaperRef = doc(db, 'wallpapers', wallpaper.id);
      await updateDoc(wallpaperRef, { downloads: increment(1) });
    } catch (error) {
      console.error("Download failed:", error);
      window.open(wallpaper.imageUrl, '_blank');
    }
  };

  const showResolutionLabel = wallpaper.resolution && wallpaper.resolution !== 'sd';

  return (
    <Link href={`/wallpaper/${wallpaper.id}`} ref={imgRef}>
      <div className="wallpaper-item group relative overflow-hidden rounded-lg shadow-lg bg-gray-300 break-inside-avoid cursor-pointer">
        
        {/* ✅ Only load image when visible */}
        {isVisible && (
          <>
            {/* Single image with blur-up effect */}
            <img
              src={wallpaper.thumbnailUrl || wallpaper.imageUrl}
              alt={`Wallpaper of ${wallpaper.title || wallpaper.id}`}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onContextMenu={(e) => e.preventDefault()}
              className={`w-full h-full object-cover transition-all duration-700 ease-in-out ${
                isLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-2xl scale-105 opacity-80'
              }`}
              style={{ filter: isLoaded ? 'blur(0)' : 'blur(20px)' }}
            />
          </>
        )}

        {/* Overlay for resolution */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50">
          <span className="text-white text-lg font-bold">
            {wallpaper.width && wallpaper.height ? `${wallpaper.width}x${wallpaper.height}` : ''}
          </span>
        </div>

        {/* Resolution Badge */}
        {showResolutionLabel && (
          <span
            className={`resolution-label absolute top-3 right-3 px-2 py-1 text-xs font-bold rounded-full pointer-events-none transition-opacity duration-300 ${
              wallpaper.resolution === '4k' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {wallpaper.resolution.toUpperCase()}
          </span>
        )}

        {/* Like & Download Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between text-white">
          <div
            className="like-btn flex items-center space-x-1 cursor-pointer p-2 -ml-2"
            onClick={handleLikeClick}
          >
            <FontAwesomeIcon icon={faHeart} className={`heart-icon text-xl ${isLiked ? 'text-red-500' : ''}`} />
            <span className="like-count text-base font-semibold">{likeCount}</span>
          </div>
          <div
            className="open-modal-btn flex items-center space-x-1 cursor-pointer p-2 -mr-2"
            onClick={handleDownloadClick}
          >
            <FontAwesomeIcon icon={faDownload} className="text-xl" />
            <span className="download-count text-base font-semibold">{downloadCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function WallpaperModal({ wallpaper, onClose }) {
  if (!wallpaper) {
    return null;
  }

  const handleDownload = async () => {
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
      await updateDoc(docRef, {
        downloads: increment(1)
      });
    } catch (error) {
      console.error("Download failed:", error);
      window.open(wallpaper.imageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 ease-in-out">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white text-4xl hover:text-purple-400 transition-colors"
        aria-label="Close modal"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <div className="w-full max-w-4xl text-center">
        <img
          src={wallpaper.imageUrl}
          alt={`Enlarged wallpaper of ${wallpaper.title || wallpaper.id}`}
          onContextMenu={e => e.preventDefault()}
          className="w-full h-auto max-h-[75vh] object-contain rounded-lg shadow-2xl"
        />
        <button
          onClick={handleDownload}
          className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
        >
          <FontAwesomeIcon icon={faDownload} className="mr-3" />
          Download
        </button>
      </div>
    </div>
  );
}
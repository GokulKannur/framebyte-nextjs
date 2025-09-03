"use client";
import React from 'react';
import Link from 'next/link';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { db } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

export default function WallpaperPageClient({ wallpaper }) {

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
    <>
      <Header />
      <div className="container mx-auto py-8">
        <Link href="/" className="text-purple-600 hover:underline">
          ← Back to gallery
        </Link>
        <div className="mt-4 p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-josefin-sans">
            {wallpaper.title || "Untitled Wallpaper"}
          </h1>
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.title || wallpaper.id}
            className="mx-auto mt-6 rounded-lg shadow-xl max-h-[75vh] object-contain"
            onContextMenu={e => e.preventDefault()}
          />
          <button
            id="modal-download-btn"
            onClick={handleDownload}
            className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-full text-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
          >
            <FontAwesomeIcon icon={faDownload} className="mr-3" />
            Download
          </button>
          {/* Recommended for You section will go here later */}
        </div>
      </div>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function WallpaperGrid() {
  const [wallpapers, setWallpapers] = useState([]);

useEffect(() => {
  const fetchWallpapers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "wallpapers"));
      console.log("Fetched docs:", querySnapshot.size);
      querySnapshot.forEach(doc => {
        console.log("Doc:", doc.id, doc.data());
      });
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWallpapers(items);
    } catch (error) {
      console.error("Error fetching wallpapers:", error);
    }
  };

  fetchWallpapers();
}, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {wallpapers.map((wall) => (
        <div key={wall.id} className="group relative overflow-hidden rounded-xl shadow-md">
          <img
            src={wall.imageUrl}
            alt={wall.title || "Wallpaper"}
            className="w-full h-48 object-cover transform group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center text-white font-semibold">
            {wall.title || "Untitled"}
          </div>
        </div>
      ))}
    </div>
  );
}

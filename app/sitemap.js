import { db } from '../lib/firebase'; // Corrected path from './' to '../'
import { collection, getDocs } from 'firebase/firestore';

export default async function sitemap() {
  const baseUrl = 'https://www.yourdomain.com'; // IMPORTANT: Replace with your actual domain later

  // Fetch all wallpaper IDs to create dynamic routes
  const wallpapersCol = collection(db, "wallpapers");
  const snapshot = await getDocs(wallpapersCol);
  const wallpaperUrls = snapshot.docs.map(doc => ({
    url: `${baseUrl}/wallpaper/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Add your static routes
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...wallpaperUrls];
}
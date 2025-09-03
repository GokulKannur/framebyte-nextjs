import Header from '../../../components/Header';
import WallpaperDetails from '../../../components/WallpaperDetails';
import { db } from '../../../lib/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

// ... (generateMetadata function remains the same)
export async function generateMetadata({ params }) {
  const { id } = params;
  const docRef = doc(db, "wallpapers", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      title: "Wallpaper Not Found",
      description: "The wallpaper you are looking for does not exist.",
    };
  }

  const wallpaper = docSnap.data();
  const displayTitle = wallpaper.title || (wallpaper.tags && wallpaper.tags.length > 0 ? wallpaper.tags.join(', ') : "Untitled Wallpaper");
  
  return {
    title: `${displayTitle} - FrameByte Wallpaper`,
    description: `Download a free, high-quality wallpaper of ${displayTitle}. Tags: ${wallpaper.tags?.join(', ')}.`,
    openGraph: {
      title: `${displayTitle} - FrameByte Wallpaper`,
      description: `Download a free, high-quality wallpaper of ${displayTitle}.`,
      images: [
        {
          url: wallpaper.imageUrl,
          width: wallpaper.width || 1200,
          height: wallpaper.height || 630,
        },
      ],
    },
  };
}


// ... (generateStaticParams function remains the same)
export async function generateStaticParams() {
  const wallpapersCol = collection(db, "wallpapers");
  const snapshot = await getDocs(wallpapersCol);
  return snapshot.docs.map(doc => ({
    id: doc.id,
  }));
}


export default async function WallpaperPage({ params }) {
  const { id } = params;

  const docRef = doc(db, "wallpapers", id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return (
        <div>Wallpaper not found.</div>
    )
  }

  const wallpaper = {
    id: docSnap.id,
    ...docSnap.data()
  };

  // --- This is the new part for Structured Data ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    'name': wallpaper.title || wallpaper.id,
    'contentUrl': wallpaper.imageUrl,
    'license': 'https://framebyte.com/license', // Replace with your actual license URL later
    'acquireLicensePage': `https://framebyte.com/wallpaper/${wallpaper.id}`, // Replace with your domain
    'creator': {
      '@type': 'Organization',
      'name': 'FrameByte',
    },
    'copyrightNotice': 'FrameByte',
  };
  // --- End of new part ---

  // Fetch all wallpapers to find recommendations
  const allWallpapersCol = collection(db, "wallpapers");
  const allWallpapersSnapshot = await getDocs(allWallpapersCol);
  const allWallpapers = allWallpapersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return (
    <>
      {/* Add the Structured Data script to the page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <WallpaperDetails wallpaper={wallpaper} allWallpapers={allWallpapers} />
    </>
  );
}
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the Firebase Admin App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// This is the same logic from our component to get the clean path
const getImagePath = (url) => {
  if (!url) return null;
  try {
    if (url.includes('/o/')) {
      const pathWithToken = url.split('/o/')[1];
      const filePath = pathWithToken.split('?')[0];
      return decodeURIComponent(filePath);
    } else {
      // Handle the other URL format
      const path = new URL(url).pathname.split('/').pop();
      return decodeURIComponent(path);
    }
  } catch (error) {
    console.error("Could not parse image URL:", url);
    return null;
  }
};

async function updateWallpapers() {
  console.log("Fetching wallpapers from Firestore...");
  const wallpapersRef = db.collection('wallpapers');
  const snapshot = await wallpapersRef.get();

  if (snapshot.empty) {
    console.log('No wallpapers found.');
    return;
  }

  const batch = db.batch();
  let updateCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    // Only update if the document is missing the imagePath field
    if (data.imageUrl && !data.imagePath) {
      const imagePath = getImagePath(data.imageUrl);
      if (imagePath) {
        batch.update(doc.ref, { imagePath: imagePath });
        updateCount++;
        console.log(`Preparing to update doc ${doc.id} with path: ${imagePath}`);
      }
    }
  });

  if (updateCount > 0) {
    console.log(`Found ${updateCount} wallpapers to update. Committing batch...`);
    await batch.commit();
    console.log('Successfully updated all wallpapers!');
  } else {
    console.log('All wallpapers already have the imagePath field. No updates needed.');
  }
}

updateWallpapers().catch(console.error);
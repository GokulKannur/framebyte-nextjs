import WallpaperItem from './WallpaperItem';

// Receive onWallpaperClick
export default function WallpaperGallery({ wallpapers, onLikeToggle, onWallpaperClick }) {
  if (!wallpapers || wallpapers.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">No wallpapers found matching your criteria.</p>
        <p className="text-sm text-gray-400 mt-2">Try a different category or reset your filters.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div id="gallery" className="masonry-gallery">
        {wallpapers.map((wallpaper) => (
          <WallpaperItem
            key={wallpaper.id}
            wallpaper={wallpaper}
            onLikeToggle={onLikeToggle}
            onWallpaperClick={onWallpaperClick} // Pass it down
          />
        ))}
      </div>
    </div>
  );
}

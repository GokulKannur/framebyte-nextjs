import WallpaperItem from './WallpaperItem';

// Receive onWallpaperClick
export default function WallpaperGallery({ wallpapers, onLikeToggle, onWallpaperClick }) {
  if (!wallpapers || wallpapers.length === 0) {
    return <p className="text-center p-8">No wallpapers found matching your criteria.</p>;
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
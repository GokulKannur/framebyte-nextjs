export default function SkeletonCard() {
  return (
    <div className="wallpaper-item group relative overflow-hidden rounded-lg shadow-lg bg-gray-200 break-inside-avoid">
      <div className="w-full h-full aspect-[3/4] bg-gray-300 animate-pulse"></div>
    </div>
  );
}
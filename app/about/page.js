"use client";
import Link from 'next/link';
import Header from '../../components/Header';

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4 font-caveat">
          Welcome to the Command Center!
        </h2>
        <div className="max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed">
          <p>
            You've found FrameByte, a place where pixels are treated with the respect they deserve. This whole operation is currently a one-man army, fueled by a passion for stunning visuals and an unhealthy amount of coffee. ☕ Every wallpaper here is hand-picked, curated, and uploaded by yours truly.
          </p>
          <p>
            Tired of sifting through endless low-quality, pixelated images? Me too. That's why this site exists. If you're looking for crisp, high-quality wallpapers that make your screen look amazing, you're in exactly the right place.
          </p>
          <p className="text-lg font-semibold pt-4 font-caveat text-2xl">
            Why did the smartphone go to therapy? <br />Because it had too many screen issues!
          </p>
          <Link href="/" className="mt-8 inline-block bg-purple-600 text-white font-bold py-3 px-8 rounded-full transition-colors hover:bg-purple-700">
            Go back to the gallery
          </Link>
        </div>
      </div>
    </>
  );
}